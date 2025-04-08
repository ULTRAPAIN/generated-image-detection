import express from "express";
import { signup } from "../controllers/auth.contoller.js";
import { login } from "../controllers/auth.contoller.js";
import { logout } from "../controllers/auth.contoller.js";
import {verifyEmail} from "../controllers/auth.contoller.js";
import {forgotPassword} from "../controllers/auth.contoller.js";
import {resetPassword} from "../controllers/auth.contoller.js";
import {checkAuth} from "../controllers/auth.contoller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router= express.Router();

router.get("/check-auth",verifyToken,checkAuth)
router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)
router.post("/verify-email",verifyEmail)
router.post("/forgot-password",forgotPassword);
router.post("/reset-password/:token",resetPassword);

export default router;