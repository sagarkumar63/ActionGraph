def build_action_graph(result):

    nodes = []
    edges = []

    task_nodes = {}

    # -------------------------
    # Create task and person nodes
    # -------------------------

    for index, action in enumerate(result["actions"], start=1):

        person_id = f"person_{index}"
        task_id = f"task_{index}"

        nodes.append({
            "id": person_id,
            "type": "person",
            "label": action["person"]
        })

        nodes.append({
            "id": task_id,
            "type": "task",
            "label": action["task"]
        })

        edges.append({
            "source": person_id,
            "target": task_id,
            "relationship": "ASSIGNED_TO"
        })

        task_nodes[action["person"]] = task_id

        # -------------------------
        # Deadline node
        # -------------------------

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

    # -------------------------
    # Dependency relationships
    # -------------------------

    for index, action in enumerate(result["actions"], start=1):

        dependency = action["dependency"]

        if dependency:

            current_task_id = f"task_{index}"

            for person, task_id in task_nodes.items():

                if person.lower() in dependency.lower():

                    edges.append({
                        "source": task_id,
                        "target": current_task_id,
                        "relationship": "BLOCKS"
                    })

    return {
        "nodes": nodes,
        "edges": edges
    }