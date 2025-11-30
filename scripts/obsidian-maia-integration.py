#!/usr/bin/env python3
"""
MAIA-Obsidian Integration Script
Connect your consciousness research vault with MAIA's AI analysis capabilities

Usage:
    python obsidian-maia-integration.py analyze <note_path>
    python obsidian-maia-integration.py batch <vault_path>
    python obsidian-maia-integration.py capabilities
"""

import requests
import json
import os
import sys
import glob
from pathlib import Path

class MAIAObsidianIntegrator:
    def __init__(self, maia_url="http://localhost:3000"):
        self.maia_url = maia_url
        self.analyze_endpoint = f"{maia_url}/api/obsidian/analyze"
        self.batch_endpoint = f"{maia_url}/api/obsidian/batch"

    def read_note(self, note_path):
        """Read Obsidian note content"""
        try:
            with open(note_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"❌ Error reading note {note_path}: {e}")
            return None

    def analyze_note(self, note_path, analysis_type="synthesis", consciousness_level=4):
        """Analyze a single Obsidian note using MAIA"""
        print(f"🧠 Analyzing note: {note_path}")
        print(f"📊 Analysis type: {analysis_type} (Level {consciousness_level})")

        content = self.read_note(note_path)
        if not content:
            return None

        payload = {
            "noteContent": content,
            "notePath": str(Path(note_path).name),
            "analysisType": analysis_type,
            "consciousnessLevel": consciousness_level
        }

        try:
            print("🔄 Connecting to MAIA...")
            response = requests.post(self.analyze_endpoint, json=payload, timeout=60)

            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    print("✅ Analysis complete!")
                    return result["data"]
                else:
                    print(f"❌ Analysis failed: {result.get('error', 'Unknown error')}")
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                print(response.text)

        except requests.exceptions.RequestException as e:
            print(f"❌ Connection error: {e}")
            print("💡 Make sure MAIA is running on localhost:3000")

        return None

    def batch_analyze_vault(self, vault_path, analysis_type="vault-synthesis", max_notes=10):
        """Analyze multiple notes from vault for comprehensive synthesis"""
        print(f"🗂️  Scanning vault: {vault_path}")

        # Find all markdown files
        md_files = glob.glob(os.path.join(vault_path, "**/*.md"), recursive=True)
        md_files = [f for f in md_files if not f.endswith("Templates/")][:max_notes]

        print(f"📚 Found {len(md_files)} notes to analyze")

        notes = []
        for file_path in md_files:
            content = self.read_note(file_path)
            if content and len(content) > 100:  # Skip very short files
                relative_path = os.path.relpath(file_path, vault_path)
                notes.append({
                    "path": relative_path,
                    "content": content[:2000]  # Truncate for batch processing
                })

        if not notes:
            print("❌ No valid notes found for batch analysis")
            return None

        payload = {
            "notes": notes,
            "analysisType": analysis_type,
            "consciousnessLevel": 5
        }

        try:
            print(f"🔄 Performing {analysis_type} on {len(notes)} notes...")
            response = requests.post(self.batch_endpoint, json=payload, timeout=120)

            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    print("✅ Batch analysis complete!")
                    return result["data"]
                else:
                    print(f"❌ Batch analysis failed: {result.get('error', 'Unknown error')}")
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                print(response.text)

        except requests.exceptions.RequestException as e:
            print(f"❌ Connection error: {e}")

        return None

    def show_capabilities(self):
        """Display available analysis types and capabilities"""
        try:
            response = requests.get(f"{self.analyze_endpoint}?action=capabilities")
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    capabilities = data["data"]
                    print("🧠 MAIA-Obsidian Analysis Capabilities:")
                    print("=" * 50)

                    for analysis in capabilities.get("analysisTypes", []):
                        print(f"📋 {analysis['name']} ({analysis['id']})")
                        print(f"   {analysis['description']}")
                        print(f"   Consciousness Level: {analysis['consciousnessLevel']}")
                        print()

                    return True
        except Exception as e:
            print(f"❌ Error fetching capabilities: {e}")
        return False

    def format_analysis_output(self, analysis_data, output_file=None):
        """Format and optionally save analysis results"""
        if not analysis_data:
            return

        print("\n" + "="*60)
        print("🧠 MAIA CONSCIOUSNESS ANALYSIS")
        print("="*60)

        if "analysis" in analysis_data:
            # Single note analysis
            print(f"📄 Note: {analysis_data.get('notePath', 'Unknown')}")
            print(f"🔬 Analysis Type: {analysis_data.get('analysisType', 'Unknown')}")
            print(f"🧠 Consciousness Level: {analysis_data.get('consciousnessLevel', 'Unknown')}")
            print(f"🤖 Model: {analysis_data.get('modelUsed', 'Unknown')}")
            print(f"⏰ Timestamp: {analysis_data.get('timestamp', 'Unknown')}")
            print("\n" + "-"*40)
            print("ANALYSIS:")
            print("-"*40)
            print(analysis_data["analysis"])

            if "suggestions" in analysis_data:
                suggestions = analysis_data["suggestions"]
                print("\n" + "-"*40)
                print("SUGGESTIONS:")
                print("-"*40)
                if "relatedTopics" in suggestions:
                    print("Related Topics:")
                    for topic in suggestions["relatedTopics"]:
                        print(f"  • {topic}")
                if "nextSteps" in suggestions:
                    print("\nNext Steps:")
                    for step in suggestions["nextSteps"]:
                        print(f"  • {step}")

        elif "results" in analysis_data:
            # Batch analysis
            print(f"📚 Notes Processed: {analysis_data.get('notesProcessed', 'Unknown')}")
            print(f"🔬 Analysis Type: {analysis_data.get('analysisType', 'Unknown')}")
            print(f"🧠 Consciousness Level: {analysis_data.get('consciousnessLevel', 'Unknown')}")
            print(f"⏰ Timestamp: {analysis_data.get('timestamp', 'Unknown')}")

            for i, result in enumerate(analysis_data["results"]):
                print(f"\n" + "-"*40)
                print(f"RESULT {i+1} ({result.get('type', 'Unknown')}):")
                print("-"*40)
                print(result.get("content", "No content"))

        print("\n" + "="*60)

        # Save to file if requested
        if output_file:
            try:
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(analysis_data, f, indent=2)
                print(f"💾 Full analysis saved to: {output_file}")
            except Exception as e:
                print(f"❌ Error saving to file: {e}")

def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python obsidian-maia-integration.py analyze <note_path> [analysis_type] [consciousness_level]")
        print("  python obsidian-maia-integration.py batch <vault_path> [analysis_type]")
        print("  python obsidian-maia-integration.py capabilities")
        print("\nAnalysis Types: synthesis, summary, connections, insights, questions")
        print("Consciousness Levels: 1-5 (higher = deeper analysis)")
        return

    integrator = MAIAObsidianIntegrator()
    command = sys.argv[1].lower()

    if command == "capabilities":
        integrator.show_capabilities()

    elif command == "analyze":
        if len(sys.argv) < 3:
            print("❌ Please specify a note path")
            return

        note_path = sys.argv[2]
        analysis_type = sys.argv[3] if len(sys.argv) > 3 else "synthesis"
        consciousness_level = int(sys.argv[4]) if len(sys.argv) > 4 else 4

        if not os.path.exists(note_path):
            print(f"❌ Note not found: {note_path}")
            return

        result = integrator.analyze_note(note_path, analysis_type, consciousness_level)
        integrator.format_analysis_output(result)

    elif command == "batch":
        if len(sys.argv) < 3:
            print("❌ Please specify a vault path")
            return

        vault_path = sys.argv[2]
        analysis_type = sys.argv[3] if len(sys.argv) > 3 else "vault-synthesis"

        if not os.path.exists(vault_path):
            print(f"❌ Vault not found: {vault_path}")
            return

        result = integrator.batch_analyze_vault(vault_path, analysis_type)
        integrator.format_analysis_output(result)

    else:
        print(f"❌ Unknown command: {command}")

if __name__ == "__main__":
    main()