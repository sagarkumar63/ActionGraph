from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from extractor import extract_actions
from graph import build_action_graph


app = FastAPI(
    title="ActionGraph API",
    description="Turn Meetings into Meaningful Action",
    version="1.0.0"
)


# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------
# Meeting Request Model
# --------------------------------

class Meeting(BaseModel):
    title: str
    transcript: str


# --------------------------------
# Home
# --------------------------------

@app.get("/")
def home():

    return {
        "message": "Welcome to ActionGraph",
        "status": "running"
    }


# --------------------------------
# Health Check
# --------------------------------

@app.get("/health")
def health_check():

    return {
        "status": "healthy"
    }


# --------------------------------
# Create Meeting
# --------------------------------

@app.post("/meetings")
def create_meeting(meeting: Meeting):

    result = extract_actions(
        meeting.transcript
    )

    graph = build_action_graph(
        result
    )

    return {
        "message": "Meeting processed successfully",

        "title": meeting.title,

        "actions": result["actions"],

        "decisions": result["decisions"],

        "risks": result["risks"],

        "graph": graph
    }