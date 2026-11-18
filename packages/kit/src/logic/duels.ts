// Duels: two designs that differ in exactly one decision, shown side by side. The owner's picks become measured preferences.
export type Design = Readonly<Record<string, string | number | boolean>>;

/** The decisions in which two designs differ. A fair duel has exactly one. */
export function differences(a: Design, b: Design): string[] {
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((key) => a[key] !== b[key]).sort();
}
export function isFairDuel(a: Design, b: Design): boolean { return differences(a, b).length === 1; }

export interface DuelResult { decision: string; picked: string; rejected: string }
export interface Preference { decision: string; value: string; wins: number; losses: number; share: number }

/** For each value of each decision: how often it won and lost. A share that rests on few duels says little; the counts are there to show it. */
export function preferences(results: readonly DuelResult[]): Preference[] {
  const tally = new Map<string, Preference>();
  const entry = (decision: string, value: string): Preference => {
    const id = `${decision}\u0000${value}`;
    const found = tally.get(id) ?? { decision, value, wins: 0, losses: 0, share: 0 };
    tally.set(id, found);
    return found;
  };
  for (const r of results) {
    if (r.picked === r.rejected) throw new Error(`A duel on "${r.decision}" has the same value on both sides.`);
    entry(r.decision, r.picked).wins++;
    entry(r.decision, r.rejected).losses++;
  }
  return [...tally.values()].map((p) => ({ ...p, share: p.wins / (p.wins + p.losses) })).sort((a, b) => a.decision.localeCompare(b.decision) || b.share - a.share || a.value.localeCompare(b.value));
}
