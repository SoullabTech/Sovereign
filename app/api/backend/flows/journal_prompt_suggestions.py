"""
Journal Prompt Suggestion Module
Analyzes journal entries and suggests relevant Spiralogic prompts
"""

from typing import List, Dict, Optional, Tuple
import requests
import json
from datetime import datetime
import numpy as np
from collections import Counter
import re

# Elemental keywords mapping for phase detection
ELEMENTAL_KEYWORDS = {
    "Fire": [
        "excited", "passionate", "angry", "motivated", "driven", "fierce",
        "burning", "intense", "creative", "inspired", "ambitious", "dynamic",
        "energized", "spontaneous", "bold", "courageous", "initiate", "new"
    ],
    "Earth": [
        "grounded", "stable", "practical", "physical", "routine", "structured",
        "material", "tangible", "secure", "comfortable", "steady", "consistent",
        "reliable", "patient", "enduring", "solid", "foundation", "manifest"
    ],
    "Air": [
        "thinking", "ideas", "thoughts", "mental", "communication", "clarity",
        "perspective", "understanding", "analyzing", "curious", "questioning",
        "learning", "exploring", "connecting", "sharing", "expressing", "light"
    ],
    "Water": [
        "feeling", "emotional", "intuitive", "flowing", "sensitive", "deep",
        "tears", "vulnerable", "receptive", "nurturing", "healing", "fluid",
        "changeable", "mysterious", "psychic", "dreamy", "subconscious", "shadow"
    ],
    "Aether": [
        "spiritual", "transcendent", "unified", "cosmic", "divine", "eternal",
        "infinite", "consciousness", "awakening", "enlightenment", "mystical",
        "universal", "oneness", "sacred", "luminous", "essence", "source"
    ]
}

# Emotional tone mapping
EMOTIONAL_TONES = {
    "exploration": ["curious", "wondering", "questioning", "searching", "seeking"],
    "transformation": ["changing", "shifting", "evolving", "becoming", "transforming"],
    "integration": ["balancing", "harmonizing", "integrating", "synthesizing", "unifying"],
    "challenge": ["struggling", "difficult", "hard", "challenging", "obstacle"],
    "breakthrough": ["realized", "discovered", "understood", "breakthrough", "clarity"],
    "shadow_work": ["shadow", "dark", "hidden", "unconscious", "repressed", "denied"]
}


class JournalPromptSuggester:
    """Analyzes journal entries and suggests relevant Spiralogic prompts"""

    def __init__(self, supabase_url: str, supabase_key: str, api_base_url: str):
        self.supabase_url = supabase_url
        self.supabase_key = supabase_key
        self.api_base_url = api_base_url
        self.headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json"
        }

    def analyze_journal_entry(self, entry_text: str) -> Dict:
        """
        Analyze journal entry for elemental phase, emotional tone, and keywords
        """
        entry_lower = entry_text.lower()
        words = re.findall(r'\b\w+\b', entry_lower)

        # Detect elemental phase
        phase_scores = {}
        for phase, keywords in ELEMENTAL_KEYWORDS.items():
            score = sum(1 for word in words if word in keywords)
            phase_scores[phase] = score

        # Get dominant phase
        dominant_phase = max(phase_scores, key=phase_scores.get)
        phase_confidence = phase_scores[dominant_phase] / max(1, sum(phase_scores.values()))

        # Detect emotional tones
        detected_tones = []
        for tone, keywords in EMOTIONAL_TONES.items():
            if any(keyword in entry_lower for keyword in keywords):
                detected_tones.append(tone)

        # Extract key themes (most common meaningful words)
        stop_words = {"the", "is", "at", "which", "on", "a", "an", "and", "or", "but", "in", "with", "to", "for", "of", "as", "by", "that", "this", "it", "from", "be", "are", "was", "were", "been"}
        meaningful_words = [w for w in words if len(w) > 3 and w not in stop_words]
        word_freq = Counter(meaningful_words)
        key_themes = [word for word, _ in word_freq.most_common(5)]

        return {
            "dominant_phase": dominant_phase,
            "phase_confidence": phase_confidence,
            "phase_scores": phase_scores,
            "emotional_tones": detected_tones,
            "key_themes": key_themes,
            "word_count": len(words)
        }

    def get_matching_prompts(self, phase: str, emotional_tones: List[str],
                           key_themes: List[str], limit: int = 3) -> List[Dict]:
        """
        Fetch prompts from Supabase that match the detected phase and tones
        """
        try:
            # Query prompts from database
            url = f"{self.supabase_url}/rest/v1/spiralogic_prompts"
            params = {
                "select": "*",
                "phase": f"eq.{phase}",
                "limit": limit * 3  # Get more to filter
            }

            response = requests.get(url, headers=self.headers, params=params)

            if response.status_code != 200:
                # Fallback to API endpoint
                return self._get_prompts_from_api(phase, limit)

            prompts = response.json()

            # Score prompts based on relevance
            scored_prompts = []
            for prompt in prompts:
                score = 0

                # Check if prompt contains emotional tone keywords
                prompt_lower = prompt.get("prompt", "").lower()
                for tone in emotional_tones:
                    if tone in prompt.get("context_tags", []):
                        score += 2
                    if tone in prompt_lower:
                        score += 1

                # Check for theme relevance
                for theme in key_themes:
                    if theme in prompt_lower:
                        score += 1

                scored_prompts.append({
                    "prompt": prompt,
                    "relevance_score": score
                })

            # Sort by relevance and return top matches
            scored_prompts.sort(key=lambda x: x["relevance_score"], reverse=True)
            return [sp["prompt"] for sp in scored_prompts[:limit]]

        except Exception as e:
            print(f"Error fetching prompts from database: {e}")
            return self._get_prompts_from_api(phase, limit)

    def _get_prompts_from_api(self, phase: str, limit: int) -> List[Dict]:
        """Fallback to get prompts from API"""
        try:
            response = requests.get(
                f"{self.api_base_url}/api/oracle-agent/prompts/{phase.lower()}",
                params={"limit": limit}
            )
            if response.status_code == 200:
                return response.json()
            return []
        except:
            return []

    def generate_prompt_suggestions(self, user_id: str, entry_text: str,
                                  include_analysis: bool = True) -> Dict:
        """
        Main function to analyze journal and suggest prompts
        """
        # Analyze the journal entry
        analysis = self.analyze_journal_entry(entry_text)

        # Get matching prompts
        prompts = self.get_matching_prompts(
            phase=analysis["dominant_phase"],
            emotional_tones=analysis["emotional_tones"],
            key_themes=analysis["key_themes"]
        )

        # Log the suggestion event (optional)
        self._log_suggestion_event(user_id, analysis, prompts)

        result = {
            "suggested_prompts": prompts,
            "phase": analysis["dominant_phase"],
            "timestamp": datetime.utcnow().isoformat()
        }

        if include_analysis:
            result["analysis"] = analysis

        return result

    def _log_suggestion_event(self, user_id: str, analysis: Dict, prompts: List[Dict]):
        """Log prompt suggestion event for analytics"""
        try:
            log_data = {
                "user_id": user_id,
                "event_type": "journal_prompt_suggestion",
                "phase_detected": analysis["dominant_phase"],
                "emotional_tones": analysis["emotional_tones"],
                "prompts_suggested": len(prompts),
                "timestamp": datetime.utcnow().isoformat()
            }

            # Log to Supabase events table if available
            url = f"{self.supabase_url}/rest/v1/oracle_events"
            requests.post(url, headers=self.headers, json=log_data)
        except:
            pass  # Don't fail on logging errors


def suggest_prompts_for_journal(
    user_id: str,
    entry_text: str,
    supabase_url: str,
    supabase_key: str,
    api_base_url: str = "http://localhost:8080"
) -> Dict:
    """
    Convenience function to get prompt suggestions for a journal entry

    Args:
        user_id: User identifier
        entry_text: Journal entry text
        supabase_url: Supabase project URL
        supabase_key: Supabase API key
        api_base_url: Base URL for the API

    Returns:
        Dictionary with suggested prompts and analysis
    """
    suggester = JournalPromptSuggester(supabase_url, supabase_key, api_base_url)
    return suggester.generate_prompt_suggestions(user_id, entry_text)


# Integration with Prefect flow
def create_journal_prompt_task():
    """Create a Prefect task for prompt suggestions"""
    from prefect import task

    @task(name="suggest_journal_prompts")
    def suggest_journal_prompts_task(user_id: str, entry_text: str, config: Dict) -> Dict:
        return suggest_prompts_for_journal(
            user_id=user_id,
            entry_text=entry_text,
            supabase_url=config["supabase_url"],
            supabase_key=config["supabase_key"],
            api_base_url=config.get("api_base_url", "http://localhost:8080")
        )

    return suggest_journal_prompts_task


# Example usage
if __name__ == "__main__":
    # Example journal entry
    example_entry = """
    Today I felt really stuck and frustrated. I've been trying to push forward with my project
    but I keep hitting walls. I feel like I'm in a transition phase where the old ways aren't
    working anymore but I don't know what the new way looks like yet. There's this deep emotional
    churning happening, like something wants to emerge but I can't quite grasp it. I need to
    trust the process more and let go of control.
    """

    # Example configuration
    config = {
        "supabase_url": "https://your-project.supabase.co",
        "supabase_key": "your-api-key",
        "api_base_url": "http://localhost:8080"
    }

    # Get suggestions
    result = suggest_prompts_for_journal(
        user_id="test-user-123",
        entry_text=example_entry,
        **config
    )

    print(json.dumps(result, indent=2))