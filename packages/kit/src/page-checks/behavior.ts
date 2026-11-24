// Page checks for behavior: what a control must do for a person who uses a keyboard, a finger, or a screen reader.
// Each function is self-contained (see neuro.ts).
import type { Finding } from '../shapes.js';

/** A thing that answers a click but that the Tab key cannot reach. */
export function keyboardReachable(doc: Document): Finding[] {
  const ruleId = 'behavior-keyboard-reach';
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  const native = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'SUMMARY', 'LABEL', 'OPTION'];
  const out: Finding[] = [];
  const walked = '[role="tablist"], [role="menu"], [role="menubar"], [role="listbox"], [role="radiogroup"], [role="toolbar"], [role="tree"], [role="grid"]';
  const flagged = new Set<Element>();
  for (const el of doc.querySelectorAll<HTMLElement>('[onclick], [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="checkbox"], [role="switch"]')) {
    if (el.getClientRects().length === 0) continue;
    if (native.includes(el.tagName) && !(el.tagName === 'A' && !el.hasAttribute('href'))) continue;
    // Inside a group that the arrow keys walk, an item with tabindex -1 is the pattern of the ARIA guide (F-15).
    // The group must still have a way in: one of its items, or the group itself, takes the Tab key.
    // A menu is the exception: the button that opens it moves the focus into it.
    const group = el.hasAttribute('tabindex') && el.tabIndex < 0 ? el.closest<HTMLElement>(walked) : null;
    if (group && (group.getAttribute('role') === 'menu' || group.tabIndex >= 0 || [...group.querySelectorAll<HTMLElement>('[role], a[href], button, input, select, textarea, [tabindex]')].some((item) => item.tabIndex >= 0 && item.getClientRects().length > 0))) continue;
    if ((el.tabIndex < 0 || !el.hasAttribute('tabindex')) && flagged.add(el)) out.push({ ruleId, status: 'fails', where: name(el), measured: 'answers a click, and the Tab key cannot reach it', required: 'reachable and usable by keyboard', fix: 'Use a <button> element (or <a href> for a link) in place of this element.' });
  }
  // A click that a script attached leaves no mark in the page that this check can read. The hand-shaped pointer is the usual
  // sign of one: an element that shows it, is no control, holds no control, and has no Tab stop is taken for a mouse-only control (F-7).
  const view = doc.defaultView;
  const control = 'a[href], button, input, select, textarea, summary, label, option, [tabindex], [contenteditable]';
  if (view) for (const el of doc.querySelectorAll<HTMLElement>('body *')) {
    if (flagged.has(el) || el.getClientRects().length === 0 || view.getComputedStyle(el).cursor !== 'pointer') continue;
    if (el.parentElement && el.parentElement !== doc.body && view.getComputedStyle(el.parentElement).cursor === 'pointer') continue;
    if (el.closest(control) || el.querySelector(control) || el.closest('[aria-hidden="true"], [inert]') || view.getComputedStyle(el).visibility !== 'visible') continue;
    out.push({ ruleId, status: 'fails', where: name(el), measured: 'shows the hand pointer of a control, and the Tab key cannot reach it', required: 'reachable and usable by keyboard', fix: 'If this element answers a click, use a <button> element (or <a href> for a link). If it does not, remove cursor: pointer.' });
  }
  // A native control taken out of the Tab order. Inside a group that the arrow keys walk (tabs, a menu, a toolbar), one stop is right.
  for (const el of doc.querySelectorAll<HTMLElement>('a[href][tabindex], button[tabindex], input[tabindex], select[tabindex], textarea[tabindex]')) {
    // A control that nobody can see or use needs no stop: hidden, or switched off (also by a fieldset around it).
    if (el.tabIndex >= 0 || el.getClientRects().length === 0 || el.matches(':disabled') || el.closest(walked) || el.closest('[inert]') || doc.defaultView?.getComputedStyle(el).visibility !== 'visible') continue;
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
  const boxOf = (el: HTMLElement): DOMRect => {
    const label = (el as HTMLInputElement).labels?.[0];
    return (el.getAttribute('type') === 'checkbox' || el.getAttribute('type') === 'radio') && label ? label.getBoundingClientRect() : el.getBoundingClientRect();
  };
  const small = (box: DOMRect): boolean => box.width < 24 || box.height < 24;
  // The spacing exception of WCAG 2.5.8: a circle 24 pixels across, centered on the small target, meets no other target
  // and no other small target's circle (F-14).
  const spaced = (el: HTMLElement, box: DOMRect): boolean => {
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    return targets.every((other) => {
      if (other === el || other.contains(el) || el.contains(other)) return true;
      const b = boxOf(other);
      if (b.width === 0 && b.height === 0) return true;
      if (small(b)) return Math.hypot(x - (b.left + b.width / 2), y - (b.top + b.height / 2)) >= 24;
      const dx = Math.max(b.left - x, 0, x - b.right);
      const dy = Math.max(b.top - y, 0, y - b.bottom);
      return Math.hypot(dx, dy) >= 12;
    });
  };
  for (const el of targets) {
    const inSentence = el.tagName === 'A' && view.getComputedStyle(el).display === 'inline' && [...(el.parentElement?.childNodes ?? [])].some((n) => n.nodeType === 3 && /[^\s|·•,;:/()\-–—]/.test(n.textContent ?? ''));
    if (inSentence) continue;
    let box = boxOf(el);
    // A skip link is one pixel large until it has the focus; it is measured as the person meets it (F-13).
    const hiddenOnPurpose = box.width <= 1.5 || box.height <= 1.5 || box.right <= 0 || box.bottom + view.scrollY <= 0;
    if (hiddenOnPurpose) {
      const before = doc.activeElement as HTMLElement | null;
      el.focus({ preventScroll: true });
      box = boxOf(el);
      if (before && before !== el && typeof before.focus === 'function') before.focus({ preventScroll: true }); else el.blur();
      if (box.width <= 1.5 || box.height <= 1.5 || box.right <= 0) continue;
    }
    if (small(box) && !spaced(el, box)) out.push({ ruleId, status: 'fails', where: name(el), measured: `${Math.round(box.width)} by ${Math.round(box.height)} px`, required: 'at least 24 by 24 px, or 24 px of room around its center', fix: 'Add padding or a min-width and min-height of 24px (44px where the design asks for comfort).' });
  }
  return out.length > 0 ? out : [{ ruleId, status: 'holds' }];
}

/** A button or link with no name that a screen reader can say, such as a button that holds only an icon. */
export function controlsHaveNames(doc: Document): Finding[] {
  const ruleId = 'behavior-control-name';
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  const controls = [...doc.querySelectorAll<HTMLElement>('a[href], button, input[type="button"], input[type="submit"], input[type="reset"], input[type="image"], [role="button"], [role="link"], [role="tab"], [role="menuitem"]')].filter((el) => el.getClientRects().length > 0);
  if (controls.length === 0) return [{ ruleId, status: 'not-applicable' }];
  const out: Finding[] = [];
  // Letters that draw nothing (zero-width spaces and joiners, the soft hyphen, the byte-order mark) are no name.
  const unseen = new RegExp('[\\u200b-\\u200f\\u2060-\\u2064\\u00ad\\ufeff]', 'g');
  for (const el of controls) {
    const byId = (el.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean).map((id) => doc.getElementById(id)?.textContent ?? '').join('');
    // Only what a screen reader is given counts: nothing inside a part marked aria-hidden, and nothing that is not drawn.
    // The text itself is asked whether it is drawn, because a wrapper with "display: contents" has no box of its own.
    const open = (node: Element): boolean => !node.closest('[aria-hidden="true"]');
    const pictures = [...el.querySelectorAll('img[alt], svg[aria-label]')].filter((p) => open(p) && p.getClientRects().length > 0).map((p) => p.getAttribute('alt') ?? p.getAttribute('aria-label') ?? '').join('');
    let text = '';
    const walker = doc.createTreeWalker(el, 4);
    const range = doc.createRange();
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.parentElement || !open(node.parentElement)) continue;
      range.selectNodeContents(node);
      if (node.parentElement.closest('svg') !== null || range.getClientRects().length > 0) text += node.textContent ?? '';
    }
    // A button made with `input`: its name is its `value` (Submit and Reset have a name from the browser); a picture button needs `alt`.
    const type = el.tagName === 'INPUT' ? (el.getAttribute('type') ?? '').toLowerCase() : '';
    const own = type === 'image' ? (el.getAttribute('alt') ?? '') : type === 'submit' || type === 'reset' ? (el.hasAttribute('value') ? (el.getAttribute('value') ?? '') : type) : type === 'button' ? (el.getAttribute('value') ?? '') : '';
    const said = [el.getAttribute('aria-label') ?? '', byId, text, pictures, own, el.getAttribute('title') ?? ''].join('').replace(unseen, '').trim();
    if (said === '') out.push({ ruleId, status: 'fails', where: name(el), measured: 'no name: no text, no label', required: 'a name that says what the control does', fix: 'Add visible text, or an aria-label that says what the control does.' });
  }
  return out.length > 0 ? out : [{ ruleId, status: 'holds' }];
}

/** A window over the page that is not marked as one, or that has no name. */
export function dialogsAreMarked(doc: Document): Finding[] {
  const ruleId = 'behavior-dialog-marked';
  const name = (el: Element): string => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''}`;
  const marks = 'dialog, [role="dialog"], [role="alertdialog"]';
  // A window that is not shown (a closed <dialog>, a hidden part) is not judged: no visitor meets it.
  const dialogs = [...doc.querySelectorAll<HTMLElement>(marks)].filter((el) => el.getClientRects().length > 0);
  const out: Finding[] = [];
  // A window with no mark at all (finding F-8): a fixed layer that covers the window, lies on top, takes the pointer, and
  // has page content beside it. A page whose whole content sits in one fixed shell has nothing beside the shell, and holds.
  const view = doc.defaultView;
  if (view) {
    const width = doc.documentElement.clientWidth;
    const height = view.innerHeight;
    for (const el of doc.querySelectorAll<HTMLElement>('body *')) {
      const computed = view.getComputedStyle(el);
      if (computed.position !== 'fixed' || computed.pointerEvents === 'none' || computed.visibility !== 'visible' || el.getClientRects().length === 0) continue;
      const box = el.getBoundingClientRect();
      if (box.width < width * 0.9 || box.height < height * 0.9) continue;
      const top = doc.elementFromPoint(width / 2, height / 2);
      if (!top || !(el === top || el.contains(top) || (top.closest('body > *') !== el.closest('body > *') && view.getComputedStyle(top).position === 'fixed'))) continue;
      const beside = [...doc.querySelectorAll<HTMLElement>('body *')].some((other) => !el.contains(other) && !other.contains(el) && other.getClientRects().length > 0 && view.getComputedStyle(other).position !== 'fixed' && !other.closest(marks) && [...other.childNodes].some((node) => node.nodeType === 3 && (node.textContent ?? '').trim() !== ''));
      const marked = el.matches(marks) || el.closest(marks) !== null || dialogs.some((d) => d.getClientRects().length > 0);
      if (beside && !marked) { out.push({ ruleId, status: 'fails', where: name(el), measured: 'a layer covers the page, and nothing marks a window', required: 'the <dialog> element, or role="dialog" with aria-modal="true" and a name', fix: 'Build the window with the <dialog> element and open it with showModal().' }); break; }
    }
  }
  if (dialogs.length === 0 && out.length === 0) return [{ ruleId, status: 'not-applicable' }];
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
  const loaders = [...doc.querySelectorAll<HTMLElement>('[data-loading], [class*="skeleton" i], [class*="spinner" i], [class*="loading" i]')].filter((el) => el.getClientRects().length > 0 && !el.closest('[hidden]') && doc.defaultView?.getComputedStyle(el).visibility === 'visible');
  if (loaders.length === 0) return [{ ruleId, status: 'not-applicable' }];
  const out: Finding[] = [];
  for (const el of loaders) {
    if (!el.closest('[aria-busy="true"], [role="status"], [role="progressbar"]')) out.push({ ruleId, status: 'fails', where: name(el), measured: 'a loading mark that a screen reader does not announce', required: 'aria-busy="true" on the part that loads, or role="status" with a word such as "Loading"', fix: 'Set aria-busy="true" on the part that is loading, and remove it when the content arrives.' });
  }
  return out.length > 0 ? out : [{ ruleId, status: 'holds' }];
}
