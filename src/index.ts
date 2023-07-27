import express from "express";
import api_access from "./middlewares/api_access";
import BlogPostController from "./controllers/BlogPostController";
import dotenv from "dotenv";

dotenv.config();
let PORT = process.env.PORT || 5000;
const app: express.Application = express();
app.use(api_access);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
BlogPostController(app);

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
});
