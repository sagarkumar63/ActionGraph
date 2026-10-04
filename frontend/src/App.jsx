import { useState } from "react";
import axios from "axios";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import "./App.css";


function App() {

  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");

  const [result, setResult] = useState(null);
  const [graphData, setGraphData] = useState(null);

  const [loading, setLoading] = useState(false);


  // ==========================================
  // Analyze Meeting
  // ==========================================

  const analyzeMeeting = async () => {

    if (!title || !transcript) {
      alert("Please enter meeting title and transcript.");
      return;
    }

    setLoading(true);

    try {

      const response = await axios.post(
        "http://127.0.0.1:8000/meetings",
        {
          title: title,
          transcript: transcript
        }
      );

      console.log("Backend Response:", response.data);

      setResult(response.data);

      setGraphData(response.data.graph);

    } catch (error) {

      console.error("Backend Error:", error);

      alert(
        "Could not connect to the ActionGraph backend."
      );

    }

    setLoading(false);
  };


  // ==========================================
  // Load Sample Meeting
  // ==========================================

  const loadSampleMeeting = () => {

    setTitle("Product Development Meeting");

    setTranscript(
      "Rahul will complete the backend API by Friday. " +
      "Priya will test the API after Rahul finishes the backend. " +
      "Amit will prepare the database schema by Wednesday. " +
      "The team decided to use PostgreSQL. " +
      "There is a risk that testing may be delayed."
    );

  };


  // ==========================================
  // Create React Flow Nodes
  // ==========================================

  const flowNodes = graphData
    ? graphData.nodes.map((node, index) => {

        let backgroundColor = "#ffffff";
        let borderColor = "#2563eb";

        if (node.type === "person") {
          backgroundColor = "#e0f2fe";
          borderColor = "#0284c7";
        }

        if (node.type === "task") {
          backgroundColor = "#dcfce7";
          borderColor = "#16a34a";
        }

        if (node.type === "deadline") {
          backgroundColor = "#fef3c7";
          borderColor = "#d97706";
        }

        if (node.type === "risk") {
          backgroundColor = "#fee2e2";
          borderColor = "#dc2626";
        }

        if (node.type === "decision") {
          backgroundColor = "#ede9fe";
          borderColor = "#7c3aed";
        }

        return {

          id: node.id,

          position: {
            x: node.type === "person"
              ? 50
              : node.type === "task"
              ? 350
              : 700,

            y: index * 150
          },

          data: {
            label: (
              <div
                style={{
                  padding: "10px",
                  minWidth: "160px",
                  textAlign: "center"
                }}
              >

                <strong>
                  {node.type.toUpperCase()}
                </strong>

                <br />

                <span>
                  {node.label}
                </span>

              </div>
            )
          },

          style: {
            background: backgroundColor,
            border: `2px solid ${borderColor}`,
            borderRadius: "10px",
            padding: "5px",
            fontSize: "14px"
          }

        };

      })
    : [];


  // ==========================================
  // Create React Flow Edges
  // ==========================================

  const flowEdges = graphData
    ? graphData.edges.map((edge, index) => {

        let edgeColor = "#64748b";

        if (edge.relationship === "ASSIGNED_TO") {
          edgeColor = "#0284c7";
        }

        if (edge.relationship === "DUE_BY") {
          edgeColor = "#d97706";
        }

        if (edge.relationship === "BLOCKS") {
          edgeColor = "#dc2626";
        }

        return {

          id: `edge-${index}`,

          source: edge.source,

          target: edge.target,

          label: edge.relationship,

          animated:
            edge.relationship === "BLOCKS",

          style: {
            stroke: edgeColor,
            strokeWidth: 2
          },

          labelStyle: {
            fill: edgeColor,
            fontWeight: 600
          }

        };

      })
    : [];


  // ==========================================
  // Count People
  // ==========================================

  const peopleCount = result
    ? new Set(
        result.actions.map(
          (action) => action.person
        )
      ).size
    : 0;


  // ==========================================
  // Count Dependencies
  // ==========================================

  const dependencyCount = result
    ? result.actions.filter(
        (action) => action.dependency
      ).length
    : 0;


  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="app">


      {/* ======================================
          HEADER
      ====================================== */}

      <header className="header">

        <h1>
          ActionGraph
        </h1>

        <p>
          Turn Meetings into Meaningful Action
        </p>

        <span className="header-description">
          Extract tasks, decisions, deadlines, risks, and dependencies
          from meeting discussions and visualize them as an action graph.
        </span>

      </header>


      <main className="container">


        {/* ======================================
            MEETING INPUT
        ====================================== */}

        <section className="input-section">

          <h2>
            Meeting Analysis
          </h2>


          <label>
            Meeting Title
          </label>

          <input
            type="text"
            placeholder="Enter meeting title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />


          <label>
            Meeting Transcript
          </label>

          <textarea
            placeholder="Paste your meeting transcript here..."
            value={transcript}
            onChange={(e) =>
              setTranscript(e.target.value)
            }
            rows="10"
          />


          <button
            onClick={analyzeMeeting}
            disabled={loading}
          >

            {loading
              ? "Analyzing..."
              : "Analyze Meeting"
            }

          </button>


          <button
            className="sample-button"
            onClick={loadSampleMeeting}
          >

            Load Sample Meeting

          </button>


          <button
            className="clear-button"
            onClick={() => {
              setTitle("");
              setTranscript("");
              setResult(null);
              setGraphData(null);
            }}
          >

            Clear

          </button>


        </section>


        {/* ======================================
            RESULTS
        ====================================== */}

        {result && (

          <section className="results">


            {/* SUCCESS MESSAGE */}

            <div className="success-message">
              ✅ Meeting analyzed successfully
            </div>


            <h2>
              Meeting Results
            </h2>


            {/* ==================================
                SUMMARY CARDS
            ================================== */}

            <div className="cards">


              {/* TASKS */}

              <div className="card">

                <h3>
                  Tasks
                </h3>

                <p>
                  {result.actions.length}
                </p>

              </div>


              {/* PEOPLE */}

              <div className="card">

                <h3>
                  People
                </h3>

                <p>
                  {peopleCount}
                </p>

              </div>


              {/* DECISIONS */}

              <div className="card">

                <h3>
                  Decisions
                </h3>

                <p>
                  {result.decisions.length}
                </p>

              </div>


              {/* RISKS */}

              <div className="card">

                <h3>
                  Risks
                </h3>

                <p>
                  {result.risks.length}
                </p>

              </div>


              {/* DEPENDENCIES */}

              <div className="card">

                <h3>
                  Dependencies
                </h3>

                <p>
                  {dependencyCount}
                </p>

              </div>


            </div>


            {/* ==================================
                ACTION ITEMS
            ================================== */}

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
                    👤 {action.person}
                  </h3>


                  <p>

                    <strong>
                      📋 Task:
                    </strong>{" "}

                    {action.task}

                  </p>


                  <p>

                    <strong>
                      📅 Deadline:
                    </strong>{" "}

                    {action.deadline ||
                      "Not specified"
                    }

                  </p>


                  <p>

                    <strong>
                      🔗 Dependency:
                    </strong>{" "}

                    {action.dependency ||
                      "None"
                    }

                  </p>

                </div>

              )
            )}


            {/* ==================================
                DECISIONS
            ================================== */}

            {result.decisions.length > 0 && (

              <>

                <h2>
                  Decisions
                </h2>


                {result.decisions.map(
                  (decision, index) => (

                    <div
                      className="action-card"
                      key={index}
                    >

                      <p>
                        {decision.decision}
                      </p>

                    </div>

                  )
                )}

              </>

            )}


            {/* ==================================
                RISKS
            ================================== */}

            {result.risks.length > 0 && (

              <>

                <h2>
                  Risks
                </h2>


                {result.risks.map(
                  (risk, index) => (

                    <div
                      className="action-card"
                      key={index}
                    >

                      <p>
                        {risk.risk}
                      </p>

                    </div>

                  )
                )}

              </>

            )}


            {/* ==================================
                ACTION GRAPH
            ================================== */}

            <h2>
              Action Graph
            </h2>


            {/* GRAPH LEGEND */}

            <div className="graph-legend">

              <div>
                <span className="legend-color person-color"></span>
                Person
              </div>

              <div>
                <span className="legend-color task-color"></span>
                Task
              </div>

              <div>
                <span className="legend-color deadline-color"></span>
                Deadline
              </div>

              <div>
                <span className="legend-color risk-color"></span>
                Risk
              </div>

              <div>
                <span className="legend-color decision-color"></span>
                Decision
              </div>

            </div>


            {graphData && (

              <div className="graph-container">

                <ReactFlow
                  nodes={flowNodes}
                  edges={flowEdges}
                  fitView
                  fitViewOptions={{
                    padding: 0.2
                  }}
                >

                  <Background />

                  <Controls />

                  <MiniMap />

                </ReactFlow>

              </div>

            )}


          </section>

        )}

      </main>

    </div>

  );

}


export default App;