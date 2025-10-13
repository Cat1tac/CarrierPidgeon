import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";

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
            generateToken(newUser._id, res);
            await newUser.save();

            //Status 201 means created successfully
            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic,
            })
        } else {
            res.status(400).json({message:"Invalid user data"})
        }
        ///Todo send welcome email to user

    } catch (error) {
        console.log("Error in signup controller: ", error);
        res.status(500).json({message: "Internal Server Error"});
    }
};