import express, { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword } from "../utils/password";
import generateToken from "../utils/authHandler";
import { sendEmail } from "../utils/sendMail";
import generateOtp from "../utils/generateOtp";
import crypto from "crypto";
import getDataUri from "../utils/getDataUri";
import cloudinary from "../config/cloudinary.config";
import { loginSchema, registerSchema } from "../schema/schema";

const prisma = new PrismaClient();

export const register/*: express.RequestHandler*/ = async (req: Request, res: Response) => {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({
            success: false,
            message: "input validation error",
            error: result.error.issues
        });
        return;
    }
    try {
        const { email, username, fullname, password} = req.body;
        const file = req.file;
        let profilePicture = null;

        if (file) {
            const fileUri = getDataUri(file);
            if (!fileUri.content) {
                return res.status(400).json({
                    message: "Invalid file content",
                    success: false
                });
            }
            const cloudRes = await cloudinary.uploader.upload(fileUri.content);
            profilePicture = cloudRes.secure_url;
        }

        const isUsernameExists = await prisma.user.findFirst({
            where: {
                username: username
            }
        });

        if (isUsernameExists) {
            return res.status(400).json({
                message: "User with username already exists",
                success: false
            });
        }
        const isEmailExists = await prisma.user.findFirst({
            where: {
                email: email
            }
        });

        if (isEmailExists) {
            return res.status(400).json({
                message: "User with email already exists",
                success: false
            });
        }

        const hashedPassword = hashPassword(password);
        console.log(`password is ${hashedPassword}`);

        const user = await prisma.user.create({
            data: {
                email: email,
                username: username,
                password: hashedPassword,
                fullname: fullname,
                profilePicture: profilePicture
            }
        });
        console.log(`Profile Picture ${profilePicture}`)

        //sending verification email
        const verificationLink = `${process.env.EMAIL_VERIFICATION_LINK}?userId=${user.id}`;

        const otp = generateOtp();

        sendEmail({
            to: user?.email,
            subject: 'Welcome to my website',
            text: `Welcome ${user.fullname} to my website`,
            html: `<b>Please Verify your email using the otp ${otp} ny clicking this link : <a href="${verificationLink}">Verify Email</a></b>`
        });

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                otp: otp
            }
        })

        return res.status(201).json({
            message: "User registered successfully",
            success: true,
            userId: user.id
        });
    } catch (error: any) {
        console.log(`Error: ${error}`);
        return res.status(500).json({
            message: "Internal Server error",
            error: error.message,
            success: false
        });
    };
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const otp = req.body.otp as number;
        const userId = req.body.userId;

        if (!otp) {
            return res.status(400).json({
                message: "OTP is required",
                success: false
            });
        }
        if (!userId) {
            return res.status(400).json({
                message: "User ID is required",
                success: false
            });
        }

        const user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        });

        if (!user) {
            return res.status(400).json({
                message: "User is not present",
                success: false
            });
        }

        if (user.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP",
                success: false
            });
        }

        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                isEmailVerified: true
            }
        });

        return res.status(200).json({
            message: "Email verified successfully",
            success: true
        });
    } catch (error: any) {
        console.log(`Error: ${error}`);
        return res.status(500).json({
            message: "Internal Server error",
            error: error.message,
            success: false
        });
    }
}

export const login = async (req: Request, res: Response) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({
            success: false,
            message: "input validation error",
            error: result.error.issues
        });
        return;
    }
    try {
        const { username, password } = req.body;

        const user = await prisma.user.findFirst({
            where: {
                username: username
            }
        });

        if (!user) {
            return res.status(400).json({
                message: "User does not exists",
                success: false
            });
        }

        const isPasswordCorrect = verifyPassword(password, user.password as string);

        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid User password",
                success: false
            });
        }


        const { accessToken, refreshToken } = generateToken({ id: user.id, email: user.email, username: user.username as string });

        await prisma.user.update({
            where: { 
                id: user.id 
            },
            data: { 
                refreshToken: refreshToken
            }
        });

        const userWithoutPassword = {
            id: user.id,
            username: user.username,
            email: user.email,
            fullname: user.fullname,
            profilepicture: user.profilePicture,
            isEmailVerified: user.isEmailVerified
        };

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000 //15 minutes
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
        });

        console.log(`${refreshToken} ${accessToken}`)

        return res.status(200).json({
            message: "User logged in",
            success: true,
            user: userWithoutPassword
        });
    } catch (error: any) {
        console.log(`Error: ${error}`);
        return res.status(500).json({
            message: "Internal Server error",
            error: error.message,
            success: false
        });
    }
}

export const logout = async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;

    if (!token) {
        return res.status(200).json({
            message: "No token present",
            success: false
        });
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                refreshToken: token
            }
        });

        if (!user) {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                sameSite: 'strict',
                secure: true
            });

            return res.status(200).json({
                message: "No user present",
                success: false
            });
        }

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                refreshToken: null
            }
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: 'strict',
            secure: true
        });

        return res.status(200).json({
            message: "User logged out successfully",
            success: true
        });
    } catch (error: any) {
        console.log(`Error: ${error}`);
        return res.status(500).json({
            message: "Internal Server error",
            error: error.message,
            success: false
        });
    }
}

//login via OTP
export const sendOtp = async (req: Request, res: Response) => {
    try {
        const email = req.body.email;

        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        });

        if (!user) {
            return res.status(400).json({
                message: "User does not exists",
                success: false
            });
        }

        const otp = generateOtp();

        sendEmail({
            to: user?.email,
            subject: 'OTP for login',
            text: `Welcome ${user.fullname} to my website`,
            html: `Your otp login is ${otp}`
        });

        await prisma.oTP.create({
            data: {
                userId: user.id,
                code: otp,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            },
        });

        return res.status(200).json({
            message: "OTP sent",
            success: true
        });
    } catch (error: any) {
        console.log(`Error: ${error}`);
        return res.status(500).json({
            message: "Internal Server error",
            error: error.message,
            success: false
        });
    }
}

export const verifyOtp = async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    try {
        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        });
    
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
    
        const validOtp = await prisma.oTP.findFirst({
            where: {
                userId: user.id,
                code: otp,
                expiresAt: { gt: new Date() },
            },
        });
    
        if (!validOtp) {
            return res.status(400).json({ 
                message: "Invalid or expired OTP" 
            });
        }
    
        await prisma.oTP.deleteMany({
            where: { 
                userId: user.id
            },
        });
        
        const { accessToken, refreshToken } = generateToken({ id: user.id, email: user.email, username: user.username as string });
        
        await prisma.user.update({
            where: { 
                id: user.id 
            },
            data: { 
                refreshToken 
            },
        });
        
        res.cookie("accessToken", accessToken, { 
            httpOnly: true, 
            secure: true, 
            sameSite: "strict" 
        });
    
        res.cookie("refreshToken", refreshToken, { 
            httpOnly: true,     
            secure: true, 
            sameSite: "strict" 
        });
    
        const userWithoutPassword = {
            id: user.id,
            username: user.username,
            email: user.email,
            fullname: user.fullname,
            profilepicture: user.profilePicture,
            isEmailVerified: user.isEmailVerified
        };
        
        return res.status(200).json({ 
            message: "User logged in successfully",
            success: true,
            user: userWithoutPassword 
        });
    } catch (error: any) {
        console.log(`Error: ${error}`);
        return res.status(500).json({
            message: "Internal Server error",
            error: error.message,
            success: false
        });
    }
};

export const getUser = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.userId) || Number(req.params.userId);

        if (isNaN(userId)) {
            return res.status(400).json({
                message: "Cannot fetch user",
                success: false
            })
        }
        
        if (!userId) {
            return res.status(400).json({
                message: "User ID is required",
                success: false
            })
        }

        const user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        });

        if (!user) {
            return res.status(400).json({
                message: "User does not exists",
                success: false
            });
        }

        const userWithoutPassword = {
            id: user.id,
            username: user.username,
            email: user.email,
            fullname: user.fullname,
            profilepicture: user.profilePicture,
            isEmailVerified: user.isEmailVerified
        };

        return res.status(200).json({
            message: "User fetched successfully",
            success: true,
            user: userWithoutPassword
        });
    } catch (error: any) {
        console.log(`Error: ${error}`);
        return res.status(500).json({
            message: "Internal Server error",
            error: error.message,
            success: false
        });
    }
}

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ 
                message: "Email is required",
                success: false 
            });
        }

        const user = await prisma.user.findUnique({ 
            where: { 
                email : email
            } 
        });

        if (!user) {
            return res.status(404).json({ 
                message: "User not found",
                success: false 
            });
        }

        // generating secure token
        const token = crypto.randomBytes(32).toString("hex");
        const expiry = new Date(Date.now() + 1000 * 60 * 15); // 15 mins

        await prisma.user.update({
            where: { email },
            data: {
                resetPasswordToken: token,
                resetTokenExpiry: expiry,
            },
        });

        const resetLink = `${process.env.RESET_PASSWORD_LINK}?token=${token}`;

        sendEmail({
            to: user?.email,
            subject: 'Reset Password',
            text: `Hello, ${user.fullname}`,
            html: `<b>Click this link to reset the password : <a href="${resetLink}">Reset Password</a></b>`
        });

        res.status(200).json({ 
            message: "Password reset link sent to your email",
            success: true 
        });
    } catch (error: any) {
        console.log(`Error: ${error}`);
        return res.status(500).json({
            message: "Internal Server error",
            error: error.message,
            success: false
        });
    }
}

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ 
                message: "Token and new password are required",
                success: false 
            });
        }

        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetTokenExpiry: {
                    gte: new Date(),
                },
            },
        });

        if (!user) {
            return res.status(400).json({ 
                message: "Invalid or expired token",
                success: false
            });
        }

        const hashedPassword = hashPassword(newPassword);

        await prisma.user.update({
            where: { 
                id: user.id 
            },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetTokenExpiry: null,
            },
        });

        res.status(200).json({ 
            message: "Password has been reset successfully",
            success: true
        });
    } 
    catch (error: any) {
        console.log(`Error: ${error}`);
        return res.status(500).json({
            message: "Internal Server error",
            error: error.message,
            success: false
        });
    }
}