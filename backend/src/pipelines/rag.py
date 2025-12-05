import os
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from backend.src.logger import logging

class RAGPipeline:
    def __init__(self):
        """
        Initializes the RAG pipeline and connects to the persistent database.
        """
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.persist_directory = "./chroma_db" 
        self.vector_store = None

        # Always connect to the existing database
        self.vector_store = Chroma(
            persist_directory=self.persist_directory, 
            embedding_function=self.embeddings
        )
        
        if os.path.exists(self.persist_directory):
            logging.info(f"RAG: Connected to existing knowledge base at {self.persist_directory}")

    def ingest_document(self, file_path: str):
        """
        Loads a new document (PDF or Text). 
        PREVENTS DUPLICATES by checking if the file is already in the DB.
        """
        # 1. Check if file is already ingested
        existing_docs = self.vector_store.get(where={"source": file_path})
        
        if existing_docs and len(existing_docs["ids"]) > 0:
            logging.info(f"RAG: Skipping {file_path} - Already exists in database.")
            return

        logging.info(f"RAG: Ingesting new file: {file_path}...")
        
        # 2. Load File
        if file_path.endswith(".pdf"):
            loader = PyPDFLoader(file_path)
        else:
            loader = TextLoader(file_path)
        
        documents = loader.load()
        self._process_and_store(documents, source_name=file_path)

    def _process_and_store(self, documents, source_name):
        """Helper to split text and add to vector store."""
        if not documents:
            logging.warning(f"RAG: Source {source_name} was empty or could not be read.")
            return

        # 3. Split Text
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        splits = text_splitter.split_documents(documents)
        
        # 4. Add to Vector Store
        self.vector_store.add_documents(documents=splits)
        
        logging.info(f"RAG: Successfully added {len(splits)} new chunks from {source_name}.")

    def retrieve_context(self, query: str, k: int = 2) -> str:
        """
        Searches the knowledge base for relevant text.
        """
        if not self.vector_store:
            return "No knowledge base loaded."

        # Search
        docs = self.vector_store.similarity_search(query, k=k)
        
        # Combine content
        context_text = "\n\n".join([f"[Source Extract]: {doc.page_content}" for doc in docs])
        return context_text