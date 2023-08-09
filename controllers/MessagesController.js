import Comment from '../models/CommentModel.js'
import Message from '../models/MessageModel.js'
import User from '../models/UserModel.js'
import 'dotenv/config'
import jwt from 'jsonwebtoken';

const jwt_key = process.env.JWT_KEY;

export const addMessage = async (req, res) => {
    try {
      const { content, timestamp } = req.body;
      const userReceive = req.params.id
      const token = req.headers.authorization;
  
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
  
      if (!content) {
        return res.status(400).json({ message: "Empty comment" });
      }
  
      const decoded = jwt.verify(token, jwt_key);
      const author = decoded.id;
  
      const message = new Message({
        message: content,
        user: author,
        userReceive : userReceive,
        timestamp: timestamp,
      });
  
      await message.save();
  
      res.json(message);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  };
  
  export const getAllMessages = async (req, res) => {
    try {
      const token = req.headers.authorization;
      const decoded = jwt.verify(token, jwt_key);
      const userId = decoded.id;
  
      const receivedMessages = await Message.find({ userReceive: userId }).sort({ timestamp: -1 });
      const sentMessages = await Message.find({ user: userId }).sort({ timestamp: -1 });
  
      const userMessageCounts = {};
  
      receivedMessages.forEach((msg) => {
        const authorId = msg.user.toString();
        userMessageCounts[authorId] = (userMessageCounts[authorId] || 0) + 1;
      });
  
      sentMessages.forEach((msg) => {
        const authorId = msg.userReceive.toString();
        userMessageCounts[authorId] = (userMessageCounts[authorId] || 0) + 1;
      });
  
      const userIds = [...new Set(receivedMessages.map((msg) => msg.user).concat(sentMessages.map((msg) => msg.userReceive)))];
      const users = await User.find({ _id: { $in: userIds } });
  
      const result = users.map((user) => {
        const authorUsername = user.username || "Unknown";
        const authorId = user._id.toString();
        const messageCount = userMessageCounts[authorId] || 0;
  
        let lastMessage = "";
        let lastMessageDate = "";
  
        // Find the last received message from the user
        const lastReceivedMessage = receivedMessages.find((msg) => msg.user.toString() === authorId);
        if (lastReceivedMessage) {
          lastMessage = lastReceivedMessage.message;
          lastMessageDate = lastReceivedMessage.timestamp;
        }
  
        // Find the last sent message to the user
        const lastSentMessage = sentMessages.find((msg) => msg.userReceive.toString() === authorId);
        if (lastSentMessage) {
          lastMessage = `אתה : ${lastSentMessage.message}`;
          lastMessageDate = lastSentMessage.timestamp;
        }
  
        return {
          author: { id: user._id, username: authorUsername, image:user.image },
          messageCount: messageCount,
          lastMessage: lastMessage,
          lastMessageDate: lastMessageDate,
        };
      });
  
      res.json(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong." });
    }
  };
  
  
  
  
  
  
  

  export const getMessages = async (req, res) => {
    try {
        const token = req.headers.authorization;

        // Verify the token and get the user ID
        const decoded = jwt.verify(token, jwt_key);
        const userId = decoded.id;
        const userReceiveId = req.params.id;
  
      const messages = await Message.find({
        $or: [
          { user: userId, userReceive: userReceiveId },
          { user: userReceiveId, userReceive: userId }
        ]
      });
  
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
  