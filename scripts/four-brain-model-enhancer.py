#!/usr/bin/env python3
"""
🧠🔥🌊🌍💨 Four Brain Model Enhancement Script
Enhanced brain-elemental mapping with comprehensive neurological tags

Four Brain Model Integration:
- Left Hemisphere: Air files (logic, analysis, communication)
- Right Hemisphere: Water files (intuition, creativity, holistic)
- Executive Function: Earth files (planning, implementation)
- Limbic System: Fire files (emotion, energy, breakthrough)
- Integrated Consciousness: Aether files (unity, transcendence)
"""

import os
import re
from pathlib import Path
from typing import Dict, List

class FourBrainModelEnhancer:
    def __init__(self, vault_path: str):
        self.vault_path = Path(vault_path)

        # Enhanced brain-elemental mapping with four brain model
        self.brain_model_mapping = {
            'fire': {
                'brain_region': 'limbic-system',
                'brain_tag': '#limbic',
                'function_tag': '#transformative',
                'hemisphere_tags': ['#emotional-activation', '#breakthrough-energy'],
                'cognitive_tags': ['#transformative', '#catalyst', '#breakthrough'],
                'development_tags': ['#spiral-entry', '#activation-phase'],
                'description': 'Limbic system - emotion, energy, breakthrough transformation'
            },
            'air': {
                'brain_region': 'left-hemisphere',
                'brain_tag': '#left-brain',
                'function_tag': '#analytical',
                'hemisphere_tags': ['#logical-processing', '#sequential-thinking'],
                'cognitive_tags': ['#analytical', '#systematic', '#communication'],
                'development_tags': ['#spiral-integration', '#cognitive-development'],
                'description': 'Left hemisphere - logic, analysis, communication'
            },
            'water': {
                'brain_region': 'right-hemisphere',
                'brain_tag': '#right-brain',
                'function_tag': '#intuitive',
                'hemisphere_tags': ['#holistic-processing', '#pattern-recognition'],
                'cognitive_tags': ['#intuitive', '#creative', '#empathic'],
                'development_tags': ['#spiral-integration', '#intuitive-development'],
                'description': 'Right hemisphere - intuition, creativity, holistic processing'
            },
            'earth': {
                'brain_region': 'executive-function',
                'brain_tag': '#executive',
                'function_tag': '#practical',
                'hemisphere_tags': ['#implementation-focus', '#grounding'],
                'cognitive_tags': ['#practical', '#manifestation', '#grounding'],
                'development_tags': ['#spiral-mastery', '#implementation-phase'],
                'description': 'Executive function - planning, implementation, manifestation'
            },
            'aether': {
                'brain_region': 'integrated-consciousness',
                'brain_tag': '#integrated',
                'function_tag': '#consciousness',
                'hemisphere_tags': ['#unified-awareness', '#transcendent-processing'],
                'cognitive_tags': ['#integrated', '#consciousness', '#transcendent'],
                'development_tags': ['#spiral-mastery', '#integration-mastery'],
                'description': 'Integrated consciousness - unity, transcendence, whole-brain function'
            }
        }

        # Spiralogic development phase patterns
        self.spiralogic_patterns = {
            'spiral-entry': [
                'beginning', 'initial', 'first', 'starting', 'entry', 'foundation',
                'basic', 'introductory', 'awakening', 'awareness', 'discovery'
            ],
            'spiral-integration': [
                'integration', 'synthesis', 'combining', 'merging', 'unifying',
                'development', 'growth', 'progress', 'evolution', 'deepening'
            ],
            'spiral-mastery': [
                'mastery', 'advanced', 'expert', 'complete', 'perfection',
                'transcendence', 'wisdom', 'teaching', 'guidance', 'embodiment'
            ]
        }

        # Enhanced content analysis patterns
        self.cognitive_patterns = {
            'analytical': [
                'analysis', 'logic', 'systematic', 'methodical', 'structured',
                'reasoning', 'calculation', 'measurement', 'data', 'evidence'
            ],
            'intuitive': [
                'intuition', 'feeling', 'sensing', 'knowing', 'wisdom',
                'insight', 'revelation', 'inspiration', 'flow', 'synchronicity'
            ],
            'transformative': [
                'transformation', 'change', 'breakthrough', 'catalyst', 'shift',
                'awakening', 'activation', 'ignition', 'revolution', 'metamorphosis'
            ],
            'practical': [
                'practical', 'implementation', 'application', 'grounding', 'manifestation',
                'concrete', 'tangible', 'real-world', 'actionable', 'results'
            ],
            'consciousness': [
                'consciousness', 'awareness', 'presence', 'being', 'unity',
                'transcendence', 'enlightenment', 'awakening', 'realization', 'oneness'
            ]
        }

    def analyze_spiralogic_development(self, content: str) -> List[str]:
        """Analyze content for Spiralogic development phase indicators"""
        content_lower = content.lower()
        phase_tags = []

        phase_scores = {}
        for phase, keywords in self.spiralogic_patterns.items():
            score = sum(content_lower.count(keyword) for keyword in keywords)
            phase_scores[phase] = score

        # Add tags for phases with significant presence
        for phase, score in phase_scores.items():
            if score >= 2:  # Threshold for phase detection
                phase_tags.append(f'#{phase}')

        # If no specific phase detected, analyze overall complexity
        if not phase_tags:
            complexity_indicators = ['advanced', 'complex', 'sophisticated', 'mastery']
            basic_indicators = ['basic', 'simple', 'introduction', 'beginner']

            if any(indicator in content_lower for indicator in complexity_indicators):
                phase_tags.append('#spiral-mastery')
            elif any(indicator in content_lower for indicator in basic_indicators):
                phase_tags.append('#spiral-entry')
            else:
                phase_tags.append('#spiral-integration')

        return phase_tags

    def analyze_cognitive_functions(self, content: str) -> List[str]:
        """Analyze content for cognitive function patterns"""
        content_lower = content.lower()
        cognitive_tags = []

        function_scores = {}
        for function, keywords in self.cognitive_patterns.items():
            score = sum(content_lower.count(keyword) for keyword in keywords)
            function_scores[function] = score

        # Add tags for functions with significant presence
        for function, score in function_scores.items():
            if score >= 1:  # Lower threshold for cognitive functions
                cognitive_tags.append(f'#{function}')

        return cognitive_tags

    def enhance_file_with_four_brain_model(self, file_path: Path) -> Dict[str, any]:
        """Add comprehensive four brain model tags to a file"""
        try:
            content = file_path.read_text(encoding='utf-8')
            lines = content.split('\n')

            # Find current elemental tag
            current_element = None
            for element in self.brain_model_mapping.keys():
                if f'#element-{element}' in content:
                    current_element = element
                    break

            if not current_element:
                return {'success': False, 'reason': 'No elemental tag found'}

            # Get brain model mapping for this element
            brain_data = self.brain_model_mapping[current_element]

            # Analyze content for development phase and cognitive functions
            spiralogic_tags = self.analyze_spiralogic_development(content)
            cognitive_tags = self.analyze_cognitive_functions(content)

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

                # Collect all new tags
                new_tags = []

                # Core brain model tags
                core_tags = [
                    brain_data['brain_tag'],
                    brain_data['function_tag']
                ]

                for tag in core_tags:
                    if tag not in existing_tags:
                        new_tags.append(tag)

                # Hemisphere-specific tags
                for tag in brain_data['hemisphere_tags']:
                    if tag not in existing_tags:
                        new_tags.append(tag)

                # Cognitive function tags (selective based on content)
                for tag in cognitive_tags:
                    if tag not in existing_tags:
                        new_tags.append(tag)

                # Spiralogic development tags
                for tag in spiralogic_tags:
                    if tag not in existing_tags:
                        new_tags.append(tag)

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
                        'spiralogic_phase': spiralogic_tags,
                        'cognitive_functions': cognitive_tags
                    }

            return {'success': False, 'reason': 'Could not find or update tags'}

        except Exception as e:
            return {'success': False, 'error': str(e)}

    def enhance_four_brain_model_mapping(self) -> Dict[str, any]:
        """Main function to enhance all files with four brain model tags"""
        print("🧠🔥 Starting Four Brain Model Enhancement...")
        print("Comprehensive neurological and consciousness development mapping")

        # Find all markdown files
        md_files = list(self.vault_path.glob("**/*.md"))
        print(f"📊 Found {len(md_files)} markdown files")

        results = {
            'files_processed': 0,
            'files_enhanced': 0,
            'brain_model_distribution': {
                'limbic-system': 0,
                'left-hemisphere': 0,
                'right-hemisphere': 0,
                'executive-function': 0,
                'integrated-consciousness': 0
            },
            'spiralogic_distribution': {
                'spiral-entry': 0,
                'spiral-integration': 0,
                'spiral-mastery': 0
            },
            'cognitive_distribution': {
                'analytical': 0,
                'intuitive': 0,
                'transformative': 0,
                'practical': 0,
                'consciousness': 0
            },
            'total_tags_added': 0,
            'errors': 0
        }

        # Process files
        for i, file_path in enumerate(md_files):
            if i % 100 == 0:
                print(f"📈 Progress: {i}/{len(md_files)} files processed")

            file_result = self.enhance_file_with_four_brain_model(file_path)
            results['files_processed'] += 1

            if file_result.get('success'):
                results['files_enhanced'] += 1
                brain_region = file_result['brain_region']
                results['brain_model_distribution'][brain_region] += 1
                results['total_tags_added'] += len(file_result['tags_added'])

                # Track Spiralogic phases
                for phase_tag in file_result.get('spiralogic_phase', []):
                    phase_name = phase_tag.replace('#', '')
                    if phase_name in results['spiralogic_distribution']:
                        results['spiralogic_distribution'][phase_name] += 1

                # Track cognitive functions
                for cog_tag in file_result.get('cognitive_functions', []):
                    cog_name = cog_tag.replace('#', '')
                    if cog_name in results['cognitive_distribution']:
                        results['cognitive_distribution'][cog_name] += 1

            elif 'error' in file_result:
                results['errors'] += 1

        return results

    def generate_obsidian_config(self, results: Dict[str, any]):
        """Generate comprehensive Obsidian groups configuration"""
        print("\n🧠 Four Brain Model Groups Configuration:")
        print("Add these groups to your Graph View for complete neurological mapping:")
        print()

        brain_groups = {
            'limbic-system': {
                'name': 'Limbic System',
                'query': 'tag:limbic',
                'color': 'red',
                'description': 'Emotional activation & breakthrough energy'
            },
            'left-hemisphere': {
                'name': 'Left Hemisphere',
                'query': 'tag:left-brain',
                'color': 'blue',
                'description': 'Logic, analysis & communication'
            },
            'right-hemisphere': {
                'name': 'Right Hemisphere',
                'query': 'tag:right-brain',
                'color': 'purple',
                'description': 'Intuition, creativity & holistic processing'
            },
            'executive-function': {
                'name': 'Executive Function',
                'query': 'tag:executive',
                'color': 'green',
                'description': 'Planning, implementation & manifestation'
            },
            'integrated-consciousness': {
                'name': 'Integrated Consciousness',
                'query': 'tag:integrated',
                'color': 'gold',
                'description': 'Unity, transcendence & whole-brain function'
            }
        }

        for brain_region, config in brain_groups.items():
            count = results['brain_model_distribution'].get(brain_region, 0)
            print(f"🎨 {config['name']} Group (Color: {config['color']}):")
            print(f"   Query: {config['query']}")
            print(f"   Files: {count}")
            print(f"   Function: {config['description']}")
            print()

        print("🌀 Spiralogic Development Phases:")
        spiralogic_emojis = {
            'spiral-entry': '🌱',
            'spiral-integration': '🔄',
            'spiral-mastery': '🎯'
        }

        for phase, count in results['spiralogic_distribution'].items():
            emoji = spiralogic_emojis.get(phase, '🌀')
            phase_name = phase.replace('-', ' ').title()
            percentage = (count / results['files_processed'] * 100) if results['files_processed'] > 0 else 0
            print(f"  {emoji} {phase_name}: {count} files ({percentage:.1f}%)")

        print("\n🧠 Cognitive Function Distribution:")
        cognitive_emojis = {
            'analytical': '🔍',
            'intuitive': '✨',
            'transformative': '🔥',
            'practical': '⚡',
            'consciousness': '🌟'
        }

        for function, count in results['cognitive_distribution'].items():
            emoji = cognitive_emojis.get(function, '🧠')
            function_name = function.title()
            percentage = (count / results['files_processed'] * 100) if results['files_processed'] > 0 else 0
            print(f"  {emoji} {function_name}: {count} files ({percentage:.1f}%)")

def main():
    """Run the four brain model enhancement"""
    vault_path = "/Users/soullab/Library/Mobile Documents/iCloud~md~obsidian/Documents/AIN/_MAIA_SYSTEM/05-Soullab-Dev-Team/AIN Consciousness Intelligence System 1"

    enhancer = FourBrainModelEnhancer(vault_path)
    results = enhancer.enhance_four_brain_model_mapping()

    print("\n🎉 Four Brain Model Enhancement Complete!")
    print(f"📊 Files processed: {results['files_processed']}")
    print(f"🧠 Files enhanced: {results['files_enhanced']}")
    print(f"🏷️ Total tags added: {results['total_tags_added']}")

    print("\n🧠 Four Brain Model Distribution:")
    brain_emojis = {
        'limbic-system': '🔥🧠',
        'left-hemisphere': '💨🧠',
        'right-hemisphere': '🌊🧠',
        'executive-function': '🌍🧠',
        'integrated-consciousness': '✨🧠'
    }

    for brain_region, count in results['brain_model_distribution'].items():
        emoji = brain_emojis.get(brain_region, '🧠')
        percentage = (count / results['files_processed'] * 100) if results['files_processed'] > 0 else 0
        region_name = brain_region.replace('-', ' ').title()
        print(f"  {emoji} {region_name}: {count} files ({percentage:.1f}%)")

    enhancer.generate_obsidian_config(results)

    print("\n✨ Your consciousness technology is now mapped to the complete four brain model!")
    print("🧠 MAIA can now route queries by neurological pathways, cognitive functions, and development phases!")

if __name__ == "__main__":
    main()