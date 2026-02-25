/**
 * ─────────────────────────────────────────────
 *  HUMO RESTORATIONS — MASTER COLOR SHEET
 * ─────────────────────────────────────────────
 *  All colors for the site are defined HERE.
 *  Tailwind config reads from this file.
 *  To change any color, edit it below.
 * ─────────────────────────────────────────────
 */

export const colors = {
  /** ── Navy (Primary Dark Blue) ── */
  navy: {
    DEFAULT: "#081428",
    50: "#E8ECF2",
    100: "#C5CDDC",
    200: "#8D9DB8",
    300: "#5A7095",
    400: "#2D4A73",
    500: "#122754",
    600: "#0B1D3E",
    700: "#081428",
    800: "#050D1A",
    900: "#020610",
  },

  /** ── Crimson (Accent Red) ── */
  crimson: {
    DEFAULT: "#C41E3A",
    light: "#E8324F",
    dark: "#9A1830",
  },

  /** ── Slate (Neutral Grays) ── */
  slate: {
    50: "#F7F8FA",
    100: "#EEF0F4",
    200: "#DDE1E9",
    300: "#B8BFCE",
    400: "#8892A7",
    500: "#5F6B80",
    600: "#414B5E",
    700: "#2E3546",
    800: "#1C2231",
    900: "#0E1420",
  },

  /** ── Static Colors ── */
  white: "#FFFFFF",
  black: "#000000",
} as const;

/** Selection highlight color (used in globals.css) */
export const selectionColor = colors.crimson.DEFAULT;
