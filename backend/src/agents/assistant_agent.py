import sys
import os
import asyncio
from typing import TypedDict
from langgraph.graph import StateGraph, END, START
from langchain_tavily import TavilySearch
from langchain_core.messages import SystemMessage
from backend.src.utils import get_llm_1, get_llm_lite_1
from backend.src.logger import logging
from backend.src.exception import CustomException
from backend.src.prompts.assistant_prompt import STUDENT_GUIDE_PROMPT, TOPIC_EXPLANATION_PROMPT, PLANNER_INSTRUCTIONS_PROMPT

class AgentState(TypedDict):
    standard: int
    subject: str
    topic: str
    raw_study_links: list[dict[str, str]]  
    student_content: str  
    instructions: str
    topic_draft: str

class AssistantAgent:
    def __init__(self):
        self.llm_lite = get_llm_lite_1() 
        self.llm = get_llm_1()
        self.tool = TavilySearch(
            max_results=5,
            topic="general",
            api_key=os.getenv("TAVILY_API_KEY")
        )
        self.graph = self._build_graph()

    def _build_graph(self):
        graph = StateGraph(AgentState)
        graph.add_node("fetch_materials", self._fetch_materials)
        graph.add_node("draft_explanation", self._draft_explanation)
        graph.add_node("compile_student_guide", self._compile_student_guide)
        graph.add_node("generate_planner_instructions", self._generate_planner_instructions)

        graph.add_edge(START, "fetch_materials")
        graph.add_edge(START, "draft_explanation")
        graph.add_edge(["fetch_materials", "draft_explanation"], "compile_student_guide")
        graph.add_edge("compile_student_guide", "generate_planner_instructions")
        graph.add_edge("generate_planner_instructions", END)
        return graph.compile()

    def _get_pedagogical_guardrails(self, standard: int) -> str:
        """Dynamically generates strict vocabulary constraints based on the student's grade."""
        std = int(standard)
        guardrail = "\n\n### CRITICAL AGE-APPROPRIATE GUARDRAILS ###\n"
        if std <= 5:
            guardrail += f"The user is in {std} standard (Elementary). You MUST use extremely simple vocabulary, short sentences, and everyday analogies (like toys, food, or playgrounds). AVOID ALL complex jargon."
        elif std <= 8:
            guardrail += f"The user is in {std} standard (Middle School). Use clear, conversational language. You may introduce technical terms, but you MUST define them immediately with simple analogies."
        elif std <= 10:
            guardrail += f"The user is in {std} standard (High School). Use standard academic language. Introduce formulas and technical concepts clearly, maintaining an engaging tone."
        else:
            guardrail += f"The user is in {std} standard (Advanced/College). Use advanced academic vocabulary, rigorous definitions, and deep technical specifics. Do not over-simplify."
        return guardrail

    async def _fetch_materials(self, state: AgentState) -> dict:
        try:
            logging.info("Async Node: Fetching study materials...")
            topic, subject, standard = state["topic"], state["subject"], state["standard"]
            query = f"Study materials, tutorials, and youtube videos for {topic} in {subject} for grade/standard {standard}"
            
            response = await self.tool.ainvoke(query)
            links = []
            results_list = response if isinstance(response, list) else response.get("results", [])
            
            for item in results_list:
                if isinstance(item, dict):
                    links.append({
                        "url": item.get("url", "No URL"),
                        "title": item.get("title", item.get("content", "Resource")[:50])
                    })
            return {"raw_study_links": links}
        except Exception as e:
            logging.error(f"Error in fetching materials: {str(e)}")
            raise CustomException(e, sys)

    async def _draft_explanation(self, state: AgentState) -> dict:
        try:
            logging.info("Async Node: Drafting topic explanation...")
            prompt = TOPIC_EXPLANATION_PROMPT.format(
                topic=state["topic"], subject=state["subject"], standard=state["standard"]
            )
            # Inject Guardrails
            prompt += self._get_pedagogical_guardrails(state["standard"])
            
            response = await self.llm_lite.ainvoke([SystemMessage(content=prompt)])
            return {"topic_draft": response.content}
        except Exception as e:
            raise CustomException(e, sys)

    async def _compile_student_guide(self, state: AgentState) -> dict:
        try:
            logging.info("Synthesizing student guide HTML...")
            raw_links = state.get("raw_study_links", [])
            links_text = "\n".join([f"- {l.get('title', 'Link')}: {l.get('url', '#')}" for l in raw_links]) if isinstance(raw_links, list) else str(raw_links)
            
            prompt = STUDENT_GUIDE_PROMPT.format(
                topic=state["topic"], subject=state["subject"], standard=state["standard"],
                study_links=links_text, topic_intro=state.get("topic_draft", "")
            )
            # Inject Guardrails
            prompt += self._get_pedagogical_guardrails(state["standard"])

            response = await self.llm.ainvoke([SystemMessage(content=prompt)])
            return {"student_content": response.content}
        except Exception as e:
            raise CustomException(e, sys)

    async def _generate_planner_instructions(self, state: AgentState) -> dict:
        try:
            logging.info("Generating instructions for Planner Agent...")
            prompt = PLANNER_INSTRUCTIONS_PROMPT.format(
                topic=state["topic"], subject=state["subject"], standard=state["standard"],
                student_content=state["student_content"], study_links=state["raw_study_links"]
            )
            # Inject Guardrails
            prompt += self._get_pedagogical_guardrails(state["standard"])

            response = await self.llm.ainvoke([SystemMessage(content=prompt)])
            return {"instructions": response.content}
        except Exception as e:
            raise CustomException(e, sys)

    async def run(self, topic: str, subject: str, standard: int):
        try:
            logging.info(f"Starting Assistant Agent for: {topic}")
            initial_state = {
                "standard": int(standard), "subject": subject, "topic": topic,
                "raw_study_links": [], "topic_draft": ""
            }
            final_state = await self.graph.ainvoke(input=initial_state)
            logging.info("Assistant Agent execution complete.")
            return final_state["instructions"]
        except Exception as e:
            raise CustomException(e, sys)

def run_assistant_sync(topic, subject, standard):
    agent = AssistantAgent()
    return asyncio.run(agent.run(topic, subject, standard))