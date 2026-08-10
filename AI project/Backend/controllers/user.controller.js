import User from "../models/user.model.js";
import uploadCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import moment from "moment";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ message: "Get current user error" });
  }
};

export const updateassistantname = async (req, res) => {
  try {
    const { assistantName, imageUrl, imageurl } = req.body;
    let assistantImage;

    if (req.file) {
      const cloudUrl = await uploadCloudinary(req.file.path);
      if (cloudUrl) {
        assistantImage = cloudUrl;
      } else {
        // Fallback to local server URL if Cloudinary fails
        assistantImage = `http://localhost:8000/${req.file.filename}`;
      }
    } else if (imageUrl || imageurl) {
      assistantImage = imageUrl || imageurl;
    }

    const updateFields = {};
    if (assistantName && assistantName.trim()) {
      updateFields.assistantName = assistantName.trim();
    }
    if (assistantImage) {
      updateFields.assistantImage = assistantImage;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateFields,
      { returnDocument: 'after' }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Update assistant error:", error);
    return res.status(500).json({ message: error.message || "Update assistant error" });
  }
};

export const askToAssistant = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.toString().trim()) {
      return res.status(400).json({ message: "Please provide a query or command." });
    }

    const cleanPrompt = prompt.toString().trim();
    const user = await User.findById(req.userId);
    const userName = user?.name || "User";
    const assistantName = user?.assistantName || "Shifra";

    // Direct instant check for creator & identity queries
    const lowerPrompt = cleanPrompt.toLowerCase();
    if (
      lowerPrompt.includes("who created you") ||
      lowerPrompt.includes("who made you") ||
      lowerPrompt.includes("kisne banaya") ||
      lowerPrompt.includes("who is your creator") ||
      lowerPrompt.includes("who is your developer") ||
      lowerPrompt.includes("who is your master") ||
      lowerPrompt.includes("who is your boss")
    ) {
      return res.json({
        type: "general",
        userInput: cleanPrompt,
        response: "I am a virtual assistant created by Ravi BaBy."
      });
    }

    if (
      lowerPrompt === "who are you" ||
      lowerPrompt === "who are you?" ||
      lowerPrompt === "tum kaun ho" ||
      lowerPrompt === "aap kaun ho" ||
      lowerPrompt === "introduce yourself" ||
      lowerPrompt === "tell me about yourself"
    ) {
      return res.json({
        type: "general",
        userInput: cleanPrompt,
        response: `I am ${assistantName}, a virtual assistant created by Ravi BaBy.`
      });
    }

    // Fast pattern matching for popular voice/text commands
    // 1. YouTube Play / Search
    if (/^(play|bajao|chalao)\s+(.+?)\s*(on youtube|pe)?$/i.test(lowerPrompt) || /^youtube\s+(pe|me)?\s*(.+?)\s*(bajao|chalao|play)$/i.test(lowerPrompt)) {
      const match = lowerPrompt.match(/(?:play|bajao|chalao)\s+(.+?)(?:\s+(?:on youtube|pe))?$/i) || lowerPrompt.match(/^youtube\s+(?:pe|me)?\s*(.+?)\s*(?:bajao|chalao|play)$/i);
      const song = match?.[1]?.replace(/on youtube|pe|me|play|bajao|chalao/gi, '').trim() || cleanPrompt;
      return res.json({
        type: 'youtube_play',
        userInput: song,
        response: `Playing ${song} on YouTube.`
      });
    }

    if (/^(search|dhundo)\s+(.+?)\s*(on youtube|youtube me|youtube pe)$/i.test(lowerPrompt) || /^youtube\s+(me|pe)?\s*(search karo|dhundo)\s+(.+)$/i.test(lowerPrompt)) {
      const match = lowerPrompt.match(/(?:search|dhundo)\s+(.+?)(?:\s+(?:on youtube|youtube me|youtube pe))?$/i) || lowerPrompt.match(/youtube\s+(?:me|pe)?\s*(?:search karo|dhundo)\s+(.+)$/i);
      const query = match?.[1] || match?.[2] || cleanPrompt;
      const cleanQ = query.replace(/on youtube|youtube me|youtube pe|search|dhundo|karo/gi, '').trim();
      return res.json({
        type: 'youtube_search',
        userInput: cleanQ,
        response: `Searching for ${cleanQ} on YouTube.`
      });
    }

    // 2. Open App shortcuts (WhatsApp, Instagram, Spotify, GitHub, ChatGPT, Gmail, Facebook, Calculator)
    if (lowerPrompt.includes("whatsapp") && (lowerPrompt.includes("open") || lowerPrompt.includes("kholo"))) {
      return res.json({ type: 'whatsapp_open', userInput: "WhatsApp", response: "Opening WhatsApp Web." });
    }
    if (lowerPrompt.includes("instagram") && (lowerPrompt.includes("open") || lowerPrompt.includes("kholo"))) {
      return res.json({ type: 'instagram_open', userInput: "Instagram", response: "Opening Instagram." });
    }
    if (lowerPrompt.includes("spotify") && (lowerPrompt.includes("open") || lowerPrompt.includes("kholo") || lowerPrompt.includes("play"))) {
      const q = cleanPrompt.replace(/open|kholo|spotify|pe|gana|songs|play/gi, '').trim();
      return res.json({ type: 'spotify_open', userInput: q || "Spotify", response: "Opening Spotify." });
    }
    if (lowerPrompt.includes("github") && (lowerPrompt.includes("open") || lowerPrompt.includes("kholo"))) {
      return res.json({ type: 'github_open', userInput: "GitHub", response: "Opening GitHub." });
    }
    if (lowerPrompt.includes("chatgpt") && (lowerPrompt.includes("open") || lowerPrompt.includes("kholo"))) {
      return res.json({ type: 'chatgpt_open', userInput: "ChatGPT", response: "Opening ChatGPT." });
    }
    if ((lowerPrompt.includes("gmail") || lowerPrompt.includes("email")) && (lowerPrompt.includes("open") || lowerPrompt.includes("kholo"))) {
      return res.json({ type: 'gmail_open', userInput: "Gmail", response: "Opening Gmail." });
    }
    if (lowerPrompt.includes("facebook") && (lowerPrompt.includes("open") || lowerPrompt.includes("kholo"))) {
      return res.json({ type: 'facebook_open', userInput: "Facebook", response: "Opening Facebook." });
    }
    if (lowerPrompt.includes("calculator") && (lowerPrompt.includes("open") || lowerPrompt.includes("kholo"))) {
      return res.json({ type: 'calculator_open', userInput: "Calculator", response: "Opening Calculator." });
    }

    // AI Understanding via Gemini
    const result = await geminiResponse(cleanPrompt, assistantName, userName);

    let gemResult = null;
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        gemResult = JSON.parse(jsonMatch[0]);
      } catch (parseErr) {
        console.warn("JSON parse error from gemini response:", parseErr);
      }
    }

    if (!gemResult) {
      return res.json({
        type: "general",
        userInput: cleanPrompt,
        response: result ? result.replace(/```json|```/g, "").trim() : "I am here to assist you."
      });
    }

    const type = (gemResult.type || "general").toLowerCase().replace(/-/g, "_");
    const extractedQuery = gemResult.userInput || gemResult.userinput || cleanPrompt;

    switch (type) {
      case 'get_date':
        return res.json({
          type: 'get_date',
          userInput: extractedQuery,
          response: `Today is ${moment().format("dddd, MMMM Do, YYYY")}`
        });

      case 'get_time':
        return res.json({
          type: 'get_time',
          userInput: extractedQuery,
          response: `The current time is ${moment().format("h:mm A")}`
        });

      case 'get_day':
        return res.json({
          type: 'get_day',
          userInput: extractedQuery,
          response: `Today is ${moment().format("dddd")}`
        });

      case 'get_month':
        return res.json({
          type: 'get_month',
          userInput: extractedQuery,
          response: `The current month is ${moment().format("MMMM")}`
        });

      case 'google_search':
        return res.json({
          type: 'google_search',
          userInput: extractedQuery,
          response: gemResult.response || `Searching for ${extractedQuery} on Google`
        });

      case 'youtube_search':
        return res.json({
          type: 'youtube_search',
          userInput: extractedQuery,
          response: gemResult.response || `Searching for ${extractedQuery} on YouTube`
        });

      case 'youtube_play':
        return res.json({
          type: 'youtube_play',
          userInput: extractedQuery,
          response: gemResult.response || `Playing ${extractedQuery} on YouTube`
        });

      case 'whatsapp_open':
        return res.json({
          type: 'whatsapp_open',
          userInput: extractedQuery,
          response: gemResult.response || "Opening WhatsApp"
        });

      case 'instagram_open':
        return res.json({
          type: 'instagram_open',
          userInput: extractedQuery,
          response: gemResult.response || "Opening Instagram"
        });

      case 'facebook_open':
        return res.json({
          type: 'facebook_open',
          userInput: extractedQuery,
          response: gemResult.response || "Opening Facebook"
        });

      case 'spotify_open':
        return res.json({
          type: 'spotify_open',
          userInput: extractedQuery,
          response: gemResult.response || "Opening Spotify"
        });

      case 'github_open':
        return res.json({
          type: 'github_open',
          userInput: extractedQuery,
          response: gemResult.response || "Opening GitHub"
        });

      case 'chatgpt_open':
        return res.json({
          type: 'chatgpt_open',
          userInput: extractedQuery,
          response: gemResult.response || "Opening ChatGPT"
        });

      case 'gmail_open':
        return res.json({
          type: 'gmail_open',
          userInput: extractedQuery,
          response: gemResult.response || "Opening Gmail"
        });

      case 'maps_open':
        return res.json({
          type: 'maps_open',
          userInput: extractedQuery,
          response: gemResult.response || `Opening Google Maps for ${extractedQuery}`
        });

      case 'calculator_open':
        return res.json({
          type: 'calculator_open',
          userInput: extractedQuery,
          response: gemResult.response || "Opening calculator for you"
        });

      case 'weather_show':
        return res.json({
          type: 'weather_show',
          userInput: extractedQuery,
          response: gemResult.response || `Here is the current weather update for ${extractedQuery}`
        });

      case 'general':
      default:
        return res.json({
          type: 'general',
          userInput: extractedQuery,
          response: gemResult.response || "I'm here to assist you."
        });
    }

  } catch (error) {
    console.error("Ask to assistant error:", error);
    return res.status(500).json({ message: "Ask to assistant error", error: error.message });
  }
};