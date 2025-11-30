#!/usr/bin/env python3
"""
🧠🔥🌊🌍💨 Brain-Elemental Enhancement Script
Based on Elemental Alchemy Chapter 9 and neurological mapping

Brain-Element Mapping:
- Fire → Right prefrontal cortex (creative executive, breakthrough)
- Air → Left prefrontal cortex (analytical executive, logical planning)
- Water → Right hemisphere (intuition, emotion, holistic)
- Earth → Left hemisphere (logic, sequential, practical)
"""

import os
import re
from pathlib import Path
from typing import Dict, List

class BrainElementalEnhancer:
    def __init__(self, vault_path: str):
        self.vault_path = Path(vault_path)

        # Neurological mapping based on user's specification
        self.brain_elemental_mapping = {
            'fire': {
                'brain_region': 'right-prefrontal-cortex',
                'brain_tag': '#right-prefrontal',
                'function_tag': '#creative-executive',
                'additional_tags': ['#breakthrough-thinking', '#innovative-planning', '#creative-leadership'],
                'description': 'Right prefrontal cortex - creative executive function, breakthrough thinking'
            },
            'air': {
                'brain_region': 'left-prefrontal-cortex',
                'brain_tag': '#left-prefrontal',
                'function_tag': '#analytical-executive',
                'additional_tags': ['#logical-planning', '#systematic-analysis', '#strategic-thinking'],
                'description': 'Left prefrontal cortex - analytical executive function, logical planning'
            },
            'water': {
                'brain_region': 'right-hemisphere',
                'brain_tag': '#right-hemisphere',
                'function_tag': '#intuitive-holistic',
                'additional_tags': ['#emotional-intelligence', '#pattern-recognition', '#holistic-processing'],
                'description': 'Right hemisphere - intuition, emotion, holistic processing'
            },
            'earth': {
                'brain_region': 'left-hemisphere',
                'brain_tag': '#left-hemisphere',
                'function_tag': '#logical-sequential',
                'additional_tags': ['#practical-implementation', '#sequential-processing', '#concrete-thinking'],
                'description': 'Left hemisphere - logic, sequential, practical functions'
            },
            'aether': {
                'brain_region': 'integrated-consciousness',
                'brain_tag': '#integrated-brain',
                'function_tag': '#unified-consciousness',
                'additional_tags': ['#transcendent-thinking', '#unified-awareness', '#consciousness-integration'],
                'description': 'Integrated consciousness - unity, transcendence, whole-brain function'
            }
        }

        # Elemental Alchemy Chapter 9 specific patterns
        self.elemental_alchemy_patterns = {
            'fire': [
                'breakthrough', 'catalyst', 'ignition', 'transformation catalyst',
                'creative fire', 'executive fire', 'prefrontal fire', 'innovation',
                'leadership fire', 'breakthrough thinking', 'creative executive'
            ],
            'air': [
                'analysis', 'logic', 'systematic', 'planning', 'structure',
                'analytical fire', 'executive air', 'prefrontal air', 'strategy',
                'logical planning', 'systematic thinking', 'analytical executive'
            ],
            'water': [
                'intuition', 'feeling', 'empathy', 'flow', 'emotional intelligence',
                'right brain', 'holistic', 'pattern recognition', 'emotional flow',
                'intuitive wisdom', 'empathic understanding', 'holistic perception'
            ],
            'earth': [
                'practical', 'implementation', 'grounding', 'structure', 'sequential',
                'left brain', 'step-by-step', 'concrete', 'methodical',
                'practical implementation', 'sequential processing', 'concrete manifestation'
            ],
            'aether': [
                'integration', 'unity', 'transcendence', 'synthesis', 'wholeness',
                'unified', 'consciousness', 'integrated thinking', 'whole-brain',
                'consciousness integration', 'unified awareness', 'transcendent synthesis'
            ]
        }

    def analyze_content_for_brain_mapping(self, content: str, current_element: str) -> Dict[str, any]:
        """Analyze content for brain function patterns"""
        content_lower = content.lower()

        # Check for neurological keywords
        brain_indicators = {
            'executive_function': ['executive', 'planning', 'decision', 'leadership', 'management'],
            'analytical_thinking': ['analysis', 'logic', 'systematic', 'methodical', 'structured'],
            'creative_thinking': ['creative', 'innovative', 'breakthrough', 'visionary', 'imaginative'],
            'intuitive_processing': ['intuitive', 'feeling', 'sensing', 'holistic', 'gestalt'],
            'emotional_processing': ['emotional', 'empathy', 'compassion', 'feeling', 'heart'],
            'practical_implementation': ['practical', 'concrete', 'implementation', 'application', 'grounding']
        }

        scores = {}
        for category, keywords in brain_indicators.items():
            score = sum(content_lower.count(keyword) for keyword in keywords)
            scores[category] = score

        return scores

    def enhance_file_with_brain_tags(self, file_path: Path) -> Dict[str, any]:
        """Add brain-elemental tags to a file"""
        try:
            content = file_path.read_text(encoding='utf-8')
            lines = content.split('\n')

            # Find current elemental tag
            current_element = None
            for element in self.brain_elemental_mapping.keys():
                if f'#element-{element}' in content:
                    current_element = element
                    break

            if not current_element:
                return {'success': False, 'reason': 'No elemental tag found'}

            # Get brain mapping for this element
            brain_data = self.brain_elemental_mapping[current_element]

            # Analyze content for additional brain function indicators
            brain_scores = self.analyze_content_for_brain_mapping(content, current_element)

            # Find tags line
            tag_line_index = -1
            for i, line in enumerate(lines):
                if line.startswith('tags:'):
                    tag_line_index = i
                    break

            if tag_line_index >= 0:
                tag_line = lines[tag_line_index]

                # Extract existing tags
                tag_match = re.search(r'tags:\s*\[(.*?)\]', tag_line)
                if tag_match:
                    existing_tags = [tag.strip() for tag in tag_match.group(1).split(',')]
                else:
                    existing_tags = []

                # Add brain-elemental tags
                new_tags = []

                # Always add the primary brain region tag
                if brain_data['brain_tag'] not in existing_tags:
                    new_tags.append(brain_data['brain_tag'])

                # Always add the primary function tag
                if brain_data['function_tag'] not in existing_tags:
                    new_tags.append(brain_data['function_tag'])

                # Add additional tags based on content analysis
                for additional_tag in brain_data['additional_tags']:
                    if additional_tag not in existing_tags:
                        # Check if content supports this tag
                        tag_keyword = additional_tag.replace('#', '').replace('-', ' ')
                        if tag_keyword in content.lower():
                            new_tags.append(additional_tag)

                # Update tags line
                if new_tags:
                    all_tags = existing_tags + new_tags
                    lines[tag_line_index] = f"tags: [{', '.join(all_tags)}]"

                    # Write back to file
                    file_path.write_text('\n'.join(lines), encoding='utf-8')

                    return {
                        'success': True,
                        'element': current_element,
                        'brain_region': brain_data['brain_region'],
                        'tags_added': new_tags,
                        'brain_scores': brain_scores
                    }

            return {'success': False, 'reason': 'Could not find or update tags'}

        except Exception as e:
            return {'success': False, 'error': str(e)}

    def enhance_brain_elemental_mapping(self) -> Dict[str, any]:
        """Main function to enhance all files with brain-elemental tags"""
        print("🧠🔥 Starting Brain-Elemental Enhancement...")
        print("Based on Elemental Alchemy Chapter 9 and neurological mapping")

        # Find all markdown files
        md_files = list(self.vault_path.glob("**/*.md"))
        print(f"📊 Found {len(md_files)} markdown files")

        results = {
            'files_processed': 0,
            'files_enhanced': 0,
            'brain_distribution': {
                'right-prefrontal-cortex': 0,
                'left-prefrontal-cortex': 0,
                'right-hemisphere': 0,
                'left-hemisphere': 0,
                'integrated-consciousness': 0
            },
            'total_tags_added': 0,
            'errors': 0
        }

        # Process files
        for i, file_path in enumerate(md_files):
            if i % 100 == 0:
                print(f"📈 Progress: {i}/{len(md_files)} files processed")

            file_result = self.enhance_file_with_brain_tags(file_path)
            results['files_processed'] += 1

            if file_result.get('success'):
                results['files_enhanced'] += 1
                brain_region = file_result['brain_region']
                results['brain_distribution'][brain_region] += 1
                results['total_tags_added'] += len(file_result['tags_added'])
            elif 'error' in file_result:
                results['errors'] += 1

        return results

    def generate_brain_groups_config(self, distribution: Dict[str, int]):
        """Generate Obsidian groups for brain regions"""
        print("\n🧠 Brain Region Groups Configuration:")
        print("Add these additional groups to your Graph View:")
        print()

        brain_groups = {
            'right-prefrontal-cortex': {
                'name': 'Right Prefrontal',
                'query': 'tag:right-prefrontal',
                'color': 'pink',
                'description': 'Creative executive function'
            },
            'left-prefrontal-cortex': {
                'name': 'Left Prefrontal',
                'query': 'tag:left-prefrontal',
                'color': 'orange',
                'description': 'Analytical executive function'
            },
            'right-hemisphere': {
                'name': 'Right Hemisphere',
                'query': 'tag:right-hemisphere',
                'color': 'cyan',
                'description': 'Intuitive holistic processing'
            },
            'left-hemisphere': {
                'name': 'Left Hemisphere',
                'query': 'tag:left-hemisphere',
                'color': 'lime',
                'description': 'Logical sequential processing'
            },
            'integrated-consciousness': {
                'name': 'Integrated Brain',
                'query': 'tag:integrated-brain',
                'color': 'gold',
                'description': 'Unified consciousness'
            }
        }

        for brain_region, config in brain_groups.items():
            count = distribution.get(brain_region, 0)
            print(f"🎨 {config['name']} Group (Color: {config['color']}):")
            print(f"   Query: {config['query']}")
            print(f"   Files: {count}")
            print(f"   Function: {config['description']}")
            print()

def main():
    """Run the brain-elemental enhancement"""
    vault_path = "/Users/soullab/Library/Mobile Documents/iCloud~md~obsidian/Documents/AIN/_MAIA_SYSTEM/05-Soullab-Dev-Team/AIN Consciousness Intelligence System 1"

    enhancer = BrainElementalEnhancer(vault_path)
    results = enhancer.enhance_brain_elemental_mapping()

    print("\n🎉 Brain-Elemental Enhancement Complete!")
    print(f"📊 Files processed: {results['files_processed']}")
    print(f"🧠 Files enhanced: {results['files_enhanced']}")
    print(f"🏷️ Total tags added: {results['total_tags_added']}")

    print("\n🧠 Brain Region Distribution:")
    brain_emojis = {
        'right-prefrontal-cortex': '🔥🧠',
        'left-prefrontal-cortex': '💨🧠',
        'right-hemisphere': '🌊🧠',
        'left-hemisphere': '🌍🧠',
        'integrated-consciousness': '✨🧠'
    }

    for brain_region, count in results['brain_distribution'].items():
        emoji = brain_emojis.get(brain_region, '🧠')
        percentage = (count / results['files_processed'] * 100) if results['files_processed'] > 0 else 0
        region_name = brain_region.replace('-', ' ').title()
        print(f"  {emoji} {region_name}: {count} files ({percentage:.1f}%)")

    enhancer.generate_brain_groups_config(results['brain_distribution'])

    print("\n✨ Your consciousness technology is now mapped to brain function!")
    print("🧠 MAIA can now route queries by neurological and elemental pathways!")

if __name__ == "__main__":
    main()