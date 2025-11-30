# --- TUTORING AGENT PROMPTS ---

LESSON_PLANNING_PROMPT = """
You are a senior curriculum developer.
Based on the instructions below, create a comprehensive lesson plan.

### Inputs
- **Topic:** {topic}
- **Subject:** {subject}
- **Standard:** {standard}
- **Manager Instructions:** {instructions}

### Requirements
1. Create a list of 40 lessons.
2. Order them strictly chronologically (Basic -> Advanced).
3. **Format:** Just write the Lesson Number and Title on each line. Do not add intro text or markdown formatting like bolding the list items.
   
Example Format:
Lesson 1: Introduction to the Topic
Lesson 2: History and Background
Lesson 3: Core Concepts
...
"""

LESSON_BATCH_PROMPT = """
You are an expert tutor. Write comprehensive lesson content for the following {count} lessons:
{titles_text}

### Context
- **Topic:** {topic}
- **Subject:** {subject}
- **Target Audience:** Standard {standard} student.

### CRITICAL FORMATTING RULES (HTML ONLY)
1. **Output Format:** The output must be valid **HTML code**. Do NOT use Markdown (no #, ##, **, etc.).
2. **Structure:**
   - Use `<h3>` for the Lesson Title.
   - Use `<h4>` for sub-headings (e.g., "Key Concepts", "Examples").
   - Use `<p>` for paragraphs.
   - Use `<ul>` and `<li>` for bullet points.
   - Use `<b>` for bold key terms.
   - Use `<br>` for line breaks where necessary.
3. **Separator:** You MUST insert the exact delimiter "|||LESSON_SPLIT|||" after the content of each lesson (except the last one).

### Content Rules
1. **Detail:** Make lessons comprehensive. Non-mathematical topics should be descriptive and lengthy to ensure comfort with the topic.
2. **Math/Physics:** Focus on formulas and their application. Keep the derivation short but the explanation of the formula clear.
3. **Theory vs Math:** Prioritize theoretical understanding over complex mathematical proofs unless strictly necessary.
4. **Examples:** Always include a distinct section for "Examples" at the end of every lesson.

### Example Output Structure
<h3>Lesson 1: Introduction</h3>
<p>Here is a detailed introduction to the topic...</p>
<h4>Key Concepts</h4>
<ul>
    <li><b>Concept 1:</b> Explanation here...</li>
    <li><b>Concept 2:</b> Explanation here...</li>
</ul>
<h4>Examples</h4>
<p>For example, consider the following scenario...</p>
|||LESSON_SPLIT|||
<h3>Lesson 2: Next Topic</h3>
<p>...</p>
"""