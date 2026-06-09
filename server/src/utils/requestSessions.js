import SkillRequest, { buildEmptySessions } from '../models/SkillRequest.js';

export const TRACKS = ['offered', 'wanted'];

export const populateRequest = (id) =>
  SkillRequest.findById(id).populate('sender', 'name avatar').populate('receiver', 'name avatar');

export const assertAcceptedParty = (request, userId) => {
  if (!request) return { ok: false, status: 404, message: 'Request not found' };
  if (request.status !== 'accepted') {
    return { ok: false, status: 400, message: 'Sessions are only for accepted swaps' };
  }
  const isSender = request.sender.toString() === userId;
  const isReceiver = request.receiver.toString() === userId;
  if (!isSender && !isReceiver) {
    return { ok: false, status: 403, message: 'Not authorized' };
  }
  return { ok: true, isSender, isReceiver };
};

export const parseTrack = (track) => {
  if (!TRACKS.includes(track)) {
    return { ok: false, status: 400, message: 'Invalid course track' };
  }
  return { ok: true, track };
};

const trackField = (track) => (track === 'offered' ? 'offeredSkillSessions' : 'wantedSkillSessions');

export const getTrackSessions = (request, track) => request[trackField(track)] || [];

export const findSession = (request, track, num) => {
  const session = getTrackSessions(request, track).find((s) => s.number === num);
  if (!session) return { ok: false, status: 404, message: 'Class not found' };
  return { ok: true, session };
};

export const resizeTrack = (request, track, count) => {
  const field = trackField(track);
  const current = request[field] || [];
  const next = [];
  for (let i = 1; i <= count; i++) {
    const existing = current.find((s) => s.number === i);
    next.push(
      existing || {
        number: i,
        status: 'open',
        proposedWhen: '',
        meetLink: '',
      }
    );
  }
  request[field] = next;
};

export const migrateLegacySessions = (request) => {
  const count = request.plannedSessionsPerSkill || request.plannedSessions || 6;
  if (request.sessions?.length && !request.offeredSkillSessions?.length) {
    request.offeredSkillSessions = request.sessions;
    request.wantedSkillSessions = buildEmptySessions(count);
  }
  request.plannedSessionsPerSkill = count;
};

export const ensureSessionsOnAccept = (request) => {
  migrateLegacySessions(request);
  const count = request.plannedSessionsPerSkill || 6;
  if (!request.offeredSkillSessions?.length) {
    request.offeredSkillSessions = buildEmptySessions(count);
  }
  if (!request.wantedSkillSessions?.length) {
    request.wantedSkillSessions = buildEmptySessions(count);
  }
  request.plannedSessionsPerSkill = count;
};

export const resizeAllTracks = (request, count) => {
  resizeTrack(request, 'offered', count);
  resizeTrack(request, 'wanted', count);
  request.plannedSessionsPerSkill = count;
};
