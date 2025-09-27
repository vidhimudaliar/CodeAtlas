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

def get_tasks_from_supabase(project_id: str = None) -> dict:
    """
    Fetch tasks (nodes) from Supabase database.
    Returns nodes with their hierarchical relationships.
    """
    if supabase and project_id:
        try:
            # Query nodes for the project
            nodes_response = supabase.table("nodes").select("*").eq("project_id", project_id).execute()
            nodes = nodes_response.data if nodes_response.data else []
            
            # Query edges to understand parent-child relationships
            edges_response = supabase.table("edges").select("*").eq("project_id", project_id).execute()
            edges = edges_response.data if edges_response.data else []
            
            # Query relations for additional relationships
            relations_response = supabase.table("relations").select("*").eq("project_id", project_id).execute()
            relations = relations_response.data if relations_response.data else []
            
            return {
                "tasks": nodes,
                "edges": edges,
                "relations": relations
            }
        except Exception as e:
            print(f"Error fetching tasks from Supabase: {e}")
            # Fallback to static data
            pass
    
    # Fallback static data for testing
    return {
        "tasks": [
            {"node_id": "T-42", "name": "Add login button", "type": "feature", "status": "todo", "level": 2},
            {"node_id": "T-77", "name": "Fix 500 on /signup", "type": "bug", "status": "todo", "level": 3},
            {"node_id": "T-88", "name": "Refactor email sender", "type": "task", "status": "done", "level": 3},
            {"node_id": "T-99", "name": "Add agency client component", "type": "feature", "status": "todo", "level": 2},
        ],
        "edges": [],
        "relations": []
    }

# ---------------------------
# 2) GitHub webhook data parser
# ---------------------------

def get_webhook_commit(webhook_data: dict) -> dict:
    """
    Extract the commit from GitHub webhook payload.
    Returns the raw commit data from the webhook.
    """
    if webhook_data.get("event") == "push" and "payload" in webhook_data:
        payload = webhook_data["payload"]
        commits = payload.get("commits", [])
        
        # Return the first commit (webhooks typically have one commit per push)
        if commits:
            return commits[0]
    
    return {}

def get_project_id_from_webhook(webhook_data: dict) -> str:
    """
    Extract project identifier from webhook data.
    Uses repository owner/name to identify the project.
    """
    if webhook_data.get("event") == "push" and "payload" in webhook_data:
        payload = webhook_data["payload"]
        repo = payload.get("repository", {})
        owner = repo.get("owner", {}).get("login", "")
        repo_name = repo.get("name", "")
        
        if owner and repo_name:
            return f"{owner}/{repo_name}"
    
    return "default-project"

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
    description="Classifies whether a commit corresponds to a known task by analyzing GitHub webhook data against Supabase nodes and edges.",
    instruction="""
You are a JSON generator that analyzes a single GitHub commit against project nodes (tasks). You MUST:
1) Call get_project_id_from_webhook to identify the project from webhook data.
2) Call get_tasks_from_supabase with the project_id to load current nodes, edges, and relations.
3) Call get_webhook_commit to extract the commit from webhook data.
4) Analyze the commit against nodes:
   - Commit message content and keywords
   - File changes (added/modified/removed files)
   - Node names and types
   - Node IDs mentioned in commit messages
   - Consider hierarchical relationships from edges
5) Return ONLY JSON following this schema (no extra text):

{
  "sha": "string",
  "was_task": true | false,
  "matched_node_id": "string or null",
  "reason": "short explanation",
  "confidence": 0.0-1.0
}

Analysis Rules:
- Look for exact node ID references in commit messages (e.g., "T-42", "fixes #123")
- Match commit message keywords to node names and types
- Consider file paths that relate to node functionality
- Use edges to understand parent-child relationships
- Prefer precision over recall - only mark as task-related if confident
- If unsure, set was_task=false and matched_node_id=null
- Include confidence score based on match strength
- Keep 'reason' concise but informative
""",
    tools=[get_tasks_from_supabase, get_webhook_commit, get_project_id_from_webhook]
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
        user_message = f"Analyze this GitHub webhook commit against current tasks: {json.dumps(webhook_data, indent=2)}"
    
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
