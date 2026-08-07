import User from "../models/user.model.js"
import uploadCloudinary from "../config/cloudinary.js"

export const getCurrentUser = async(req, res) => {
  try {
    const userId = req.userId 
    const user = await User.findById(userId).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    return res.status(200).json(user)
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ message: "Get current user error" })
  }
}

export const updateassistantname = async(req, res) => {
  try {
    const { assistantName, imageUrl, imageurl } = req.body
    let assistantImage;

    if (req.file) {
      const cloudUrl = await uploadCloudinary(req.file.path)
      if (cloudUrl) {
        assistantImage = cloudUrl
      } else {
        // Fallback to local server URL if Cloudinary fails or has invalid credentials
        assistantImage = `http://localhost:8000/${req.file.filename}`
      }
    } else if (imageUrl || imageurl) {
      assistantImage = imageUrl || imageurl
    }

    const updateFields = {}
    if (assistantName && assistantName.trim()) {
      updateFields.assistantName = assistantName.trim()
    }
    if (assistantImage) {
      updateFields.assistantImage = assistantImage
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateFields,
      { returnDocument: 'after' }
    ).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Update assistant error:", error);
    return res.status(500).json({ message: error.message || "Update assistant error" })
  }
}