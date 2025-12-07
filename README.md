# SensAI: Personalized AI Learning Platform

SensAI is a cutting-edge educational platform that leverages a **Multi-Agent AI Architecture** and **Retrieval-Augmented Generation (RAG)** to create comprehensive, verified, and personalized learning curriculums.

Unlike standard AI wrappers, SensAI orchestrates three distinct specialized agents (Assistant, Tutor, and Examiner) to research topics, generate detailed lessons based on verified textbooks, and create revision tests—all asynchronously for a seamless user experience.

## 📸 Project Showcase

### Screenshots

Here's a glimpse of the Draftware application in action.

**Landing Page** 
![Landing Page](./static/images/screenshot_landing.png)

**Dashboard** 
![Dashboard](./static/images/screenshot_dashboard.png)

**Drafts Review Modal** 
![Drafts Modal](./static/images/screenshot_modal.png)

## 🌟 Features

* **🤖 Multi-Agent Orchestration:**
  * **Assistant Agent:** Researches the topic using Tavily, drafts an overview, and compiles study resources.
  * **Tutoring Agent:** Acts as a senior curriculum developer to plan a chronologically ordered course, then generates HTML-formatted lessons.
  * **Testing Agent:** Reviews the generated lessons and creates conceptual practice questions with detailed solutions.
* **📚 RAG (Retrieval-Augmented Generation) Pipeline:** 
  * Ingests PDF textbooks and Web URLs into a persistent ChromaDB vector store.
  * Ensures lessons are grounded in verified source material rather than AI hallucinations.
  * Uses HuggingFace Embeddings (all-MiniLM-L6-v2) for efficient, local vector processing.
* **⚡ High-Performance Async Backend:**
  * Built on **Flask (Async)** to handle long-running AI tasks without blocking the web server.
  * Uses **Batch Processing** and **Semaphores** to optimize LLM token usage and prevent rate-limiting errors.
* **🔐 User Management:**
  * Secure user authentication (Login/Register) with hashed passwords.
  * Session-based history: Users can save, view, resume, and delete their generated courses.
* **🎨 Modern UI:**
  * Glassmorphism design with animated backgrounds.
  * Clean, rendered HTML output for lessons (Math formulas, bullet points, headers).

## 🛠️ Tech Stack

* **Backend:** Flask (Async/Await)
* **Database:** SQLite (SQLAlchemy)
* **AI Agent Framework:** LangChain, LangGraph 
* **LLM:** Groq (via `langchain_groq`) [`llama-instant-8b` and `llama-versatile-70b`]
* **Vector Database:** ChromaDB (via `langchain-chroma`)
* **Embeddings:** HuggingFace (`all-MiniLM-L6-v2`)
* **Frontend:** HTML, CSS, JavaScript
* **Search Tool:** Tavily API
* **Document Loading:** PyPDFLoader, WebBaseLoader

## 📂 Project Structure

```
.
├── app.py                      # Main Async Flask application
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables (API Keys)
├── users.db                    # SQLite database (Users & Courses)
├── chroma_db/                  # Persistent Vector Store directory
├── instance/                   # Directory for PDF source files
├── static/
│   ├── style.css               # Main application styling
│   └── script.js               # Frontend interactions
├── templates/
│   ├── dashboard.html          # User dashboard
│   ├── product.html            # Course view
│   ├── login.html              # Auth pages
│   └── landing.html            # Home page
└── src/
    ├── agents/
    │   ├── assistant_agent.py  # Research & Planning
    │   ├── tutoring_agent.py   # Lesson Generation (with RAG integration)
    │   ├── testing_agent.py    # Quiz Generation
    │   ├── rag_pipeline.py     # Vector ingestion & retrieval logic
    ├── prompts/                # Centralized prompt templates
    │   ├── assistant_prompt.py
    │   ├── tutoring_prompt.py
    │   └── testing_prompt.py
    ├── pipelines/
    │   ├── rag.py              * RAG Pipeline
    ├── utils.py                # LLM initialization helpers
    └── logger.py               # Custom logging setup
```

## ⚙️ Setup and Installation

Follow these steps to get the SensAI running on your local machine.

### 1. Clone the Repository

```bash
git clone [https://github.com/your-username/sensai.git](https://github.com/your-username/sensai.git)
cd sensai
```

### 2. Create and Activate a Virtual Environment

```bash
# Windows
python -m venv .venv
.\.venv\Scripts\activate
```
```bash
# macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies

Install all the required Python packages from requirements.txt.

```bash
pip install -r requirements.txt
# Ensure you install the specific async support if not in requirements:
pip install "flask[async]"
```

### 4. Set Up Environment Variables

The application requires a several environment variables and keys. Create a `.env` file in the project root:

```bash
FLASK_SECRET_KEY="your_super_secret_key"
GROQ_API_KEY="gsk_..."
TAVILY_API_KEY="tvly-..."
```

### 5. Run the Flask Application

Now you're ready to start the web server.

```bash
python app.py
```
Navigate to `http://127.0.0.1:5000` in your web browser.

## 📄 License

This project is licensed under the MIT License.
