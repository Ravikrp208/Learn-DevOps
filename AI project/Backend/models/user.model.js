import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    assistantName: {
      type: String,
      required: true,
    },

    assistantImage: {
      type: String,
      default: "",
    },

    history: [
      {
        prompt: { type: String, default: "" },
        response: { type: String, default: "" },
        type: { type: String, default: "general" },
        userInput: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
