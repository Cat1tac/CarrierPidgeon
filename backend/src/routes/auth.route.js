import express from "express";
import { signup, login, logout, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();
//Get retrives data from server and post sends data to the server
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile); //protect route function checks to see if user is authenticated before being able to update their profile

router.get("/check", protectRoute, (req, res) => res.status(200).json(req.user)); //checks if current user is authenticated

export default router;