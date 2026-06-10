export const hasMeetingLink = (link) => Boolean(link?.trim());

/** Open a Google Meet or Zoom URL for a scheduled session. */
export const openMeetingLink = (link) => {
  const trimmed = link?.trim();
  if (!trimmed) return false;

  const url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
};
