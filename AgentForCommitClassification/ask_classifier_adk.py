# file: task_classifier_adk.py
# Requirements
#   pip install google-adk google-generativeai
# Optional (only if you change to real HTTP): requests

import os
import json
import sqlite3
import difflib
import asyncio
from typing import List, Dict, Any, Optional

import google.generativeai as genai
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService, Session
from google.genai.types import Content, Part

# ---------------------------
# 0) Config
# ---------------------------

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
if not GOOGLE_API_KEY:
    # Set this in your env before running, or hardcode for quick tests
    # os.environ["GOOGLE_API_KEY"] = "YOUR_KEY"
    pass
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

# ---------------------------
# 1) Static-data tool (stub now, GET later)
# ---------------------------

def get_static_tasks() -> dict:
    """
    Return the current static tasks to compare against commits.
    Later: replace internals with requests.get(YOUR_URL).json().
    Output schema:
    {
      "tasks":[
        {"id":"T-42", "title":"Add login button"},
        {"id":"T-77", "title":"Fix 500 on /signup"}
      ]
    }
    """
    # ---- swap this block with your GET API when ready ----
    return {
        "tasks": [
            {"id": "T-42", "title": "Add login button"},
            {"id": "T-77", "title": "Fix 500 on /signup"},
            {"id": "T-88", "title": "Refactor email sender"},
        ]
    }

# ---------------------------
# 2) SQL tool (SQLite example; replace with your DB)
# ---------------------------

def query_recent_commits(limit: int = 20) -> dict:
    """
    Query recent commits from the database and return:
    {"commits":[{"sha": "...", "msg":"...", "author":"...", "date":"..."}]}
    Notes:
    - Uses SQLite for demo. Replace with your DB driver (psycopg, mysqlclient, etc.)
    - Make sure your DB has a 'commits' table or adjust SQL accordingly.
    """
    # Change path/connection for your environment
    con = sqlite3.connect("app.db")
    try:
        con.execute("""
        CREATE TABLE IF NOT EXISTS commits (
            sha TEXT PRIMARY KEY,
            message TEXT,
            author TEXT,
            committed_at TEXT
        )
        """)
        # Seed a few example rows if table is empty
        row_count = con.execute("SELECT COUNT(*) FROM commits").fetchone()[0]
        if row_count == 0:
            con.executemany(
                "INSERT OR IGNORE INTO commits (sha, message, author, committed_at) VALUES (?,?,?,?)",
                [
                    ("a1b2c3", "Add login button on navbar", "rafa", "2025-09-26T10:20:00Z"),
                    ("d4e5f6", "hotfix 500 error on /signup controller", "rafa", "2025-09-26T11:00:00Z"),
                    ("0f1e2d", "Update README", "rafa", "2025-09-26T11:30:00Z"),
                    ("abc999", "refactor email sender to reduce retries", "rafa", "2025-09-26T12:00:00Z"),
                ],
            )
            con.commit()

        rows = con.execute("""
            SELECT sha, message, author, committed_at
            FROM commits
            ORDER BY committed_at DESC
            LIMIT ?
        """, (limit,)).fetchall()

        return {
            "commits": [
                {"sha": r[0], "msg": r[1], "author": r[2], "date": r[3]}
                for r in rows
            ]
        }
    finally:
        con.close()

# ---------------------------
# 3) (Optional) Local matcher you can unit test
# ---------------------------

def normalize(s: str) -> str:
    return " ".join(s.lower().strip().split())

def match_commit_to_tasks(commit_msg: str, tasks: List[Dict[str, Any]], ratio_threshold: float = 0.75):
    """
    Simple fuzzy match between commit message and task titles.
    Returns (was_task: bool, matched_task_id: Optional[str], reason: str)
    You can replace this with embeddings later.
    """
    c = normalize(commit_msg)
    best_id, best_ratio, best_title = None, 0.0, None

    for t in tasks:
        title = normalize(t.get("title", ""))
        ratio = difflib.SequenceMatcher(None, c, title).ratio()
        if ratio > best_ratio:
            best_ratio, best_id, best_title = ratio, t.get("id"), t.get("title")

        # Quick exact-ish triggers
        # Check if task ID shows up in commit message
        if t.get("id") and t["id"].lower() in c:
            return True, t["id"], f"commit references task id {t['id']}"

    if best_ratio >= ratio_threshold:
        return True, best_id, f"fuzzy match to '{best_title}' ({best_ratio:.2f})"

    return False, None, f"no sufficient match (best={best_ratio:.2f})"

# ---------------------------
# 4) Agent that calls both tools and returns strict JSON
# ---------------------------

task_classifier = Agent(
    name="task_classifier",
    model="gemini-2.5-flash",  # fast + cheap; upgrade to pro if needed
    description="Classifies whether each commit corresponds to a known task by combining static tasks + SQL commits.",
    instruction="""
You are a strict JSON generator. You MUST:
1) Call get_static_tasks to load tasks.
2) Call query_recent_commits to load recent commits.
3) Compare each commit message to the task list using exact match hints (IDs/keywords) and near-match heuristics.
4) Return ONLY JSON following this schema (no extra text):

{
  "results":[
    {
      "sha": "string",
      "was_task": true | false,
      "matched_task_id": "string or null",
      "reason": "short explanation"
    }
  ]
}

Rules:
- Prefer precision over recall.
- Do not invent task IDs.
- If unsure, set was_task=false and matched_task_id=null.
- Keep 'reason' short.
""",
    tools=[get_static_tasks, query_recent_commits]
)

# ---------------------------
# 5) Runner helpers
# ---------------------------

session_service = InMemorySessionService()

async def run_classification(user_message: str = "Classify the latest 20 commits against current tasks.") -> str:
    """
    Executes the agent once and returns the model's final JSON string.
    """
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
# 6) Optional: local (non-LLM) classification path for testing
# ---------------------------

def classify_locally_without_llm() -> dict:
    """
    Bypass the model and do local matching (useful for tests or offline).
    Returns the same schema as the agent should.
    """
    tasks = get_static_tasks().get("tasks", [])
    commits = query_recent_commits().get("commits", [])

    results = []
    for c in commits:
        was_task, matched_id, reason = match_commit_to_tasks(c["msg"], tasks)
        results.append({
            "sha": c["sha"],
            "was_task": was_task,
            "matched_task_id": matched_id,
            "reason": reason
        })
    return {"results": results}

# ---------------------------
# 7) Main
# ---------------------------

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Task/Commit classifier via ADK")
    parser.add_argument("--local", action="store_true",
                        help="Run local non-LLM matching (no API calls)")
    args = parser.parse_args()

    if args.local:
        out = classify_locally_without_llm()
        print(json.dumps(out, indent=2))
    else:
        if not os.getenv("GOOGLE_API_KEY"):
            print("Set GOOGLE_API_KEY env var to use the agent (or run with --local).")
        else:
            result = asyncio.run(run_classification())
            print(result)
