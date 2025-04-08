import express from 'express';
import { connectDB } from './db/connectDB.js';
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import authRoutes from "./routes/auth.route.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
// Import ChatOpenAI from LangChain
// import { ChatOpenAI } from "langchain/chat_models/openai";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();
const __filename = fileURLToPath(import.meta.url);

app.use(express.json()); // Parse JSON payloads from requests
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use("/api/auth", authRoutes);

// Function to create the conversation context
function conversationContext(aiName, attributes) {
  return `
The following is a conversation with an AI assistant. The assistant is ${attributes}.

Human: Hello
${aiName}: Hi, I am ${aiName}. What's your question?
`;
}

app.post("/openai", async (req, res) => {
  console.log("[/openai] Request received:", req.body);
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    // Initialize ChatOpenAI using LangChain with the model you specified (text-davinci-002).
    const aiName = "AI-Image Detective";
    const attributes = "helpful, knowledgeable about AI-generated image detection, GANs, datasets, and performance analysis";

    // Build the prompt with the conversation context
    const prompt = `${conversationContext(aiName, attributes)}Human: ${query}\n${aiName}:`;

    // Initialize LangChain's ChatOpenAI to interact with OpenAI API
    const llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "text-davinci-002",  // Use the text-davinci-002 model
      basePath: "https://api.sree.shop/v1",  // Custom OpenAI API endpoint
    });

    // Invoke the model with the generated prompt
    const result = await llm.call(prompt);
    console.log("[/openai] Raw result:", result);

    // Using the content property from the result, send the reply
    const botReply = result.content || "No reply generated.";
    console.log("[/openai] Reply being sent:", botReply);
    res.json({ reply: botReply });
  } catch (error) {
    console.error("LangChain ChatOpenAI error:", error);
    res.status(500).json({ error: "Failed to generate response." });
  }
});

// Static frontend path for production
const frontendPath = path.join(__dirname, "./frontend/UI/dist");
if (process.env.NODE_ENV === "production") {
  app.use(express.static(frontendPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port", PORT);
});