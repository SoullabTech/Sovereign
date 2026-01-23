#!/bin/bash
# Local Mac Studio startup script
# Includes embeddings profile for local Ollama
cd /Users/soullab/MAIA-SOVEREIGN
docker compose -f docker-compose.production.yml -f docker-compose.production.override.yml --profile embeddings up -d
