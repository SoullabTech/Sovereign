#!/usr/bin/env python3
"""
🌐 AIN Obsidian Graph View Enhancement Script
Converts external links to WikiLinks and adds strategic cross-references
"""

import os
import re
import glob
from pathlib import Path
from typing import Dict, List, Set

class ObsidianGraphEnhancer:
    def __init__(self, vault_path: str):
        self.vault_path = Path(vault_path)
        self.processed_files = 0
        self.links_converted = 0
        self.cross_refs_added = 0

        # Common MAIA/AIN concepts for cross-referencing
        self.concept_patterns = {
            'consciousness': ['consciousness', 'awareness', 'sentience'],
            'maia': ['maia', 'maya', 'oracle', 'guidance'],
            'spiralogic': ['spiralogic', 'spiral', 'elemental'],
            'architecture': ['architecture', 'system', 'framework'],
            'intelligence': ['intelligence', 'ai', 'artificial'],
            'integration': ['integration', 'synthesis', 'bridge'],
            'safety': ['safety', 'security', 'protection'],
            'testing': ['testing', 'beta', 'protocol'],
            'mobile': ['mobile', 'ios', 'app', 'application'],
            'deployment': ['deployment', 'build', 'production']
        }

        # File relationships for cross-referencing
        self.related_files = {
            'safety': ['MAIA Safety Framework', 'Beta Testing Protocol', 'Security Analysis'],
            'architecture': ['AIN Architecture', 'System Design', 'Core Framework'],
            'consciousness': ['Consciousness Technology', 'Awareness Systems', 'Sentience Framework'],
            'mobile': ['iOS Implementation', 'Mobile Interface', 'App Development'],
            'testing': ['Beta Testing', 'QA Protocol', 'Testing Framework']
        }

    def backup_file(self, file_path: Path) -> Path:
        """Create backup of original file"""
        backup_path = file_path.with_suffix(file_path.suffix + '.backup')
        backup_path.write_text(file_path.read_text(encoding='utf-8'), encoding='utf-8')
        return backup_path

    def convert_vscode_links_to_wiki(self, content: str) -> tuple[str, int]:
        """Convert VSCode webview links to WikiLinks"""
        conversions = 0

        # Pattern for VSCode links: [text](vscode-webview://...filename)
        vscode_pattern = r'\[([^\]]+)\]\(vscode-webview://[^)]*?([^/\)]+?\.[a-zA-Z]+)\)'

        def replace_vscode_link(match):
            nonlocal conversions
            display_text = match.group(1)
            filename = match.group(2)

            # Extract clean name for wiki link
            clean_name = filename.replace('.ts', '').replace('.md', '').replace('.js', '')
            clean_name = re.sub(r'[^a-zA-Z0-9\s-]', '', clean_name)

            conversions += 1
            return f'[[{clean_name}|{display_text}]]'

        new_content = re.sub(vscode_pattern, replace_vscode_link, content)

        # Convert common file references to WikiLinks
        file_ref_patterns = [
            (r'\b(CLAUDE\.sovereign\.md)\b', r'[[\1]]'),
            (r'\b(000_START_HERE_GUIDE\.md)\b', r'[[\1]]'),
            (r'\b([A-Z][A-Z_]+\.md)\b', r'[[\1]]'),
            (r'\b([a-zA-Z]+\.config\.[a-z]+)\b', r'[[\1]]')
        ]

        for pattern, replacement in file_ref_patterns:
            matches = len(re.findall(pattern, new_content))
            conversions += matches
            new_content = re.sub(pattern, replacement, new_content)

        return new_content, conversions

    def add_cross_references(self, content: str, file_path: Path) -> tuple[str, int]:
        """Add strategic cross-references based on content analysis"""
        additions = 0
        filename_lower = file_path.name.lower()

        # Determine file category
        file_categories = []
        for category, keywords in self.concept_patterns.items():
            if any(keyword in filename_lower or keyword in content.lower() for keyword in keywords):
                file_categories.append(category)

        # Skip if no categories identified or already has many links
        if not file_categories or content.count('[[') > 10:
            return content, additions

        # Find insertion point (before first header or at end)
        lines = content.split('\n')
        insertion_point = len(lines)

        for i, line in enumerate(lines):
            if line.startswith('## ') and i > 5:  # After initial content
                insertion_point = i
                break

        # Generate cross-references
        cross_refs = []
        for category in file_categories:
            if category in self.related_files:
                for related_file in self.related_files[category]:
                    if related_file.lower() not in filename_lower:
                        cross_refs.append(f'[[{related_file}]]')

        if cross_refs and len(cross_refs) <= 5:  # Limit to prevent spam
            ref_line = f"\n**Related:** {' | '.join(cross_refs[:3])}\n"
            lines.insert(insertion_point, ref_line)
            additions = len(cross_refs[:3])

        return '\n'.join(lines), additions

    def enhance_tags(self, content: str) -> tuple[str, int]:
        """Enhance existing tags and add strategic ones"""
        enhancements = 0

        # Check if file already has tags section
        if 'tags:' in content or 'Tags:' in content:
            return content, enhancements

        # Determine appropriate tags based on content
        suggested_tags = []
        content_lower = content.lower()

        tag_suggestions = {
            'consciousness': '#consciousness-tech',
            'maia': '#maia-system',
            'safety': '#safety-framework',
            'mobile': '#mobile-app',
            'testing': '#beta-testing',
            'architecture': '#system-architecture',
            'integration': '#integration-guide'
        }

        for keyword, tag in tag_suggestions.items():
            if keyword in content_lower:
                suggested_tags.append(tag)

        if suggested_tags:
            # Add tags at the beginning of the file
            lines = content.split('\n')
            if lines and not lines[0].startswith('tags:'):
                tag_line = f"tags: [{', '.join(suggested_tags[:3])}]"
                lines.insert(0, tag_line)
                lines.insert(1, "")  # Empty line
                enhancements = len(suggested_tags[:3])
                content = '\n'.join(lines)

        return content, enhancements

    def process_file(self, file_path: Path) -> Dict[str, int]:
        """Process a single markdown file"""
        try:
            # Read file content
            content = file_path.read_text(encoding='utf-8')
            original_content = content

            # Create backup
            self.backup_file(file_path)

            # Apply enhancements
            content, links_converted = self.convert_vscode_links_to_wiki(content)
            content, cross_refs_added = self.add_cross_references(content, file_path)
            content, tags_added = self.enhance_tags(content)

            # Only write if changes were made
            if content != original_content:
                file_path.write_text(content, encoding='utf-8')

                return {
                    'links_converted': links_converted,
                    'cross_refs_added': cross_refs_added,
                    'tags_added': tags_added,
                    'file_modified': True
                }

            return {
                'links_converted': 0,
                'cross_refs_added': 0,
                'tags_added': 0,
                'file_modified': False
            }

        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")
            return {
                'links_converted': 0,
                'cross_refs_added': 0,
                'tags_added': 0,
                'file_modified': False,
                'error': str(e)
            }

    def enhance_graph_view(self) -> Dict[str, int]:
        """Main enhancement function"""
        print(f"🌐 Starting AIN Graph View Enhancement...")
        print(f"📁 Processing: {self.vault_path}")

        # Find all markdown files
        md_files = list(self.vault_path.glob("**/*.md"))
        print(f"📊 Found {len(md_files)} markdown files")

        results = {
            'files_processed': 0,
            'files_modified': 0,
            'total_links_converted': 0,
            'total_cross_refs_added': 0,
            'total_tags_added': 0,
            'errors': 0
        }

        # Process files in batches
        for i, file_path in enumerate(md_files):
            if i % 50 == 0:  # Progress update every 50 files
                print(f"📈 Progress: {i}/{len(md_files)} files processed")

            file_results = self.process_file(file_path)

            results['files_processed'] += 1
            if file_results.get('file_modified', False):
                results['files_modified'] += 1

            results['total_links_converted'] += file_results['links_converted']
            results['total_cross_refs_added'] += file_results['cross_refs_added']
            results['total_tags_added'] += file_results['tags_added']

            if 'error' in file_results:
                results['errors'] += 1

        return results

def main():
    """Run the enhancement script"""
    vault_path = "/Users/soullab/Library/Mobile Documents/iCloud~md~obsidian/Documents/AIN/_MAIA_SYSTEM/05-Soullab-Dev-Team/AIN Consciousness Intelligence System 1"

    enhancer = ObsidianGraphEnhancer(vault_path)
    results = enhancer.enhance_graph_view()

    print("\n🎉 Enhancement Complete!")
    print(f"📊 Files processed: {results['files_processed']}")
    print(f"✏️ Files modified: {results['files_modified']}")
    print(f"🔗 Links converted: {results['total_links_converted']}")
    print(f"🌐 Cross-references added: {results['total_cross_refs_added']}")
    print(f"🏷️ Tags enhanced: {results['total_tags_added']}")

    if results['errors'] > 0:
        print(f"⚠️ Errors encountered: {results['errors']}")

    print("\n✨ Your Obsidian Graph View should now be much more populated!")
    print("🔄 Refresh your Graph View in Obsidian to see the changes.")

if __name__ == "__main__":
    main()