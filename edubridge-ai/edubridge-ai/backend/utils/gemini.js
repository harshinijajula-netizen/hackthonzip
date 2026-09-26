// Thin wrapper around the Google Gemini API. Kept isolated here so every
// route calls through this file and the API key never leaves the backend.

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

class GeminiError extends Error {
  constructor(message) {
    super(message);
    this.status = 502;
  }
}

/**
 * Calls Gemini with a system instruction + user prompt.
 * @param {string} systemInstruction
 * @param {string} userPrompt
 * @param {boolean} jsonMode - if true, asks Gemini to return raw JSON only
 */
export async function callGemini(systemInstruction, userPrompt, jsonMode = false) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiError("AI service is not configured. Missing GEMINI_API_KEY.");
  }

  const body = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: jsonMode ? 0.4 : 0.7,
      maxOutputTokens: 2048,
      ...(jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  };

  let response;
  try {
    response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    throw new GeminiError("AI service is temporarily unavailable. Please try again.");
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error("Gemini API error:", response.status, errText);
    throw new GeminiError("AI service is temporarily unavailable. Please try again.");
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";

  if (!text) {
    throw new GeminiError("AI did not return a usable response. Please try again.");
  }

  if (jsonMode) {
    try {
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON:", text);
      throw new GeminiError("AI returned an unexpected format. Please try again.");
    }
  }

  return text;
}

export { GeminiError };
