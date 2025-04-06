import express from "express";
import { login, logout, register } from "../controllers/user.controller";

const router = express.Router();

router.post('/register', register as unknown as  express.RequestHandler);
router.post('/login', login as unknown as express.RequestHandler);
router.post('/logout', logout as unknown as express.RequestHandler);

export default router;