def build_action_graph(result):

    nodes = []
    edges = []

    # Store task IDs for each person
    task_nodes = {}

    # =========================================================
    # 1. CREATE PERSON, TASK AND DEADLINE NODES
    # =========================================================

    for index, action in enumerate(result["actions"], start=1):

        person_id = f"person_{index}"
        task_id = f"task_{index}"

        # -----------------------------------------------------
        # PERSON NODE
        # -----------------------------------------------------

        nodes.append({
            "id": person_id,
            "type": "person",
            "label": action["person"]
        })

        # -----------------------------------------------------
        # TASK NODE
        # -----------------------------------------------------

        nodes.append({
            "id": task_id,
            "type": "task",
            "label": action["task"]
        })

        # -----------------------------------------------------
        # PERSON -> TASK
        # -----------------------------------------------------

        edges.append({
            "source": person_id,
            "target": task_id,
            "relationship": "ASSIGNED_TO"
        })

        # Save task ID using person's name
        task_nodes[action["person"].lower()] = task_id

        # -----------------------------------------------------
        # DEADLINE NODE
        # -----------------------------------------------------

        if action["deadline"]:

            deadline_id = f"deadline_{index}"

            nodes.append({
                "id": deadline_id,
                "type": "deadline",
                "label": action["deadline"]
            })

            edges.append({
                "source": task_id,
                "target": deadline_id,
                "relationship": "DUE_BY"
            })

    # =========================================================
    # 2. CREATE DEPENDENCY RELATIONSHIPS
    # =========================================================

    for index, action in enumerate(result["actions"], start=1):

        dependency = action["dependency"]

        if not dependency:
            continue

        current_task_id = f"task_{index}"

        dependency_lower = dependency.lower()

        # Find the person mentioned in the dependency
        for person, task_id in task_nodes.items():

            if person in dependency_lower:

                # Don't create a task pointing to itself
                if task_id != current_task_id:

                    edges.append({
                        "source": task_id,
                        "target": current_task_id,
                        "relationship": "BLOCKS"
                    })

                break

    # =========================================================
    # 3. CREATE DECISION NODES
    # =========================================================

    for index, decision in enumerate(result["decisions"], start=1):

        decision_id = f"decision_{index}"

        nodes.append({
            "id": decision_id,
            "type": "decision",
            "label": decision["decision"]
        })

    # =========================================================
    # 4. CREATE RISK NODES
    # =========================================================

    for index, risk in enumerate(result["risks"], start=1):

        risk_id = f"risk_{index}"

        nodes.append({
            "id": risk_id,
            "type": "risk",
            "label": risk["risk"]
        })

    # =========================================================
    # 5. RETURN COMPLETE GRAPH
    # =========================================================

    return {
        "nodes": nodes,
        "edges": edges
    }