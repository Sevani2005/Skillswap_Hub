import express from 'express';
import {
  getMessages,
  getConversations,
  sendMessage,
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', getConversations);
router.post('/', sendMessage);
router.get('/:userId', getMessages);

export default router;
