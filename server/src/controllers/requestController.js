import SkillRequest from '../models/SkillRequest.js';
import {
  populateRequest,
  assertAcceptedParty,
  parseTrack,
  findSession,
  resizeAllTracks,
  ensureSessionsOnAccept,
} from '../utils/requestSessions.js';

// @desc    Send skill exchange request
// @route   POST /api/requests
export const createRequest = async (req, res, next) => {
  try {
    const { receiverId, offeredSkill, wantedSkill, message } = req.body;

    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot send request to yourself' });
    }

    const existing = await SkillRequest.findOne({
      sender: req.user._id,
      receiver: receiverId,
      status: 'pending',
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Pending request already exists' });
    }

    const request = await SkillRequest.create({
      sender: req.user._id,
      receiver: receiverId,
      offeredSkill,
      wantedSkill,
      message,
    });

    const populated = await SkillRequest.findById(request._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all requests for current user
// @route   GET /api/requests
export const getRequests = async (req, res, next) => {
  try {
    const { type, status } = req.query;
    const filter = {};

    if (type === 'sent') filter.sender = req.user._id;
    else if (type === 'received') filter.receiver = req.user._id;
    else {
      filter.$or = [{ sender: req.user._id }, { receiver: req.user._id }];
    }

    if (status) filter.status = status;

    const requests = await SkillRequest.find(filter)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort({ createdAt: -1 });

    for (const r of requests) {
      if (r.status === 'accepted' || r.status === 'completed') {
        ensureSessionsOnAccept(r);
      }
    }

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
};

// @desc    Update request status (accept/reject/complete)
// @route   PUT /api/requests/:id
export const updateRequest = async (req, res, next) => {
  try {
    const { status } = req.body;
    const request = await SkillRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!['accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    request.status = status;
    if (status === 'accepted') {
      ensureSessionsOnAccept(request);
    }
    await request.save();

    const populated = await populateRequest(request._id);
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// Mark completed (either party)
export const completeRequest = async (req, res, next) => {
  try {
    const request = await SkillRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const isParty =
      request.sender.toString() === req.user._id.toString() ||
      request.receiver.toString() === req.user._id.toString();

    if (!isParty) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (request.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Request must be accepted first' });
    }

    request.status = 'completed';
    await request.save();

    const populated = await SkillRequest.findById(request._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Set total sessions & your general availability
// @route   PUT /api/requests/:id/plan
export const updatePlan = async (req, res, next) => {
  try {
    const request = await SkillRequest.findById(req.params.id);
    const auth = assertAcceptedParty(request, req.user._id.toString());
    if (!auth.ok) {
      return res.status(auth.status).json({ success: false, message: auth.message });
    }

    const { plannedSessions, plannedSessionsPerSkill, availabilityNote } = req.body;
    const rawCount = plannedSessionsPerSkill ?? plannedSessions;

    if (rawCount !== undefined) {
      const n = Math.min(24, Math.max(1, Number(rawCount) || 6));
      resizeAllTracks(request, n);
    }

    if (typeof availabilityNote === 'string') {
      const note = availabilityNote.trim();
      if (auth.isSender) request.senderAvailability = note;
      else request.receiverAvailability = note;
    }

    await request.save();
    const populated = await populateRequest(request._id);
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Propose time options for a session (partner must confirm)
// @route   PUT /api/requests/:id/sessions/:track/:num/propose
export const proposeSession = async (req, res, next) => {
  try {
    const trackCheck = parseTrack(req.params.track);
    if (!trackCheck.ok) {
      return res.status(trackCheck.status).json({ success: false, message: trackCheck.message });
    }
    const num = Number(req.params.num);
    const { proposedWhen, meetLink } = req.body;
    const request = await SkillRequest.findById(req.params.id);
    const auth = assertAcceptedParty(request, req.user._id.toString());
    if (!auth.ok) {
      return res.status(auth.status).json({ success: false, message: auth.message });
    }

    const found = findSession(request, trackCheck.track, num);
    if (!found.ok) {
      return res.status(found.status).json({ success: false, message: found.message });
    }

    const { session } = found;
    if (!['open', 'proposed'].includes(session.status)) {
      return res.status(400).json({ success: false, message: 'This session cannot be proposed now' });
    }

    const when = typeof proposedWhen === 'string' ? proposedWhen.trim() : '';
    if (!when) {
      return res.status(400).json({ success: false, message: 'Add when you are free (e.g. Sat 3pm, Sun 5pm)' });
    }

    session.status = 'proposed';
    session.proposedBy = req.user._id;
    session.proposedWhen = when;
    if (typeof meetLink === 'string') session.meetLink = meetLink.trim();
    session.confirmedBy = undefined;

    await request.save();
    const populated = await populateRequest(request._id);
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Decline partner's proposed time (back to open for a new proposal)
// @route   PUT /api/requests/:id/sessions/:track/:num/decline
export const declineSession = async (req, res, next) => {
  try {
    const trackCheck = parseTrack(req.params.track);
    if (!trackCheck.ok) {
      return res.status(trackCheck.status).json({ success: false, message: trackCheck.message });
    }
    const num = Number(req.params.num);
    const request = await SkillRequest.findById(req.params.id);
    const auth = assertAcceptedParty(request, req.user._id.toString());
    if (!auth.ok) {
      return res.status(auth.status).json({ success: false, message: auth.message });
    }

    const found = findSession(request, trackCheck.track, num);
    if (!found.ok) {
      return res.status(found.status).json({ success: false, message: found.message });
    }

    const { session } = found;
    if (session.status !== 'proposed') {
      return res.status(400).json({ success: false, message: 'Nothing to decline' });
    }
    if (session.proposedBy?.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Use update proposal on your own offer' });
    }

    session.status = 'open';
    session.proposedBy = undefined;
    session.proposedWhen = '';
    session.meetLink = '';
    session.confirmedBy = undefined;

    await request.save();
    const populated = await populateRequest(request._id);
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm partner's proposed time
// @route   PUT /api/requests/:id/sessions/:track/:num/confirm
export const confirmSession = async (req, res, next) => {
  try {
    const trackCheck = parseTrack(req.params.track);
    if (!trackCheck.ok) {
      return res.status(trackCheck.status).json({ success: false, message: trackCheck.message });
    }
    const num = Number(req.params.num);
    const request = await SkillRequest.findById(req.params.id);
    const auth = assertAcceptedParty(request, req.user._id.toString());
    if (!auth.ok) {
      return res.status(auth.status).json({ success: false, message: auth.message });
    }

    const found = findSession(request, trackCheck.track, num);
    if (!found.ok) {
      return res.status(found.status).json({ success: false, message: found.message });
    }

    const { session } = found;
    if (session.status !== 'proposed') {
      return res.status(400).json({ success: false, message: 'Nothing to confirm yet' });
    }
    if (session.proposedBy?.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Wait for your partner to confirm your proposal' });
    }

    session.status = 'confirmed';
    session.confirmedBy = req.user._id;

    await request.save();
    const populated = await populateRequest(request._id);
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark one session as done
// @route   PUT /api/requests/:id/sessions/:track/:num/complete
export const completeSession = async (req, res, next) => {
  try {
    const trackCheck = parseTrack(req.params.track);
    if (!trackCheck.ok) {
      return res.status(trackCheck.status).json({ success: false, message: trackCheck.message });
    }
    const num = Number(req.params.num);
    const request = await SkillRequest.findById(req.params.id);
    const auth = assertAcceptedParty(request, req.user._id.toString());
    if (!auth.ok) {
      return res.status(auth.status).json({ success: false, message: auth.message });
    }

    const found = findSession(request, trackCheck.track, num);
    if (!found.ok) {
      return res.status(found.status).json({ success: false, message: found.message });
    }

    const { session } = found;
    if (session.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Confirm a time before marking complete' });
    }

    const teacherId =
      trackCheck.track === 'offered'
        ? request.sender.toString()
        : request.receiver.toString();

    if (req.user._id.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Only the teacher for this class can mark it done',
      });
    }

    session.status = 'completed';

    await request.save();
    const populated = await populateRequest(request._id);
    res.json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};
