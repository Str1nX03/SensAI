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

### CRITICAL FORMATTING RULES
1. **Separator:** You MUST insert the exact delimiter "|||LESSON_SPLIT|||" after the content of each lesson (except the last one).

Example Output Structure:
Lesson 1 
|||LESSON_SPLIT|||
Lesson 2
|||LESSON_SPLIT|||
Lesson 3

Rules:-

1. Make the lessons really comprehensive and detailed.
2. Make the non-mathematical lessons a bit lengthy so that the user will have time to adapt to the topic comfortably.
3. If the topic is math or physics, focus on formulas but dont make it too lengthy, keep it short so that the user will have to understand with his/her own intellect.
4. If use maths to explain the topic only if its necessary but don't make it too comprehensive, focus on theory the most.
5. Include examples at the end of the lesson.

"""