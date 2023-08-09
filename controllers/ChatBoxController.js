import Comment from '../models/CommentModel.js'
import ChatBox from '../models/ChatModel.js'
import User from '../models/UserModel.js'
import 'dotenv/config'
import jwt from 'jsonwebtoken';

const jwt_key = process.env.JWT_KEY;

export const addMessage = async (req, res) => {
    try {
      const { content, timestamp } = req.body;
      const token = req.headers.authorization;
  
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
  
      if (!content) {
        return res.status(400).json({ message: "Empty comment" });
      }
  
      const decoded = jwt.verify(token, jwt_key);
      const author = decoded.id;
  
      const message = new ChatBox({
        message: content,
        user: author,
        timestamp: timestamp,
      });
  
      await message.save();
  
      res.json(message);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  };
  

export const getMessages = async (req, res) => {
    try {
      
      const messages = await ChatBox.find();
      const populateMessages = await Promise.all(
        messages.map(async (msg) => {
          const user = await User.findById(msg.user);
          const authorUsername = user ? user.username : 'Unknown';
          const authorImage = user ? user.image : "/default.jpg";
          return { ...msg.toObject(), author: { id: msg.user, username: authorUsername, image: authorImage } };
        })
      );
      
      res.json(populateMessages);
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong.' });
    }
  };


  export const deleteMessage = async (req, res) => {
    const token = req.headers.authorization;     
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
  
    try {
      const decoded = jwt.verify(token, jwt_key);
      const author = decoded.id;// the login user
  
      const commentId = req.params.id;
      const comment = await Comment.findById(commentId);
  
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      console.log("comment.author : "+ comment.author)
      console.log("authorr : "+ author)
      if (comment.author != author) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }
  
      await comment.remove();
      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  };

  


  export const updateMessage = async (req, res) => {
    const token = req.headers.authorization;
    const newContent = req.body.content;
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
  
    try {
      const decoded = jwt.verify(token, jwt_key);
      const author = decoded.id; // the login user
  
      const commentId = req.params.id;
      const comment = await Comment.findById(commentId);
  
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
  
      if (comment.author.toString() != author) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }
  
      comment.content = newContent; // Update the comment content
      await comment.save();
  
      res.json({ message: 'Comment updated successfully', comment });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  };
  