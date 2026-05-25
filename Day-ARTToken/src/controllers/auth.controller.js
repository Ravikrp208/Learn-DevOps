
const userModel = require("../models/user.model");
let bcrypt = require("bcrypt");

// ------------------------------ REGISTER CONTROLLER ------------------
let registerController = async (req, res) => {
  let { name , email , password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
     message: "All fields are required" });
  }
 
  let isExisted = await userModel.findOne({ email });
    if (isExisted) {
        return res.status(400).json({
            message: "User with this email already exists"
        });
    }

    if (isExisted) 
        return res.status(409).json({
            message: "User with this email already exists"
        });

        let hashedPassword =bcrypt.hashSync(password, 10);
        let newUser = await userModel.create({
            name,
            email,
            password: hashedPassword
        });




  res.json({ message: "User registered successfully" });
};


// ------------------------------ LOGIN CONTROLLER ------------------
let loginController = async (req, res) => {
  let { email , password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  res.json({ message: "User logged in successfully" });
};

module.exports = {
  registerController,
  loginController
};