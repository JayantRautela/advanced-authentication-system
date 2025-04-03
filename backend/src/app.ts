import express, { Express } from "express";
import UserRouter from "./routes/user.route";

const app: Express = express();

app.use(express.json());

app.use('/api/v1/users', UserRouter);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server started at port ${port}`);
});
