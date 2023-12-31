import express from "express";
import api_access from "./middlewares/api_access";
import BlogController from "./controllers/BlogController";
import MediaController from "./controllers/MediaController";
import dotenv from "dotenv";
import ProxyController from "./controllers/ProxyController";
import { runUserConsumer } from "./events/consumers";

dotenv.config();
const PORT = process.env.PORT || 6000;
const app: express.Application = express();
app.use(api_access);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/",(req:express.Request,res:express.Response)=>{
    return res.status(200).json({
        status:200,
        message:'Welcome to Fimiz Blog API'
    })
})

///// RUN USER CONSUMER FROM KAFKA BROKERS ////////

// runUserConsumer().catch(err =>{
//     console.log("Consumer Error from Server with Id",process.env.SERVER_ID,"=>",err)
// })

//// CONTROLLERS //////
app.use(ProxyController);
app.use(BlogController);
app.use(MediaController);

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
});
