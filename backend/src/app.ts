import express, { Express } from "express";
import UserRouter from "./routes/user.route";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

const app: Express = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/users', UserRouter);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server started at port ${port}`);
});
