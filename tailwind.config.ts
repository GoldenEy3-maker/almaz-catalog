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
        xs: "26.25rem",
      },
      fontFamily: {
        gothamPro: ["GothaPro", ...fontFamily.sans],
        ptRoot: ["PTRoot", ...fontFamily.sans],
      },
      fontSize: {
        // 32px at 640px and 40px at 1536px
        h1: ["clamp(2rem, 1.6429rem + 0.8929vw, 2.5rem)", "1.3"],
        // 28px at 640px and 36px at 1536px
        h2: ["clamp(1.75rem, 1.3929rem + 0.8929vw, 2.25rem)", "1.3"],
        // 20px at 640px and 24px at 1536px
        h3: ["clamp(1.25rem, 1.0714rem + 0.4464vw, 1.5rem)", "1.3"],
        // 18px at 640px and 22px at 1536px
        h4: ["clamp(1.125rem, 0.9464rem + 0.4464vw, 1.375rem)", "1.35"],
        // 16px at 640px and 20px at 1536px
        h5: ["clamp(1rem, 0.8214rem + 0.4464vw, 1.25rem)", "1"],
      },
      colors: {
        background: "#FFFFFF",
        foreground: "#000000",
        primary: {
          DEFAULT: "#FABA2C",
          foreground: "#FAB92B",
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
      keyframes: {
        modalOpen: {
          from: {
            opacity: "0",
            visiblity: "hidden",
            translate: "0 50px",
          },
          to: {
            opacity: "1",
            visibility: "visible",
            translate: "0",
          },
        },
        modalClose: {
          from: {
            opacity: "1",
            visibility: "visible",
            translate: "0",
          },
          to: {
            opacity: "0",
            visiblity: "hidden",
            translate: "0 50px",
          },
        },
      },
      animation: {
        modalOpen: "modalOpen ease forwards",
        modalClose: "modalClose ease forwards",
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
