import express, { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword } from "../utils/password";
import generateToken from "../utils/authHandler";
import { sendEmail } from "../utils/sendMail";
import generateOtp from "../utils/generateOtp";

const prisma = new PrismaClient();

export const register/*: express.RequestHandler*/ = async (req: Request, res: Response) => {
    try {
        const { email, username, fullname, password} = req.body;

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
                fullname: fullname
            }
        });

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
            success: true
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

export const login = async (req: Request, res: Response) => {
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

        const isPasswordCorrect = verifyPassword(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Invalid User password",
                success: false
            });
        }

        const { accessToken, refreshToken } = generateToken({ id: user.id, email: user.email, username: user.username });

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
            fullname: user.fullname
        };

        res.cookie('access-token', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 //15 minutes
        });
        res.cookie('refresh-token', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
        });

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