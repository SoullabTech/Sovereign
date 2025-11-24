from prefect import flow, task
from datetime import datetime
import requests
import os
import json
from journal_prompt_suggestions import suggest_prompts_for_journal
from supabase import create_client, Client

# Setup Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


@task
def analyze_entry(entry_text: str) -> dict:
    keywords = ["grief", "rupture", "longing", "transformation", "shadow", "breakthrough"]
    detected = [k for k in keywords if k in entry_text.lower()]

    intensity_words = ["very", "extremely", "deeply", "intensely", "overwhelmingly"]
    intensity = sum(1 for word in intensity_words if word in entry_text.lower())

    return {
        "keywords": detected,
        "emotional_intensity": min(intensity, 5),
        "timestamp": datetime.utcnow().isoformat()
    }


@task
def trigger_adjuster_if_needed(keywords: list, user_id: str):
    if "rupture" in keywords:
        requests.post(
            "https://yourdomain.com/api/adjuster/log",
            json={
                "user_id": user_id,
                "message": "Detected energetic rupture during journaling",
                "phase": "adjustment",
            },
        )


@task
def get_prompt_suggestions(user_id: str, entry_text: str) -> dict:
    try:
        return suggest_prompts_for_journal(
            user_id=user_id,
            entry_text=entry_text,
            supabase_url=SUPABASE_URL,
            supabase_key=SUPABASE_KEY,
            api_base_url=os.getenv("API_BASE_URL", "http://localhost:8080")
        )
    except Exception as e:
        print(f"Error getting prompt suggestions: {e}")
        return {"suggested_prompts": [], "phase": "Unknown"}


@task
def save_journal_insights(user_id: str, insights: dict, prompts: dict):
    try:
        row = {
            "user_id": user_id,
            "keywords": insights["keywords"],
            "emotional_intensity": insights["emotional_intensity"],
            "detected_phase": prompts.get("phase", "Unknown"),
            "suggested_prompts": json.dumps(prompts.get("suggested_prompts", [])),
            "analysis": json.dumps(prompts.get("analysis", {})),
            "created_at": insights["timestamp"],
        }

        response = supabase.table("prompt_insight_log").insert(row).execute()

        if response.error:
            raise Exception(response.error.message)

        print(f"[✓] Saved journal insights for user {user_id}")
        return True

    except Exception as e:
        print(f"[✗] Error saving journal insights: {e}")
        return False


@flow(name="daily_journal_processing")
def daily_journal_processing_flow(user_id: str, entry_text: str):
    insights = analyze_entry(entry_text)
    prompt_suggestions = get_prompt_suggestions(user_id, entry_text)
    trigger_adjuster_if_needed(insights["keywords"], user_id)
    save_journal_insights(user_id, insights, prompt_suggestions)

    return {
        "insights": insights,
        "prompt_suggestions": prompt_suggestions,
        "processing_complete": True
    }
