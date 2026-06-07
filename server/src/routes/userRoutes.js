import express from 'express';
import {
  getUsers,
  getUserById,
  updateProfile,
  uploadAvatar,
  getDashboard,
} from '../controllers/userController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getUsers);
router.get('/dashboard', protect, getDashboard);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, uploadAvatar);
router.get('/:id', optionalAuth, getUserById);

export default router;
