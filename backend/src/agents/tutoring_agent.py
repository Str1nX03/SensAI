import sys
import asyncio
import random
from typing import TypedDict
from backend.src.utils import get_llm_1, get_llm_lite_1
from backend.src.logger import logging
from backend.src.exception import CustomException
from langgraph.graph import StateGraph, END, START
from langchain_core.messages import SystemMessage

# Import prompts
try:
    from backend.src.prompts.tutoring_prompt import LESSON_PLANNING_PROMPT, LESSON_CONTENT_PROMPT
except ImportError:
    from backend.src.prompts.tutoring_prompt import LESSON_PLANNING_PROMPT, LESSON_CONTENT_PROMPT

class AgentState(TypedDict):
    instructions: str
    standard: int
    subject: str
    topic: str
    plannings: str   
    lessons: dict    

class TutoringAgent:
    def __init__(self):
        self.llm_lite = get_llm_lite_1() 
        self.llm = get_llm_1()           
        self.graph = self._build_graph()

    def _build_graph(self):
        graph = StateGraph(AgentState)
        
        graph.add_node("plan_curriculum", self._plan_curriculum)
        graph.add_node("generate_parallel_lessons", self._generate_parallel_lessons)

        graph.add_edge(START, "plan_curriculum")
        graph.add_edge("plan_curriculum", "generate_parallel_lessons")
        graph.add_edge("generate_parallel_lessons", END)
        
        return graph.compile()
    
    async def _plan_curriculum(self, state: AgentState) -> dict:
        try:
            logging.info("Generating curriculum plan...")
            
            prompt = LESSON_PLANNING_PROMPT.format(
                topic=state["topic"],
                subject=state["subject"],
                standard=state["standard"],
                instructions=state["instructions"]
            )

            response = await self.llm_lite.ainvoke([SystemMessage(content=prompt)])
            
            return {"plannings": response.content}

        except Exception as e:
            raise CustomException(e, sys)
        
    async def _generate_parallel_lessons(self, state: AgentState) -> dict:
        try:
            logging.info("Generating lessons with strict rate limiting...")

            plannings = state["plannings"]
            topic = state["topic"]
            subject = state["subject"]
            standard = state["standard"]
            
            lesson_list = [line.strip() for line in plannings.split("\n") if line.strip()]

            sem = asyncio.Semaphore(3) 

            async def generate_single_lesson_safe(lesson_title):
                """Generates content for one lesson with aggressive retries."""
                async with sem:  
                    # Retry loop for 429 errors
                    for attempt in range(5):
                        try:
                            # Add a small base delay to space out requests
                            await asyncio.sleep(0.1) 
                            
                            p = LESSON_CONTENT_PROMPT.format(
                                lesson_title=lesson_title,
                                topic=topic,
                                subject=subject,
                                standard=standard
                            )
                            res = await self.llm.ainvoke([SystemMessage(content=p)])
                            logging.info(f"Generated: {lesson_title[:30]}...")
                            return lesson_title, res.content
                        
                        except Exception as e:
                            error_msg = str(e).lower()
                            # Check for rate limit errors
                            if "429" in error_msg or "rate limit" in error_msg:
                                wait_time = 10 * (attempt + 1) + random.uniform(0, 5)
                                logging.warning(f"Rate limit hit for {lesson_title[:15]}. Waiting {wait_time:.1f}s...")
                                await asyncio.sleep(wait_time)
                                continue # Retry loop
                            else:
                                # Genuine error, log and return failure
                                logging.error(f"Failed to generate {lesson_title}: {str(e)}")
                                return lesson_title, f"<p>Error generating content: {str(e)}</p>"
                    
                    return lesson_title, "<p>Error: Could not generate lesson due to high server load.</p>"

            tasks = [generate_single_lesson_safe(lesson) for lesson in lesson_list]

            results = await asyncio.gather(*tasks)

            lessons_dict = {title: content for title, content in results}

            logging.info(f"Generated {len(lessons_dict)} lessons successfully.")

            return {"lessons": lessons_dict}

        except Exception as e:
            raise CustomException(e, sys)

    async def run(self, instructions: str, standard: int, subject: str, topic: str):
        try: 
            logging.info(f"Starting Tutoring Agent for: {topic}")

            initial_state = {
                "instructions": instructions, 
                "standard": standard, 
                "subject": subject, 
                "topic": topic,
                "lessons": {}
            }
            
            final_state = await self.graph.ainvoke(input=initial_state)
            logging.info("Tutoring Agent finished.")
            return final_state["lessons"]

        except Exception as e:
            raise CustomException(e, sys)

def run_tutor_sync(instructions, standard, subject, topic):
    agent = TutoringAgent()
    return asyncio.run(agent.run(instructions, standard, subject, topic))