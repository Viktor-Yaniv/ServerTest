import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import UserRoute from "./routes/UserRoute.js";
import PostRoute from "./routes/PostRoute.js";
import ChatBoxRoute from "./routes/ChatBoxRoute.js";
import CommentRoute from "./routes/CommentRoute.js";
import MessagesRoute from "./routes/MessagesRoute.js";
import cookieParser from 'cookie-parser';
import bodyParser from "body-parser"; 




import 'dotenv/config'
const port = process.env.PORT;
const jwt_key = process.env.JWT_KEY;
const db_link = process.env.DB;




const app = express();

app.use(express.static('uploads/'));
mongoose.connect(db_link,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;

db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Database Connected...'));
app.use(express.json()); 
app.use(cookieParser())
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(UserRoute);
app.use(PostRoute);
app.use(ChatBoxRoute);
app.use(CommentRoute);
app.use(MessagesRoute);





 
app.listen(port, ()=> console.log('Server up and running...'));