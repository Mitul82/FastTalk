import express from 'express';

const router = express.Router();

import protectRoute from '../middleware/auth.js';
import { userSignup, userLogin, checkAuth, updateProfile } from '../controllers/userController.js';

router.post('/signup', userSignup);
router.post('/login', userLogin);
router.put('/update-profile', protectRoute, updateProfile);
router.get('/check', protectRoute, checkAuth);

export default router;