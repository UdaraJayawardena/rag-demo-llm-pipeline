import fs from "fs";
import readline from "readline";

function chunkText(text, chunkSize = 500) {
  const chunks = [];
  let current = "";
  const sentences = text.split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    if ((current + sentence).length > chunkSize) {
      chunks.push(current.trim());
      current = "";
    }
    current += sentence + " ";
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks;
}

async function getEmbedding(text) {
  const response = await fetch("http://localhost:11434/api/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "nomic-embed-text", prompt: text })
  });
  const data = await response.json();
  return data.embedding;
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function askQuestion(question, embeddedChunks) {
  const questionEmbedding = await getEmbedding(question);

  // score every chunk by similarity to the question
  const scored = embeddedChunks.map(chunk => ({
    ...chunk,
    score: cosineSimilarity(questionEmbedding, chunk.embedding)
  }));

  scored.sort((a, b) => b.score - a.score);
  const topChunks = scored.slice(0, 2); // take top 2 most relevant chunks

  const context = topChunks.map(c => c.text).join("\n\n");

  const prompt = `Answer the question using only the context below. If the answer isn't in the context, say you don't know.

Context:
${context}

Question: ${question}

Answer:`;

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "llama3.2", prompt, stream: false })
  });

  const data = await response.json();
  console.log("\nAnswer:", data.response);
  console.log("\n(Used chunks with scores:", topChunks.map(c => c.score.toFixed(3)), ")");
}

async function main() {
  const text = fs.readFileSync("notes.txt", "utf-8");
  const chunks = chunkText(text);

  console.log(`Embedding ${chunks.length} chunks...`);
  const embeddedChunks = [];
  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk);
    embeddedChunks.push({ text: chunk, embedding });
  }
  console.log("Ready! Ask a question about notes.txt (Ctrl+C to quit)\n");

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const ask = () => {
    rl.question("You: ", async (question) => {
      await askQuestion(question, embeddedChunks);
      ask();
    });
  };

  ask();
}

main();