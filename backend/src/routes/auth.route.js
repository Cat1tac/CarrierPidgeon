import express from "express";
import { signup, login, logout } from "../controllers/auth.controller.js";

const router = express.Router();
//Get retrives data from server and post sends data to the server
router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

export default router;