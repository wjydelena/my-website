// v1 marked the introduction seen before it was actually visible. Do not carry
// that premature record forward; completion now requires explicit dismissal/use.
export const CUSTOMIZE_EDUCATION_KEY = 'live-console.customize-education.v2';
export const CUSTOMIZE_EDUCATION_DELAY = 2000;
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
