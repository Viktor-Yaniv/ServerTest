import express from "express"; 


import 
{ addMessage ,
    getMessages ,
    deleteMessage,
    updateMessage
    } from '../controllers/ChatBoxController.js'

const router = express.Router();
router.post('/chatbox' , addMessage)
router.get(`/chat` , getMessages)
router.delete(`/chatbox/:id` ,deleteMessage )
router.put(`/chatbox/:id` ,updateMessage )

export default router