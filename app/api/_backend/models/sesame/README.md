# 🎤 Sesame CSM - Local Models Directory

This directory contains cached model files for Maya's offline voice synthesis.

## Contents (after setup)

```
backend/models/sesame/
├── README.md              # This file
├── config.json           # Model configuration  
├── tokenizer.json        # Tokenizer configuration
├── vocab.txt             # Vocabulary file
├── pytorch_model.bin     # Model weights
├── tokenizer_config.json # Tokenizer settings
└── special_tokens_map.json # Special token mappings
```

## Setup

Run the setup script to populate this directory:

```bash
./scripts/setup-sesame-offline.sh
```

## Model Info

- **Model**: microsoft/DialoGPT-medium
- **Purpose**: Conversational text generation for Maya's voice responses
- **Size**: ~400MB
- **Type**: Offline-capable, no external dependencies after download

## Usage

These models are automatically loaded by the Sesame CSM Docker container when running in offline mode. No manual intervention required.

## GPU Support

Models will automatically use GPU acceleration if available, falling back to CPU mode otherwise.