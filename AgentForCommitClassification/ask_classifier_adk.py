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
# 1) Get the task from subabase
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
    
    return {
        "tasks": [],
        "edges": [],
        "relations": []
    }

# ---------------------------
# 2) Get the commit from the webhook
# ---------------------------

def get_webhook_data(webhook_data: dict) -> dict:
    """
    Extract relevant information from GitHub webhook payload.
    Returns structured data based on the webhook event type.
    """
    if not webhook_data.get("payload"):
        return {}
    
    payload = webhook_data["payload"]
    event_type = webhook_data.get("event", "")
    
    result = {
        "event_type": event_type,
        "repository": payload.get("repository", {}),
        "sender": payload.get("sender", {}),
        "action": payload.get("action", ""),
        "timestamp": payload.get("head_commit", {}).get("timestamp") or payload.get("created_at"),
    }
    
    # Handle different event types
    if event_type == "push":
        commits = payload.get("commits", [])
        result["commits"] = commits
        result["head_commit"] = payload.get("head_commit", {})
        result["ref"] = payload.get("ref", "")
        result["before"] = payload.get("before", "")
        result["after"] = payload.get("after", "")
        
        # Return the first commit for analysis (most common case)
        if commits:
            result["primary_commit"] = commits[0]
    
    elif event_type == "pull_request":
        result["pull_request"] = payload.get("pull_request", {})
        result["number"] = payload.get("number", "")
        result["title"] = payload.get("pull_request", {}).get("title", "")
        result["body"] = payload.get("pull_request", {}).get("body", "")
    
    elif event_type == "issues":
        result["issue"] = payload.get("issue", {})
        result["number"] = payload.get("number", "")
        result["title"] = payload.get("issue", {}).get("title", "")
        result["body"] = payload.get("issue", {}).get("body", "")
    
    elif event_type == "issue_comment":
        result["issue"] = payload.get("issue", {})
        result["comment"] = payload.get("comment", {})
        result["number"] = payload.get("issue", {}).get("number", "")
    
    return result

def get_project_id_from_webhook(webhook_data: dict) -> str:
    """
    Extract project identifier from webhook data.
    Uses repository owner/name to identify the project.
    Works for both owners and contributors.
    """
    if "payload" in webhook_data:
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
    description="Classifies whether GitHub webhook events correspond to known tasks by analyzing webhook data against Supabase nodes and edges.",
    instruction="""
You are a JSON generator that analyzes GitHub webhook events against project nodes (tasks). You MUST:
1) Call get_project_id_from_webhook to identify the project from webhook data.
2) Call get_tasks_from_supabase with the project_id to load current nodes, edges, and relations.
3) Call get_webhook_data to extract relevant information from webhook data.
4) Analyze the webhook event against nodes based on event type:
   - For PUSH events: analyze commit messages, file changes, and commit content
   - For PULL_REQUEST events: analyze PR title, body, and changes
   - For ISSUES events: analyze issue title, body, and labels
   - For ISSUE_COMMENT events: analyze comment content and related issue
   - Look for node ID references in any text content
   - Match keywords to node names and types
   - Consider hierarchical relationships from edges
5) Return ONLY JSON following this schema (no extra text):

{
  "event_type": "string",
  "was_task": true | false,
  "matched_node_id": "string or null",
  "reason": "short explanation",
  "confidence": 0.0-1.0,
  "relevant_data": {
    "sha": "string (for commits)",
    "number": "string (for PRs/issues)",
    "title": "string",
    "content": "string"
  }
}

Analysis Rules:
- Look for exact node ID references in any text content (e.g., "T-42", "fixes #123")
- Match content keywords to node names and types
- Consider file paths and changes that relate to node functionality
- Use edges to understand parent-child relationships
- Prefer precision over recall - only mark as task-related if confident
- If unsure, set was_task=false and matched_node_id=null
- Include confidence score based on match strength
- Keep 'reason' concise but informative
- Include relevant data from the webhook event
""",
    tools=[get_tasks_from_supabase, get_webhook_data, get_project_id_from_webhook]
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
        user_message = f"Analyze this GitHub webhook event against current tasks: {json.dumps(webhook_data, indent=2)}"
    
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
