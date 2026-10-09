import re


def extract_actions(transcript: str):

    actions = []
    decisions = []
    risks = []

    # Split transcript into individual sentences
    sentences = re.split(r"[.!?]", transcript)

    for sentence in sentences:

        sentence = sentence.strip()

        if not sentence:
            continue

        lower_sentence = sentence.lower()

        # =====================================================
        # TASK EXTRACTION
        # =====================================================

        task_patterns = [

            # Rahul will complete the API
            r"([A-Z][a-z]+)\s+will\s+(.+)",

            # Rahul needs to complete the API
            r"([A-Z][a-z]+)\s+needs\s+to\s+(.+)",

            # Rahul should complete the API
            r"([A-Z][a-z]+)\s+should\s+(.+)",

            # Rahul is responsible for testing
            r"([A-Z][a-z]+)\s+is\s+responsible\s+for\s+(.+)",

            # Rahul has to complete the API
            r"([A-Z][a-z]+)\s+has\s+to\s+(.+)",

            # Rahul must complete the API
            r"([A-Z][a-z]+)\s+must\s+(.+)"
        ]

        for pattern in task_patterns:

            match = re.search(pattern, sentence)

            if match:

                person = match.group(1)

                # Keep the complete sentence as the task
                task = sentence

                # =================================================
                # DEADLINE EXTRACTION
                # =================================================

                deadline_match = re.search(
                    r"\b(by|before|until)\s+"
                    r"((?:next\s+)?(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)"
                    r"|(?:next\s+)?(?:week|month)"
                    r"|tomorrow|today"
                    r"|\d{1,2}(?:st|nd|rd|th)?\s+"
                    r"(?:January|February|March|April|May|June|July|August|September|October|November|December)"
                    r"|(?:January|February|March|April|May|June|July|August|September|October|November|December)"
                    r"\s+\d{1,2}(?:st|nd|rd|th)?)",
                    sentence,
                    re.IGNORECASE
                )

                if deadline_match:

                    deadline = deadline_match.group(2)

                else:

                    deadline = None

                # =================================================
                # DEPENDENCY EXTRACTION
                # =================================================

                dependency = None

                dependency_match = re.search(
                    r"\bafter\s+(.+)",
                    sentence,
                    re.IGNORECASE
                )

                if dependency_match:

                    dependency = dependency_match.group(1).strip()

                # =================================================
                # STORE ACTION
                # =================================================

                actions.append({
                    "person": person,
                    "task": task,
                    "deadline": deadline,
                    "dependency": dependency
                })

                break

        # =====================================================
        # DECISION EXTRACTION
        # =====================================================

        if (
            "decided to" in lower_sentence
            or "decided" in lower_sentence
            or "agreed to" in lower_sentence
            or "agreed on" in lower_sentence
            or "agreed to use" in lower_sentence
        ):

            decisions.append({
                "decision": sentence
            })

        # =====================================================
        # RISK EXTRACTION
        # =====================================================

        if (
            "risk" in lower_sentence
            or "might be" in lower_sentence
            or "may be" in lower_sentence
            or "could be" in lower_sentence
            or "possible delay" in lower_sentence
            or "may be delayed" in lower_sentence
            or "might be delayed" in lower_sentence
        ):

            risks.append({
                "risk": sentence
            })

    # =========================================================
    # FINAL RESULT
    # =========================================================

    return {
        "actions": actions,
        "decisions": decisions,
        "risks": risks
    }