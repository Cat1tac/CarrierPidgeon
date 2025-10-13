import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
    //Check if JWT_SECRET exists
    const {JWT_SECRET} = process.env;
    if (!JWT_SECRET){
        throw new Error("JWT_SECRET is no configured");
    }

    //Create Token for user and check if they are authenticated
    const token = jwt.sign({userId}, JWT_SECRET, {expiresIn: "7"});

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, //7 days in MS
        httpOnly: true, //prevent XSS attacks: cross-stite scripting
        sameSite: "strict", //CSRF attacks
        secure: process.env.NODE_ENV === "development" ? false : true 
    });
    return token;
}