import express from "express"; 


import 
{ addComment ,
    getComments ,
    deleteComment,
    updateComment
    } from '../controllers/CommentController.js'

const router = express.Router();
router.post('/comment/:id' , addComment)
router.get(`/posts/:id/comments` , getComments)
router.delete(`/comment/:id` ,deleteComment )
router.put(`/comment/:id` ,updateComment )

export default router