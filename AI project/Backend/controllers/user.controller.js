import User from "../models/user.model.js"

export const getCurrentUser = async(req, res) =>{

    try {
        const userId= req.userId 
        const user= await User.findById(userId).select("-Password")
        if (!user)
        {
            return res.status(400).json({message : "user not Found"})
        }

        return res.status(200).json(user)
    }
    catch (cerror)
    {
        return res.status(400).json({message: "get currnet user error"})
    }

}