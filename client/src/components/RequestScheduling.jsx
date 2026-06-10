import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiChevronRight,
  FiX,
  FiExternalLink,
  FiMessageSquare,
  FiUser,
} from 'react-icons/fi';
import api from '../api/axios';
import { getApiErrorMessage } from '../utils/apiError';
import { hasMeetingLink, openMeetingLink } from '../utils/meeting';

const statusLabel = {
  open: 'Not scheduled',
  proposed: 'Waiting for OK',
  confirmed: 'Time agreed',
  completed: 'Done',
};

const statusClass = {
  open: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  proposed: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
};

const sessionPath = (requestId, track, num, action) =>
  `/requests/${requestId}/sessions/${track}/${num}/${action}`;

const SessionRow = ({
  session,
  track,
  requestId,
  currentUserId,
  partnerName,
  teacherName,
  skillName,
  isTeacher,
  canEdit,
  onUpdated,
}) => {
  const [when, setWhen] = useState(session.proposedWhen || '');
  const [meetLink, setMeetLink] = useState(session.meetLink || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showCounter, setShowCounter] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const proposedByMe = String(session.proposedBy) === String(currentUserId);
  const isPartnerProposal = session.status === 'proposed' && !proposedByMe;
  const showProposeForm =
    session.status === 'open' ||
    (session.status === 'proposed' && proposedByMe) ||
    (isPartnerProposal && showCounter);

  const needsYourResponse = canEdit && isPartnerProposal;

  useEffect(() => {
    if (needsYourResponse) setExpanded(true);
  }, [needsYourResponse]);

  const run = async (fn) => {
    setError('');
    setBusy(true);
    try {
      await fn();
      onUpdated?.();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Something went wrong'));
    } finally {
      setBusy(false);
    }
  };

  const collapsedSummary = () => {
    if (session.status === 'completed' || session.status === 'confirmed') {
      return session.proposedWhen ? `Agreed: ${session.proposedWhen}` : null;
    }
    if (session.status === 'proposed') {
      if (needsYourResponse) return `${partnerName}: "${session.proposedWhen}" — tap to respond`;
      return `Waiting for ${partnerName}`;
    }
    return 'Tap arrow to schedule';
  };

  const summary = collapsedSummary();

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-2 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
        aria-expanded={expanded}
      >
        {expanded ? (
          <FiChevronDown className="shrink-0 text-gray-500" size={18} />
        ) : (
          <FiChevronRight className="shrink-0 text-gray-500" size={18} />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium text-sm text-gray-900 dark:text-white">Class {session.number}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[session.status]}`}>
              {statusLabel[session.status]}
            </span>
          </div>
          {!expanded && summary && (
            <p
              className={`text-xs mt-1 truncate ${
                needsYourResponse ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {summary}
            </p>
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-0 border-t border-gray-100 dark:border-gray-700">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 pt-2">
        <FiUser className="inline mr-1" size={12} />
        {teacherName} teaches <span className="text-primary-600 font-medium">{skillName}</span> — one skill only
      </p>

      {session.status === 'confirmed' || session.status === 'completed' ? (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">Agreed:</span> {session.proposedWhen}
        </p>
      ) : null}

      {session.status === 'proposed' && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {proposedByMe
            ? `You asked: "${session.proposedWhen}" — waiting for ${partnerName} to say OK`
            : `${partnerName} suggests: "${session.proposedWhen}"`}
        </p>
      )}

      {canEdit && isPartnerProposal && (
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => api.put(sessionPath(requestId, track, session.number, 'confirm')))}
            className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
          >
            <FiCheck className="inline mr-1" /> Yes, this time works
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setWhen('');
              setMeetLink('');
              setShowCounter(true);
            }}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
          >
            <FiX className="inline mr-1" /> No, different time
          </button>
          {hasMeetingLink(session.meetLink) && (
            <button
              type="button"
              onClick={() => openMeetingLink(session.meetLink)}
              className="px-3 py-1.5 bg-gray-700 text-white rounded-lg text-sm"
            >
              <FiExternalLink className="inline mr-1" /> Meet link
            </button>
          )}
        </div>
      )}

      {canEdit && isPartnerProposal && showCounter && (
        <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
          Suggest another time — {partnerName} must agree.
        </p>
      )}

      {canEdit && session.status === 'confirmed' && isTeacher && (
        <button
          type="button"
          disabled={busy}
          onClick={() => run(() => api.put(sessionPath(requestId, track, session.number, 'complete')))}
          className="mt-3 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600"
        >
          Mark class {session.number} done
        </button>
      )}
      {canEdit && session.status === 'confirmed' && !isTeacher && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
          Only {teacherName} can mark this class done after you attend.
        </p>
      )}

      {canEdit && showProposeForm && (
        <div className="mt-3 space-y-2">
          <label className="text-xs text-gray-500">
            {isPartnerProposal && showCounter
              ? 'Your alternative times (partner must agree)'
              : 'Propose a time for this class (partner must agree)'}
          </label>
          <input
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            placeholder="e.g. Saturday 3pm week 2"
            className="input-field text-sm"
          />
          <input
            value={meetLink}
            onChange={(e) => setMeetLink(e.target.value)}
            placeholder="Meet / Zoom link (optional)"
            className="input-field text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await api.put(sessionPath(requestId, track, session.number, 'propose'), {
                    proposedWhen: when,
                    meetLink: meetLink.trim(),
                  });
                  setShowCounter(false);
                })
              }
              className="btn-primary text-sm py-2 px-4"
            >
              {session.status === 'proposed' && proposedByMe ? 'Update times' : 'Send times'}
            </button>
            {isPartnerProposal && showCounter && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setShowCounter(false)}
                className="btn-secondary text-sm py-2 px-4"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
};

const CourseTrack = ({
  track,
  title,
  subtitle,
  sessions,
  teacherName,
  teacherId,
  skillName,
  request,
  currentUserId,
  partnerName,
  canEdit,
  onUpdated,
}) => {
  const isTeacher = String(teacherId) === String(currentUserId);
  const list = [...(sessions || [])].sort((a, b) => a.number - b.number);
  const done = list.filter((s) => s.status === 'completed').length;

  return (
    <div className="mb-6 last:mb-0">
      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">{subtitle}</p>
      <p className="text-xs text-gray-500 mb-3">
        Progress: {done} / {list.length} classes done
      </p>
      <div className="space-y-3">
        {list.map((s) => (
          <SessionRow
            key={`${track}-${s._id || s.number}`}
            session={s}
            track={track}
            requestId={request._id}
            currentUserId={currentUserId}
            partnerName={partnerName}
            teacherName={teacherName}
            skillName={skillName}
            isTeacher={isTeacher}
            canEdit={canEdit}
            onUpdated={onUpdated}
          />
        ))}
      </div>
    </div>
  );
};

const RequestScheduling = ({ request, currentUserId, onUpdated }) => {
  const isSender = String(request.sender?._id) === String(currentUserId);
  const partner = isSender ? request.receiver : request.sender;
  const partnerId = partner?._id;
  const senderName = request.sender?.name || 'Sender';
  const receiverName = request.receiver?.name || 'Receiver';

  const myAvailability = isSender ? request.senderAvailability : request.receiverAvailability;
  const partnerAvailability = isSender ? request.receiverAvailability : request.senderAvailability;

  const perSkill =
    request.plannedSessionsPerSkill || request.plannedSessions || 6;

  const offeredSessions =
    request.offeredSkillSessions?.length > 0
      ? request.offeredSkillSessions
      : request.sessions || [];
  const wantedSessions = request.wantedSkillSessions || [];
  const hasOffered = !!request.offeredSkill?.trim();
  const hasWanted = !!request.wantedSkill?.trim();

  const [planned, setPlanned] = useState(perSkill);
  const [availability, setAvailability] = useState(myAvailability || '');
  const [planBusy, setPlanBusy] = useState(false);
  const [planError, setPlanError] = useState('');

  if (request.status !== 'accepted' && request.status !== 'completed') {
    return null;
  }

  const canEdit = request.status === 'accepted';

  const savePlan = async () => {
    setPlanError('');
    setPlanBusy(true);
    try {
      await api.put(`/requests/${request._id}/plan`, {
        plannedSessionsPerSkill: Number(planned),
        availabilityNote: availability,
      });
      onUpdated?.();
    } catch (err) {
      setPlanError(getApiErrorMessage(err, 'Failed to save plan'));
    } finally {
      setPlanBusy(false);
    }
  };

  return (
    <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <FiCalendar size={14} />
          {hasOffered && hasWanted
            ? `Two separate courses with ${partner?.name}`
            : `Course plan with ${partner?.name}`}
        </p>
        {partnerId && (
          <Link
            to="/chat"
            state={{ partnerId }}
            className="text-xs text-primary-600 hover:underline inline-flex items-center gap-1"
          >
            <FiMessageSquare size={12} /> Chat about times
          </Link>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {hasOffered && hasWanted
          ? 'Each class teaches one skill with one teacher. Finishing class 2 in course A does not affect course B. You can run both courses in the same week or finish one first.'
          : 'This course plan lists the scheduled sessions where the teacher shares their skill. Agree on times and complete sessions together.'}
      </p>

      {canEdit && (
        <div className="mb-4 p-3 rounded-lg bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-600 space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="form-label text-xs">Classes per skill (each course)</label>
              <input
                type="number"
                min={1}
                max={24}
                value={planned}
                onChange={(e) => setPlanned(e.target.value)}
                className="input-field w-24 text-sm"
              />
            </div>
            <button type="button" onClick={savePlan} disabled={planBusy} className="btn-secondary text-sm py-2 px-4">
              {planBusy ? 'Saving...' : 'Save plan'}
            </button>
          </div>
          <div>
            <label className="form-label text-xs">When are you usually free?</label>
            <input
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="e.g. Tue & Thu evenings"
              className="input-field text-sm"
            />
          </div>
          {planError && <p className="text-xs text-red-600">{planError}</p>}
        </div>
      )}

      {partnerAvailability && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          <span className="font-medium">{partner?.name}&apos;s availability:</span> {partnerAvailability}
        </p>
      )}

      {hasOffered && (
        <CourseTrack
          track="offered"
          title={hasWanted ? `Course 1 — ${senderName} teaches ${request.offeredSkill}` : `${senderName} teaches ${request.offeredSkill}`}
          subtitle={`${receiverName} learns. Schedule each week/class separately.`}
          sessions={offeredSessions}
          teacherName={senderName}
          teacherId={request.sender?._id}
          skillName={request.offeredSkill}
          request={request}
          currentUserId={currentUserId}
          partnerName={partner?.name}
          canEdit={canEdit}
          onUpdated={onUpdated}
        />
      )}

      {hasWanted && (
        <div className={hasOffered ? 'border-t border-gray-200 dark:border-gray-600 pt-4' : ''}>
          <CourseTrack
            track="wanted"
            title={hasOffered ? `Course 2 — ${receiverName} teaches ${request.wantedSkill}` : `${receiverName} teaches ${request.wantedSkill}`}
            subtitle={`${senderName} learns. Independent from course 1.`}
            sessions={wantedSessions}
            teacherName={receiverName}
            teacherId={request.receiver?._id}
            skillName={request.wantedSkill}
            request={request}
            currentUserId={currentUserId}
            partnerName={partner?.name}
            canEdit={canEdit}
            onUpdated={onUpdated}
          />
        </div>
      )}
    </div>
  );
};

export default RequestScheduling;
