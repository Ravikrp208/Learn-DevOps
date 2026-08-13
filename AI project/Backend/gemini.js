import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const geminiResponse = async (command, assistantName = "Shifra", userName = "User") => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return JSON.stringify({
            type: "general",
            userinput: command,
            response: "Gemini API key is not configured in the backend."
        });
    }

    const modelsToTry = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-3.1-flash-lite"
    ];

    const creatorName = "Ravi BaBy";

    const promptText = `You are an intelligent, highly knowledgeable AI Assistant named "${assistantName}" created by "${creatorName}".
You understand English, Hindi, and Hinglish fluently.

Your goal is to provide a direct, COMPLETE, DETAILED, AND IN-DEPTH EXPLANATION for any query, question, coding task, or search topic requested by the user.

Always respond strictly in a valid JSON object format:
{
  "type": "general" | "youtube_play" | "youtube_search" | "google_search" | "whatsapp_open" | "instagram_open" | "facebook_open" | "spotify_open" | "github_open" | "chatgpt_open" | "gmail_open" | "maps_open" | "calculator_open" | "weather_show" | "get_time" | "get_date" | "get_day" | "get_month",
  "userinput": "<cleaned search or action query>",
  "response": "<Direct and comprehensive explanation or response answering user's query with key points, code blocks, or structured details.>"
}

CRITICAL RULES:
1. NO REPETITIVE INTRODUCTIONS:
   - DO NOT start every response with "Hello! I am ${assistantName}, created by ${creatorName}..."!
   - Jump DIRECTLY into answering the question, explaining the topic, or writing the code.
   - ONLY introduce yourself or mention ${creatorName} if the user explicitly asks "Who are you?", "Who created you?", "Introduce yourself", or "Aapko kisne banaya?".

2. DETAILED & STRUCTURED ANSWERS:
   - Whenever the user asks any question, concept explanation, coding help, or general search topic:
     * Give a comprehensive, structured response with clear headings, bullet points, and code blocks (with syntax \`\`\`language ... \`\`\`) where applicable.
     * Reply naturally in the same language (English, Hindi, or Hinglish) used by the user.

3. SPECIFIC APP ACTIONS (Only when user explicitly commands to open an app or play video/music):
   - "youtube_play": ONLY if user explicitly wants to play a song/video (e.g. "play Kesariya on youtube"). userinput: song title.
   - "youtube_search": ONLY if user explicitly says "search X on youtube". userinput: search query.
   - "whatsapp_open": ONLY if user asks to open WhatsApp.
   - "instagram_open": ONLY if user asks to open Instagram.
   - "facebook_open": ONLY if user asks to open Facebook.
   - "spotify_open": ONLY if user asks to open Spotify or play music on Spotify.
   - "github_open": ONLY if user asks to open GitHub.
   - "chatgpt_open": ONLY if user asks to open ChatGPT.
   - "gmail_open": ONLY if user asks to open Gmail.
   - "maps_open": ONLY if user asks to open Google Maps for a location.
   - "calculator_open": ONLY if user asks to open calculator.
   - "get_date", "get_time", "get_day", "get_month": for real-time clock/calendar queries.
   - Otherwise, default to "type": "general" and give the full AI answer.

4. FORMAT:
   - Return ONLY the raw JSON object without markdown JSON wrappers (\`\`\`json).

User Prompt: ${command}`;

    for (const model of modelsToTry) {
        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const response = await axios.post(apiUrl, {
                contents: [
                    {
                        parts: [
                            { text: promptText }
                        ]
                    }
                ]
            }, { timeout: 20000 });

            const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (rawText) {
                console.log(`Gemini response (${model}):`, rawText);
                return rawText;
            }
        } catch (error) {
            console.warn(`Gemini model ${model} failed:`, error?.response?.data?.error?.message || error.message);
            // Try next model
        }
    }

    return JSON.stringify({
        type: "general",
        userinput: command,
        response: "Sorry, I am having trouble connecting to AI services right now."
    });
};

export default geminiResponse;