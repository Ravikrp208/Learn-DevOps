import "dotenv/config";
import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import Redis from "ioredis";
import  {User} from "./models/user.model.js";



// ------MongoDB connection ---------------------------

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  }
    catch (error) {
    console.error("Error connecting to MongoDB:", error);
    }
};

connectToMongoDB();


// ------Redis connection ---------------------------
const redis = new Redis(process.env.REDIS_URI);
 redis.once("ready", () => {
  console.log("Connected to Redis");
 });

// ------Express server setup ---------------------------
const app = express();
app.use(morgan("dev"));
app.use(express.json());    


// ------API routes ---------------------------

app.post("/users/:id", async (req, res) => {
 try 
 {

    const users = await User.findOne({ _id: req.params.id });
    res.json({
        message: "User fetched successfully",
        data: users,
    });

 }
 catch (error) 
    {

    res.status(500).json({ error: "Error fetching user from MongoDB" });

    }
});


app.post("/users", async (req, res) => {
    try {
        const  newUser = new User(req.body);
        await newUser.save();
        res.json({
            message: "User created successfully",
            data: newUser,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Error creating user in MongoDB" });
    }
});


// ------Start the server ---------------------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
