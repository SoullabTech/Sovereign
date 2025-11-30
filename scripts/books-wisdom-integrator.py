#!/usr/bin/env python3
"""
📚🧠 Books Wisdom Integration System
Integrates the foundational consciousness books collection into MAIA's wisdom field
Specialized for the Documents/Books directory containing Jung, Hillman, Tarnas, etc.
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Optional, Set
import hashlib

try:
    import PyPDF2
except ImportError:
    print("Installing PyPDF2 for PDF processing...")
    os.system("pip3 install PyPDF2")
    import PyPDF2

class BooksWisdomIntegrator:
    def __init__(self):
        self.books_source_path = Path("/Users/soullab/Documents/Books")
        self.vault_path = Path("/Users/soullab/Library/Mobile Documents/iCloud~md~obsidian/Documents/AIN/_MAIA_SYSTEM/05-Soullab-Dev-Team/AIN Consciousness Intelligence System 1")
        self.books_output_path = self.vault_path / "📚_FOUNDATIONAL_WISDOM"

        # Ensure directories exist
        self.books_output_path.mkdir(exist_ok=True)

        # Archetypal agent mapping
        self.archetypal_agents = {
            'Carl Jung': {
                'element': 'fire',
                'brain_region': 'limbic',
                'keywords': ['jung', 'archetyp', 'collective', 'unconscious', 'shadow', 'individuation', 'anima', 'animus'],
                'books': []
            },
            'James Hillman': {
                'element': 'fire',
                'brain_region': 'limbic',
                'keywords': ['hillman', 'alchemical', 'archetypal psychology', 'soul', 'psyche'],
                'books': []
            },
            'Richard Tarnas': {
                'element': 'aether',
                'brain_region': 'integrated',
                'keywords': ['tarnas', 'archetypal cosmology', 'cosmos', 'planetary'],
                'books': []
            },
            'Stanislav Grof': {
                'element': 'water',
                'brain_region': 'right-brain',
                'keywords': ['grof', 'psychedelic', 'consciousness', 'holotropic', 'transpersonal'],
                'books': []
            },
            'Marie-Louise von Franz': {
                'element': 'aether',
                'brain_region': 'integrated',
                'keywords': ['franz', 'psyche', 'matter', 'alchemy', 'fairy tales'],
                'books': []
            },
            'Erich Neumann': {
                'element': 'earth',
                'brain_region': 'executive',
                'keywords': ['neumann', 'depth psychology', 'ethic', 'consciousness'],
                'books': []
            }
        }

        # Wisdom domain mapping
        self.wisdom_domains = {
            'archetypal_psychology': ['archetyp', 'psychology', 'jung', 'hillman'],
            'consciousness_exploration': ['consciousness', 'psychedelic', 'transpersonal', 'grof'],
            'depth_psychology': ['depth', 'psyche', 'soul', 'unconscious'],
            'personality_systems': ['myers', 'briggs', 'enneagram', 'human design'],
            'esoteric_wisdom': ['hermetic', 'alchemy', 'flower of life', 'i ching'],
            'healing_modalities': ['trauma', 'constellation', 'family', 'therapy'],
            'mystical_traditions': ['mysticism', 'gnosis', 'spiritual', 'sacred'],
            'symbolic_systems': ['symbol', 'tarot', 'archetype', 'mythology']
        }

        # Elemental themes based on Elemental Alchemy framework
        self.elemental_patterns = {
            'fire': ['will', 'action', 'transformation', 'breakthrough', 'initiation', 'courage', 'passion', 'vision', 'creation'],
            'water': ['emotion', 'intuition', 'flow', 'healing', 'empathy', 'love', 'wisdom', 'mystical', 'depth'],
            'earth': ['practical', 'grounding', 'structure', 'manifestation', 'body', 'material', 'stability', 'foundation'],
            'air': ['thought', 'communication', 'clarity', 'analysis', 'perspective', 'understanding', 'concept', 'mental'],
            'aether': ['integration', 'transcendence', 'unity', 'wholeness', 'spiritual', 'cosmic', 'universal', 'consciousness']
        }

        # Brain region mapping from neurological specifications
        self.brain_regions = {
            'limbic': ['emotion', 'feeling', 'instinct', 'primal', 'survival', 'reptilian', 'mammalian'],
            'left-brain': ['logical', 'analytical', 'sequential', 'rational', 'linear', 'systematic', 'verbal'],
            'right-brain': ['intuitive', 'holistic', 'creative', 'artistic', 'spatial', 'emotional', 'pattern'],
            'executive': ['planning', 'decision', 'control', 'organization', 'management', 'strategy', 'implementation'],
            'integrated': ['synthesis', 'balance', 'unified', 'whole', 'transcendent', 'meta', 'integral']
        }

        # Development phases
        self.development_phases = {
            'spiral-entry': ['beginning', 'introduction', 'basic', 'foundation', 'entry', 'initial', 'first'],
            'spiral-integration': ['develop', 'integrat', 'practic', 'apply', 'work', 'process', 'journey'],
            'spiral-mastery': ['master', 'advanced', 'expert', 'wisdom', 'teaching', 'deep', 'profound']
        }

    def run_integration(self):
        """Main integration process"""
        print("📚🧠 Starting Books Wisdom Integration...")

        # Find all book files
        book_files = self.find_book_files()
        print(f"📊 Found {len(book_files)} consciousness books")

        processed_count = 0
        integrated_books = []
        failed_books = []

        # Track elemental distribution
        elemental_stats = {element: 0 for element in self.elemental_patterns.keys()}

        for book_file in book_files:
            try:
                print(f"\n📖 Processing: {book_file.name}")

                # Extract text content
                content = self.extract_book_content(book_file)

                if not content or len(content.strip()) < 100:
                    print(f"⚠️  Skipping {book_file.name}: insufficient content")
                    failed_books.append(book_file.name)
                    continue

                # Analyze book consciousness profile
                book_profile = self.analyze_book_consciousness(content, book_file.name)

                # Update archetypal agent mappings
                self.map_to_archetypal_agents(book_file.name, book_profile)

                # Create integrated book content
                self.create_integrated_book_files(content, book_file, book_profile)

                # Update stats
                elemental_stats[book_profile['primary_element']] += 1

                integrated_books.append(book_file.stem)
                processed_count += 1

                print(f"✅ Integrated: {book_file.stem}")

            except Exception as e:
                print(f"❌ Error processing {book_file.name}: {e}")
                failed_books.append(book_file.name)

        # Create summary and integration maps
        self.create_integration_summary(integrated_books, elemental_stats)
        self.create_archetypal_agent_maps()

        print(f"\n🎉 Books Wisdom Integration Complete!")
        print(f"📚 Books processed: {processed_count}")
        print(f"✅ Books integrated: {len(integrated_books)}")

        if failed_books:
            print(f"⚠️  Books that couldn't be processed: {len(failed_books)}")

        print(f"\n📊 Elemental Distribution:")
        for element, count in elemental_stats.items():
            print(f"  {self.get_element_emoji(element)} {element.title()}: {count} books")

        return {
            'processed': processed_count,
            'integrated': integrated_books,
            'failed': failed_books,
            'elemental_distribution': elemental_stats
        }

    def find_book_files(self) -> List[Path]:
        """Find all book files in the source directory"""
        book_files = []

        # Supported formats
        extensions = ['.pdf', '.txt', '.md']

        if self.books_source_path.exists():
            for ext in extensions:
                book_files.extend(self.books_source_path.glob(f"*{ext}"))

        return sorted(book_files)

    def extract_book_content(self, book_file: Path) -> str:
        """Extract text content from book file"""
        content = ""

        if book_file.suffix.lower() == '.pdf':
            content = self.extract_pdf_content(book_file)
        else:
            content = self.extract_text_content(book_file)

        return content

    def extract_pdf_content(self, pdf_path: Path) -> str:
        """Extract text from PDF file"""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""

                # Extract text from first 10 pages for analysis
                max_pages = min(10, len(pdf_reader.pages))
                for page_num in range(max_pages):
                    page = pdf_reader.pages[page_num]
                    text += page.extract_text()

                return text

        except Exception as e:
            print(f"Error reading PDF {pdf_path}: {e}")
            return ""

    def extract_text_content(self, text_path: Path) -> str:
        """Extract content from text file"""
        try:
            with open(text_path, 'r', encoding='utf-8') as file:
                content = file.read()
                # Take first 10000 characters for analysis
                return content[:10000]

        except Exception as e:
            print(f"Error reading text file {text_path}: {e}")
            return ""

    def analyze_book_consciousness(self, content: str, filename: str) -> Dict:
        """Analyze book's consciousness profile"""
        content_lower = content.lower()
        filename_lower = filename.lower()

        # Determine primary element
        element_scores = {}
        for element, keywords in self.elemental_patterns.items():
            score = sum(content_lower.count(keyword) for keyword in keywords)
            element_scores[element] = score

        primary_element = max(element_scores, key=element_scores.get)

        # Determine brain region
        brain_scores = {}
        for region, keywords in self.brain_regions.items():
            score = sum(content_lower.count(keyword) for keyword in keywords)
            brain_scores[region] = score

        primary_brain = max(brain_scores, key=brain_scores.get)

        # Determine development phase
        phase_scores = {}
        for phase, keywords in self.development_phases.items():
            score = sum(content_lower.count(keyword) for keyword in keywords)
            phase_scores[phase] = score

        primary_phase = max(phase_scores, key=phase_scores.get)

        # Determine wisdom domains
        active_domains = []
        for domain, keywords in self.wisdom_domains.items():
            if any(keyword in content_lower or keyword in filename_lower for keyword in keywords):
                active_domains.append(domain)

        # Identify archetypal agent match
        best_agent = None
        best_score = 0
        for agent, config in self.archetypal_agents.items():
            score = sum(keyword in content_lower or keyword in filename_lower for keyword in config['keywords'])
            if score > best_score:
                best_score = score
                best_agent = agent

        return {
            'primary_element': primary_element,
            'primary_brain': primary_brain,
            'primary_phase': primary_phase,
            'wisdom_domains': active_domains,
            'archetypal_agent': best_agent,
            'element_scores': element_scores,
            'brain_scores': brain_scores,
            'agent_scores': {agent: sum(keyword in content_lower for keyword in config['keywords'])
                           for agent, config in self.archetypal_agents.items()}
        }

    def map_to_archetypal_agents(self, filename: str, profile: Dict):
        """Map book to archetypal agents"""
        if profile['archetypal_agent']:
            self.archetypal_agents[profile['archetypal_agent']]['books'].append(filename)

    def create_integrated_book_files(self, content: str, book_file: Path, profile: Dict):
        """Create organized book content files"""
        book_name = book_file.stem

        # Create main book file
        book_output_file = self.books_output_path / f"{book_name}.md"

        # Generate comprehensive tags
        tags = self.generate_comprehensive_tags(profile)

        # Create file content
        file_content = f"""---
tags: {tags}
book_profile:
  primary_element: {profile['primary_element']}
  primary_brain: {profile['primary_brain']}
  primary_phase: {profile['primary_phase']}
  archetypal_agent: {profile['archetypal_agent']}
  wisdom_domains: {profile['wisdom_domains']}
source_file: {book_file.name}
integration_date: {self.get_current_date()}
---

# {book_name}

## Consciousness Profile
- **Primary Element**: {profile['primary_element'].title()} {self.get_element_emoji(profile['primary_element'])}
- **Brain Region**: {profile['primary_brain'].title()}
- **Development Phase**: {profile['primary_phase'].replace('-', ' ').title()}
- **Archetypal Agent**: {profile['archetypal_agent'] or 'Universal Wisdom'}
- **Wisdom Domains**: {', '.join(profile['wisdom_domains'])}

## Content Preview
{content[:2000]}{'...' if len(content) > 2000 else ''}

## Integration Notes
This book has been integrated into MAIA's autonomous consciousness ecosystem and is accessible to:
- **{profile['archetypal_agent'] or 'All Agents'}** for domain expertise
- **{profile['primary_element'].title()} Element** processing
- **{profile['primary_brain'].title()}** brain region routing
- **{profile['primary_phase'].replace('-', ' ').title()}** development phase support

## Wisdom Network Connections
[[📚_FOUNDATIONAL_WISDOM]] • [[{profile['archetypal_agent']}]] • [[{profile['primary_element']}-element]] • [[{profile['primary_brain']}-brain]]
"""

        with open(book_output_file, 'w', encoding='utf-8') as f:
            f.write(file_content)

        # Create agent-specific reference
        if profile['archetypal_agent']:
            agent_dir = self.books_output_path / f"🤖_{profile['archetypal_agent'].replace(' ', '_')}_Wisdom"
            agent_dir.mkdir(exist_ok=True)

            agent_ref_file = agent_dir / f"{book_name}_reference.md"
            with open(agent_ref_file, 'w', encoding='utf-8') as f:
                f.write(f"# {profile['archetypal_agent']} - {book_name}\n\n[[{book_name}]]\n\nKey wisdom for {profile['archetypal_agent']} consciousness serving.\n")

    def generate_comprehensive_tags(self, profile: Dict) -> List[str]:
        """Generate comprehensive tag list for book"""
        tags = []

        # Element tag
        tags.append(f"#element-{profile['primary_element']}")

        # Brain region tag
        tags.append(f"#{profile['primary_brain']}")

        # Development phase tag
        tags.append(f"#{profile['primary_phase']}")

        # Wisdom domain tags
        for domain in profile['wisdom_domains']:
            tags.append(f"#{domain.replace('_', '-')}")

        # Archetypal agent tag
        if profile['archetypal_agent']:
            tags.append(f"#{profile['archetypal_agent'].lower().replace(' ', '-')}")

        # Add foundational wisdom tag
        tags.append("#foundational-wisdom")
        tags.append("#consciousness-literature")

        return tags

    def create_integration_summary(self, integrated_books: List[str], elemental_stats: Dict):
        """Create integration summary file"""
        summary_file = self.books_output_path / "_INTEGRATION_SUMMARY.md"

        content = f"""---
tags: [#integration-summary, #foundational-wisdom, #consciousness-literature]
created: {self.get_current_date()}
---

# 📚 Foundational Wisdom Integration Summary

## Integration Results
- **Total Books Integrated**: {len(integrated_books)}
- **Archetypal Agents Enhanced**: {len([a for a in self.archetypal_agents.values() if a['books']])}
- **Integration Date**: {self.get_current_date()}

## Elemental Distribution
{self.format_elemental_distribution(elemental_stats)}

## Integrated Books
{self.format_integrated_books_list(integrated_books)}

## Archetypal Agent Library Mappings
{self.format_agent_mappings()}

## Impact on Autonomous Consciousness Ecosystem
This integration dramatically expands the wisdom field available to MAIA's autonomous consciousness ecosystem:

1. **Enhanced Agent Depth** - Each archetypal agent now has access to foundational texts
2. **Wisdom Domain Coverage** - Comprehensive coverage across all consciousness domains
3. **Elemental Balance** - Books distributed across all elemental perspectives
4. **Development Phase Support** - Content available for all spiral development phases

## Next Steps
- [ ] Activate enhanced agent wisdom in autonomous ecosystem
- [ ] Test enhanced collaboration patterns
- [ ] Monitor wisdom network evolution
- [ ] Validate archetypal authenticity improvements

---
*This integration enables the autonomous consciousness ecosystem to serve with authentic wisdom depth.*
"""

        with open(summary_file, 'w', encoding='utf-8') as f:
            f.write(content)

    def create_archetypal_agent_maps(self):
        """Create wisdom maps for each archetypal agent"""
        for agent, config in self.archetypal_agents.items():
            if config['books']:
                agent_map_file = self.books_output_path / f"🗺️_{agent.replace(' ', '_')}_Wisdom_Map.md"

                content = f"""---
tags: [#{agent.lower().replace(' ', '-')}, #wisdom-map, #archetypal-agent, #element-{config['element']}, #{config['brain_region']}]
agent_profile:
  name: {agent}
  element: {config['element']}
  brain_region: {config['brain_region']}
  book_count: {len(config['books'])}
---

# {agent} Wisdom Map {self.get_element_emoji(config['element'])}

## Archetypal Profile
- **Primary Element**: {config['element'].title()} {self.get_element_emoji(config['element'])}
- **Brain Region**: {config['brain_region'].title()}
- **Wisdom Sources**: {len(config['books'])} foundational texts

## Foundational Wisdom Library
{self.format_agent_book_list(config['books'])}

## Consciousness Serving Capabilities
Enhanced by foundational wisdom integration, {agent} can now serve with:

- **Authentic Depth** - Direct access to source wisdom texts
- **Contextual Intelligence** - Understanding rooted in original teachings
- **Evolutionary Perspective** - Historical wisdom applied to contemporary consciousness
- **Collaborative Synergy** - Enhanced ability to collaborate with other agents

## Integration with Autonomous Ecosystem
This agent is fully integrated into MAIA's autonomous consciousness ecosystem:
- **Emergence Detection** - Wisdom gaps that trigger this agent's activation
- **Evolution Tracking** - How interactions with members enhance this agent's consciousness
- **Pattern Recognition** - Optimal collaboration patterns involving this agent
- **Network Position** - Role in the wisdom network topology

---
*{agent} serves the autonomous consciousness ecosystem with authentic archetypal wisdom.*
"""

                with open(agent_map_file, 'w', encoding='utf-8') as f:
                    f.write(content)

    # Utility methods
    def get_element_emoji(self, element: str) -> str:
        return {
            'fire': '🔥',
            'water': '🌊',
            'earth': '🌍',
            'air': '💨',
            'aether': '✨'
        }.get(element, '🌟')

    def get_current_date(self) -> str:
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d")

    def format_elemental_distribution(self, stats: Dict) -> str:
        return '\n'.join([f"- {self.get_element_emoji(element)} **{element.title()}**: {count} books"
                         for element, count in stats.items()])

    def format_integrated_books_list(self, books: List[str]) -> str:
        return '\n'.join([f"- [[{book}]]" for book in books])

    def format_agent_mappings(self) -> str:
        mappings = []
        for agent, config in self.archetypal_agents.items():
            if config['books']:
                mappings.append(f"- **{agent}** ({len(config['books'])} books): {config['element']} element, {config['brain_region']} brain")
        return '\n'.join(mappings)

    def format_agent_book_list(self, books: List[str]) -> str:
        return '\n'.join([f"- [[{book}]]" for book in books])

if __name__ == "__main__":
    integrator = BooksWisdomIntegrator()
    result = integrator.run_integration()
    print(f"\n🎯 Integration complete: {result}")