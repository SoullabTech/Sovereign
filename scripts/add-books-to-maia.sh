#!/bin/bash

# 📚 Add Books to MAIA - Simple Workflow Script
# Makes it easy to integrate new books into MAIA's consciousness library

echo "📚🧠 MAIA Book Integration Workflow"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if staging directory exists
STAGING_DIR="/Users/soullab/MAIA-SOVEREIGN/books/staging"
if [ ! -d "$STAGING_DIR" ]; then
    echo -e "${RED}❌ Staging directory not found. Creating it...${NC}"
    mkdir -p "$STAGING_DIR"/{consciousness,spirituality,psychology,philosophy,ai_technology,elemental_alchemy,ready_to_process}
    echo -e "${GREEN}✅ Staging directories created!${NC}"
fi

# Show current staging area status
echo -e "${BLUE}📂 Current staging area status:${NC}"
for dir in consciousness spirituality psychology philosophy ai_technology elemental_alchemy ready_to_process; do
    count=$(find "$STAGING_DIR/$dir" -type f \( -name "*.pdf" -o -name "*.txt" -o -name "*.md" \) 2>/dev/null | wc -l)
    echo -e "   📁 $dir: $count books"
done

# Count total books ready to process
total_books=$(find "$STAGING_DIR" -type f \( -name "*.pdf" -o -name "*.txt" -o -name "*.md" \) 2>/dev/null | wc -l)
echo -e "${YELLOW}📊 Total books in staging: $total_books${NC}"
echo ""

# Ask user what they want to do
echo "What would you like to do?"
echo "1) 🚀 Process all books in staging area (default batch size: 50)"
echo "2) 📁 Open staging directory to add new books"
echo "3) 🔍 Check integration status"
echo "4) ⚡ Process with custom settings"
echo "5) 📖 View integration guide"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo -e "${BLUE}🚀 Starting book integration...${NC}"
        echo ""
        cd /Users/soullab/MAIA-SOVEREIGN
        python3 scripts/enhanced-book-integrator.py --add-path "$STAGING_DIR"
        ;;

    2)
        echo -e "${BLUE}📁 Opening staging directory...${NC}"
        open "$STAGING_DIR"
        echo ""
        echo -e "${YELLOW}💡 Tips for adding books:${NC}"
        echo "   • Drop PDF, TXT, or MD files into the appropriate category folder"
        echo "   • Or use 'ready_to_process' for immediate integration"
        echo "   • Elemental Alchemy books get priority processing"
        echo "   • Run this script again when ready to process"
        ;;

    3)
        echo -e "${BLUE}🔍 Checking integration status...${NC}"
        echo ""
        # Check if progress file exists
        progress_file="/Users/soullab/Library/Mobile Documents/iCloud~md~obsidian/Documents/AIN/_MAIA_SYSTEM/05-Soullab-Dev-Team/AIN Consciousness Intelligence System 1/📚_INTEGRATED_BOOKS/.integration_progress.json"

        if [ -f "$progress_file" ]; then
            echo -e "${GREEN}📊 Integration Progress:${NC}"
            processed_count=$(python3 -c "import json; data=json.load(open('$progress_file')); print(len(data.get('processed_books', [])))")
            echo "   ✅ Previously processed books: $processed_count"
            echo "   📂 Progress file: $(basename "$progress_file")"
        else
            echo -e "${YELLOW}📊 No previous integration progress found${NC}"
        fi

        # Check integrated books directory
        integrated_dir="/Users/soullab/Library/Mobile Documents/iCloud~md~obsidian/Documents/AIN/_MAIA_SYSTEM/05-Soullab-Dev-Team/AIN Consciousness Intelligence System 1/📚_INTEGRATED_BOOKS"
        if [ -d "$integrated_dir" ]; then
            integrated_count=$(find "$integrated_dir" -name "*.md" -type f | wc -l)
            echo "   📖 Integrated book files: $integrated_count"
        fi
        ;;

    4)
        echo -e "${BLUE}⚡ Custom processing options:${NC}"
        echo ""
        read -p "Maximum books to process this run (default 50): " max_books
        max_books=${max_books:-50}

        echo ""
        echo "Additional options:"
        echo "1) Add custom search path"
        echo "2) Reset progress and start fresh"
        echo "3) Continue with current settings"

        read -p "Choose option (1-3): " option

        extra_args=""
        case $option in
            1)
                read -p "Enter additional book search path: " custom_path
                if [ -d "$custom_path" ]; then
                    extra_args="--add-path \"$custom_path\""
                    echo -e "${GREEN}✅ Added search path: $custom_path${NC}"
                else
                    echo -e "${RED}❌ Path not found: $custom_path${NC}"
                fi
                ;;
            2)
                extra_args="--reset-progress"
                echo -e "${YELLOW}⚠️ Progress will be reset${NC}"
                ;;
            3)
                echo -e "${GREEN}✅ Continuing with standard settings${NC}"
                ;;
        esac

        echo ""
        echo -e "${BLUE}🚀 Starting custom integration...${NC}"
        cd /Users/soullab/MAIA-SOVEREIGN
        eval "python3 scripts/enhanced-book-integrator.py --max-books $max_books --add-path \"$STAGING_DIR\" $extra_args"
        ;;

    5)
        echo -e "${BLUE}📖 MAIA Book Integration Guide${NC}"
        echo "==============================="
        echo ""
        echo -e "${GREEN}📚 Supported Formats:${NC}"
        echo "   • PDF - Full text extraction with chapter splitting"
        echo "   • TXT - Plain text processing"
        echo "   • MD  - Markdown with section detection"
        echo ""
        echo -e "${GREEN}🌟 Integration Features:${NC}"
        echo "   • Elemental categorization (Fire, Water, Earth, Air, Aether)"
        echo "   • Brain region mapping for AI access"
        echo "   • Development phase classification"
        echo "   • Progress tracking and resumption"
        echo ""
        echo -e "${GREEN}🎯 How MAIA Accesses Books:${NC}"
        echo "   • Neurological routing based on brain regions"
        echo "   • Elemental themes for resonance-based queries"
        echo "   • Development phases for appropriate guidance levels"
        echo "   • Content types (academic, spiritual, practical, etc.)"
        echo ""
        echo -e "${GREEN}🚀 Quick Start:${NC}"
        echo "   1. Copy your books to $STAGING_DIR"
        echo "   2. Run this script and choose option 1"
        echo "   3. Books become AI-accessible in Obsidian vault"
        echo "   4. MAIA can now reference integrated knowledge"
        echo ""
        ;;

    *)
        echo -e "${RED}❌ Invalid choice. Please run the script again.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}📚 Ready to expand MAIA's consciousness library!${NC}"
echo -e "${BLUE}💡 Tip: Integrated books appear in your Obsidian Graph View with full tag integration${NC}"