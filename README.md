# ActionGraph — Turn Meetings into Meaningful Action

## Overview

ActionGraph is a meeting intelligence system that converts
meeting transcripts into meaningful and actionable information.

It extracts:

- Tasks
- Responsible people
- Deadlines
- Decisions
- Risks
- Dependencies

The extracted information is represented as an interactive
action graph for easier understanding and follow-up.

## Technologies

- React
- Vite
- FastAPI
- Python
- Axios
- React Flow

## System Architecture

Meeting Transcript
↓
React Frontend
↓
FastAPI Backend
↓
Rule-Based Extraction
↓
Tasks + Decisions + Risks + Dependencies
↓
Action Graph
↓
React Flow Visualization

## Features

- Meeting transcript analysis
- Task extraction
- Person identification
- Deadline extraction
- Decision detection
- Risk detection
- Dependency detection
- Interactive graph visualization
- Summary dashboard

## Project Structure

ActionGraph/

├── backend/

│   ├── main.py

│   ├── extractor.py

│   └── graph.py

│

├── frontend/

│   ├── src/

│   ├── package.json

│   └── vite.config.js

│

└── README.md

## Project Status

Currently under active development.
