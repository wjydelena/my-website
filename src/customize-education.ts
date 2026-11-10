// Reintroduce the restored education once, without inheriting earlier dismissal records.
// Completion still requires dismissal/use or two GIF plays, not merely appearing.
export const CUSTOMIZE_EDUCATION_KEY = 'live-console.customize-education.v3';
export const CUSTOMIZE_EDUCATION_DELAY = 2000;
// Sum of all 71 GIF frame delays: 5,850ms per play, at most two plays.
export const CUSTOMIZE_EDUCATION_PLAY_DURATION = 5850;
export const CUSTOMIZE_EDUCATION_MAX_PLAYS = 2;
export function scheduleCustomizeEducationDismiss(dismiss: () => void) {
  const timer = setTimeout(dismiss, CUSTOMIZE_EDUCATION_PLAY_DURATION * CUSTOMIZE_EDUCATION_MAX_PLAYS);
  return () => clearTimeout(timer);
}
let seenInMemory = false;
export function hasSeenCustomizeEducation() {
  try { return seenInMemory || localStorage.getItem(CUSTOMIZE_EDUCATION_KEY) === 'seen'; }
  catch { return seenInMemory; }
}
export function markCustomizeEducationSeen() {
  seenInMemory = true;
  try { localStorage.setItem(CUSTOMIZE_EDUCATION_KEY, 'seen'); } catch {}
}
export function scheduleCustomizeEducation(show: () => void) {
  if (hasSeenCustomizeEducation()) return () => {};
  const timer = setTimeout(() => {
    if (hasSeenCustomizeEducation()) return;
    show();
  }, CUSTOMIZE_EDUCATION_DELAY);
  return () => clearTimeout(timer);
}
