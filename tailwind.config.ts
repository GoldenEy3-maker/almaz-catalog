import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import fluid, { extract, screens, fontSize } from "fluid-tailwind";
import containerQueries from "@tailwindcss/container-queries";

export default {
  content: {
    files: [
      "./src/**/*.pug",
      "./src/**/*.ts",
      "./src/**/*.js",
      "./src/**/*.css",
      "./src/**/*.scss",
      "./src/**/*.sass",
    ],
    extract,
  },
  theme: {
    screens,
    fontSize,
    extend: {
      screens: {
        md2: "62rem",
      },
      fontFamily: {
        gothamPro: ["GothaPro", ...fontFamily.sans],
        ptRoot: ["PTRoot", ...fontFamily.sans],
      },
      fontSize: {
        // 32px at 640px and 40px at 1536px
        h1: ["clamp(2rem, 1.6429rem + 0.8929vw, 2.5rem)", "1.3"],
        // 36px
        h2: ["2.25rem", "1.3"],
        // 24px
        h3: ["1.5rem", "1.3"],
        // 22px
        h4: ["1.375rem", "1.35"],
        // 20px
        h5: ["1.25rem", "1"],
      },
      colors: {
        background: "#FFFFFF",
        foreground: "#000000",
        primary: {
          DEFAULT: "#FABA2C",
        },
        border: {
          DEFAULT: "#CACACA",
          foreground: "#777777",
        },
        muted: {
          DEFAULT: "#9B9B9B",
          foreground: "#B6B6B6",
          background: "",
        },
        card: {
          DEFAULT: "#F2F2F2",
          background: "#F3F3F3",
          foreground: "#E6E6E6",
        },
        description: "#8C8C8E",
        destructive: "#E70400",
      },
    },
  },
  plugins: [
    fluid({
      checkSC144: false,
    }),
    containerQueries,
  ],
} satisfies Config;
