import express from 'express';
import {
  createRequest,
  getRequests,
  updateRequest,
  completeRequest,
  updatePlan,
  proposeSession,
  declineSession,
  confirmSession,
  completeSession,
} from '../controllers/requestController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.route('/').get(getRequests).post(createRequest);
router.put('/:id/plan', updatePlan);
router.put('/:id/sessions/:track/:num/propose', proposeSession);
router.put('/:id/sessions/:track/:num/decline', declineSession);
router.put('/:id/sessions/:track/:num/confirm', confirmSession);
router.put('/:id/sessions/:track/:num/complete', completeSession);
router.put('/:id', updateRequest);
router.put('/:id/complete', completeRequest);

export default router;
