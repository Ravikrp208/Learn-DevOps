import User from "../models/user.model.js"
import uploadCloudinary from "../config/cloudinary.js"

export const getCurrentUser = async(req, res) => {
  try {
    const userId = req.userId 
    const user = await User.findById(userId).select("-password")
    if (!user) {
      return res.status(400).json({ message: "User not found" })
    }
    return res.status(200).json(user)
  } catch (error) {
    return res.status(400).json({ message: "Get current user error" })
  }
}

export const updateassistantname = async(req, res) => {
  try {
    const { assistantName, imageUrl, imageurl } = req.body
    let assistantImage;

    if (req.file) {
      assistantImage = await uploadCloudinary(req.file.path)
    } else {
      assistantImage = imageUrl || imageurl
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true }
    ).select("-password")

    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: "Update assistant name error" })
  }
}