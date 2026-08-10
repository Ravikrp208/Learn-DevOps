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

    const type = (gemResult.type || "general").toLowerCase().replace(/_/g, "-");
    const extractedQuery = gemResult.userInput || gemResult.userinput || cleanPrompt;

    switch (type) {
      case 'get-date':
        return res.json({
          type: 'get_date',
          userInput: extractedQuery,
          response: `Today is ${moment().format("dddd, MMMM Do, YYYY")}`
        });

      case 'get-time':
        return res.json({
          type: 'get_time',
          userInput: extractedQuery,
          response: `The current time is ${moment().format("h:mm A")}`
        });

      case 'get-day':
        return res.json({
          type: 'get_day',
          userInput: extractedQuery,
          response: `Today is ${moment().format("dddd")}`
        });

      case 'get-month':
        return res.json({
          type: 'get_month',
          userInput: extractedQuery,
          response: `The current month is ${moment().format("MMMM")}`
        });

      case 'google-search':
        return res.json({
          type: 'google_search',
          userInput: extractedQuery,
          response: gemResult.response || `Searching for ${extractedQuery} on Google`
        });

      case 'youtube-search':
        return res.json({
          type: 'youtube_search',
          userInput: extractedQuery,
          response: gemResult.response || `Searching for ${extractedQuery} on YouTube`
        });

      case 'youtube-play':
        return res.json({
          type: 'youtube_play',
          userInput: extractedQuery,
          response: gemResult.response || `Playing ${extractedQuery} on YouTube`
        });

      case 'calculator-open':
        return res.json({
          type: 'calculator_open',
          userInput: extractedQuery,
          response: gemResult.response || "Opening calculator for you"
        });

      case 'instagram-open':
        return res.json({
          type: 'instagram_open',
          userInput: extractedQuery,
          response: gemResult.response || "Opening Instagram"
        });

      case 'facebook-open':
        return res.json({
          type: 'facebook_open',
          userInput: extractedQuery,
          response: gemResult.response || "Opening Facebook"
        });

      case 'weather-show':
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