import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandler.js";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    const {fullName, email, password} = req.body;

    try {
        //If theres not name, email, or pass return error
        if(!fullName || !email || !password){
            return res.status(400).json({message:"All fields are required"});
        }
        //If pass is too short reutrn error
        if(password.length < 6) {
            return res.status(400).json({message:"Password should be at least 6 characters"});
        }
        //check if email is valid
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)){
            return res.status(400).json({message:"Invalid email format"});
        }
        
        //If user exists return error
        const user = await User.findOne({email});
        if (user) return res.status(400).json({messages:"Email already exists"});

        //if user does not exist hash password
        const salt = await bcrypt.genSalt(10); //determines how long hashed string will be
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        if(newUser) {
            //save user to database then generate the token
            const savedUser = await newUser.save();
            generateToken(savedUser._id, res);

            //Status 201 means created successfully
            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic,
            });

            //Send email 
            console.log(savedUser.email);
            try {
                await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);
            } catch (error) {
                console.error("Failed to send welcome email:", error);
            }
        } else {
            res.status(400).json({message:"Invalid user data"})
        }

    } catch (error) {
        console.log("Error in signup controller: ", error);
        res.status(500).json({message: "Internal Server Error"});
    }
};

export const login = async (req, res) => {
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({ message: "Email and password are required"});
    }

    try {
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message: "Invalid Credentials"});
        //Never tell client which is incorrect: password or email
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) return res.status(400).json({message:"Invalid Credentials"});

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.error("Error in login controller:", error);
        res.status(500).json({ message: "Internal server error"});
    }
}

export const logout = (_, res) => {
    res.cookie("jwt", "", ({maxAge: 0}));
    res.status(200).json({message: "Logged out successfully"});
}

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        if(!profilePic) return res.status(400).json({message: "Profile pic is required"});

        const userId = req.user._id;

        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            {profilePic:uploadResponse.secure_url}, 
            {new:true}
        ).select("-password");

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in update profile:", error);
        res.status(500).json({message: "Internal server error"});
    }
}