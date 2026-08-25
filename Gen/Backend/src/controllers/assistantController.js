import User from "../models/User.js";
import geminiResponse from "../utils/gemini.js";

// @desc    Get assistant configurations and chat history
// @route   GET /api/assistant/me
// @access  Private
export const getAssistant = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({
      assistantName: user.assistantName || "Shifra",
      assistantImage: user.assistantImage || "",
      history: user.history || []
    });
  } catch (error) {
    console.error("Get assistant details error:", error);
    return res.status(500).json({ message: "Failed to get assistant details" });
  }
};

// @desc    Update assistant name and image avatar
// @route   POST /api/assistant/update
// @access  Private
export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, assistantImage, imageUrl } = req.body;
    const finalImage = assistantImage || imageUrl;

    const updateFields = {};
    if (assistantName && assistantName.trim()) {
      updateFields.assistantName = assistantName.trim();
    }
    if (finalImage) {
      updateFields.assistantImage = finalImage;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Assistant updated successfully",
      assistantName: user.assistantName,
      assistantImage: user.assistantImage
    });
  } catch (error) {
    console.error("Update assistant error:", error);
    return res.status(500).json({ message: "Failed to update assistant" });
  }
};

// @desc    Clear assistant chat history
// @route   POST /api/assistant/clear-history
// @access  Private
export const clearHistory = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { history: [] } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "Chat history cleared successfully", history: [] });
  } catch (error) {
    console.error("Clear history error:", error);
    return res.status(500).json({ message: "Failed to clear chat history" });
  }
};

// @desc    Query the assistant
// @route   POST /api/assistant/ask
// @access  Private
export const askToAssistant = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.toString().trim()) {
      return res.status(400).json({ message: "Please provide a query or command." });
    }

    const cleanPrompt = prompt.toString().trim();
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userName = user.name || "User";
    const assistantName = user.assistantName || "Shifra";

    // Helper function to save to history and send response
    const sendAndSave = async (type, userInput, responseText) => {
      const historyEntry = {
        prompt: cleanPrompt,
        response: responseText,
        type: type,
        userInput: userInput,
        createdAt: new Date()
      };

      try {
        await User.findByIdAndUpdate(req.user._id, {
          $push: {
            history: {
              $each: [historyEntry],
              $slice: -100 // Keep only last 100 entries
            }
          }
        });
      } catch (err) {
        console.error("Failed to save chat history:", err);
      }

      return res.json({
        type,
        userInput,
        response: responseText,
        historyEntry
      });
    };

    // Fast-path local patterns
    const lowerPrompt = cleanPrompt.toLowerCase();

    // Identity queries
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

    // App action quick matches
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

    // Call Gemini for general/flexible responses
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
    const dateObj = new Date();

    switch (type) {
      case 'get_date':
        return sendAndSave('get_date', extractedQuery, `Today is ${dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);

      case 'get_time':
        return sendAndSave('get_time', extractedQuery, `The current time is ${dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`);

      case 'get_day':
        return sendAndSave('get_day', extractedQuery, `Today is ${dateObj.toLocaleDateString(undefined, { weekday: 'long' })}`);

      case 'get_month':
        return sendAndSave('get_month', extractedQuery, `The current month is ${dateObj.toLocaleDateString(undefined, { month: 'long' })}`);

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
    return res.status(500).json({ message: "Failed to query assistant", error: error.message });
  }
};
