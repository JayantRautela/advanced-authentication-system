import express from "express";
import { login, logout, register, sendOtp, verifyOtp } from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";

const router = express.Router();

router.post('/register', register as unknown as  express.RequestHandler);
router.post('/login', login as unknown as express.RequestHandler);
router.post('/logout', isAuthenticated as unknown as express.RequestHandler, logout as unknown as express.RequestHandler);
router.post('/sendOtp', sendOtp as unknown as express.RequestHandler);
router.post('/verifyOtp', verifyOtp as unknown as express.RequestHandler);

export default router;