// Scripted keyboard walks. A walk is a plain list of steps; any tool that can press keys in a browser can run it.
// The kit holds no such tool: the checker (the browser tests today, the Fitter later) runs the steps and reports the first step that fails.

export type WalkStep =
  | { do: 'focus'; on: string }
  | { do: 'press'; key: 'Tab' | 'Shift+Tab' | 'Enter' | 'Space' | 'Escape' | 'ArrowRight' | 'ArrowLeft' | 'ArrowDown' | 'ArrowUp' | 'Home' | 'End' }
  | { do: 'expect-focus-on'; on: string }
  | { do: 'expect-focus-inside'; on: string }
  | { do: 'expect-visible'; on: string }
  | { do: 'expect-hidden'; on: string }
  | { do: 'expect-attribute'; on: string; name: string; value: string };

export interface Walk { id: string; ruleId: string; steps: readonly WalkStep[] }

/** A window over the page: Enter opens it, the focus moves inside and stays inside, Escape closes it, and the focus returns to the opener. */
export function dialogWalk(opener: string, dialog: string, tabPresses = 12): Walk {
  const steps: WalkStep[] = [{ do: 'focus', on: opener }, { do: 'press', key: 'Enter' }, { do: 'expect-visible', on: dialog }, { do: 'expect-focus-inside', on: dialog }];
  for (let i = 0; i < tabPresses; i++) steps.push({ do: 'press', key: 'Tab' }, { do: 'expect-focus-inside', on: dialog });
  steps.push({ do: 'press', key: 'Shift+Tab' }, { do: 'expect-focus-inside', on: dialog }, { do: 'press', key: 'Escape' }, { do: 'expect-hidden', on: dialog }, { do: 'expect-focus-on', on: opener });
  return { id: 'dialog-walk', ruleId: 'behavior-dialog-keys', steps };
}

/** A row of tabs: the arrow keys move between tabs, Home and End jump to the ends, and the chosen tab is marked. `tabs` lists the tabs in order. */
export function tabsWalk(tabs: readonly string[]): Walk {
  const first = tabs[0];
  const last = tabs[tabs.length - 1];
  if (first === undefined || last === undefined || tabs.length < 2) throw new Error('A tabs walk needs at least two tabs.');
  const steps: WalkStep[] = [{ do: 'focus', on: first }];
  for (const tab of tabs.slice(1)) steps.push({ do: 'press', key: 'ArrowRight' }, { do: 'expect-focus-on', on: tab });
  steps.push({ do: 'press', key: 'ArrowRight' }, { do: 'expect-focus-on', on: first }, { do: 'press', key: 'End' }, { do: 'expect-focus-on', on: last }, { do: 'press', key: 'Home' }, { do: 'expect-focus-on', on: first }, { do: 'press', key: 'Enter' }, { do: 'expect-attribute', on: first, name: 'aria-selected', value: 'true' });
  return { id: 'tabs-walk', ruleId: 'behavior-tabs-keys', steps };
}

/** The order of the Tab key: from `start`, each press lands on the next entry of `order`. */
export function tabOrderWalk(start: string, order: readonly string[]): Walk {
  const steps: WalkStep[] = [{ do: 'focus', on: start }];
  for (const stop of order) steps.push({ do: 'press', key: 'Tab' }, { do: 'expect-focus-on', on: stop });
  return { id: 'tab-order-walk', ruleId: 'behavior-tab-order', steps };
}
