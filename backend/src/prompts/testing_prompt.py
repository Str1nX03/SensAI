# --- TESTING AGENT PROMPTS ---

TEST_BATCH_PROMPT = """
You are an expert examiner. Create a test question and a detailed solution for each of the following {count} topics/lessons:
{topics_text}

### Requirements for EACH Topic:
1. **Question:** Create 1 conceptual question based on the topic title.
2. **Solution:** Provide a detailed solution.
3. **Length:** Ensure the solution is detailed and comprehensive.

### CRITICAL FORMATTING RULES (HTML ONLY)
1. **Output Format:** The output must be valid **HTML code**. Do NOT use Markdown.
2. **Structure:**
   - Wrap the entire block in a `<div>`.
   - Use `<p><b>Question:</b> ...</p>` for the question.
   - Use `<p><b>Solution:</b> ...</p>` for the solution.
   - Use `<br>` for spacing.
3. **Separator:** You MUST separate each topic's response with the delimiter "|||TEST_SPLIT|||".

### Example Output
<div>
    <p><b>Question:</b> What is the primary function of...?</p>
    <p><b>Solution:</b> The primary function is... This is calculated by...</p>
</div>
|||TEST_SPLIT|||
<div>
    <p><b>Question:</b> Solve for x...</p>
    <p><b>Solution:</b> To solve this...</p>
</div>
"""