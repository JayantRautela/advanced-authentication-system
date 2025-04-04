import jwt from "jsonwebtoken";

interface Data {
    id: number;
    username: string;
    email: string;
}

interface GeneratedToken {
    accessToken: string;
    refreshToken: string;
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';

const generateToken = (data: Data): GeneratedToken => {
    const accessToken = jwt.sign(data, ACCESS_TOKEN_SECRET, {
        expiresIn: '15m',
    });
    
    const refreshToken = jwt.sign(data, REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
    });

    return { accessToken, refreshToken };
}

export default generateToken