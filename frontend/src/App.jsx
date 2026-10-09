import { useEffect, useState } from "react";
import axios from "axios";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import "./App.css";


function App() {

  // =========================================================
  // STATE
  // =========================================================

  const [title, setTitle] = useState("");

  const [transcript, setTranscript] = useState("");

  const [result, setResult] = useState({
    actions: [],
    decisions: [],
    risks: [],
  });

  const [graphData, setGraphData] = useState({
    nodes: [],
    edges: [],
  });

  const [meetingHistory, setMeetingHistory] = useState([]);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");


  // =========================================================
  // LOAD MEETING HISTORY FROM BACKEND
  // =========================================================

  useEffect(() => {

    const loadMeetingHistory = async () => {

      try {

        const response = await axios.get(
          "http://127.0.0.1:8000/meetings"
        );

        setMeetingHistory(response.data);

      } catch (error) {

        console.error(
          "Failed to load meeting history:",
          error
        );

        if (error.response) {

          setError(
            "Unable to load meeting history from the server."
          );

        } else if (error.request) {

          setError(
            "Cannot connect to the backend. Make sure FastAPI is running."
          );

        } else {

          setError(
            "Something went wrong while loading meeting history."
          );

        }

      }

    };

    loadMeetingHistory();

  }, []);


  // =========================================================
  // LOAD SAMPLE MEETING
  // =========================================================

  const loadSampleMeeting = () => {

    setTitle(
      "Project Planning Meeting"
    );

    setTranscript(
      "Rahul will complete the backend API by Friday. " +
      "Priya will test the API after Rahul finishes the backend. " +
      "Amit will prepare the database schema by Wednesday. " +
      "The team decided to use PostgreSQL. " +
      "There is a risk that testing may be delayed."
    );

    setMessage("");

    setError("");

  };


  // =========================================================
  // CLEAR CURRENT MEETING
  // =========================================================

  const clearMeeting = () => {

    setTitle("");

    setTranscript("");

    setResult({
      actions: [],
      decisions: [],
      risks: [],
    });

    setGraphData({
      nodes: [],
      edges: [],
    });

    setMessage("");

    setError("");

  };


  // =========================================================
  // ANALYZE MEETING
  // =========================================================

  const analyzeMeeting = async () => {

    // -------------------------------------------------------
    // Frontend validation
    // -------------------------------------------------------

    if (!title.trim()) {

      setError(
        "Please enter a meeting title."
      );

      return;

    }


    if (!transcript.trim()) {

      setError(
        "Please enter a meeting transcript."
      );

      return;

    }


    setLoading(true);

    setMessage("");

    setError("");


    try {

      // -----------------------------------------------------
      // Send meeting to FastAPI
      // -----------------------------------------------------

      const response = await axios.post(
        "http://127.0.0.1:8000/meetings",
        {
          title: title,
          transcript: transcript,
        }
      );


      // -----------------------------------------------------
      // Store analysis result
      // -----------------------------------------------------

      setResult({

        actions:
          response.data.actions,

        decisions:
          response.data.decisions,

        risks:
          response.data.risks,

      });


      // -----------------------------------------------------
      // Store graph
      // -----------------------------------------------------

      setGraphData(
        response.data.graph
      );


      // -----------------------------------------------------
      // Create history item
      // -----------------------------------------------------

      const historyItem = {

        id:
          response.data.id,

        title:
          response.data.title,

        transcript:
          transcript,

        actions:
          response.data.actions,

        decisions:
          response.data.decisions,

        risks:
          response.data.risks,

        graph:
          response.data.graph,

      };


      // -----------------------------------------------------
      // Add meeting to history
      // -----------------------------------------------------

      setMeetingHistory(
        (previousHistory) => {

          return [
            historyItem,
            ...previousHistory,
          ];

        }
      );


      // -----------------------------------------------------
      // Success message
      // -----------------------------------------------------

      setMessage(
        "Meeting processed and saved successfully."
      );


    } catch (error) {

      console.error(
        "Meeting analysis error:",
        error
      );


      // -----------------------------------------------------
      // SERVER RESPONSE ERROR
      // -----------------------------------------------------

      if (error.response) {

        if (
          error.response.status === 422
        ) {

          setError(
            "Invalid meeting data. Please check the title and transcript."
          );

        }

        else if (
          error.response.status === 404
        ) {

          setError(
            "The requested API endpoint was not found."
          );

        }

        else if (
          error.response.status === 500
        ) {

          setError(
            "Server error. Please check the FastAPI backend."
          );

        }

        else {

          setError(
            error.response.data?.detail ||
            "The server returned an error."
          );

        }

      }

      // -----------------------------------------------------
      // REQUEST SENT BUT NO RESPONSE
      // -----------------------------------------------------

      else if (error.request) {

        setError(
          "Cannot connect to the backend. Make sure FastAPI is running."
        );

      }

      // -----------------------------------------------------
      // OTHER ERROR
      // -----------------------------------------------------

      else {

        setError(
          "Something went wrong. Please try again."
        );

      }

    }

    finally {

      setLoading(false);

    }

  };


  // =========================================================
  // LOAD MEETING FROM HISTORY
  // =========================================================

  const loadMeetingFromHistory = (
    meeting
  ) => {

    setTitle(
      meeting.title
    );

    setTranscript(
      meeting.transcript || ""
    );

    setResult({

      actions:
        meeting.actions || [],

      decisions:
        meeting.decisions || [],

      risks:
        meeting.risks || [],

    });

    setGraphData(
      meeting.graph || {
        nodes: [],
        edges: [],
      }
    );

    setMessage("");

    setError("");


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  // =========================================================
  // DELETE ONE MEETING
  // =========================================================

  const deleteMeeting = async (
    meetingId
  ) => {

    try {

      await axios.delete(
        `http://127.0.0.1:8000/meetings/${meetingId}`
      );


      setMeetingHistory(
        (previousHistory) =>
          previousHistory.filter(
            (meeting) =>
              meeting.id !== meetingId
          )
      );


      setMessage(
        "Meeting deleted successfully."
      );

      setError("");


    } catch (error) {

      console.error(
        "Delete meeting error:",
        error
      );


      if (error.response) {

        if (
          error.response.status === 404
        ) {

          setError(
            "Meeting was not found in the database."
          );

        }

        else {

          setError(
            error.response.data?.detail ||
            "Failed to delete meeting."
          );

        }

      }

      else if (error.request) {

        setError(
          "Cannot connect to the backend. Make sure FastAPI is running."
        );

      }

      else {

        setError(
          "Something went wrong while deleting the meeting."
        );

      }

    }

  };


  // =========================================================
  // CLEAR ALL MEETINGS
  // =========================================================

  const clearAllHistory = async () => {

    try {

      await axios.delete(
        "http://127.0.0.1:8000/meetings"
      );


      setMeetingHistory([]);

      setMessage(
        "Meeting history cleared successfully."
      );

      setError("");


    } catch (error) {

      console.error(
        "Clear history error:",
        error
      );


      if (error.response) {

        setError(
          error.response.data?.detail ||
          "Failed to clear meeting history."
        );

      }

      else if (error.request) {

        setError(
          "Cannot connect to the backend. Make sure FastAPI is running."
        );

      }

      else {

        setError(
          "Something went wrong while clearing history."
        );

      }

    }

  };


  // =========================================================
  // CONVERT BACKEND NODES TO REACT FLOW NODES
  // =========================================================

  const flowNodes =
    graphData.nodes.map(
      (node, index) => {

        let backgroundColor =
          "#ffffff";

        let borderColor =
          "#374151";


        // ---------------------------------------------------
        // PERSON
        // ---------------------------------------------------

        if (
          node.type === "person"
        ) {

          backgroundColor =
            "#dbeafe";

          borderColor =
            "#2563eb";

        }


        // ---------------------------------------------------
        // TASK
        // ---------------------------------------------------

        else if (
          node.type === "task"
        ) {

          backgroundColor =
            "#dcfce7";

          borderColor =
            "#16a34a";

        }


        // ---------------------------------------------------
        // DEADLINE
        // ---------------------------------------------------

        else if (
          node.type === "deadline"
        ) {

          backgroundColor =
            "#ffedd5";

          borderColor =
            "#ea580c";

        }


        // ---------------------------------------------------
        // DECISION
        // ---------------------------------------------------

        else if (
          node.type === "decision"
        ) {

          backgroundColor =
            "#f3e8ff";

          borderColor =
            "#9333ea";

        }


        // ---------------------------------------------------
        // RISK
        // ---------------------------------------------------

        else if (
          node.type === "risk"
        ) {

          backgroundColor =
            "#fee2e2";

          borderColor =
            "#dc2626";

        }


        // ---------------------------------------------------
        // GRAPH COLUMN POSITION
        // ---------------------------------------------------

        let x = 50;


        if (
          node.type === "task"
        ) {

          x = 350;

        }

        else if (
          node.type === "deadline"
        ) {

          x = 700;

        }

        else if (
          node.type === "decision" ||
          node.type === "risk"
        ) {

          x = 1000;

        }


        // ---------------------------------------------------
        // RETURN REACT FLOW NODE
        // ---------------------------------------------------

        return {

          id:
            node.id,

          position: {

            x: x,

            y:
              index * 150,

          },

          data: {

            label:
              node.label,

          },

          style: {

            background:
              backgroundColor,

            border:
              `2px solid ${borderColor}`,

            borderRadius:
              "10px",

            padding:
              "10px",

            width:
              230,

            fontSize:
              "13px",

          },

        };

      }
    );


  // =========================================================
  // CONVERT BACKEND EDGES TO REACT FLOW EDGES
  // =========================================================

  const flowEdges =
    graphData.edges.map(
      (edge, index) => {

        let strokeColor =
          "#2563eb";


        if (
          edge.relationship ===
          "DUE_BY"
        ) {

          strokeColor =
            "#ea580c";

        }

        else if (
          edge.relationship ===
          "BLOCKS"
        ) {

          strokeColor =
            "#dc2626";

        }


        return {

          id:
            `edge-${index}`,

          source:
            edge.source,

          target:
            edge.target,

          label:
            edge.relationship,

          animated:
            edge.relationship ===
            "BLOCKS",

          style: {

            stroke:
              strokeColor,

          },

          labelStyle: {

            fontSize:
              11,

          },

        };

      }
    );


  // =========================================================
  // SUMMARY INFORMATION
  // =========================================================

  const people = [
    ...new Set(
      result.actions.map(
        (action) =>
          action.person
      )
    ),
  ];


  const dependencies =
    result.actions.filter(
      (action) =>
        action.dependency
    );


  // =========================================================
  // USER INTERFACE
  // =========================================================

  return (

    <div className="app">


      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="header">

        <h1>
          ActionGraph
        </h1>

        <p>
          Turn Meetings into Meaningful Action
        </p>

      </header>


      <main className="container">


        {/* =================================================
            MEETING INPUT
        ================================================= */}

        <section className="card">

          <h2>
            Meeting Analysis
          </h2>


          <label>
            Meeting Title
          </label>


          <input

            type="text"

            value={title}

            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }

            placeholder="Enter meeting title"

          />


          <label>
            Meeting Transcript
          </label>


          <textarea

            value={transcript}

            onChange={(event) =>
              setTranscript(
                event.target.value
              )
            }

            placeholder="Enter meeting transcript..."

            rows="10"

          />


          <div className="button-group">


            <button

              onClick={
                analyzeMeeting
              }

              disabled={
                loading
              }

            >

              {loading
                ? "Analyzing..."
                : "Analyze Meeting"}

            </button>


            <button

              className="secondary-button"

              onClick={
                loadSampleMeeting
              }

            >

              Load Sample Meeting

            </button>


            <button

              className="clear-button"

              onClick={
                clearMeeting
              }

            >

              Clear

            </button>


          </div>


          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {message && (

            <div className="success-message">

              {message}

            </div>

          )}


          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (

            <div className="error-message">

              {error}

            </div>

          )}

        </section>


        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="summary-grid">


          <div className="summary-card">

            <h3>
              Tasks
            </h3>

            <strong>
              {result.actions.length}
            </strong>

          </div>


          <div className="summary-card">

            <h3>
              People
            </h3>

            <strong>
              {people.length}
            </strong>

          </div>


          <div className="summary-card">

            <h3>
              Decisions
            </h3>

            <strong>
              {result.decisions.length}
            </strong>

          </div>


          <div className="summary-card">

            <h3>
              Risks
            </h3>

            <strong>
              {result.risks.length}
            </strong>

          </div>


          <div className="summary-card">

            <h3>
              Dependencies
            </h3>

            <strong>
              {dependencies.length}
            </strong>

          </div>


        </section>


        {/* =================================================
            ACTION ITEMS
        ================================================= */}

        {result.actions.length > 0 && (

          <section className="card">

            <h2>
              Action Items
            </h2>


            {result.actions.map(
              (action, index) => (

                <div

                  className="action-card"

                  key={index}

                >

                  <h3>
                    {action.person}
                  </h3>


                  <p>
                    {action.task}
                  </p>


                  {action.deadline && (

                    <p>

                      <strong>
                        Deadline:
                      </strong>{" "}

                      {action.deadline}

                    </p>

                  )}


                  {action.dependency && (

                    <p>

                      <strong>
                        Depends on:
                      </strong>{" "}

                      {action.dependency}

                    </p>

                  )}

                </div>

              )
            )}

          </section>

        )}


        {/* =================================================
            DECISIONS
        ================================================= */}

        {result.decisions.length > 0 && (

          <section className="card">

            <h2>
              Decisions
            </h2>


            {result.decisions.map(
              (decision, index) => (

                <div

                  className="decision-card"

                  key={index}

                >

                  {decision.decision}

                </div>

              )
            )}

          </section>

        )}


        {/* =================================================
            RISKS
        ================================================= */}

        {result.risks.length > 0 && (

          <section className="card">

            <h2>
              Risks
            </h2>


            {result.risks.map(
              (risk, index) => (

                <div

                  className="risk-card"

                  key={index}

                >

                  {risk.risk}

                </div>

              )
            )}

          </section>

        )}


        {/* =================================================
            ACTION GRAPH
        ================================================= */}

        {flowNodes.length > 0 && (

          <section className="card">

            <h2>
              Action Graph
            </h2>


            <div className="graph-container">

              <ReactFlow

                nodes={flowNodes}

                edges={flowEdges}

                fitView

              >

                <Background />

                <Controls />

                <MiniMap />

              </ReactFlow>

            </div>


            {/* =================================================
                GRAPH LEGEND
            ================================================= */}

            <div className="graph-legend">


              <div>

                <span
                  className="legend-person"
                ></span>

                Person

              </div>


              <div>

                <span
                  className="legend-task"
                ></span>

                Task

              </div>


              <div>

                <span
                  className="legend-deadline"
                ></span>

                Deadline

              </div>


              <div>

                <span
                  className="legend-decision"
                ></span>

                Decision

              </div>


              <div>

                <span
                  className="legend-risk"
                ></span>

                Risk

              </div>


            </div>


          </section>

        )}


        {/* =================================================
            MEETING HISTORY
        ================================================= */}

        <section className="card">


          <div className="history-header">

            <h2>
              Meeting History
            </h2>


            {meetingHistory.length > 0 && (

              <button

                className="clear-history-button"

                onClick={
                  clearAllHistory
                }

              >

                Clear All History

              </button>

            )}

          </div>


          {meetingHistory.length === 0 ? (

            <p>
              No meetings saved yet.
            </p>

          ) : (

            <div>


              {meetingHistory.map(
                (meeting) => (

                  <div

                    className="history-card"

                    key={meeting.id}

                  >


                    <div

                      className="history-content"

                      onClick={() =>
                        loadMeetingFromHistory(
                          meeting
                        )
                      }

                    >

                      <h3>
                        {meeting.title}
                      </h3>


                      <div
                        className="history-details"
                      >

                        <span>

                          Tasks:{" "}

                          {
                            meeting.actions?.length ||
                            0
                          }

                        </span>


                        <span>

                          Decisions:{" "}

                          {
                            meeting.decisions?.length ||
                            0
                          }

                        </span>


                        <span>

                          Risks:{" "}

                          {
                            meeting.risks?.length ||
                            0
                          }

                        </span>

                      </div>

                    </div>


                    <button

                      className="delete-history-button"

                      onClick={() =>
                        deleteMeeting(
                          meeting.id
                        )
                      }

                    >

                      Delete

                    </button>


                  </div>

                )
              )}

            </div>

          )}

        </section>


      </main>

    </div>

  );

}


export default App;