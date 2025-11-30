import torch
from transformers import CsmForConditionalGeneration, AutoProcessor
import sys
import json
import os

model_id = "sesame/csm-1b"
device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"

# Load processor and model
processor = AutoProcessor.from_pretrained(model_id)
model = CsmForConditionalGeneration.from_pretrained(model_id, device_map=device)

def generate_audio(prompt_data, output_path="oracle_response.wav"):
    conversation = [
        {
            "role": prompt_data["speakerId"],
            "content": [
                {"type": "text", "text": prompt_data["text"]}
            ]
        }
    ]
    inputs = processor.apply_chat_template(
        conversation,
        tokenize=True,
        return_dict=True
    ).to(device)

    audio = model.generate(**inputs, output_audio=True)
    processor.save_audio(audio, output_path)
    return output_path

if __name__ == "__main__":
    input_json = sys.argv[1]
    prompt_data = json.loads(input_json)
    output_path = prompt_data.get("output_path", "oracle_response.wav")
    result = generate_audio(prompt_data, output_path)
    print(result)