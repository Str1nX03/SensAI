import sys
import asyncio
import random
from typing import TypedDict, List, Dict
from backend.src.utils import get_llm_2, get_llm_lite_2
from backend.src.logger import logging
from backend.src.exception import CustomException
from langgraph.graph import StateGraph, END, START
from langchain_core.messages import SystemMessage

try:

    from backend.src.prompts.testing_prompt import TEST_BATCH_PROMPT

except ImportError:

    from backend.src.prompts.testing_prompt import TEST_BATCH_PROMPT

class AgentState(TypedDict):

    lessons: dict
    tests: dict

class TestingAgent:

    def __init__(self):

        self.llm = get_llm_2()       
        self.llm_lite = get_llm_lite_2() 
        self.graph = self._build_graph()

    def _build_graph(self):

        graph = StateGraph(AgentState)

        graph.add_node("generate_tests_parallel", self._generate_tests_parallel)

        graph.add_edge(START, "generate_tests_parallel")
        graph.add_edge("generate_tests_parallel", END)

        return graph.compile()

    async def _generate_tests_parallel(self, state: AgentState) -> dict:

        try:

            logging.info("Testing Agent: Generating tests (Async/Batched)...")

            lessons = state["lessons"]
            lesson_list = list(lessons.keys()) 
            total_lessons = len(lesson_list)
            
            mid_point = total_lessons // 2
            group_lite = lesson_list[:mid_point]
            group_heavy = lesson_list[mid_point:]

            BATCH_SIZE = 3 
            sem = asyncio.Semaphore(2)

            async def process_batch(batch_titles: List[str], model):

                async with sem:

                    for attempt in range(3):

                        try:

                            await asyncio.sleep(1) 
                            
                            titles_text = "\n".join([f"- {t}" for t in batch_titles])
                            
                            prompt = TEST_BATCH_PROMPT.format(
                                count=len(batch_titles),
                                topics_text=titles_text
                            )

                            res = await model.ainvoke([SystemMessage(content=prompt)])
                            
                            parts = res.content.split("|||TEST_SPLIT|||")
                            
                            results = {}
                            for i, title in enumerate(batch_titles):

                                if i < len(parts):

                                    results[title] = parts[i].strip()

                                else:

                                    results[title] = f"<p>Error: Test content missing for {title}</p>"
                            
                            return results

                        except Exception as e:

                            if "429" in str(e) or "rate limit" in str(e).lower():

                                wait = 10 * (attempt + 1)
                                logging.warning(f"Test Agent Rate Limit. Waiting {wait}s...")
                                await asyncio.sleep(wait)

                                continue

                            logging.error(f"Batch failed: {e}")

                            return {t: f"<p>Error generating test: {e}</p>" for t in batch_titles}
                        
                    return {t: "<p>Error: Rate limit exhausted</p>" for t in batch_titles}

            batches_lite = [group_lite[i:i + BATCH_SIZE] for i in range(0, len(group_lite), BATCH_SIZE)]
            
            batches_heavy = [group_heavy[i:i + BATCH_SIZE] for i in range(0, len(group_heavy), BATCH_SIZE)]

            tasks = []
            for b in batches_lite:

                tasks.append(process_batch(b, self.llm_lite))

            for b in batches_heavy:

                tasks.append(process_batch(b, self.llm))

            batch_results = await asyncio.gather(*tasks)

            all_tests = {}
            for res in batch_results:

                all_tests.update(res)

            logging.info(f"Generated {len(all_tests)} tests successfully.")

            return {"tests": all_tests}

        except Exception as e:

            raise CustomException(e, sys)

    async def run(self, lessons: dict):

        try:

            logging.info("Running Testing Agent...")

            initial_state = {"lessons": lessons, "tests": {}}
            final_state = await self.graph.ainvoke(input=initial_state)

            return final_state["tests"]
        
        except Exception as e:

            raise CustomException(e, sys)

def run_testing_sync(lessons):

    agent = TestingAgent()
    
    return asyncio.run(agent.run(lessons))