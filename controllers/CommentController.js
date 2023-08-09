import Comment from '../models/CommentModel.js'
import User from '../models/UserModel.js'
import 'dotenv/config'
import jwt from 'jsonwebtoken';

const jwt_key = process.env.JWT_KEY;

export const addComment = async (req, res) => {
    try {
        const content = req.body.content
        const postId = req.params.id;
        const token = req.body.userId;

        const decoded = jwt.verify(token, jwt_key);
        const author = decoded.id;    
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        
        if (!content) { 
            return res.status(400).json({ message: 'Empty comment' }) 
        }
        
        const comment = new Comment({ 
            content : content,
            author : author,
            post : postId
        });
        
        await comment.save();
        
        res.json(comment);
    } 
    catch (error) {
        console.log(error) 
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export const getComments = async (req, res) => {
    try {
      const postId = req.params.id;
      const comments = await Comment.find({ post: postId });
      const populatedComments = await Promise.all(
        comments.map(async (comment) => {
          const user = await User.findById(comment.author);
          const authorUsername = user ? user.username : 'Unknown';
          const authorImage = user ? user.image : "/default.jpg";
          return { ...comment.toObject(), author: { id: comment.author, username: authorUsername , image : authorImage } };
        })
      );
      res.json(populatedComments);
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong.' });
    }
  };


  export const deleteComment = async (req, res) => {
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

  


  export const updateComment = async (req, res) => {
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
  