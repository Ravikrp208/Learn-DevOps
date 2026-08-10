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

    const promptText = `You are a virtual assistant named ${assistantName} created by ${userName}.
You are not Google. You will now behave like a voice-enabled assistant.

Your task is to understand the user's natural language input and respond with a JSON object like this:

{
  "type": "general" | "google_search" | "youtube_search" | "youtube_play" | "get_time" | "get_date" | "get_day" | "get_month" | "calculator_open" | "instagram_open" | "facebook_open" | "weather-show",
  "userinput": "<original user input>" {only remove your name from userinput if exists} and agar kisi ne google ya youtube pe kuch search karne ko bola hai to userInput me only bo search baala text jaye,
  "response": "<a short spoken response to read out loud to the user>"
}

Instructions:
- "type": determine the intent of the user.
- "userinput": original search query or sentence the user spoke/typed (e.g. if user asks "search Elon Musk on google", userinput should be "Elon Musk").
- "response": A short, friendly spoken reply to speak out loud, e.g., "Sure, searching Elon Musk on Google", "Here is what I found", "Today is Tuesday", etc.

Type meanings:
- "general": if it's a conversational, factual, or informational question.
- "google_search": if user wants to search something on Google.
- "youtube_search": if user wants to search something on YouTube.
- "youtube_play": if user wants to directly play a video, music, or song.
- "calculator_open": if user wants to open calculator.
- "instagram_open": if user wants to open Instagram.
- "facebook_open": if user wants to open Facebook.
- "weather-show": if user wants to know weather or forecast.
- "get_time": if user asks for current time.
- "get_date": if user asks for today's date.
- "get_day": if user asks what day it is.
- "get_month": if user asks for the current month.

Important:
- Use "${userName}" agar koi puche kisne banaya.
- Return ONLY the JSON object.

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