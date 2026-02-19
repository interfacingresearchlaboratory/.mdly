/** LocalStorage key for app font preference. */
export const APP_FONT_STORAGE_KEY = "app-font";

/** Font keys available for the whole app. */
export type AppFontKey = "geist" | "inter";

export const APP_FONT_KEYS: AppFontKey[] = ["geist", "inter"];

/** CSS variable for each app font (must match layout font variable names). */
export const APP_FONT_VARIABLES: Record<AppFontKey, string> = {
  geist: "var(--font-geist-sans)",
  inter: "var(--font-inter)",
};

export const APP_FONT_LABELS: Record<AppFontKey, string> = {
  geist: "Geist",
  inter: "Inter",
};
