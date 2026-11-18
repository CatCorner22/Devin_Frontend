// Page checks for behavior: what a control must do for a person who uses a keyboard, a finger, or a screen reader.
// Each function is self-contained (see neuro.ts).
import type { Finding } from '../shapes.js';

/** A thing that answers a click but that the Tab key cannot reach. */
export function keyboardReachable(doc: Document): Finding[] {
  const ruleId = 'behavior-keyboard-reach';
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  const native = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'SUMMARY', 'LABEL', 'OPTION'];
  const out: Finding[] = [];
  for (const el of doc.querySelectorAll<HTMLElement>('[onclick], [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="checkbox"], [role="switch"]')) {
    if (el.getClientRects().length === 0) continue;
    if (native.includes(el.tagName) && !(el.tagName === 'A' && !el.hasAttribute('href'))) continue;
    if (el.tabIndex < 0 || !el.hasAttribute('tabindex')) out.push({ ruleId, status: 'fails', where: name(el), measured: 'answers a click, and the Tab key cannot reach it', required: 'reachable and usable by keyboard', fix: 'Use a <button> element (or <a href> for a link) in place of this element.' });
  }
  // A native control taken out of the Tab order. Inside a group that the arrow keys walk (tabs, a menu, a toolbar), one stop is right.
  const walked = '[role="tablist"], [role="menu"], [role="menubar"], [role="listbox"], [role="radiogroup"], [role="toolbar"], [role="tree"], [role="grid"]';
  for (const el of doc.querySelectorAll<HTMLElement>('a[href][tabindex], button[tabindex], input[tabindex], select[tabindex], textarea[tabindex]')) {
    if (el.tabIndex >= 0 || el.getClientRects().length === 0 || (el as HTMLButtonElement).disabled || el.closest(walked) || el.closest('[inert]')) continue;
    out.push({ ruleId, status: 'fails', where: name(el), measured: `tabindex ${el.tabIndex} keeps the Tab key from reaching this control`, required: 'reachable by keyboard', fix: 'Remove the negative tabindex, or hide the control from everyone if nobody should use it.' });
  }
  for (const el of doc.querySelectorAll<HTMLElement>('[tabindex]')) {
    if (el.tabIndex > 0) out.push({ ruleId, status: 'fails', where: name(el), measured: `tabindex ${el.tabIndex} changes the order of the Tab key`, required: 'the order of the page', fix: 'Remove the positive tabindex and put the element where it belongs in the page.' });
  }
  return out.length > 0 ? out : [{ ruleId, status: 'holds' }];
}

/** A control that shows no change when the keyboard reaches it. The function moves the focus to each control in turn and puts it back. */
export function focusIsVisible(doc: Document): Finding[] {
  const ruleId = 'behavior-focus-visible';
  const view = doc.defaultView;
  if (!view) return [{ ruleId, status: 'could-not-measure', measured: 'the page has no window' }];
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  const look = (el: Element): string => { const s = view.getComputedStyle(el); return [s.outlineStyle === 'none' ? '0' : s.outlineWidth, s.outlineColor, s.boxShadow, s.borderTopColor, s.borderBottomColor, s.borderBottomWidth, s.backgroundColor, s.textDecorationLine].join('|'); };
  const controls = [...doc.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, summary, [tabindex]')].filter((el) => el.tabIndex >= 0 && el.getClientRects().length > 0 && !(el as HTMLButtonElement).disabled && el.getAttribute('type') !== 'hidden');
  if (controls.length === 0) return [{ ruleId, status: 'not-applicable' }];
  const before = doc.activeElement as HTMLElement | null;
  // The look at rest is taken without the focus, also for the control that holds the focus when the check starts.
  before?.blur();
  const out: Finding[] = [];
  for (const el of controls) {
    const rest = look(el);
    el.focus({ preventScroll: true });
    if (doc.activeElement !== el) continue;
    const seen = el.matches(':focus-visible');
    const focused = look(el);
    el.blur();
    if (!seen) continue;
    if (focused === rest) out.push({ ruleId, status: 'fails', where: name(el), measured: 'looks the same with and without the keyboard focus', required: 'a visible focus mark', fix: 'Add a :focus-visible style with an outline of at least 2 px in a color that stands out from the background.' });
  }
  before?.focus({ preventScroll: true });
  return out.length > 0 ? out : [{ ruleId, status: 'holds' }];
}

/** A target too small to hit with a finger: under 24 by 24 CSS pixels. Links inside a sentence are exempt, as WCAG 2.5.8 exempts them. */
export function targetSize(doc: Document): Finding[] {
  const ruleId = 'behavior-target-size';
  const view = doc.defaultView;
  if (!view) return [{ ruleId, status: 'could-not-measure', measured: 'the page has no window' }];
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  const targets = [...doc.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, summary, [role="button"], [role="tab"], [role="menuitem"]')].filter((el) => el.getClientRects().length > 0 && el.getAttribute('type') !== 'hidden');
  if (targets.length === 0) return [{ ruleId, status: 'not-applicable' }];
  const out: Finding[] = [];
  for (const el of targets) {
    const inSentence = el.tagName === 'A' && view.getComputedStyle(el).display === 'inline' && (el.parentElement?.textContent ?? '').trim().length > (el.textContent ?? '').trim().length;
    if (inSentence) continue;
    let box = el.getBoundingClientRect();
    const label = (el as HTMLInputElement).labels?.[0];
    if ((el.getAttribute('type') === 'checkbox' || el.getAttribute('type') === 'radio') && label) box = label.getBoundingClientRect();
    if (box.width < 24 || box.height < 24) out.push({ ruleId, status: 'fails', where: name(el), measured: `${Math.round(box.width)} by ${Math.round(box.height)} px`, required: 'at least 24 by 24 px', fix: 'Add padding or a min-width and min-height of 24px (44px where the design asks for comfort).' });
  }
  return out.length > 0 ? out : [{ ruleId, status: 'holds' }];
}

/** A button or link with no name that a screen reader can say, such as a button that holds only an icon. */
export function controlsHaveNames(doc: Document): Finding[] {
  const ruleId = 'behavior-control-name';
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  const controls = [...doc.querySelectorAll<HTMLElement>('a[href], button, [role="button"], [role="link"], [role="tab"], [role="menuitem"]')].filter((el) => el.getClientRects().length > 0);
  if (controls.length === 0) return [{ ruleId, status: 'not-applicable' }];
  const out: Finding[] = [];
  for (const el of controls) {
    const byId = (el.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean).map((id) => doc.getElementById(id)?.textContent ?? '').join('');
    // Only what a screen reader is given counts: nothing inside a part marked aria-hidden, and nothing that is not drawn.
    const heard = (node: Element): boolean => !node.closest('[aria-hidden="true"]') && (node.closest('svg') !== null || node.getClientRects().length > 0);
    const pictures = [...el.querySelectorAll('img[alt], svg[aria-label]')].filter(heard).map((p) => p.getAttribute('alt') ?? p.getAttribute('aria-label') ?? '').join('');
    let text = '';
    const walker = doc.createTreeWalker(el, 4);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) if (node.parentElement && heard(node.parentElement)) text += node.textContent ?? '';
    const said = [el.getAttribute('aria-label') ?? '', byId, text, pictures, el.getAttribute('title') ?? ''].join('').trim();
    if (said === '') out.push({ ruleId, status: 'fails', where: name(el), measured: 'no name: no text, no label', required: 'a name that says what the control does', fix: 'Add visible text, or an aria-label that says what the control does.' });
  }
  return out.length > 0 ? out : [{ ruleId, status: 'holds' }];
}

/** A window over the page that is not marked as one, or that has no name. */
export function dialogsAreMarked(doc: Document): Finding[] {
  const ruleId = 'behavior-dialog-marked';
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  const dialogs = [...doc.querySelectorAll<HTMLElement>('dialog, [role="dialog"], [role="alertdialog"]')];
  if (dialogs.length === 0) return [{ ruleId, status: 'not-applicable' }];
  const out: Finding[] = [];
  for (const el of dialogs) {
    const named = (el.getAttribute('aria-label') ?? '').trim() !== '' || (el.getAttribute('aria-labelledby') ?? '').split(/\s+/).some((id) => id !== '' && (doc.getElementById(id)?.textContent ?? '').trim() !== '');
    if (!named) out.push({ ruleId, status: 'fails', where: name(el), measured: 'a window over the page with no name', required: 'a name, taken from its heading', fix: 'Give the heading an id and point aria-labelledby on the window at it.' });
    if (el.tagName !== 'DIALOG' && el.getAttribute('aria-modal') !== 'true') out.push({ ruleId, status: 'fails', where: name(el), measured: 'not marked as a window that blocks the page', required: 'the <dialog> element, or aria-modal="true"', fix: 'Use the <dialog> element and open it with showModal().' });
  }
  return out.length > 0 ? out : [{ ruleId, status: 'holds' }];
}

/** A list or table with nothing in it and no word about why. */
export function emptyStatesExplain(doc: Document): Finding[] {
  const ruleId = 'state-empty-explained';
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  const holders = [...doc.querySelectorAll<HTMLElement>('ul, ol, tbody, [role="list"], [role="grid"], [role="listbox"], [data-list]')].filter((el) => el.isConnected && !el.closest('[hidden]'));
  if (holders.length === 0) return [{ ruleId, status: 'not-applicable' }];
  const out: Finding[] = [];
  for (const el of holders) {
    if (el.children.length > 0 || (el.textContent ?? '').trim() !== '') continue;
    const around = (el.tagName === 'TBODY' ? el.parentElement?.parentElement : el.parentElement) ?? null;
    const told = around?.querySelector('[data-empty], [role="status"]') ?? null;
    if (!told || (told.textContent ?? '').trim() === '') out.push({ ruleId, status: 'fails', where: name(el), measured: 'an empty list with no explanation', required: 'a sentence that says what belongs here and what to do next', fix: 'Beside the empty list, add an element marked data-empty that says what belongs in the list and offers the next action.' });
  }
  return out.length > 0 ? out : [{ ruleId, status: 'holds' }];
}

/** A part that is loading and does not say so to a screen reader. */
export function loadingIsAnnounced(doc: Document): Finding[] {
  const ruleId = 'state-loading-announced';
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  const loaders = [...doc.querySelectorAll<HTMLElement>('[data-loading], [class*="skeleton" i], [class*="spinner" i], [class*="loading" i]')].filter((el) => el.getClientRects().length > 0);
  if (loaders.length === 0) return [{ ruleId, status: 'not-applicable' }];
  const out: Finding[] = [];
  for (const el of loaders) {
    if (!el.closest('[aria-busy="true"], [role="status"], [role="progressbar"]')) out.push({ ruleId, status: 'fails', where: name(el), measured: 'a loading mark that a screen reader does not announce', required: 'aria-busy="true" on the part that loads, or role="status" with a word such as "Loading"', fix: 'Set aria-busy="true" on the part that is loading, and remove it when the content arrives.' });
  }
  return out.length > 0 ? out : [{ ruleId, status: 'holds' }];
}
