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

    const promptText = `You are a voice-enabled virtual assistant named "${assistantName}" created by "${creatorName}".
You understand both English, Hindi, and Hinglish commands fluently.

Your task is to understand what the user wants and respond with a JSON object like this:

{
  "type": "general" | "google_search" | "youtube_search" | "youtube_play" | "whatsapp_open" | "instagram_open" | "facebook_open" | "spotify_open" | "github_open" | "chatgpt_open" | "gmail_open" | "maps_open" | "calculator_open" | "weather_show" | "get_time" | "get_date" | "get_day" | "get_month",
  "userinput": "<clean query text to search or play>",
  "response": "<a short, natural, friendly spoken reply to read out loud in the same language user used (Hindi/English)>"
}

Instructions:
- "type": select the exact matching intent:
  * "youtube_play": user wants to play a song/video (e.g., "play Kesariya on youtube", "youtube pe arijit ke gane bajao"). userinput should only be the song/video title e.g. "Kesariya".
  * "youtube_search": user wants to search something on YouTube (e.g., "search react tutorial on youtube", "youtube me search karo java"). userinput should only be the search term e.g. "react tutorial".
  * "google_search": user wants to search on Google or asks to search something (e.g., "google pe search karo python", "search quantum computing on google"). userinput should only be the search query.
  * "whatsapp_open": user wants to open WhatsApp (e.g., "open whatsapp", "whatsapp kholo").
  * "instagram_open": user wants to open Instagram (e.g., "open instagram", "instagram kholo").
  * "facebook_open": user wants to open Facebook (e.g., "open facebook", "facebook kholo").
  * "spotify_open": user wants to open Spotify or play music on Spotify.
  * "github_open": user wants to open GitHub.
  * "chatgpt_open": user wants to open ChatGPT.
  * "gmail_open": user wants to open Gmail.
  * "maps_open": user wants to open Google Maps or find a location on map.
  * "calculator_open": user wants to open calculator.
  * "weather_show": user wants to check the weather.
  * "get_time": user asks for current time.
  * "get_date": user asks for today's date.
  * "get_day": user asks what day it is.
  * "get_month": user asks for current month.
  * "general": conversational queries, jokes, facts, calculations, who created you, etc.

Identity & Creator Rules (CRITICAL):
- Your name is "${assistantName}". You are a virtual assistant.
- Your creator / maker / developer is "${creatorName}".
- If user asks who created you / tumhe kisne banaya: response MUST BE "I am a virtual assistant created by ${creatorName}." (or in Hindi "Mujhe ${creatorName} ne banaya hai.").
- NEVER claim you are ${creatorName}.

Important:
- Clean "userinput": Do NOT include words like "search karo", "bajao", "play", "on youtube", "google me" in the userinput parameter so search URLs work cleanly.
- Return ONLY the JSON object, nothing else.

User Input: ${command}`;

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
            }, { timeout: 15000 });

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