import axios from "axios";

const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export async function generateText(prompt: string): Promise<string> {
  if (!OPENAI_KEY) {
    return "AI is not configured. Set OPENAI_API_KEY to enable real match previews/summaries.";
  }

  // Minimal OpenAI Responses API compatible call via HTTPS.
  // If you prefer the official SDK, swap this implementation later.
  const res = await axios.post(
    "https://api.openai.com/v1/responses",
    {
      model: MODEL,
      input: prompt
    },
    { headers: { Authorization: `Bearer ${OPENAI_KEY}` } }
  );

  // Extract text safely
  const output = res.data?.output ?? [];
  const textParts: string[] = [];
  for (const item of output) {
    const contents = item?.content ?? [];
    for (const c of contents) {
      if (c?.type === "output_text" && typeof c?.text === "string") textParts.push(c.text);
    }
  }
  return textParts.join("\n").trim() || "No text returned from AI.";
}
