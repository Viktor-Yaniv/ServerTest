import express from "express";
import upload from '../upload.js'
import { 
    updateUser,
    deleteUser,
    getUserProfile,
    userRegister,
    userLogin,
    authMiddleware,
    userLogout,
    getMyProfile,
    updateMyProfile,
    Header,
    verifyPassword
    //
    
} from "../controllers/UserController.js";

 

const router = express.Router();







router.post('/userLogout', userLogout);
router.get('/Header', Header);
router.get('/userprofile', getMyProfile );
router.put('/userprofile',  upload.single('image'), updateMyProfile );
router.post('/users/userRegister', upload.single('image'), userRegister);
router.post('/users/userLogin', userLogin);
router.get('/users/:id', getUserProfile);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);


 
export default router;