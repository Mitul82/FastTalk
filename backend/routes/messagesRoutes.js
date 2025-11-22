import express from 'express';

const router = express.Router();

import protectRoutes from '../middleware/auth.js';
import { getUsersForSideBar, getMessages, markMessageAsSeen, sendMessage } from '../controllers/messageController.js';

router.get('/users', protectRoutes, getUsersForSideBar);
router.get('/:id', protectRoutes, getMessages);
router.put('/mark/:id', protectRoutes, markMessageAsSeen);
router.post('/send/:id', protectRoutes, sendMessage);

export default router;