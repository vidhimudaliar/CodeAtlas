# Requirements
#   pip install google-adk google-generativeai supabase requests

import os
import json
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime

import google.generativeai as genai
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService, Session
from google.genai.types import Content, Part
from supabase import create_client, Client
import requests

# ---------------------------
# 0) Config
# ---------------------------

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ---------------------------
# 1) Static-data tool (stub now, GET later)
# ---------------------------

def get_tasks_from_supabase() -> dict:
    # Fallback static data for testing
    return {
        "tasks": [
            {"id": "T-42", "title": "Add login button", "description": "Implement login functionality", "status": "in_progress"},
            {"id": "T-77", "title": "Fix 500 on /signup", "description": "Resolve server error on signup page", "status": "open"},
            {"id": "T-88", "title": "Refactor email sender", "description": "Improve email sending reliability", "status": "completed"},
            {"id": "T-99", "title": "Add agency client component", "description": "Create new agency client interface", "status": "open"},
        ]
    }

# ---------------------------
# 2) GitHub webhook data parser
# ---------------------------

def parse_github_webhook_payload(webhook_data: dict) -> dict:
    """
    Parse GitHub webhook payload and extract commit information.
    Input: GitHub webhook payload (push event)
    Output: {"commits":[{"sha": "...", "msg":"...", "author":"...", "date":"...", "files": [...]}]}
    """
    commits = []
    
    if webhook_data.get("event") == "push" and "payload" in webhook_data:
        payload = webhook_data["payload"]
        
        # Extract commits from the payload
        webhook_commits = payload.get("commits", [])
        
        for commit in webhook_commits:
            commit_info = {
                "sha": commit.get("id", ""),
                "msg": commit.get("message", ""),
                "author": commit.get("author", {}).get("name", ""),
                "date": commit.get("timestamp", ""),
                "files": {
                    "added": commit.get("added", []),
                    "removed": commit.get("removed", []),
                    "modified": commit.get("modified", [])
                },
                "url": commit.get("url", "")
            }
            commits.append(commit_info)
    
    return {"commits": commits}

def get_sample_webhook_data() -> dict:
    """
    Return sample GitHub webhook data for testing.
    """
    return {
        "event": "push",
        "payload": {
            "ref": "refs/heads/feature/n8n",
            "before": "10196470e3d299c99c1b2fb6b94a4e688046b358",
            "after": "37c3d51058b8f787a6c29719e880ff8626339147",
            "repository": {
                "id": 857492214,
                "name": "DeepVisor",
                "full_name": "Yengner/DeepVisor",
                "private": False,
                "owner": {
                    "name": "Yengner",
                    "email": "Yengnerb475@gmail.com",
                    "login": "Yengner"
                }
            },
            "pusher": {
                "name": "Yengner",
                "email": "Yengnerb475@gmail.com"
            },
            "commits": [
                {
                    "id": "37c3d51058b8f787a6c29719e880ff8626339147",
                    "tree_id": "470d8dca073df53e1c728aa820883b6cb4445f38",
                    "distinct": True,
                    "message": "he",
                    "timestamp": "2025-09-27T14:32:34-04:00",
                    "url": "https://github.com/Yengner/DeepVisor/commit/37c3d51058b8f787a6c29719e880ff8626339147",
                    "author": {
                        "name": "Yengner",
                        "email": "Yengnerb475@gmail.com",
                        "username": "Yengner"
                    },
                    "committer": {
                        "name": "Yengner",
                        "email": "Yengnerb475@gmail.com",
                        "username": "Yengner"
                    },
                    "added": ["src/app/(root)/agency/AgencyClient.tsx"],
                    "removed": [],
                    "modified": []
                }
            ],
            "head_commit": {
                "id": "37c3d51058b8f787a6c29719e880ff8626339147",
                "tree_id": "470d8dca073df53e1c728aa820883b6cb4445f38",
                "distinct": True,
                "message": "he",
                "timestamp": "2025-09-27T14:32:34-04:00",
                "url": "https://github.com/Yengner/DeepVisor/commit/37c3d51058b8f787a6c29719e880ff8626339147",
                "author": {
                    "name": "Yengner",
                    "email": "Yengnerb475@gmail.com",
                    "username": "Yengner"
                },
                "committer": {
                    "name": "Yengner",
                    "email": "Yengnerb475@gmail.com",
                    "username": "Yengner"
                },
                "added": ["src/app/(root)/agency/AgencyClient.tsx"],
                "removed": [],
                "modified": []
            }
        }
    }

# ---------------------------
# 3) Agent that calls both tools and returns strict JSON
# ---------------------------

task_classifier = Agent(
    name="task_classifier",
    model="gemini-2.5-flash",  # fast + cheap; upgrade to pro if needed
    description="Classifies whether each commit corresponds to a known task by analyzing GitHub webhook data against Supabase tasks.",
    instruction="""
You are a strict JSON generator that analyzes GitHub commits against project tasks. You MUST:
1) Call get_tasks_from_supabase to load current tasks from the database.
2) Call parse_github_webhook_payload to extract commit information from webhook data.
3) For each commit, analyze:
   - Commit message content and keywords
   - File changes (added/modified/removed files)
   - Task titles and descriptions
   - Task IDs mentioned in commit messages
4) Return ONLY JSON following this schema (no extra text):

{
  "results":[
    {
      "sha": "string",
      "was_task": true | false,
      "matched_task_id": "string or null",
      "reason": "short explanation",
      "confidence": 0.0-1.0
    }
  ]
}

Analysis Rules:
- Look for exact task ID references in commit messages (e.g., "T-42", "fixes #123")
- Match commit message keywords to task titles/descriptions
- Consider file paths that relate to task functionality
- Prefer precision over recall - only mark as task-related if confident
- If unsure, set was_task=false and matched_task_id=null
- Include confidence score based on match strength
- Keep 'reason' concise but informative
""",
    tools=[get_tasks_from_supabase, parse_github_webhook_payload]
)

# ---------------------------
# 4) Runner helpers
# ---------------------------

session_service = InMemorySessionService()

async def run_classification(webhook_data: dict = None, user_message: str = None) -> str:
    """
    Executes the agent once and returns the model's final JSON string.
    If webhook_data is provided, it will be used for classification.
    """
    if webhook_data is None:
        webhook_data = get_sample_webhook_data()
    
    if user_message is None:
        user_message = f"Analyze the commits in this GitHub webhook payload against current tasks: {json.dumps(webhook_data, indent=2)}"
    
    session: Session = await session_service.create_session(
        app_name=task_classifier.name,
        user_id="user-1"
    )

    runner = Runner(agent=task_classifier, session_service=session_service, app_name=task_classifier.name)

    final_text = ""
    async for event in runner.run_async(
        user_id="user-1",
        session_id=session.id,
        new_message=Content(parts=[Part(text=user_message)], role="user"),
    ):
        if event.is_final_response():
            final_text = event.content.parts[0].text

    # Optional: sanity check that it's valid JSON
    try:
        json.loads(final_text)
    except Exception:
        # If the model returns non-JSON, wrap as error
        final_text = json.dumps({"error": "Non-JSON response from model", "raw": final_text})

    return final_text


# ---------------------------
# 5) Main
# ---------------------------

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="GitHub Commit/Task classifier via ADK")
    parser.add_argument("--webhook-file", type=str,
                        help="Path to JSON file containing GitHub webhook payload")
    parser.add_argument("--test-sample", action="store_true",
                        help="Test with the provided sample webhook data")
    args = parser.parse_args()

    # Load webhook data
    webhook_data = None
    if args.webhook_file:
        try:
            with open(args.webhook_file, 'r') as f:
                webhook_data = json.load(f)
        except Exception as e:
            print(f"Error loading webhook file: {e}")
            exit(1)
    elif args.test_sample:
        webhook_data = get_sample_webhook_data()
    else:
        # Use the provided sample data from user
        webhook_data = {
            "event": "push",
            "payload": {
                "ref": "refs/heads/feature/n8n",
                "before": "10196470e3d299c99c1b2fb6b94a4e688046b358",
                "after": "37c3d51058b8f787a6c29719e880ff8626339147",
                "repository": {
                    "id": 857492214,
                    "name": "DeepVisor",
                    "full_name": "Yengner/DeepVisor",
                    "private": False,
                    "owner": {
                        "name": "Yengner",
                        "email": "Yengnerb475@gmail.com",
                        "login": "Yengner"
                    }
                },
                "pusher": {
                    "name": "Yengner",
                    "email": "Yengnerb475@gmail.com"
                },
                "commits": [
                    {
                        "id": "37c3d51058b8f787a6c29719e880ff8626339147",
                        "tree_id": "470d8dca073df53e1c728aa820883b6cb4445f38",
                        "distinct": True,
                        "message": "he",
                        "timestamp": "2025-09-27T14:32:34-04:00",
                        "url": "https://github.com/Yengner/DeepVisor/commit/37c3d51058b8f787a6c29719e880ff8626339147",
                        "author": {
                            "name": "Yengner",
                            "email": "Yengnerb475@gmail.com",
                            "username": "Yengner"
                        },
                        "committer": {
                            "name": "Yengner",
                            "email": "Yengnerb475@gmail.com",
                            "username": "Yengner"
                        },
                        "added": ["src/app/(root)/agency/AgencyClient.tsx"],
                        "removed": [],
                        "modified": []
                    }
                ]
            }
        }

    if not os.getenv("GOOGLE_API_KEY"):
        print("Set GOOGLE_API_KEY env var to use the agent.")
    else:
        result = asyncio.run(run_classification(webhook_data))
        print(result)
