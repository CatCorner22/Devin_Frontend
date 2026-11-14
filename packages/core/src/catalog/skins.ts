// Skins: pre-built colors for a Direction.
//
// A Direction sets everything at once: layout, letters, shapes, and colors. A skin changes the colors only: the main color,
// the second color where the page has one, the tint of the grays, and whether the headline carries a color fade (designers
// call a fade a gradient). Layout, letters, and shapes stay as the Direction made them. How light and how vivid the main
// color is also stays, because the Direction's readable contrast depends on it.
//
// Every skin is the composition of the assistant that wrote this Studio. No outside source was consulted for the choice of
// colors, and no person has reviewed them. Which skins a Direction offers is a list on the Direction record; a unit test holds
// that each listed pair starts without a clash between its choices and with every measured color pair passing.

import type { DesignParams, DisplayTreatment } from '../params.js';
import type { Direction } from './directions.js';

export interface Skin {
  id: string;
  name: string;
  /** What the skin looks like, in plain words. */
  what: string;
  /** Which color the main color is, as a place on the color wheel (0 to 360). */
  accentHue: number;
  /** The second color: the far end of a fade, and the second color of a two-color page. `null`: the skin has one color. */
  accent2Hue: number | null;
  /** The tint of the grays, as a place on the color wheel. */
  neutralHue: number;
  /** How vivid the main color is, where the skin must set it (a skin without color). Otherwise the Direction's value stays. */
  accentChroma?: number;
  /** How the largest headline is filled: one color, or a fade. */
  displayTreatment: DisplayTreatment;
}

export const SKINS: readonly Skin[] = [
  { id: 'ocean', name: 'Ocean', what: 'A clear blue, with grays that lean slightly blue.', accentHue: 245, accent2Hue: null, neutralHue: 245, displayTreatment: 'solid' },
  { id: 'lagoon', name: 'Lagoon fade', what: 'Blue-green that fades into blue across the headline.', accentHue: 195, accent2Hue: 255, neutralHue: 215, displayTreatment: 'accent-gradient' },
  { id: 'forest', name: 'Forest', what: 'A deep green, with grays that lean slightly green.', accentHue: 152, accent2Hue: null, neutralHue: 150, displayTreatment: 'solid' },
  { id: 'meadow', name: 'Meadow fade', what: 'Green that fades into yellow-green across the headline.', accentHue: 140, accent2Hue: 100, neutralHue: 120, displayTreatment: 'accent-gradient' },
  { id: 'sunset', name: 'Sunset fade', what: 'Orange that fades into rose pink across the headline.', accentHue: 42, accent2Hue: 355, neutralHue: 50, displayTreatment: 'accent-gradient' },
  { id: 'ember', name: 'Ember', what: 'A red-orange, with grays that lean slightly warm.', accentHue: 28, accent2Hue: null, neutralHue: 45, displayTreatment: 'solid' },
  { id: 'berry', name: 'Berry', what: 'A rose red, with grays that lean slightly pink.', accentHue: 355, accent2Hue: null, neutralHue: 350, displayTreatment: 'solid' },
  { id: 'orchid', name: 'Orchid fade', what: 'Pink-purple that fades into violet across the headline.', accentHue: 320, accent2Hue: 275, neutralHue: 300, displayTreatment: 'accent-gradient' },
  { id: 'violet', name: 'Violet', what: 'A blue-purple, with grays that lean slightly purple.', accentHue: 288, accent2Hue: null, neutralHue: 285, displayTreatment: 'solid' },
  { id: 'gold', name: 'Gold', what: 'A warm yellow-brown, with grays that lean slightly yellow.', accentHue: 82, accent2Hue: null, neutralHue: 78, displayTreatment: 'solid' },
  { id: 'graphite', name: 'Graphite', what: 'Almost no color: a near-black main color and a soft fade from top to bottom in the headline.', accentHue: 255, accent2Hue: null, neutralHue: 255, accentChroma: 0.02, displayTreatment: 'ink-gradient' },
  // Two skins from the study of Japanese design (decision D52). The names say what a person sees. No screen value of a
  // "traditional" color exists (the research record says so), so these are the Studio's own values inside each color family.
  { id: 'indigo', name: 'Indigo dye', what: 'A deep, quiet blue, like cloth dyed with indigo, with grays that lean slightly warm.', accentHue: 250, accent2Hue: null, neutralHue: 85, accentChroma: 0.09, displayTreatment: 'solid' },
  { id: 'vermilion', name: 'Vermilion seal', what: 'The orange-red of a seal stamped on a letter, with grays that lean slightly warm.', accentHue: 35, accent2Hue: null, neutralHue: 85, displayTreatment: 'solid' },
];

const SKIN_TABLE = new Map<string, Skin>(SKINS.map((skin) => [skin.id, skin]));
export const findSkin = (id: string): Skin | undefined => SKIN_TABLE.get(id);

const turn = (hue: number, by: number): number => (((hue + by) % 360) + 360) % 360;

/**
 * The design values of a Direction in one of the skins. Only color values change.
 * A two-color skin shows its second color where the Direction's page has room for one: on a page with one main color or with
 * two colors. A page that is tinted as a whole, or that uses color in small details only, keeps its way of using color.
 * A one-color skin on a two-color Direction keeps the Direction's distance between the two colors.
 */
export function skinParams(direction: Direction, skin: Skin): DesignParams {
  const p = direction.params;
  const twoColors = p.colorStrategy === 'duo' || p.colorStrategy === 'single-accent';
  const out: DesignParams = { ...p, accentHue: skin.accentHue, neutralHue: skin.neutralHue, displayTreatment: skin.displayTreatment };
  if (skin.accentChroma !== undefined) out.accentChroma = skin.accentChroma;
  if (skin.accent2Hue !== null && twoColors) {
    out.colorStrategy = 'duo';
    out.accent2Hue = skin.accent2Hue;
  } else if (p.colorStrategy === 'duo') {
    out.accent2Hue = turn(skin.accentHue, p.accent2Hue - p.accentHue);
  }
  return out;
}

/** The skins that a Direction offers, in the order of its record. A Direction without a list (a generated one) offers none. */
export function skinsOf(direction: Direction): Skin[] {
  return (direction.skins ?? []).map((id) => findSkin(id)).filter((skin): skin is Skin => skin !== undefined);
}
