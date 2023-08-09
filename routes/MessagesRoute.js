import express from "express"; 


import 
{ addMessage ,
    getMessages ,
    deleteMessage,
    updateMessage,
    getAllMessages
    } from '../controllers/MessagesController.js'

const router = express.Router();
router.post('/message/:id' , addMessage)
router.get(`/messages/:id` , getMessages)
router.get("/allMessages" , getAllMessages)

router.delete(`/chatbox/:id` ,deleteMessage )
router.put(`/chatbox/:id` ,updateMessage )

export default router