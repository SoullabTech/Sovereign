#!/usr/bin/env python3
"""
📚🧠 Enhanced Book Consciousness Integration System
Integrates large quantities of books into the consciousness intelligence architecture

Enhanced Features:
- Configurable book processing limits
- Progress tracking and resumption
- Better error handling
- Batch processing capabilities
- Support for adding new book directories
"""

import os
import re
import json
import argparse
from pathlib import Path
from typing import Dict, List, Optional

# Import the existing brain model system
import sys
sys.path.append('/Users/soullab/MAIA-SOVEREIGN/scripts')

try:
    import PyPDF2
except ImportError:
    print("Installing PyPDF2 for PDF processing...")
    os.system("pip3 install PyPDF2")
    import PyPDF2

class EnhancedBookConsciousnessIntegrator:
    def __init__(self, vault_path: str, books_source_path: str = "/Users/soullab", max_books: int = 50):
        self.vault_path = Path(vault_path)
        self.books_source_path = Path(books_source_path)
        self.max_books = max_books
        self.books_output_path = self.vault_path / "📚_INTEGRATED_BOOKS"
        self.progress_file = self.books_output_path / ".integration_progress.json"

        # Priority: Elemental Alchemy as foundational architectural logic
        self.elemental_alchemy_path = self.books_output_path / "🌟_ELEMENTAL_ALCHEMY_FOUNDATION"

        # Ensure directories exist
        self.books_output_path.mkdir(exist_ok=True)
        self.elemental_alchemy_path.mkdir(exist_ok=True)

        # Additional search paths for new books
        self.additional_book_paths = []

        # Load previous progress
        self.processed_books = self.load_progress()

        # FOUNDATIONAL: Elemental Alchemy framework (same as original)
        self.brain_model_mapping = {
            'fire': {
                'brain_region': 'limbic-system',
                'brain_tag': '#limbic',
                'function_tag': '#transformative',
                'elemental_alchemy_principle': 'Fire element - phenomenal transformation through limbic activation',
                'keywords': [
                    'transformation', 'breakthrough', 'catalyst', 'change', 'ignition',
                    'passion', 'energy', 'activation', 'power', 'drive', 'motivation',
                    'breakthrough', 'innovation', 'revolution', 'awakening', 'alchemy',
                    'transmutation', 'sacred fire', 'elemental fire', 'phoenix', 'regeneration'
                ]
            },
            'air': {
                'brain_region': 'left-hemisphere',
                'brain_tag': '#left-brain',
                'function_tag': '#analytical',
                'elemental_alchemy_principle': 'Air element - phenomenal communication through left-brain analysis',
                'keywords': [
                    'analysis', 'logic', 'reason', 'thought', 'mind', 'intellect',
                    'communication', 'language', 'concepts', 'understanding',
                    'systematic', 'methodical', 'structured', 'planning', 'alchemy',
                    'elemental air', 'sacred breath', 'mental clarity', 'wisdom transmission'
                ]
            },
            'water': {
                'brain_region': 'right-hemisphere',
                'brain_tag': '#right-brain',
                'function_tag': '#intuitive',
                'elemental_alchemy_principle': 'Water element - phenomenal flow through right-brain intuition',
                'keywords': [
                    'intuition', 'feeling', 'emotion', 'flow', 'empathy', 'compassion',
                    'wisdom', 'knowing', 'sensing', 'heart', 'soul', 'spirit',
                    'holistic', 'gestalt', 'pattern', 'rhythm', 'alchemy',
                    'elemental water', 'sacred flow', 'emotional intelligence', 'lunar wisdom'
                ]
            },
            'earth': {
                'brain_region': 'executive-function',
                'brain_tag': '#executive',
                'function_tag': '#practical',
                'elemental_alchemy_principle': 'Earth element - phenomenal manifestation through executive grounding',
                'keywords': [
                    'practical', 'implementation', 'grounding', 'manifestation',
                    'concrete', 'real', 'tangible', 'application', 'results',
                    'action', 'doing', 'building', 'creating', 'structure', 'alchemy',
                    'elemental earth', 'sacred ground', 'material mastery', 'embodied wisdom'
                ]
            },
            'aether': {
                'brain_region': 'integrated-consciousness',
                'brain_tag': '#integrated',
                'function_tag': '#consciousness',
                'elemental_alchemy_principle': 'Aether element - phenomenal unity through integrated consciousness',
                'keywords': [
                    'consciousness', 'awareness', 'unity', 'integration', 'wholeness',
                    'transcendence', 'enlightenment', 'presence', 'being',
                    'unified', 'connected', 'cosmic', 'universal', 'divine', 'alchemy',
                    'elemental aether', 'sacred unity', 'cosmic consciousness', 'alchemical gold'
                ]
            }
        }

        # Book-specific patterns for enhanced classification
        self.book_content_patterns = {
            'academic': ['research', 'study', 'theory', 'methodology', 'analysis', 'evidence'],
            'spiritual': ['sacred', 'divine', 'meditation', 'prayer', 'enlightenment', 'awakening'],
            'practical': ['exercise', 'practice', 'technique', 'method', 'how-to', 'guide'],
            'philosophical': ['philosophy', 'meaning', 'existence', 'reality', 'truth', 'wisdom'],
            'psychological': ['psychology', 'mind', 'behavior', 'cognitive', 'emotional', 'mental']
        }

        # Development phase mapping for books
        self.development_phases = {
            'foundational': ['introduction', 'basics', 'fundamentals', 'beginner', 'overview'],
            'developmental': ['intermediate', 'developing', 'growth', 'progress', 'advancing'],
            'mastery': ['advanced', 'expert', 'master', 'profound', 'deep', 'complete']
        }

    def add_book_source_path(self, path: str):
        """Add additional book source paths for discovery"""
        book_path = Path(path)
        if book_path.exists():
            self.additional_book_paths.append(book_path)
            print(f"📂 Added book source: {path}")
        else:
            print(f"⚠️ Path not found: {path}")

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

    def find_book_files(self) -> List[Path]:
        """Enhanced book discovery with additional paths"""
        book_extensions = ['.pdf', '.txt', '.md', '.epub']
        book_files = []

        # Standard search paths
        search_paths = [
            self.books_source_path / "Documents",
            self.books_source_path / "Downloads",
            self.books_source_path / "Library",
            self.books_source_path / "Desktop",
            self.books_source_path,
            Path("/Users/soullab/Obsidian Vaults"),
            Path("/Users/soullab/Documents")
        ]

        # Add any additional paths
        search_paths.extend(self.additional_book_paths)

        for search_path in search_paths:
            if search_path.exists():
                try:
                    for ext in book_extensions:
                        book_files.extend(search_path.rglob(f"*{ext}"))
                except (PermissionError, OSError, InterruptedError) as e:
                    print(f"⚠️ Skipping path {search_path}: {e}")
                    continue

        # Filter for consciousness-related books
        consciousness_keywords = [
            'consciousness', 'spiritual', 'wisdom', 'psychology', 'mind',
            'elemental', 'alchemy', 'meditation', 'awareness', 'intelligence',
            'ai', 'artificial', 'neuroscience', 'brain', 'cognitive', 'philosophy',
            'mystical', 'esoteric', 'metaphysical', 'quantum', 'healing'
        ]

        filtered_books = []
        for book_file in book_files:
            book_name_lower = book_file.name.lower()

            # Skip already processed books
            if str(book_file) in self.processed_books:
                continue

            if any(keyword in book_name_lower for keyword in consciousness_keywords):
                filtered_books.append(book_file)
            elif 'book' in book_name_lower or 'handbook' in book_name_lower:
                filtered_books.append(book_file)

        # Priority handling for Elemental Alchemy books
        elemental_alchemy_books = [b for b in filtered_books
                                 if 'elemental' in b.name.lower() and 'alchemy' in b.name.lower()]

        other_books = [b for b in filtered_books if b not in elemental_alchemy_books]

        return elemental_alchemy_books + other_books

    def extract_pdf_content(self, pdf_path: Path) -> Dict[str, str]:
        """Extract text content from PDF by pages/chapters - same as original"""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                content = {}

                for page_num, page in enumerate(pdf_reader.pages):
                    page_text = page.extract_text()
                    if page_text.strip():  # Only include non-empty pages
                        content[f"page_{page_num + 1}"] = page_text

                return content
        except Exception as e:
            print(f"Error extracting PDF {pdf_path}: {e}")
            return {}

    def extract_text_content(self, text_path: Path) -> Dict[str, str]:
        """Extract content from text/markdown files - same as original"""
        try:
            content = text_path.read_text(encoding='utf-8')

            # Try to split by chapters or sections
            if '# ' in content or '## ' in content:
                # Markdown-style sections
                sections = re.split(r'\n#+ ', content)
                return {f"section_{i}": section.strip() for i, section in enumerate(sections) if section.strip()}
            else:
                # Single content file
                return {"full_content": content}
        except Exception as e:
            print(f"Error reading text file {text_path}: {e}")
            return {}

    def analyze_content_consciousness(self, content: str) -> Dict[str, any]:
        """Analyze content for consciousness themes - same as original"""
        content_lower = content.lower()

        # Elemental analysis
        elemental_scores = {}
        for element, data in self.brain_model_mapping.items():
            score = sum(content_lower.count(keyword) for keyword in data['keywords'])
            elemental_scores[element] = score

        # Find dominant element
        dominant_element = max(elemental_scores, key=elemental_scores.get)

        # Content type analysis
        content_types = []
        for content_type, keywords in self.book_content_patterns.items():
            if sum(content_lower.count(keyword) for keyword in keywords) >= 2:
                content_types.append(content_type)

        # Development phase analysis
        development_level = 'developmental'  # default
        for phase, keywords in self.development_phases.items():
            if any(keyword in content_lower for keyword in keywords):
                development_level = phase
                break

        return {
            'dominant_element': dominant_element,
            'elemental_scores': elemental_scores,
            'content_types': content_types,
            'development_level': development_level,
            'brain_region': self.brain_model_mapping[dominant_element]['brain_region']
        }

    def generate_book_tags(self, analysis: Dict[str, any], book_title: str) -> List[str]:
        """Generate comprehensive tags - same as original"""
        tags = []

        # PRIORITY: Elemental Alchemy foundational tags
        if 'elemental' in book_title.lower() and 'alchemy' in book_title.lower():
            tags.extend([
                '#elemental-alchemy-foundation',
                '#ancient-art',
                '#phenomenal-living',
                '#architectural-logic',
                '#foundational-wisdom'
            ])

        # Core elemental tag (based on Elemental Alchemy principles)
        dominant_element = analysis['dominant_element']
        tags.append(f"#element-{dominant_element}")

        # Brain model tags (derived from Elemental Alchemy)
        brain_data = self.brain_model_mapping[dominant_element]
        tags.extend([
            brain_data['brain_tag'],
            brain_data['function_tag']
        ])

        # Elemental Alchemy principle tag
        if 'elemental_alchemy_principle' in brain_data:
            tags.append(f"#elemental-{dominant_element}-principle")

        # Content type tags
        for content_type in analysis['content_types']:
            tags.append(f"#{content_type}")

        # Development phase tag (aligned with phenomenal living progression)
        development_level = analysis['development_level']
        if development_level == 'foundational':
            tags.extend(['#spiral-entry', '#elemental-foundation'])
        elif development_level == 'developmental':
            tags.extend(['#spiral-integration', '#elemental-development'])
        else:
            tags.extend(['#spiral-mastery', '#elemental-mastery'])

        # Book-specific tags
        tags.extend(['#book-content', '#consciousness-literature'])

        return list(set(tags))  # Remove duplicates

    def create_book_chapter_file(self, book_title: str, chapter_title: str,
                                content: str, tags: List[str]) -> Path:
        """Create a properly formatted markdown file - same as original"""
        # Clean titles for filename
        safe_book_title = re.sub(r'[^\w\s-]', '', book_title).strip()[:50]
        safe_chapter_title = re.sub(r'[^\w\s-]', '', chapter_title).strip()[:30]

        filename = f"📖 {safe_book_title} - {safe_chapter_title}.md"
        file_path = self.books_output_path / filename

        # Create markdown content
        markdown_content = f"""---
tags: [{', '.join(tags)}]
book_title: "{book_title}"
chapter: "{chapter_title}"
content_type: "book_content"
ai_accessible: true
---

# 📖 {book_title}
## {chapter_title}

{content}

---

### 🧠 AI Integration Notes
- **Elemental Theme**: Primary consciousness element based on content analysis
- **Brain Region**: Neurological routing for AI query matching
- **Development Phase**: Appropriate for users at this consciousness level
- **Access Pattern**: MAIA can route queries here based on matching tags

### 🔗 Related Consciousness Technology
This content integrates with the broader consciousness intelligence system through:
- Elemental mapping for resonance-based access
- Neurological routing for brain-function specific queries
- Development phase calibration for appropriate guidance

"""

        # Write file
        file_path.write_text(markdown_content, encoding='utf-8')
        return file_path

    def integrate_book(self, book_path: Path) -> Dict[str, any]:
        """Integrate a single book - same as original"""
        print(f"📚 Processing: {book_path.name}")

        # Extract content based on file type
        if book_path.suffix.lower() == '.pdf':
            content_sections = self.extract_pdf_content(book_path)
        else:
            content_sections = self.extract_text_content(book_path)

        if not content_sections:
            return {'success': False, 'reason': 'No content extracted'}

        book_title = book_path.stem
        files_created = []
        total_analysis = {
            'fire': 0, 'water': 0, 'earth': 0, 'air': 0, 'aether': 0
        }

        # Process each section/chapter
        for section_title, content in content_sections.items():
            if len(content.strip()) < 100:  # Skip very short content
                continue

            # Analyze consciousness themes
            analysis = self.analyze_content_consciousness(content)

            # Update total analysis
            for element, score in analysis['elemental_scores'].items():
                total_analysis[element] += score

            # Generate tags
            tags = self.generate_book_tags(analysis, book_title)

            # Create markdown file
            created_file = self.create_book_chapter_file(
                book_title, section_title, content, tags
            )
            files_created.append(created_file)

        return {
            'success': True,
            'book_title': book_title,
            'files_created': len(files_created),
            'elemental_distribution': total_analysis,
            'files': files_created
        }

    def integrate_batch_books(self) -> Dict[str, any]:
        """Enhanced batch integration with progress tracking"""
        print("📚🧠 Starting Enhanced Book Consciousness Integration...")

        # Find all available books
        book_files = self.find_book_files()
        print(f"📊 Found {len(book_files)} new consciousness books to process")
        print(f"📋 Previously processed: {len(self.processed_books)} books")

        if not book_files:
            print("No new book files found.")
            return {'success': False, 'reason': 'No new books found'}

        # Limit to max_books for this run
        books_to_process = book_files[:self.max_books]
        print(f"🎯 Processing {len(books_to_process)} books in this batch")

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

        # Process each book with progress tracking
        for i, book_file in enumerate(books_to_process, 1):
            print(f"\n📖 Processing [{i}/{len(books_to_process)}]: {book_file.name}")

            book_result = self.integrate_book(book_file)
            results['books_processed'] += 1

            # Mark as processed regardless of success
            processed_books.add(str(book_file))

            if book_result.get('success'):
                results['books_integrated'] += 1
                results['total_files_created'] += book_result['files_created']
                results['successful_books'].append(book_result['book_title'])

                # Update elemental distribution
                for element, count in book_result['elemental_distribution'].items():
                    results['total_elemental_distribution'][element] += count
            else:
                results['failed_books'].append(book_file.name)

            # Save progress periodically
            if i % 5 == 0:
                self.save_progress(processed_books)
                print(f"📊 Progress saved - {i} books processed")

        # Final progress save
        self.save_progress(processed_books)
        return results

def main():
    """Enhanced main function with command line arguments"""
    parser = argparse.ArgumentParser(description='Enhanced Book Consciousness Integrator')
    parser.add_argument('--max-books', type=int, default=50, help='Maximum books to process in this run')
    parser.add_argument('--add-path', action='append', help='Additional book source paths')
    parser.add_argument('--reset-progress', action='store_true', help='Reset integration progress')

    args = parser.parse_args()

    vault_path = "/Users/soullab/Library/Mobile Documents/iCloud~md~obsidian/Documents/AIN/_MAIA_SYSTEM/05-Soullab-Dev-Team/AIN Consciousness Intelligence System 1"

    integrator = EnhancedBookConsciousnessIntegrator(vault_path, max_books=args.max_books)

    # Reset progress if requested
    if args.reset_progress:
        if integrator.progress_file.exists():
            integrator.progress_file.unlink()
            print("🔄 Integration progress reset")

    # Add additional book paths if provided
    if args.add_path:
        for path in args.add_path:
            integrator.add_book_source_path(path)

    results = integrator.integrate_batch_books()

    print("\n🎉 Enhanced Book Consciousness Integration Complete!")
    print(f"📚 Books processed in this run: {results['books_processed']}")
    print(f"✅ Books integrated: {results['books_integrated']}")
    print(f"📄 Total files created: {results['total_files_created']}")

    print("\n📊 Elemental Distribution in New Books:")
    brain_emojis = {
        'fire': '🔥', 'water': '🌊', 'earth': '🌍', 'air': '💨', 'aether': '✨'
    }

    for element, count in results['total_elemental_distribution'].items():
        emoji = brain_emojis.get(element, '📖')
        print(f"  {emoji} {element.title()}: {count} references")

    if results['successful_books']:
        print(f"\n✅ Successfully Integrated Books:")
        for book in results['successful_books']:
            print(f"  📖 {book}")

    if results['failed_books']:
        print(f"\n⚠️  Books that couldn't be processed:")
        for book in results['failed_books']:
            print(f"  ❌ {book}")

    print("\n🤖 MAIA can now access all book content through:")
    print("  🧠 Neurological routing (brain regions)")
    print("  🌀 Elemental themes (fire, water, earth, air, aether)")
    print("  📈 Development phases (entry, integration, mastery)")
    print("  🎯 Content types (academic, spiritual, practical, etc.)")

    print(f"\n📂 All book content organized in: {integrator.books_output_path}")
    print("🎨 Book content will appear in your Graph View with full tag integration!")

if __name__ == "__main__":
    main()