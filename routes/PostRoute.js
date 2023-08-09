import express from "express"; 
//import upload from '../upload.js'
import upload2 from '../upload2.js'


import {
    getPosts, 
    getPostById,
    savePost,
    updatePost,
    deletePost,
    somePosts
     
    
   

 } from "../controllers/PostController.js"

 const router = express.Router();



router.get('/posts', getPosts);
router.get('/somePosts', somePosts);
router.get('/posts/:id', getPostById);
router.post('/posts', upload2.array('image[]',10),savePost);
router.put('/posts/:id' ,  upload2.single('image'),updatePost);
router.delete('/posts/:id', deletePost);


export default router;

