import { z } from "zod";

export const registerSchema = z.object({
    fullname: z.string({
        required_error: "full name is required"
    }),
    email: z.string({
        required_error: "email is required"
    }).email("Not a valid email"),
    password: z.string({
        required_error: "password is required"
    }).min(6, "password must be of atleast 6 characters.").max(12, "password must not be long than 12 characters"),
    username: z.string({
        required_error: "username is required."
    }).min(5, "username must contain atleast 5 characters").max(12, "username must not be long than 12 characters")
});

export const loginSchema = z.object({
    username: z.string({
        required_error: "username is required."
    }).min(5, "username must contain atleast 5 characters").max(12, "username must not be long than 12 characters"),
    password: z.string({
        required_error: "password is required"
    }).min(6, "password must be of atleast 6 characters.").max(12, "password must not be long than 12 characters"),
})