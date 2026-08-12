import User from "../models/user.model.js";
import imagekit, { uploadImageKit } from "../config/imagekit.js";
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
      // 1. Primary: Upload image via ImageKit
      const ikUrl = await uploadImageKit(req.file.path, req.file.filename || req.file.originalname);
      
      if (ikUrl) {
        assistantImage = ikUrl;
      } else {
        // 2. Fallback: Cloudinary
        const cloudUrl = await uploadCloudinary(req.file.path);
        if (cloudUrl) {
          assistantImage = cloudUrl;
        } else {
          // 3. Fallback: Local Server Static File URL
          const host = req.headers.host || "localhost:8000";
          assistantImage = `http://${host}/${req.file.filename}`;
        }
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

    return res.status(200).json(user);
  } catch (error) {
    console.error("Update assistant error:", error);
    return res.status(500).json({ message: error.message || "Update assistant error" });
  }
};

export const getImageKitAuth = (req, res) => {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return res.status(200).json(authenticationParameters);
  } catch (error) {
    console.error("ImageKit auth error:", error);
    return res.status(500).json({ message: "Failed to generate ImageKit auth params" });
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

    // Helper to save to user history and send response
    const sendAndSave = async (type, userInput, responseText) => {
      const historyEntry = {
        prompt: cleanPrompt,
        response: responseText,
        type: type,
        userInput: userInput,
        createdAt: new Date()
      };

      try {
        if (req.userId) {
          await User.findByIdAndUpdate(req.userId, {
            $push: {
              history: {
                $each: [historyEntry],
                $slice: -100 // keep last 100 entries
              }
            }
          });
        }
      } catch (err) {
        console.error("Save chat history error:", err);
      }

      return res.json({
        type,
        userInput,
        response: responseText,
        historyEntry
      });
    };

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
      return sendAndSave("general", cleanPrompt, "I am a virtual assistant created by Ravi BaBy.");
    }

    if (
      lowerPrompt === "who are you" ||
      lowerPrompt === "who are you?" ||
      lowerPrompt === "tum kaun ho" ||
      lowerPrompt === "aap kaun ho" ||
      lowerPrompt === "introduce yourself" ||
      lowerPrompt === "tell me about yourself"
    ) {
      return sendAndSave("general", cleanPrompt, `I am ${assistantName}, a virtual assistant created by Ravi BaBy.`);
    }

    // Fast pattern matching for popular voice/text commands
    // 1. YouTube Play / Search
    if (/^(play|bajao|chalao)\s+(.+?)\s*(on youtube|pe)?$/i.test(lowerPrompt) || /^youtube\s+(pe|me)?\s*(.+?)\s*(bajao|chalao|play)$/i.test(lowerPrompt)) {
      const match = lowerPrompt.match(/(?:play|bajao|chalao)\s+(.+?)(?:\s+(?:on youtube|pe))?$/i) || lowerPrompt.match(/^youtube\s+(?:pe|me)?\s*(.+?)\s*(?:bajao|chalao|play)$/i);
      const song = match?.[1]?.replace(/on youtube|pe|me|play|bajao|chalao/gi, '').trim() || cleanPrompt;
      return sendAndSave('youtube_play', song, `Playing ${song} on YouTube.`);
    }

    if (/^(search|dhundo)\s+(.+?)\s*(on youtube|youtube me|youtube pe)$/i.test(lowerPrompt) || /^youtube\s+(me|pe)?\s*(search karo|dhundo)\s+(.+)$/i.test(lowerPrompt)) {
      const match = lowerPrompt.match(/(?:search|dhundo)\s+(.+?)(?:\s+(?:on youtube|youtube me|youtube pe))?$/i) || lowerPrompt.match(/youtube\s+(?:me|pe)?\s*(?:search karo|dhundo)\s+(.+)$/i);
      const query = match?.[1] || match?.[2] || cleanPrompt;
      const cleanQ = query.replace(/on youtube|youtube me|youtube pe|search|dhundo|karo/gi, '').trim();
      return sendAndSave('youtube_search', cleanQ, `Searching for ${cleanQ} on YouTube.`);
    }

    // 2. Open App shortcuts
    if (lowerPrompt.includes("whatsapp") && (lowerPrompt.includes("open") || lowerPrompt.includes("kholo"))) {
      return sendAndSave('whatsapp_open', "WhatsApp", "Opening WhatsApp Web.");
    }
    if (lowerPrompt.includes("instagram") && (lowerPrompt.includes("open") || lowerPrompt.includes("kholo"))) {
      return sendAndSave('instagram_open', "Instagram", "Opening Instagram.");
    }
    if (lowerPrompt.includes("spotify") && (lowerPrompt.includes("open") || lowerPrompt.includes("kholo") || lowerPrompt.includes("play"))) {
      const q = cleanPrompt.replace(/open|kholo|spotify|pe|gana|songs|play/gi, '').trim();
      return sendAndSave('spotify_open', q || "Spotify", "Opening Spotify.");
    }
    if (lowerPrompt.includes("github") && (lowerPrompt.includes("open") || lowerPrompt.includes("kholo"))) {
      return sendAndSave('github_open', "GitHub", "Opening GitHub.");
    }
    if (lowerPrompt.includes("chatgpt") && (lowerPrompt.includes("open") || lowerPrompt.includes("kholo"))) {
      return sendAndSave('chatgpt_open', "ChatGPT", "Opening ChatGPT.");
    }
    if ((lowerPrompt.includes("gmail") || lowerPrompt.includes("email")) && (lowerPrompt.includes("open") || lowerPrompt.includes("kholo"))) {
      return sendAndSave('gmail_open', "Gmail", "Opening Gmail.");
    }
    if (lowerPrompt.includes("facebook") && (lowerPrompt.includes("open") || lowerPrompt.includes("kholo"))) {
      return sendAndSave('facebook_open', "Facebook", "Opening Facebook.");
    }
    if (lowerPrompt.includes("calculator") && (lowerPrompt.includes("open") || lowerPrompt.includes("kholo"))) {
      return sendAndSave('calculator_open', "Calculator", "Opening Calculator.");
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
      const fallbackAns = result ? result.replace(/```json|```/g, "").trim() : "I am here to assist you.";
      return sendAndSave("general", cleanPrompt, fallbackAns);
    }

    const type = (gemResult.type || "general").toLowerCase().replace(/-/g, "_");
    const extractedQuery = gemResult.userInput || gemResult.userinput || cleanPrompt;

    switch (type) {
      case 'get_date':
        return sendAndSave('get_date', extractedQuery, `Today is ${moment().format("dddd, MMMM Do, YYYY")}`);

      case 'get_time':
        return sendAndSave('get_time', extractedQuery, `The current time is ${moment().format("h:mm A")}`);

      case 'get_day':
        return sendAndSave('get_day', extractedQuery, `Today is ${moment().format("dddd")}`);

      case 'get_month':
        return sendAndSave('get_month', extractedQuery, `The current month is ${moment().format("MMMM")}`);

      case 'google_search':
        return sendAndSave('google_search', extractedQuery, gemResult.response || `Searching for ${extractedQuery} on Google`);

      case 'youtube_search':
        return sendAndSave('youtube_search', extractedQuery, gemResult.response || `Searching for ${extractedQuery} on YouTube`);

      case 'youtube_play':
        return sendAndSave('youtube_play', extractedQuery, gemResult.response || `Playing ${extractedQuery} on YouTube`);

      case 'whatsapp_open':
        return sendAndSave('whatsapp_open', extractedQuery, gemResult.response || "Opening WhatsApp");

      case 'instagram_open':
        return sendAndSave('instagram_open', extractedQuery, gemResult.response || "Opening Instagram");

      case 'facebook_open':
        return sendAndSave('facebook_open', extractedQuery, gemResult.response || "Opening Facebook");

      case 'spotify_open':
        return sendAndSave('spotify_open', extractedQuery, gemResult.response || "Opening Spotify");

      case 'github_open':
        return sendAndSave('github_open', extractedQuery, gemResult.response || "Opening GitHub");

      case 'chatgpt_open':
        return sendAndSave('chatgpt_open', extractedQuery, gemResult.response || "Opening ChatGPT");

      case 'gmail_open':
        return sendAndSave('gmail_open', extractedQuery, gemResult.response || "Opening Gmail");

      case 'maps_open':
        return sendAndSave('maps_open', extractedQuery, gemResult.response || `Opening Google Maps for ${extractedQuery}`);

      case 'calculator_open':
        return sendAndSave('calculator_open', extractedQuery, gemResult.response || "Opening calculator for you");

      case 'weather_show':
        return sendAndSave('weather_show', extractedQuery, gemResult.response || `Here is the current weather update for ${extractedQuery}`);

      case 'general':
      default:
        return sendAndSave('general', extractedQuery, gemResult.response || "I'm here to assist you.");
    }

  } catch (error) {
    console.error("Ask to assistant error:", error);
    return res.status(500).json({ message: "Ask to assistant error", error: error.message });
  }
};

export const clearHistory = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { $set: { history: [] } });
    return res.status(200).json({ message: "Chat history cleared successfully" });
  } catch (error) {
    console.error("Clear history error:", error);
    return res.status(500).json({ message: "Failed to clear history" });
  }
};