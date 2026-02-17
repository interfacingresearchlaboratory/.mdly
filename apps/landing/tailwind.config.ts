import type { Config } from "tailwindcss";
import baseConfig from "@editor/ui/tailwind.config";

export default {
  ...baseConfig,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
} satisfies Config;
