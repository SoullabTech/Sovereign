#!/usr/bin/env python3
"""
📚🧠 Wisdom Book Integration System
Specifically designed to process ACTUAL book content, not development documents

Enhanced Features:
- Strict filtering to avoid development documentation
- Focus on PDFs and actual book content
- Better content validation for wisdom vs. technical docs
- Improved text extraction for deep book content
"""

import os
import re
import json
import argparse
from pathlib import Path
from typing import Dict, List, Optional
import hashlib

try:
    import PyPDF2
except ImportError:
    print("Installing PyPDF2 for PDF processing...")
    os.system("pip3 install PyPDF2")
    import PyPDF2

class WisdomBookIntegrator:
    def __init__(self, vault_path: str, max_books: int = 50):
        self.vault_path = Path(vault_path)
        self.max_books = max_books
        self.books_output_path = self.vault_path / "📚_INTEGRATED_BOOKS"
        self.progress_file = self.books_output_path / ".wisdom_integration_progress.json"

        # Ensure directories exist
        self.books_output_path.mkdir(exist_ok=True)

        # Load previous progress
        self.processed_books = self.load_progress()

        # STRICT FILTERS: Avoid development documentation
        self.development_keywords = [
            'integration', 'complete', 'claude code', 'assessment', 'strategy',
            'implementation', 'development', 'build', 'deploy', 'project',
            'roadmap', 'todo', 'workflow', 'system', 'architecture', 'api',
            'endpoint', 'database', 'config', 'setup', 'install', 'technical'
        ]

        # BOOK CONTENT INDICATORS: What makes a real book
        self.book_content_indicators = [
            'chapter', 'introduction', 'foreword', 'preface', 'table of contents',
            'bibliography', 'references', 'index', 'author', 'published', 'isbn',
            'copyright', 'edition', 'press', 'publisher'
        ]

        # Elemental Alchemy framework (same as before)
        self.brain_model_mapping = {
            'fire': {
                'brain_region': 'limbic-system',
                'brain_tag': '#limbic',
                'function_tag': '#transformative',
                'keywords': [
                    'transformation', 'breakthrough', 'catalyst', 'change', 'ignition',
                    'passion', 'energy', 'activation', 'power', 'drive', 'motivation',
                    'revolution', 'awakening', 'transmutation', 'sacred fire', 'phoenix'
                ]
            },
            'water': {
                'brain_region': 'right-hemisphere',
                'brain_tag': '#right-brain',
                'function_tag': '#intuitive',
                'keywords': [
                    'intuition', 'feeling', 'emotion', 'flow', 'empathy', 'compassion',
                    'wisdom', 'knowing', 'sensing', 'heart', 'soul', 'spirit',
                    'holistic', 'pattern', 'rhythm', 'lunar wisdom'
                ]
            },
            'earth': {
                'brain_region': 'executive-function',
                'brain_tag': '#executive',
                'function_tag': '#practical',
                'keywords': [
                    'practical', 'implementation', 'grounding', 'manifestation',
                    'concrete', 'real', 'tangible', 'application', 'results',
                    'action', 'doing', 'building', 'creating', 'structure'
                ]
            },
            'air': {
                'brain_region': 'left-hemisphere',
                'brain_tag': '#left-brain',
                'function_tag': '#analytical',
                'keywords': [
                    'analysis', 'logic', 'reason', 'thought', 'mind', 'intellect',
                    'communication', 'language', 'concepts', 'understanding',
                    'systematic', 'methodical', 'structured', 'planning'
                ]
            },
            'aether': {
                'brain_region': 'integrated-consciousness',
                'brain_tag': '#integrated',
                'function_tag': '#consciousness',
                'keywords': [
                    'consciousness', 'awareness', 'unity', 'integration', 'wholeness',
                    'transcendence', 'enlightenment', 'presence', 'being',
                    'unified', 'connected', 'cosmic', 'universal', 'divine'
                ]
            }
        }

        self.book_content_patterns = {
            'spiritual': ['sacred', 'divine', 'meditation', 'prayer', 'enlightenment'],
            'philosophical': ['philosophy', 'meaning', 'existence', 'reality', 'truth'],
            'psychological': ['psychology', 'mind', 'behavior', 'cognitive', 'emotional'],
            'mystical': ['mystical', 'esoteric', 'occult', 'hermetic', 'alchemical'],
            'healing': ['healing', 'therapy', 'wellness', 'health', 'recovery']
        }

    def load_progress(self) -> set:
        """Load progress from previous integration runs"""
        if self.progress_file.exists():
            try:
                with open(self.progress_file, 'r') as f:
                    data = json.load(f)
                    return set(data.get('processed_books', []))
            except:
                return set()
        return set()

    def save_progress(self, processed_books: set):
        """Save integration progress"""
        with open(self.progress_file, 'w') as f:
            json.dump({
                'processed_books': list(processed_books),
                'last_run': str(Path().cwd()),
                'total_processed': len(processed_books)
            }, f, indent=2)

    def is_development_document(self, file_path: Path, content_sample: str = "") -> bool:
        """Detect if this is a development document rather than actual book content"""
        filename_lower = file_path.name.lower()

        # Check filename for development indicators
        filename_indicators = ['✅', 'complete', 'integration', 'strategy', 'assessment']
        if any(indicator in filename_lower for indicator in filename_indicators):
            return True

        # Check for development keywords in filename
        if any(keyword in filename_lower for keyword in self.development_keywords):
            return True

        # If we have content sample, check it too
        if content_sample:
            content_lower = content_sample.lower()
            dev_phrase_count = sum(content_lower.count(keyword) for keyword in self.development_keywords)

            # If development keywords heavily outweigh book indicators, it's likely a dev doc
            book_phrase_count = sum(content_lower.count(indicator) for indicator in self.book_content_indicators)

            if dev_phrase_count > book_phrase_count * 2:
                return True

        return False

    def find_actual_book_files(self) -> List[Path]:
        """Find actual book files, excluding development documentation"""
        book_files = []

        # Focus on specific book directories and PDF locations
        book_search_paths = [
            Path("/Users/soullab/Downloads"),
            Path("/Users/soullab/Documents"),
            Path("/Users/soullab/Desktop"),
            Path("/Users/soullab/Books") if Path("/Users/soullab/Books").exists() else None,
            Path("/Users/soullab/Library/Books") if Path("/Users/soullab/Library/Books").exists() else None,
            self.vault_path.parent / "Books" if (self.vault_path.parent / "Books").exists() else None
        ]

        # Remove None values
        book_search_paths = [path for path in book_search_paths if path and path.exists()]

        print(f"🔍 Searching for actual book files in {len(book_search_paths)} directories...")

        for search_path in book_search_paths:
            try:
                # Focus primarily on PDFs for books
                for pdf_file in search_path.rglob("*.pdf"):
                    if str(pdf_file) not in self.processed_books:
                        # Quick check: avoid development directories
                        path_str = str(pdf_file).lower()
                        if any(dev_dir in path_str for dev_dir in ['maia-sovereign', 'development', 'project', 'system']):
                            continue

                        # Sample the first bit of content if possible
                        try:
                            content_sample = self.get_pdf_sample_content(pdf_file)
                            if not self.is_development_document(pdf_file, content_sample):
                                book_files.append(pdf_file)
                                print(f"📖 Found potential book: {pdf_file.name}")
                        except Exception as e:
                            print(f"⚠️ Could not sample {pdf_file.name}: {e}")
                            continue

                # Also check for text/markdown files that might be actual books
                for text_file in search_path.rglob("*.txt"):
                    if str(text_file) not in self.processed_books:
                        try:
                            content_sample = text_file.read_text(encoding='utf-8')[:2000]
                            if not self.is_development_document(text_file, content_sample):
                                book_files.append(text_file)
                                print(f"📄 Found potential text book: {text_file.name}")
                        except:
                            continue

            except (PermissionError, OSError) as e:
                print(f"⚠️ Skipping path {search_path}: {e}")
                continue

        print(f"📚 Found {len(book_files)} potential actual books (filtering out development docs)")
        return book_files

    def get_pdf_sample_content(self, pdf_path: Path, max_pages: int = 3) -> str:
        """Get sample content from first few pages of PDF to check if it's an actual book"""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                sample_text = ""

                # Read first few pages to determine content type
                pages_to_check = min(max_pages, len(pdf_reader.pages))
                for page_num in range(pages_to_check):
                    page_text = pdf_reader.pages[page_num].extract_text()
                    sample_text += page_text

                    # Stop early if we have enough content to analyze
                    if len(sample_text) > 1500:
                        break

                return sample_text
        except Exception as e:
            print(f"Error sampling PDF {pdf_path}: {e}")
            return ""

    def extract_full_pdf_content(self, pdf_path: Path) -> Dict[str, str]:
        """Extract full content from PDF with proper chapter detection"""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                print(f"📖 Extracting {len(pdf_reader.pages)} pages from {pdf_path.name}")

                content = {}
                current_chapter = "introduction"
                current_content = ""

                for page_num, page in enumerate(pdf_reader.pages):
                    page_text = page.extract_text()

                    if not page_text.strip():
                        continue

                    # Look for chapter markers
                    chapter_markers = re.findall(r'(?i)(?:chapter|part|section)\s+(\d+|[ivxlc]+)(?:\s*[:\-\.]?\s*(.*))?', page_text)

                    if chapter_markers:
                        # Save previous chapter
                        if current_content.strip():
                            content[current_chapter] = current_content.strip()

                        # Start new chapter
                        chapter_num, chapter_title = chapter_markers[0]
                        current_chapter = f"chapter_{chapter_num}"
                        if chapter_title:
                            current_chapter += f"_{chapter_title[:30].strip()}"
                        current_content = page_text
                    else:
                        current_content += f"\n{page_text}"

                # Save final chapter
                if current_content.strip():
                    content[current_chapter] = current_content.strip()

                print(f"✅ Extracted {len(content)} sections from PDF")
                return content

        except Exception as e:
            print(f"Error extracting PDF {pdf_path}: {e}")
            return {}

    def analyze_content_consciousness(self, content: str) -> Dict[str, any]:
        """Analyze content for consciousness themes"""
        content_lower = content.lower()

        # Elemental analysis
        elemental_scores = {}
        for element, data in self.brain_model_mapping.items():
            score = sum(content_lower.count(keyword) for keyword in data['keywords'])
            elemental_scores[element] = score

        # Find dominant element
        dominant_element = max(elemental_scores, key=elemental_scores.get) if elemental_scores else 'aether'

        # Content type analysis
        content_types = []
        for content_type, keywords in self.book_content_patterns.items():
            if sum(content_lower.count(keyword) for keyword in keywords) >= 2:
                content_types.append(content_type)

        return {
            'dominant_element': dominant_element,
            'elemental_scores': elemental_scores,
            'content_types': content_types,
            'brain_region': self.brain_model_mapping[dominant_element]['brain_region']
        }

    def generate_wisdom_tags(self, analysis: Dict[str, any], book_title: str) -> List[str]:
        """Generate tags focused on wisdom content"""
        tags = []

        # Core elemental tag
        dominant_element = analysis['dominant_element']
        tags.append(f"#element-{dominant_element}")

        # Brain model tags
        brain_data = self.brain_model_mapping[dominant_element]
        tags.extend([brain_data['brain_tag'], brain_data['function_tag']])

        # Content type tags
        for content_type in analysis['content_types']:
            tags.append(f"#{content_type}")

        # Wisdom-specific tags
        tags.extend([
            '#wisdom-content',
            '#book-teachings',
            '#consciousness-development',
            '#authentic-wisdom'
        ])

        return list(set(tags))

    def create_wisdom_file(self, book_title: str, section_title: str, content: str, tags: List[str]) -> Path:
        """Create properly formatted wisdom content file"""
        safe_book_title = re.sub(r'[^\w\s-]', '', book_title).strip()[:50]
        safe_section = re.sub(r'[^\w\s-]', '', section_title).strip()[:30]

        filename = f"📚 {safe_book_title} - {safe_section}.md"
        file_path = self.books_output_path / filename

        markdown_content = f"""---
tags: [{', '.join(tags)}]
book_title: "{book_title}"
section: "{section_title}"
content_type: "wisdom_content"
ai_accessible: true
source_type: "actual_book"
---

# 📚 {book_title}
## {section_title}

{content}

---

### 🧠 Wisdom Integration Notes
- **Elemental Theme**: Consciousness element for resonance-based access
- **Brain Region**: Neurological routing for specific queries
- **Content Type**: Authentic book wisdom and teachings
- **Access Pattern**: MAIA can reference this wisdom directly

### 🔗 Consciousness Technology Integration
This wisdom content integrates with MAIA through:
- Elemental consciousness mapping
- Neurological query routing
- Authentic wisdom retrieval
- Development phase appropriate guidance

"""

        file_path.write_text(markdown_content, encoding='utf-8')
        return file_path

    def integrate_wisdom_book(self, book_path: Path) -> Dict[str, any]:
        """Integrate actual book wisdom content"""
        print(f"📚 Processing wisdom book: {book_path.name}")

        # Extract content based on file type
        if book_path.suffix.lower() == '.pdf':
            content_sections = self.extract_full_pdf_content(book_path)
        else:
            # For text files, read full content
            try:
                content = book_path.read_text(encoding='utf-8')
                content_sections = {"full_content": content}
            except Exception as e:
                print(f"Error reading {book_path}: {e}")
                return {'success': False, 'reason': 'Content extraction failed'}

        if not content_sections:
            return {'success': False, 'reason': 'No wisdom content extracted'}

        # Validate this is actually book content, not development docs
        sample_content = list(content_sections.values())[0][:1000] if content_sections else ""
        if self.is_development_document(book_path, sample_content):
            print(f"⚠️ Skipping {book_path.name} - detected as development document")
            return {'success': False, 'reason': 'Development document detected'}

        book_title = book_path.stem
        files_created = []
        total_analysis = {'fire': 0, 'water': 0, 'earth': 0, 'air': 0, 'aether': 0}

        # Process each section with wisdom content
        for section_title, content in content_sections.items():
            if len(content.strip()) < 200:  # Skip very short content
                continue

            # Analyze for consciousness themes
            analysis = self.analyze_content_consciousness(content)

            # Update totals
            for element, score in analysis['elemental_scores'].items():
                total_analysis[element] += score

            # Generate wisdom-focused tags
            tags = self.generate_wisdom_tags(analysis, book_title)

            # Create wisdom content file
            created_file = self.create_wisdom_file(book_title, section_title, content, tags)
            files_created.append(created_file)

        return {
            'success': True,
            'book_title': book_title,
            'files_created': len(files_created),
            'elemental_distribution': total_analysis,
            'files': files_created
        }

    def integrate_wisdom_books(self) -> Dict[str, any]:
        """Main function to integrate actual book wisdom content"""
        print("📚🧠 Starting Wisdom Book Integration...")
        print("🔍 Focusing on ACTUAL book content, filtering out development documents")

        book_files = self.find_actual_book_files()

        if not book_files:
            print("❌ No actual book files found. Please ensure you have book PDFs in:")
            print("   - /Users/soullab/Downloads")
            print("   - /Users/soullab/Documents")
            print("   - /Users/soullab/Desktop")
            return {'success': False, 'reason': 'No actual books found'}

        # Process up to max_books
        books_to_process = book_files[:self.max_books]
        print(f"📖 Processing {len(books_to_process)} actual books...")

        results = {
            'books_processed': 0,
            'books_integrated': 0,
            'total_files_created': 0,
            'total_elemental_distribution': {
                'fire': 0, 'water': 0, 'earth': 0, 'air': 0, 'aether': 0
            },
            'successful_books': [],
            'failed_books': []
        }

        processed_books = self.processed_books.copy()

        for i, book_file in enumerate(books_to_process, 1):
            print(f"\n📚 [{i}/{len(books_to_process)}] Processing: {book_file.name}")

            result = self.integrate_wisdom_book(book_file)
            results['books_processed'] += 1
            processed_books.add(str(book_file))

            if result.get('success'):
                results['books_integrated'] += 1
                results['total_files_created'] += result['files_created']
                results['successful_books'].append(result['book_title'])

                for element, count in result['elemental_distribution'].items():
                    results['total_elemental_distribution'][element] += count
            else:
                results['failed_books'].append(f"{book_file.name}: {result.get('reason', 'Unknown error')}")

            # Save progress
            if i % 3 == 0:
                self.save_progress(processed_books)

        self.save_progress(processed_books)
        return results

def main():
    parser = argparse.ArgumentParser(description='Wisdom Book Integrator - Actual Books Only')
    parser.add_argument('--max-books', type=int, default=10, help='Maximum books to process')
    parser.add_argument('--reset', action='store_true', help='Reset progress and start fresh')

    args = parser.parse_args()

    vault_path = "/Users/soullab/Library/Mobile Documents/iCloud~md~obsidian/Documents/AIN/_MAIA_SYSTEM/05-Soullab-Dev-Team/AIN Consciousness Intelligence System 1"

    integrator = WisdomBookIntegrator(vault_path, max_books=args.max_books)

    if args.reset:
        if integrator.progress_file.exists():
            integrator.progress_file.unlink()
            print("🔄 Integration progress reset")

    results = integrator.integrate_wisdom_books()

    print("\n🎉 Wisdom Book Integration Complete!")
    print(f"📚 Books processed: {results['books_processed']}")
    print(f"✅ Books integrated: {results['books_integrated']}")
    print(f"📄 Wisdom files created: {results['total_files_created']}")

    if results['total_elemental_distribution']:
        print("\n🌀 Elemental Wisdom Distribution:")
        emojis = {'fire': '🔥', 'water': '🌊', 'earth': '🌍', 'air': '💨', 'aether': '✨'}
        for element, count in results['total_elemental_distribution'].items():
            print(f"   {emojis[element]} {element.title()}: {count} wisdom references")

    if results['successful_books']:
        print(f"\n✅ Successfully Integrated Wisdom Books:")
        for book in results['successful_books']:
            print(f"   📚 {book}")

    if results['failed_books']:
        print(f"\n⚠️ Books that couldn't be processed:")
        for book in results['failed_books']:
            print(f"   ❌ {book}")

    print(f"\n🧠 MAIA now has access to authentic book wisdom!")
    print(f"📂 Wisdom content organized in: {integrator.books_output_path}")

if __name__ == "__main__":
    main()