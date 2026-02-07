import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: "#020617", // Slate 950 (Deep Space Black)
          dark: "#0f172a",  // Slate 900 (Deep Navy)
          gray: "#1e293b",  // Slate 800 (Tech Gray)
          primary: "#38bdf8", // Sky 400 (Holographic Blue)
          secondary: "#f43f5e", // Rose 500 (Laser Red)
          accent: "#94a3b8", // Slate 400 (Titanium Gray)
          muted: "#334155", // Slate 700
        },
      },
      fontFamily: {
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-fast': 'scan 2s linear infinite',
        'scan-slow': 'scan 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      },
    },
  },
  plugins: [],
};
export default config;
