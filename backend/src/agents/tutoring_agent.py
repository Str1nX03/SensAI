import sys
import asyncio
import random
from typing import TypedDict, List
from backend.src.utils import get_llm_1, get_llm_lite_1
from backend.src.logger import logging
from backend.src.exception import CustomException
from langgraph.graph import StateGraph, END, START
from langchain_core.messages import SystemMessage

# --- RAG IMPORT ---
# Adjust this import path based on your exact folder structure
try:
    from backend.src.pipelines.rag import RAGPipeline
except ImportError:
    try:
        from backend.src.pipelines.rag import RAGPipeline
    except ImportError:
        from backend.src.pipelines.rag import RAGPipeline

try:
    from backend.src.prompts.tutoring_prompt import LESSON_PLANNING_PROMPT, LESSON_BATCH_PROMPT
except ImportError:
    from backend.src.prompts.tutoring_prompt import LESSON_PLANNING_PROMPT, LESSON_BATCH_PROMPT

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
        
        # 1. Initialize RAG Pipeline (Connects to existing DB)
        try:
            self.rag_pipeline = RAGPipeline()
            logging.info("Tutoring Agent connected to RAG Pipeline.")
        except Exception as e:
            logging.error(f"Failed to initialize RAG: {e}")
            self.rag_pipeline = None

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
            logging.info("Generating lessons with RAG & Batching...")

            plannings = state["plannings"]
            topic = state["topic"]
            subject = state["subject"]
            standard = state["standard"]
            
            lesson_list = [line.strip() for line in plannings.split("\n") if line.strip()]

            # Batch Size Configuration
            BATCH_SIZE = 3
            batches = [lesson_list[i:i + BATCH_SIZE] for i in range(0, len(lesson_list), BATCH_SIZE)]

            sem = asyncio.Semaphore(1) 

            async def generate_batch_safe(batch_titles: List[str]):
                async with sem:  
                    for attempt in range(5):
                        try:
                            await asyncio.sleep(0.8) 
                            
                            # 2. RAG CONTEXT RETRIEVAL
                            # We construct a rich prompt containing the Source Material for each lesson
                            formatted_lesson_requests = []
                            
                            for title in batch_titles:
                                context_text = "No source material found."
                                
                                if self.rag_pipeline:
                                    # Run retrieval in a thread to prevent blocking the async loop
                                    context_text = await asyncio.to_thread(
                                        self.rag_pipeline.retrieve_context, 
                                        query=title
                                    )
                                
                                # Create a block for the prompt
                                lesson_block = f"""
                                ---
                                TARGET LESSON: {title}
                                VERIFIED SOURCE MATERIAL FROM TEXTBOOK:
                                {context_text}
                                ---
                                """
                                formatted_lesson_requests.append(lesson_block)

                            # Join all blocks to send to LLM
                            full_titles_text = "\n".join(formatted_lesson_requests)
                            
                            # 3. Inject into Prompt
                            # We update the prompt text to explicitly mention the source material usage
                            formatted_prompt = LESSON_BATCH_PROMPT.format(
                                count=len(batch_titles),
                                titles_text=full_titles_text,
                                topic=topic,
                                subject=subject,
                                standard=standard
                            )
                            
                            # Append specific RAG instruction dynamically
                            formatted_prompt += "\n\nCRITICAL INSTRUCTION: Use the provided 'VERIFIED SOURCE MATERIAL' to write the lesson content. Do not hallucinate information if it is present in the source."

                            res = await self.llm.ainvoke([SystemMessage(content=formatted_prompt)])
                            raw_content = res.content
                            
                            split_content = raw_content.split("|||LESSON_SPLIT|||")
                            
                            batch_results = {}
                            for i, title in enumerate(batch_titles):
                                if i < len(split_content):
                                    batch_results[title] = split_content[i].strip()
                                else:
                                    batch_results[title] = "<p>Error: Content missing from batch response.</p>"
                            
                            logging.info(f"Generated batch of {len(batch_titles)} lessons using RAG.")
                            return batch_results
                        
                        except Exception as e:
                            error_msg = str(e).lower()
                            if "429" in error_msg or "rate limit" in error_msg:
                                wait_time = 15 * (attempt + 1) + random.uniform(0, 5)
                                logging.warning(f"Rate limit hit. Waiting {wait_time:.1f}s...")
                                await asyncio.sleep(wait_time)
                                continue 
                            else:
                                logging.error(f"Failed to generate batch: {str(e)}")
                                return {title: f"<p>Error: {str(e)}</p>" for title in batch_titles}
                    
                    return {title: "<p>Error: Rate limit exhausted.</p>" for title in batch_titles}

            tasks = [generate_batch_safe(batch) for batch in batches]
            results = await asyncio.gather(*tasks)

            lessons_dict = {}
            for batch_result in results:
                lessons_dict.update(batch_result)

            logging.info(f"Generated {len(lessons_dict)} lessons successfully.")
            return {"lessons": lessons_dict}

        except Exception as e:
            raise CustomException(e, sys)

    async def run(self, instructions: str, standard: int, subject: str, topic: str):
        try: 
            logging.info(f"Starting Tutoring Agent for: {topic}")
            initial_state = {
                "instructions": instructions, "standard": standard, 
                "subject": subject, "topic": topic, "lessons": {}
            }
            final_state = await self.graph.ainvoke(input=initial_state)
            logging.info("Tutoring Agent finished.")
            return final_state["lessons"]
        except Exception as e:
            raise CustomException(e, sys)

def run_tutor_sync(instructions, standard, subject, topic):
    agent = TutoringAgent()
    return asyncio.run(agent.run(instructions, standard, subject, topic))