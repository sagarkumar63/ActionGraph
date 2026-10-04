import re


def extract_actions(transcript: str):

    actions = []
    decisions = []
    risks = []

    sentences = re.split(r"[.!?]", transcript)

    for sentence in sentences:

        sentence = sentence.strip()

        if not sentence:
            continue

        lower_sentence = sentence.lower()

        # ==========================================
        # TASK EXTRACTION
        # ==========================================

        task_patterns = [
            r"([A-Z][a-z]+)\s+will\s+(.+)",
            r"([A-Z][a-z]+)\s+needs\s+to\s+(.+)",
            r"([A-Z][a-z]+)\s+should\s+(.+)",
            r"([A-Z][a-z]+)\s+is\s+responsible\s+for\s+(.+)"
        ]

        matched_task = False

        for pattern in task_patterns:

            match = re.search(pattern, sentence)

            if match:

                person = match.group(1)

                task = sentence

                # ----------------------------------
                # Deadline
                # ----------------------------------

                deadline_match = re.search(
                    r"\b(by|before|until)\s+([A-Za-z0-9]+)",
                    sentence,
                    re.IGNORECASE
                )

                deadline = (
                    deadline_match.group(2)
                    if deadline_match
                    else None
                )

                # ----------------------------------
                # Dependency
                # ----------------------------------

                dependency = None

                dependency_match = re.search(
                    r"\bafter\s+(.+)",
                    sentence,
                    re.IGNORECASE
                )

                if dependency_match:

                    dependency = dependency_match.group(1).strip()

                actions.append({
                    "person": person,
                    "task": task,
                    "deadline": deadline,
                    "dependency": dependency
                })

                matched_task = True

                break

        # ==========================================
        # DECISION EXTRACTION
        # ==========================================

        if (
            "decided to" in lower_sentence
            or "decided" in lower_sentence
            or "agreed to" in lower_sentence
            or "agreed on" in lower_sentence
        ):

            decisions.append({
                "decision": sentence
            })

        # ==========================================
        # RISK EXTRACTION
        # ==========================================

        if (
            "risk" in lower_sentence
            or "might be" in lower_sentence
            or "may be" in lower_sentence
            or "could be" in lower_sentence
            or "possible delay" in lower_sentence
        ):

            risks.append({
                "risk": sentence
            })

    return {
        "actions": actions,
        "decisions": decisions,
        "risks": risks
    }