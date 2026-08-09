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
    const user = await User.findById(req.userId);
    const userName = user?.name || "User";
    const assistantName = user?.assistantName || "Shifra";

    const result = await geminiResponse(prompt, assistantName, userName);

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(400).json({ message: "sorry , i cant understand you ?" });
    }

    let gemResult;
    try {
      gemResult = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      return res.status(400).json({ message: "Invalid JSON response from AI model." });
    }

    const type = gemResult.type;

    switch (type) {
      case 'get_date':
      case 'get-date':
        return res.json({
          type,
          userInput: gemResult.userInput || gemResult.userinput || prompt,
          response: `today is ${moment().format("MMMM Do YYYY")}`
        });

      case 'get_time':
      case 'get-time':
        return res.json({
          type,
          userInput: gemResult.userInput || gemResult.userinput || prompt,
          response: `current time is ${moment().format("h:mm A")}`
        });

      case 'get_day':
      case 'get-day':
        return res.json({
          type,
          userInput: gemResult.userInput || gemResult.userinput || prompt,
          response: `today is ${moment().format("dddd")}`
        });

      case 'get_month':
      case 'get-month':
        return res.json({
          type,
          userInput: gemResult.userInput || gemResult.userinput || prompt,
          response: `current month is ${moment().format("MMMM")}`
        });

      case 'google_search':
      case 'google-search':
      case 'youtube_search':
      case 'youtube-search':
      case 'youtube_play':
      case 'youtube-play':
      case 'general':
      case 'calculator_open':
      case 'calculator-open':
      case 'instagram_open':
      case 'instagram-open':
      case 'facebook_open':
      case 'facebook-open':
      case 'weather-show':
      case 'weather_show':
        return res.json({
          type,
          userInput: gemResult.userInput || gemResult.userinput || prompt,
          response: gemResult.response
        });

      default:
        return res.status(400).json({ response: "I can't understand you" });
    }

  } catch (error) {
    console.error("Ask to assistant error:", error);
    return res.status(500).json({ message: "Ask to assistant error" });
  }
};