import sys
import asyncio
from typing import TypedDict
from src.utils import get_llm_1, get_llm_lite_1
from src.logger import logging
from src.exception import CustomException
from langgraph.graph import StateGraph, END, START
from langchain_core.messages import SystemMessage

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

            logging.info("Generating lessons with rate limiting...")

            plannings = state["plannings"]
            topic = state["topic"]
            subject = state["subject"]
            standard = state["standard"]
            
            lesson_list = [line.strip() for line in plannings.split("\n") if line.strip()]

            sem = asyncio.Semaphore(3) 

            async def generate_single_lesson_safe(lesson_title):

                """Generates content for one lesson, respecting the semaphore limit."""
                
                async with sem:  

                    try:

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

                        logging.error(f"Failed to generate {lesson_title}: {str(e)}")
                        
                        return lesson_title, f"<p>Error generating content: {str(e)}</p>"

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