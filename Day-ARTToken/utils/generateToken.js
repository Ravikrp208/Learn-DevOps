let jwt =  require("jsonwebtoken");

let generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET_KEY, {
     expiresIn: "1h" 
    });

    let refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET_KEY, {
        expiresIn: "1d" 
    });
}