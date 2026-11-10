// Sum of all 71 GIF frame delays: 5,850ms per play, at most two plays.
export const CUSTOMIZE_EDUCATION_PLAY_DURATION = 5850;
export const CUSTOMIZE_EDUCATION_MAX_PLAYS = 2;
export function scheduleCustomizeEducationDismiss(dismiss: () => void) {
  const timer = setTimeout(dismiss, CUSTOMIZE_EDUCATION_PLAY_DURATION * CUSTOMIZE_EDUCATION_MAX_PLAYS);
  return () => clearTimeout(timer);
}
// Only empty, non-interactive page surfaces start a demonstration.
// Header unmounts in layout editing, so this listener is normal-mode only.
export function isCustomizeEducationBlankTarget(target:EventTarget|null) {
  if(!(target instanceof HTMLElement) || !target.closest('.console-shell'))return false;
  if(document.querySelector('[aria-modal="true"], [role="dialog"]'))return false;
  if(target.closest('button,a,input,textarea,select,label,summary,video,audio,img,svg,[role="button"],[role="link"],[role="tab"],[role="checkbox"],[role="switch"],[role="menu"],[role="menuitem"],[role="separator"],[tabindex],[contenteditable="true"],[draggable="true"],.quick-live,.assistant'))return false;
  if(getComputedStyle(target).cursor!=='auto' && getComputedStyle(target).cursor!=='default')return false;
  return !Array.from(target.childNodes).some(node=>node.nodeType===Node.TEXT_NODE && node.textContent?.trim());
}
