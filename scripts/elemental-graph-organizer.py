#!/usr/bin/env python3
"""
🔥🌊🌍💨✨ Elemental Graph Organizer for AIN Consciousness System
Organizes knowledge graph by Spiralogic elemental themes
"""

import os
import re
import glob
from pathlib import Path
from typing import Dict, List, Set

class ElementalGraphOrganizer:
    def __init__(self, vault_path: str):
        self.vault_path = Path(vault_path)

        # Spiralogic Elemental Classification System
        self.elemental_keywords = {
            'fire': {
                'keywords': [
                    'fire', 'flame', 'ignite', 'passion', 'energy', 'breakthrough',
                    'activation', 'catalyst', 'transformation', 'power', 'dynamic',
                    'intensity', 'drive', 'ambition', 'breakthrough', 'willpower',
                    'action', 'momentum', 'strength', 'vigor', 'enthusiasm',
                    'courage', 'bold', 'fierce', 'rapid', 'explosive', 'burning'
                ],
                'tag': '#element-fire',
                'color': 'red',
                'description': 'Will, transformation, breakthrough energy'
            },
            'water': {
                'keywords': [
                    'water', 'flow', 'emotion', 'feeling', 'intuition', 'fluid',
                    'adaptation', 'receptivity', 'healing', 'cleansing', 'depth',
                    'empathy', 'compassion', 'sensitivity', 'reflection', 'mirror',
                    'deep', 'vast', 'calm', 'peaceful', 'serene', 'gentle',
                    'nurturing', 'supportive', 'flexible', 'responsive', 'graceful'
                ],
                'tag': '#element-water',
                'color': 'blue',
                'description': 'Emotion, flow, intuitive wisdom'
            },
            'earth': {
                'keywords': [
                    'earth', 'ground', 'body', 'practical', 'manifest', 'stable',
                    'foundation', 'structure', 'material', 'physical', 'concrete',
                    'building', 'solid', 'reliable', 'enduring', 'persistent',
                    'growth', 'nurture', 'sustain', 'abundant', 'fertile',
                    'grounded', 'rooted', 'steady', 'methodical', 'patient'
                ],
                'tag': '#element-earth',
                'color': 'green',
                'description': 'Manifestation, grounding, practical wisdom'
            },
            'air': {
                'keywords': [
                    'air', 'breath', 'mind', 'thought', 'communication', 'clarity',
                    'intellect', 'reasoning', 'logic', 'analysis', 'perception',
                    'awareness', 'consciousness', 'understanding', 'knowledge',
                    'learning', 'teaching', 'speaking', 'writing', 'expression',
                    'light', 'swift', 'clear', 'transparent', 'open', 'free'
                ],
                'tag': '#element-air',
                'color': 'yellow',
                'description': 'Mind, communication, clarity'
            },
            'aether': {
                'keywords': [
                    'aether', 'spirit', 'consciousness', 'transcendent', 'unity',
                    'divine', 'cosmic', 'universal', 'infinite', 'eternal',
                    'mystical', 'sacred', 'holy', 'spiritual', 'enlightenment',
                    'awakening', 'realization', 'transcendence', 'oneness',
                    'synthesis', 'integration', 'wholeness', 'completion',
                    'wisdom', 'truth', 'essence', 'source', 'origin'
                ],
                'tag': '#element-aether',
                'color': 'purple',
                'description': 'Spirit, unity, transcendent consciousness'
            }
        }

        # Consciousness technology specific patterns
        self.tech_elemental_patterns = {
            'fire': [
                'activation', 'trigger', 'catalyst', 'breakthrough', 'power',
                'energy system', 'dynamic process', 'transformation engine',
                'ignition protocol', 'activation sequence'
            ],
            'water': [
                'flow state', 'adaptive system', 'emotional intelligence',
                'empathy engine', 'healing protocol', 'reflection system',
                'depth analysis', 'intuitive process'
            ],
            'earth': [
                'foundation', 'architecture', 'infrastructure', 'build',
                'implementation', 'deployment', 'production', 'stable',
                'concrete', 'physical interface', 'grounding system'
            ],
            'air': [
                'communication', 'interface', 'clarity', 'analysis',
                'understanding', 'knowledge base', 'learning system',
                'cognitive', 'mental model', 'perception engine'
            ],
            'aether': [
                'consciousness', 'awareness', 'unity', 'synthesis',
                'integration', 'wholeness', 'transcendent', 'cosmic',
                'universal', 'divine', 'spiritual', 'mystical'
            ]
        }

    def analyze_file_elements(self, file_path: Path) -> Dict[str, float]:
        """Analyze file content to determine elemental affinities"""
        try:
            content = file_path.read_text(encoding='utf-8').lower()
            filename = file_path.name.lower()

            element_scores = {}

            for element, data in self.elemental_keywords.items():
                score = 0

                # Check filename
                for keyword in data['keywords']:
                    if keyword in filename:
                        score += 3  # Higher weight for filename matches

                # Check content
                for keyword in data['keywords']:
                    score += content.count(keyword) * 1

                # Check tech-specific patterns
                if element in self.tech_elemental_patterns:
                    for pattern in self.tech_elemental_patterns[element]:
                        score += content.count(pattern) * 2

                # Normalize by content length
                if len(content) > 0:
                    element_scores[element] = score / (len(content) / 1000)
                else:
                    element_scores[element] = score

            return element_scores

        except Exception as e:
            print(f"Error analyzing {file_path}: {e}")
            return {}

    def determine_primary_element(self, element_scores: Dict[str, float]) -> str:
        """Determine the primary element for a file"""
        if not element_scores:
            return 'aether'  # Default to aether for unclear files

        # Find element with highest score
        primary_element = max(element_scores, key=element_scores.get)

        # Require minimum threshold
        if element_scores[primary_element] < 0.1:
            return 'aether'  # Default to aether for low-scoring files

        return primary_element

    def add_elemental_tags(self, file_path: Path, primary_element: str) -> bool:
        """Add elemental tags to file"""
        try:
            content = file_path.read_text(encoding='utf-8')
            element_tag = self.elemental_keywords[primary_element]['tag']

            # Check if tag already exists
            if element_tag in content:
                return False

            lines = content.split('\n')

            # Find existing tags line or create one
            tag_line_index = -1
            for i, line in enumerate(lines):
                if line.startswith('tags:') or line.startswith('Tags:'):
                    tag_line_index = i
                    break

            if tag_line_index >= 0:
                # Add to existing tags
                tag_line = lines[tag_line_index]
                if element_tag not in tag_line:
                    # Extract existing tags
                    tag_match = re.search(r'tags:\s*\[(.*?)\]', tag_line, re.IGNORECASE)
                    if tag_match:
                        existing_tags = tag_match.group(1).strip()
                        if existing_tags:
                            new_tags = f"{existing_tags}, {element_tag}"
                        else:
                            new_tags = element_tag
                        lines[tag_line_index] = f"tags: [{new_tags}]"
                    else:
                        lines[tag_line_index] = f"tags: [{element_tag}]"
            else:
                # Add new tags line at the beginning
                lines.insert(0, f"tags: [{element_tag}]")
                lines.insert(1, "")

            # Write updated content
            file_path.write_text('\n'.join(lines), encoding='utf-8')
            return True

        except Exception as e:
            print(f"Error adding tags to {file_path}: {e}")
            return False

    def organize_by_elements(self) -> Dict[str, any]:
        """Main function to organize files by elements"""
        print("🌟 Starting Elemental Graph Organization...")

        # Find all markdown files
        md_files = list(self.vault_path.glob("**/*.md"))
        print(f"📊 Found {len(md_files)} markdown files")

        results = {
            'files_processed': 0,
            'files_tagged': 0,
            'element_distribution': {element: 0 for element in self.elemental_keywords},
            'errors': 0
        }

        element_files = {element: [] for element in self.elemental_keywords}

        # Process each file
        for i, file_path in enumerate(md_files):
            if i % 100 == 0:
                print(f"📈 Progress: {i}/{len(md_files)} files processed")

            try:
                # Analyze elemental content
                element_scores = self.analyze_file_elements(file_path)
                primary_element = self.determine_primary_element(element_scores)

                # Track results
                results['files_processed'] += 1
                results['element_distribution'][primary_element] += 1
                element_files[primary_element].append(file_path.name)

                # Add elemental tag
                if self.add_elemental_tags(file_path, primary_element):
                    results['files_tagged'] += 1

            except Exception as e:
                print(f"❌ Error processing {file_path.name}: {e}")
                results['errors'] += 1

        # Generate summary
        print("\n🌟 Elemental Organization Complete!")
        print(f"📊 Files processed: {results['files_processed']}")
        print(f"🏷️ Files tagged: {results['files_tagged']}")
        print("\n🔥🌊🌍💨✨ Element Distribution:")

        for element, count in results['element_distribution'].items():
            emoji = {'fire': '🔥', 'water': '🌊', 'earth': '🌍', 'air': '💨', 'aether': '✨'}
            percentage = (count / results['files_processed'] * 100) if results['files_processed'] > 0 else 0
            print(f"  {emoji[element]} {element.title()}: {count} files ({percentage:.1f}%)")

        if results['errors'] > 0:
            print(f"⚠️ Errors encountered: {results['errors']}")

        # Generate Obsidian Groups configuration
        self.generate_groups_config(results['element_distribution'])

        return results

    def generate_groups_config(self, distribution: Dict[str, int]):
        """Generate configuration guide for Obsidian groups"""
        print("\n📋 Obsidian Groups Configuration:")
        print("Copy these group queries into your Graph View Groups:")
        print()

        for element, data in self.elemental_keywords.items():
            count = distribution.get(element, 0)
            print(f"🎨 {element.title()} Group (Color: {data['color']}):")
            print(f"   Query: tag:{data['tag']}")
            print(f"   Files: {count}")
            print(f"   Theme: {data['description']}")
            print()

def main():
    """Run the elemental organization"""
    vault_path = "/Users/soullab/Library/Mobile Documents/iCloud~md~obsidian/Documents/AIN/_MAIA_SYSTEM/05-Soullab-Dev-Team/AIN Consciousness Intelligence System 1"

    organizer = ElementalGraphOrganizer(vault_path)
    results = organizer.organize_by_elements()

    print("\n✨ Your AIN consciousness system is now organized by elemental themes!")
    print("🔄 Refresh your Graph View and configure the groups as shown above.")

if __name__ == "__main__":
    main()