# rag-demo-llm

A minimal **Retrieval-Augmented Generation (RAG)** pipeline built from scratch in Node.js — no LangChain, no LlamaIndex, no external API costs. Everything runs locally using [Ollama](https://ollama.com).

This project lets you "chat" with a text file: it splits the file into chunks, embeds each chunk, and when you ask a question, it finds the most relevant chunks and uses them as context for a local LLM to generate an answer.

## How it works

1. Read `notes.txt` and split it into small chunks (grouped by sentence boundaries)
2. Convert each chunk into a numeric vector ("embedding") using a local embedding model
3. When you ask a question, convert the question into a vector the same way
4. Compare the question's vector to every chunk's vector using cosine similarity
5. Take the top matching chunks and insert them into a prompt as context
6. Send that prompt to a local chat model and print the generated answer

This is the same core pattern used by most "chat with your docs" tools, just implemented by hand instead of through a framework.

## Requirements

- [Node.js](https://nodejs.org) v18 or later (needed for built-in `fetch`)
- [Ollama](https://ollama.com/download) installed and running locally

## Installation

**1. Clone the repo**
```bash
git clone https://github.com/UdaraJayawardena/rag-demo-llm-pipeline.git
cd rag-demo-llm
```

**2. Install Ollama**

Download and install from [ollama.com/download](https://ollama.com/download), then confirm it's running:
```bash
ollama list
```

**3. Pull the required models**
```bash
ollama pull llama3.2
ollama pull nomic-embed-text
```

- `llama3.2` — the chat model that generates answers
- `nomic-embed-text` — the embedding model that converts text into vectors for similarity search

*(If your machine is lower-spec, `ollama pull llama3.2:1b` is a smaller/faster alternative.)*

**4. Install Node dependencies**

This project has no external npm dependencies — it only uses Node's built-in `fetch` and `fs` modules. Just confirm your `package.json` has:
```json
{
  "type": "module"
}
```

## Usage

**1. Add your content**

Edit `notes.txt` and paste in whatever text you want to be able to ask questions about (notes, an article, documentation, etc.) — a few hundred words minimum works well.

**2. Run the script**
```bash
node index.js
```

**3. Ask questions**

Once the chunks are embedded, you'll see a prompt in your terminal:
```
Ready! Ask a question about notes.txt (Ctrl+C to quit)
You: what is RAG?
```

The script will print the generated answer, along with the similarity scores of the chunks it used as context.

## Project structure

```
rag-demo-llm/
├── index.js       # main pipeline: chunking, embedding, retrieval, generation
├── notes.txt       # the text file you're "chatting" with
├── package.json
└── README.md
```

## Notes / limitations

- This is a learning project, not production-ready code — chunking, storage, and retrieval are intentionally simple.
- Embeddings are recomputed from scratch every time the script starts (no persistent vector store).
- Answer quality depends on the local model used — `llama3.2` is small and may give terse answers compared to larger hosted models.

## What this project demonstrates

- Text chunking strategy
- Generating embeddings via a local model
- Cosine similarity for semantic search
- Prompt construction for context-grounded generation
- Calling a local LLM API (Ollama) directly, without a framework like LangChain