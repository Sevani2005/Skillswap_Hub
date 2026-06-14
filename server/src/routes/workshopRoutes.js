import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createWorkshop,
  getWorkshops,
  getWorkshopById,
  joinWorkshop,
  leaveWorkshop
} from '../controllers/workshopController.js';

const router = express.Router();

router.route('/')
  .post(protect, createWorkshop)
  .get(protect, getWorkshops);

router.route('/:id')
  .get(protect, getWorkshopById);

router.route('/:id/join')
  .post(protect, joinWorkshop);

router.route('/:id/leave')
  .post(protect, leaveWorkshop);

export default router;
