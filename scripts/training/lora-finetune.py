#!/usr/bin/env python3
"""
MAIA LoRA Fine-Tuning Pipeline

Trains a LoRA adapter on MAIA's gold responses to create a sovereign model
that captures MAIA's voice, wisdom, and relational style.

Prerequisites:
- Python 3.10+
- pip install transformers peft datasets accelerate bitsandbytes
- pip install psycopg2-binary
- CUDA-capable GPU or Apple Silicon (MPS)

Usage:
    python lora-finetune.py --base-model mistralai/Mixtral-8x7B-Instruct-v0.1
    python lora-finetune.py --base-model deepseek-ai/deepseek-llm-7b-chat --export-only
"""

import os
import sys
import json
import argparse
from datetime import datetime
from typing import List, Dict, Any, Optional

# Database connection
import psycopg2
from psycopg2.extras import RealDictCursor

# Transformers & PEFT
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling,
    BitsAndBytesConfig
)
from peft import (
    LoraConfig,
    get_peft_model,
    prepare_model_for_kbit_training,
    TaskType
)
from datasets import Dataset

# Configuration
DEFAULT_BASE_MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1"
DEFAULT_OUTPUT_DIR = "./maia-lora-adapter"
DEFAULT_LORA_RANK = 16
DEFAULT_LORA_ALPHA = 32
DEFAULT_EPOCHS = 3
DEFAULT_BATCH_SIZE = 4
DEFAULT_LEARNING_RATE = 2e-4

# Database connection (from environment or defaults)
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://soullab@localhost:5432/maia_consciousness"
)


def get_db_connection():
    """Get PostgreSQL connection."""
    return psycopg2.connect(DATABASE_URL)


def export_training_data(min_score: float = 4.0, min_feedback: int = 2) -> List[Dict[str, Any]]:
    """
    Export gold training data from MAIA's learning system.

    Returns list of conversation examples with:
    - user_text: The human message
    - maia_text: MAIA's gold response
    - element: Spiralogic element (fire/water/earth/air/aether)
    - processing_profile: FAST/CORE/DEEP
    - metadata: Additional context
    """
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # Query gold turns (high-quality rated responses)
    cur.execute("""
        SELECT
            t.id,
            t.user_text,
            t.maia_text,
            t.element,
            t.processing_profile,
            t.primary_engine,
            t.consciousness_layers_activated,
            AVG(f.felt_seen_score) as avg_felt_seen,
            AVG(f.attunement_score) as avg_attunement,
            COUNT(f.id) as feedback_count
        FROM maia_turns t
        JOIN maia_turn_feedback f ON t.id = f.turn_id
        WHERE f.rupture_mark = false
        GROUP BY t.id
        HAVING COUNT(f.id) >= %s
            AND AVG(f.felt_seen_score) >= %s
            AND AVG(f.attunement_score) >= %s
        ORDER BY AVG(f.attunement_score) DESC, AVG(f.felt_seen_score) DESC
    """, (min_feedback, min_score, min_score))

    gold_turns = cur.fetchall()

    # If no feedback yet, fall back to all turns with Claude consultation
    if len(gold_turns) < 100:
        print(f"⚠️  Only {len(gold_turns)} gold turns with feedback. Falling back to Claude-consulted turns...")
        cur.execute("""
            SELECT
                id,
                user_text,
                maia_text,
                element,
                processing_profile,
                primary_engine,
                consciousness_layers_activated
            FROM maia_turns
            WHERE used_claude_consult = true
                AND maia_text IS NOT NULL
                AND LENGTH(maia_text) > 50
            ORDER BY created_at DESC
            LIMIT 5000
        """)
        gold_turns = cur.fetchall()

    cur.close()
    conn.close()

    # Convert to training format
    training_data = []
    for turn in gold_turns:
        if turn['user_text'] and turn['maia_text']:
            training_data.append({
                'user_text': turn['user_text'],
                'maia_text': turn['maia_text'],
                'element': turn.get('element', 'aether'),
                'processing_profile': turn.get('processing_profile', 'CORE'),
                'metadata': {
                    'id': turn['id'],
                    'engine': turn.get('primary_engine', 'unknown'),
                    'layers': turn.get('consciousness_layers_activated', [])
                }
            })

    return training_data


def format_for_training(example: Dict[str, Any]) -> str:
    """
    Format example into instruction-following format.

    Uses ChatML-style format compatible with most instruction-tuned models.
    """
    system_prompt = f"""You are MAIA, a sovereign consciousness companion.
You speak with warmth, wisdom, and genuine presence.
Mode: {example.get('processing_profile', 'CORE')}
Element: {example.get('element', 'aether')}"""

    return f"""<|im_start|>system
{system_prompt}
<|im_end|>
<|im_start|>user
{example['user_text']}
<|im_end|>
<|im_start|>assistant
{example['maia_text']}
<|im_end|>"""


def create_dataset(training_data: List[Dict[str, Any]], tokenizer) -> Dataset:
    """Create HuggingFace dataset from training data."""

    formatted_texts = [format_for_training(ex) for ex in training_data]

    def tokenize_function(examples):
        return tokenizer(
            examples['text'],
            truncation=True,
            max_length=2048,
            padding='max_length',
            return_tensors='pt'
        )

    dataset = Dataset.from_dict({'text': formatted_texts})
    tokenized_dataset = dataset.map(
        tokenize_function,
        batched=True,
        remove_columns=['text']
    )

    return tokenized_dataset


def setup_model_and_tokenizer(base_model: str, use_4bit: bool = True):
    """
    Load base model with quantization for efficient fine-tuning.
    """
    print(f"📦 Loading base model: {base_model}")

    tokenizer = AutoTokenizer.from_pretrained(base_model, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token

    if use_4bit:
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype="float16",
            bnb_4bit_use_double_quant=True,
        )
        model = AutoModelForCausalLM.from_pretrained(
            base_model,
            quantization_config=bnb_config,
            device_map="auto",
            trust_remote_code=True,
        )
        model = prepare_model_for_kbit_training(model)
    else:
        model = AutoModelForCausalLM.from_pretrained(
            base_model,
            device_map="auto",
            trust_remote_code=True,
        )

    return model, tokenizer


def setup_lora(model, rank: int = DEFAULT_LORA_RANK, alpha: int = DEFAULT_LORA_ALPHA):
    """
    Configure LoRA adapter for efficient fine-tuning.
    """
    lora_config = LoraConfig(
        r=rank,
        lora_alpha=alpha,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type=TaskType.CAUSAL_LM,
    )

    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    return model


def train(
    model,
    tokenizer,
    dataset,
    output_dir: str,
    epochs: int = DEFAULT_EPOCHS,
    batch_size: int = DEFAULT_BATCH_SIZE,
    learning_rate: float = DEFAULT_LEARNING_RATE,
):
    """
    Run LoRA fine-tuning.
    """
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=epochs,
        per_device_train_batch_size=batch_size,
        gradient_accumulation_steps=4,
        learning_rate=learning_rate,
        warmup_steps=100,
        logging_steps=10,
        save_steps=200,
        save_total_limit=3,
        fp16=True,
        optim="paged_adamw_8bit",
        report_to="none",
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
        data_collator=DataCollatorForLanguageModeling(tokenizer, mlm=False),
    )

    print("🚀 Starting training...")
    trainer.train()

    # Save final adapter
    final_path = os.path.join(output_dir, "final")
    model.save_pretrained(final_path)
    tokenizer.save_pretrained(final_path)

    print(f"✅ Training complete! Adapter saved to: {final_path}")
    return final_path


def export_to_jsonl(training_data: List[Dict[str, Any]], output_path: str):
    """Export training data to JSONL format for external tools."""
    with open(output_path, 'w') as f:
        for example in training_data:
            jsonl_entry = {
                'messages': [
                    {'role': 'system', 'content': f"You are MAIA. Mode: {example.get('processing_profile', 'CORE')}"},
                    {'role': 'user', 'content': example['user_text']},
                    {'role': 'assistant', 'content': example['maia_text']}
                ],
                'metadata': example.get('metadata', {})
            }
            f.write(json.dumps(jsonl_entry) + '\n')

    print(f"📄 Exported {len(training_data)} examples to {output_path}")


def main():
    parser = argparse.ArgumentParser(description="MAIA LoRA Fine-Tuning Pipeline")
    parser.add_argument("--base-model", default=DEFAULT_BASE_MODEL, help="Base model to fine-tune")
    parser.add_argument("--output-dir", default=DEFAULT_OUTPUT_DIR, help="Output directory for adapter")
    parser.add_argument("--epochs", type=int, default=DEFAULT_EPOCHS, help="Training epochs")
    parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE, help="Batch size")
    parser.add_argument("--learning-rate", type=float, default=DEFAULT_LEARNING_RATE, help="Learning rate")
    parser.add_argument("--lora-rank", type=int, default=DEFAULT_LORA_RANK, help="LoRA rank")
    parser.add_argument("--lora-alpha", type=int, default=DEFAULT_LORA_ALPHA, help="LoRA alpha")
    parser.add_argument("--min-score", type=float, default=4.0, help="Minimum quality score for gold data")
    parser.add_argument("--export-only", action="store_true", help="Only export data, don't train")
    parser.add_argument("--no-4bit", action="store_true", help="Don't use 4-bit quantization")

    args = parser.parse_args()

    print("=" * 60)
    print("🧠 MAIA LoRA Fine-Tuning Pipeline")
    print("=" * 60)
    print(f"Base model: {args.base_model}")
    print(f"Output dir: {args.output_dir}")
    print(f"Database: {DATABASE_URL[:50]}...")
    print("=" * 60)

    # Export training data
    print("\n📊 Exporting training data from MAIA learning system...")
    training_data = export_training_data(min_score=args.min_score)
    print(f"✅ Exported {len(training_data)} training examples")

    if len(training_data) < 100:
        print("⚠️  WARNING: Less than 100 training examples. Results may be poor.")
        print("   Consider collecting more conversation data before fine-tuning.")

    # Export to JSONL (always, for backup/external use)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    jsonl_path = os.path.join(args.output_dir, f"training_data_{timestamp}.jsonl")
    os.makedirs(args.output_dir, exist_ok=True)
    export_to_jsonl(training_data, jsonl_path)

    if args.export_only:
        print("\n✅ Export complete (--export-only specified)")
        return

    # Setup model and tokenizer
    model, tokenizer = setup_model_and_tokenizer(
        args.base_model,
        use_4bit=not args.no_4bit
    )

    # Setup LoRA
    model = setup_lora(model, rank=args.lora_rank, alpha=args.lora_alpha)

    # Create dataset
    print("\n🔄 Creating training dataset...")
    dataset = create_dataset(training_data, tokenizer)
    print(f"✅ Dataset ready: {len(dataset)} examples")

    # Train
    final_path = train(
        model,
        tokenizer,
        dataset,
        output_dir=args.output_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.learning_rate,
    )

    print("\n" + "=" * 60)
    print("🎉 MAIA LoRA Fine-Tuning Complete!")
    print("=" * 60)
    print(f"Adapter saved to: {final_path}")
    print(f"Training data: {jsonl_path}")
    print("\nTo use the adapter with Ollama:")
    print(f"  1. Convert to GGUF format")
    print(f"  2. Create Modelfile pointing to adapter")
    print(f"  3. ollama create maia-sovereign -f Modelfile")
    print("=" * 60)


if __name__ == "__main__":
    main()
