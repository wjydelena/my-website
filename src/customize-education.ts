export const CUSTOMIZE_EDUCATION_KEY = 'live-console.customize-education.v1';
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
    markCustomizeEducationSeen();
    show();
  }, CUSTOMIZE_EDUCATION_DELAY);
  return () => clearTimeout(timer);
}
