import express from "express";
import { login, logout, register, sendOtp, verifyOtp } from "../controllers/user.controller";

const router = express.Router();

router.post('/register', register as unknown as  express.RequestHandler);
router.post('/login', login as unknown as express.RequestHandler);
router.post('/logout', logout as unknown as express.RequestHandler);
router.post('/sendOtp', sendOtp as unknown as express.RequestHandler);
router.post('/verifyOtp', verifyOtp as unknown as express.RequestHandler);

export default router;