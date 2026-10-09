from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

import json

from extractor import extract_actions
from graph import build_action_graph

from database import engine, Base, get_db
from models import MeetingDB


# =========================================================
# CREATE DATABASE TABLES
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="ActionGraph API",
    description="Turn Meetings into Meaningful Action",
    version="1.0.0"
)


# =========================================================
# CORS CONFIGURATION
# =========================================================

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


# =========================================================
# MEETING REQUEST MODEL
# =========================================================

class Meeting(BaseModel):

    title: str = Field(
        ...,
        min_length=3,
        max_length=200
    )

    transcript: str = Field(
        ...,
        min_length=10
    )


# =========================================================
# MEETING RESPONSE MODELS
# =========================================================

class MeetingResponse(BaseModel):

    id: int
    title: str
    actions: list
    decisions: list
    risks: list
    graph: dict


class MeetingListItem(BaseModel):

    id: int
    title: str
    transcript: str
    actions: list
    decisions: list
    risks: list
    graph: dict


# =========================================================
# HOME API
# =========================================================

@app.get("/")
def home():

    return {
        "message": "Welcome to ActionGraph",
        "status": "running"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy"
    }


# =========================================================
# CREATE / ANALYZE MEETING
# =========================================================

@app.post(
    "/meetings",
    response_model=MeetingResponse
)
def create_meeting(
    meeting: Meeting,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # Extract information from transcript
    # -----------------------------------------------------

    result = extract_actions(
        meeting.transcript
    )


    # -----------------------------------------------------
    # Build action graph
    # -----------------------------------------------------

    graph = build_action_graph(
        result
    )


    # -----------------------------------------------------
    # Convert Python objects to JSON strings
    # -----------------------------------------------------

    actions_json = json.dumps(
        result["actions"]
    )

    decisions_json = json.dumps(
        result["decisions"]
    )

    risks_json = json.dumps(
        result["risks"]
    )

    graph_json = json.dumps(
        graph
    )


    # -----------------------------------------------------
    # Create database record
    # -----------------------------------------------------

    new_meeting = MeetingDB(

        title=meeting.title,

        transcript=meeting.transcript,

        actions=actions_json,

        decisions=decisions_json,

        risks=risks_json,

        graph=graph_json

    )


    # -----------------------------------------------------
    # Save meeting
    # -----------------------------------------------------

    db.add(
        new_meeting
    )

    db.commit()

    db.refresh(
        new_meeting
    )


    # -----------------------------------------------------
    # Return response
    # -----------------------------------------------------

    return {

        "id":
            new_meeting.id,

        "title":
            meeting.title,

        "actions":
            result["actions"],

        "decisions":
            result["decisions"],

        "risks":
            result["risks"],

        "graph":
            graph

    }


# =========================================================
# GET ALL SAVED MEETINGS
# =========================================================

@app.get(
    "/meetings",
    response_model=list[MeetingListItem]
)
def get_meetings(
    db: Session = Depends(get_db)
):

    meetings = (
        db.query(MeetingDB)
        .order_by(MeetingDB.id.desc())
        .all()
    )


    result = []


    for meeting in meetings:

        result.append({

            "id":
                meeting.id,

            "title":
                meeting.title,

            "transcript":
                meeting.transcript,

            "actions":
                json.loads(
                    meeting.actions
                ),

            "decisions":
                json.loads(
                    meeting.decisions
                ),

            "risks":
                json.loads(
                    meeting.risks
                ),

            "graph":
                json.loads(
                    meeting.graph
                )

        })


    return result


# =========================================================
# GET ONE MEETING
# =========================================================

@app.get(
    "/meetings/{meeting_id}",
    response_model=MeetingListItem
)
def get_meeting(
    meeting_id: int,
    db: Session = Depends(get_db)
):

    meeting = (
        db.query(MeetingDB)
        .filter(
            MeetingDB.id == meeting_id
        )
        .first()
    )


    # -----------------------------------------------------
    # Meeting not found
    # -----------------------------------------------------

    if meeting is None:

        raise HTTPException(
            status_code=404,
            detail="Meeting not found"
        )


    # -----------------------------------------------------
    # Return meeting
    # -----------------------------------------------------

    return {

        "id":
            meeting.id,

        "title":
            meeting.title,

        "transcript":
            meeting.transcript,

        "actions":
            json.loads(
                meeting.actions
            ),

        "decisions":
            json.loads(
                meeting.decisions
            ),

        "risks":
            json.loads(
                meeting.risks
            ),

        "graph":
            json.loads(
                meeting.graph
            )

    }


# =========================================================
# DELETE ONE MEETING
# =========================================================

@app.delete("/meetings/{meeting_id}")
def delete_meeting(
    meeting_id: int,
    db: Session = Depends(get_db)
):

    meeting = (
        db.query(MeetingDB)
        .filter(
            MeetingDB.id == meeting_id
        )
        .first()
    )


    # -----------------------------------------------------
    # Meeting not found
    # -----------------------------------------------------

    if meeting is None:

        raise HTTPException(
            status_code=404,
            detail="Meeting not found"
        )


    # -----------------------------------------------------
    # Delete meeting
    # -----------------------------------------------------

    db.delete(
        meeting
    )

    db.commit()


    return {

        "message":
            "Meeting deleted successfully",

        "id":
            meeting_id

    }


# =========================================================
# DELETE ALL MEETINGS
# =========================================================

@app.delete("/meetings")
def delete_all_meetings(
    db: Session = Depends(get_db)
):

    db.query(
        MeetingDB
    ).delete()

    db.commit()


    return {

        "message":
            "All meetings deleted successfully"

    }