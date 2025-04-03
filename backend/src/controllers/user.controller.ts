import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../utils/password";

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

        await prisma.user.create({
            data: {
                email: email,
                username: username,
                password: hashedPassword,
                fullname: fullname
            }
        });

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