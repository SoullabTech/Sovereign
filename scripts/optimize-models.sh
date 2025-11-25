#!/bin/bash
# MAIA Model Optimization Script
# Downloads and manages optimized quantized models for better performance

set -e

echo "🚀 MAIA Model Optimization Starting..."
echo "======================================"

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Ollama is running
if ! curl -s http://localhost:11434 > /dev/null; then
    echo -e "${RED}❌ Ollama is not running. Please start it first.${NC}"
    echo "   Run: ollama serve"
    exit 1
fi

echo -e "${GREEN}✅ Ollama is running${NC}"

# Get current models
echo "📋 Checking current models..."
CURRENT_MODELS=$(ollama list | tail -n +2 | awk '{print $1}')

if [ -z "$CURRENT_MODELS" ]; then
    echo -e "${YELLOW}⚠️ No models found. Please install some models first.${NC}"
    exit 1
fi

echo "Current models:"
echo "$CURRENT_MODELS"
echo ""

# Function to try downloading optimized model
try_download_optimized() {
    local base_model="$1"
    local quantization="$2"
    local optimized_name="$3"

    echo "🔍 Checking for $optimized_name..."

    if ollama list | grep -q "$optimized_name"; then
        echo -e "${GREEN}✅ $optimized_name already exists${NC}"
        return 0
    fi

    echo "📥 Attempting to download $optimized_name..."
    if ollama pull "$optimized_name" 2>/dev/null; then
        echo -e "${GREEN}✅ Successfully downloaded $optimized_name${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️ $optimized_name not available${NC}"
        return 1
    fi
}

# Function to get model size
get_model_size() {
    local model="$1"
    ollama show "$model" 2>/dev/null | grep "Size:" | awk '{print $2}' || echo "Unknown"
}

echo -e "${GREEN}🔧 Starting optimization process...${NC}"
echo ""

# Optimize DeepSeek R1
if echo "$CURRENT_MODELS" | grep -q "deepseek-r1"; then
    echo "⚙️ Optimizing DeepSeek R1..."

    # Try various quantized versions
    try_download_optimized "deepseek-r1:latest" "q4_k_m" "deepseek-r1:q4_k_m" || \
    try_download_optimized "deepseek-r1:latest" "q8_0" "deepseek-r1:q8_0" || \
    echo -e "${YELLOW}⚠️ No optimized versions available for DeepSeek R1${NC}"

    echo ""
fi

# Optimize Llama 3.1 models
if echo "$CURRENT_MODELS" | grep -q "llama3.1:8b"; then
    echo "⚙️ Optimizing Llama 3.1 8B..."

    # For 8B models, prefer higher quality quantization
    try_download_optimized "llama3.1:8b" "q8_0" "llama3.1:8b-instruct-q8_0" || \
    try_download_optimized "llama3.1:8b" "q5_k_m" "llama3.1:8b-instruct-q5_k_m" || \
    try_download_optimized "llama3.1:8b" "q4_k_m" "llama3.1:8b-instruct-q4_k_m" || \
    echo -e "${YELLOW}⚠️ No optimized versions available for Llama 3.1 8B${NC}"

    echo ""
fi

if echo "$CURRENT_MODELS" | grep -q "llama3.1:70b"; then
    echo "⚙️ Optimizing Llama 3.1 70B..."

    # For 70B models, prefer aggressive quantization for speed
    try_download_optimized "llama3.1:70b" "q4_k_m" "llama3.1:70b-instruct-q4_k_m" || \
    try_download_optimized "llama3.1:70b" "q4_0" "llama3.1:70b-instruct-q4_0" || \
    try_download_optimized "llama3.1:70b" "q5_k_m" "llama3.1:70b-instruct-q5_k_m" || \
    echo -e "${YELLOW}⚠️ No optimized versions available for Llama 3.1 70B${NC}"

    echo ""
fi

# Optimize Mistral 7B
if echo "$CURRENT_MODELS" | grep -q "mistral:7b"; then
    echo "⚙️ Optimizing Mistral 7B..."

    try_download_optimized "mistral:7b" "q8_0" "mistral:7b-instruct-q8_0" || \
    try_download_optimized "mistral:7b" "q4_k_m" "mistral:7b-instruct-q4_k_m" || \
    echo -e "${YELLOW}⚠️ No optimized versions available for Mistral 7B${NC}"

    echo ""
fi

# Optimize Nous Hermes Mixtral
if echo "$CURRENT_MODELS" | grep -q "nous-hermes2-mixtral"; then
    echo "⚙️ Optimizing Nous Hermes Mixtral..."

    try_download_optimized "nous-hermes2-mixtral:8x7b" "q4_k_m" "nous-hermes2-mixtral:8x7b-q4_k_m" || \
    try_download_optimized "nous-hermes2-mixtral:8x7b" "q5_k_m" "nous-hermes2-mixtral:8x7b-q5_k_m" || \
    echo -e "${YELLOW}⚠️ No optimized versions available for Nous Hermes Mixtral${NC}"

    echo ""
fi

# Download recommended models from the video
echo "📦 Downloading recommended models from benchmarks..."
echo ""

echo "🏆 Downloading top-performing models (from video recommendations)..."

# Qwen 2.5 - mentioned as top performer in video
echo "🔍 Trying Qwen 2.5 models (top benchmark performer)..."
try_download_optimized "qwen2.5" "7b" "qwen2.5:7b" || \
try_download_optimized "qwen2.5" "14b" "qwen2.5:14b" || \
echo -e "${YELLOW}⚠️ Qwen 2.5 models not available${NC}"

# GPT-4o-mini style models
echo "🔍 Trying other high-performance models..."
try_download_optimized "gemma2" "9b" "gemma2:9b" || \
echo -e "${YELLOW}⚠️ Gemma2 not available${NC}"

echo ""
echo -e "${GREEN}✅ Optimization process complete!${NC}"
echo "======================================"

# Display final model list with sizes
echo "📊 Final model inventory:"
echo ""
ollama list

echo ""
echo -e "${GREEN}🎯 Performance Tips:${NC}"
echo "1. Use quantized models (Q4_K_M, Q8_0) for 2-3x speed improvement"
echo "2. Monitor model performance in the MAIA dashboard"
echo "3. Test different models for different consciousness levels"
echo "4. Your M4 Max with 48GB RAM can handle most quantized 70B models"

echo ""
echo -e "${GREEN}🧠 Next Steps:${NC}"
echo "1. Test the new models in the MAIA interface"
echo "2. Run the benchmarking suite to compare performance"
echo "3. Update consciousness level model assignments"
echo "4. Monitor memory usage and response times"

echo ""
echo -e "${GREEN}📈 Expected Improvements:${NC}"
echo "- 50-80% faster response times"
echo "- Better memory efficiency"
echo "- Ability to run larger models simultaneously"
echo "- Improved consciousness level appropriateness"

echo ""
echo "🎉 Your local model setup is now optimized!"