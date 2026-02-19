/** LocalStorage key for app font preference. */
export const APP_FONT_STORAGE_KEY = "app-font";

/** Built-in app font keys. */
export type AppFontKey = "geist" | "inter";

export const APP_FONT_KEYS: AppFontKey[] = ["geist", "inter"];

/** CSS value for each built-in app font (variable or custom font-family string). */
export const APP_FONT_VARIABLES: Record<AppFontKey, string> = {
  geist: "var(--font-geist-sans)",
  inter: "var(--font-inter)",
};

export const APP_FONT_LABELS: Record<AppFontKey, string> = {
  geist: "Geist",
  inter: "Inter",
};

/** Resolve stored app font value to the CSS value for --font-app (variable or font-family string). */
export function getAppFontCssValue(stored: string): string {
  if (stored === "geist" || stored === "inter") {
    return APP_FONT_VARIABLES[stored];
  }
  return stored;
}
