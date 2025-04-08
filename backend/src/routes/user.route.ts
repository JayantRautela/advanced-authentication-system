import express from "express";
import { login, logout, register, sendOtp, verifyEmail, verifyOtp, getUser } from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { singleUpload } from "../middleware/multer.middleware";

const router = express.Router();


router.post('/register', singleUpload, register as unknown as  express.RequestHandler);
router.post('/verify-email/:userId', verifyEmail as unknown as express.RequestHandler);
router.post('/login', login as unknown as express.RequestHandler);
router.post('/logout', isAuthenticated as unknown as express.RequestHandler, logout as unknown as express.RequestHandler);
router.post('/sendOtp', sendOtp as unknown as express.RequestHandler);
router.post('/verifyOtp', verifyOtp as unknown as express.RequestHandler);
router.get('/getUser/:userId', getUser as unknown as express.RequestHandler);

export default router;