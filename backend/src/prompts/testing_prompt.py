# --- TESTING AGENT PROMPTS ---

TEST_BATCH_PROMPT = """
You are an expert examiner. Create a test question and a detailed solution for each of the following {count} topics/lessons:
{topics_text}

### Requirements for EACH Topic:
1. **Question:** Create 1 conceptual question based on the topic title.
2. **Solution:** Provide a detailed solution.
3. **Length:** Ensure the solution is detailed and comprehensive.

### CRITICAL OUTPUT FORMAT
You MUST separate each topic's response with the delimiter "|||TEST_SPLIT|||".

Example Output:
<b>Question:</b> What is... <p>...</p> <b>Solution:</b> <p>...</p>
|||TEST_SPLIT|||
<b>Question:</b> Explain... <p>...</p> <b>Solution:</b> <p>...</p>
"""