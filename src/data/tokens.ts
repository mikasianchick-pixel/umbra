// Подписи для страницы /system. Сами значения живут в src/styles/tokens.css —
// здесь только имена переменных и текст для людей, образцы красятся через var(--…).

export interface ColorToken {
  name: string;
  oklch: string;
  hex: string;
  use: string;
}

export const baseColors: ColorToken[] = [
  { name: "--bg", oklch: "0.145 0.014 285", hex: "#090910", use: "Page background" },
  { name: "--surface-1", oklch: "0.185 0.018 285", hex: "#12121A", use: "Cards" },
  { name: "--surface-2", oklch: "0.225 0.022 285", hex: "#1B1A26", use: "Dialogs, raised" },
  { name: "--text", oklch: "0.94 0.008 285", hex: "#EAEAF0", use: "Primary text · 16.6:1" },
  { name: "--text-muted", oklch: "0.70 0.02 285", hex: "#9D9DAB", use: "Secondary text · 7.4:1" },
];

export const accentColors: ColorToken[] = [
  {
    name: "--accent",
    oklch: "0.74 0.14 292",
    hex: "#AD99FB",
    use: "Main · buttons, links, active",
  },
  { name: "--accent-2", oklch: "0.83 0.10 205", hex: "#6FDAE6", use: "Glow · gradients, numbers" },
  { name: "--hot", oklch: "0.74 0.14 352", hex: "#ED83B4", use: "Rare · Play, sales" },
];

export const stateColors: ColorToken[] = [
  { name: "--success", oklch: "0.80 0.13 155", hex: "#72D699", use: "Success" },
  { name: "--danger", oklch: "0.70 0.15 22", hex: "#ED7473", use: "Errors" },
];

export const typeScale = [
  {
    label: "Display · Orbitron 900",
    token: "--text-display",
    sample: "Play the night",
    font: "display",
  },
  { label: "H1 · Orbitron 900", token: "--text-5xl", sample: "Games of the week", font: "display" },
  { label: "H2 · Orbitron 900", token: "--text-4xl", sample: "Umbra Pass", font: "display" },
  {
    label: "Lead · Inter 400",
    token: "--text-xl",
    sample: "Discover handpicked indie worlds, built by small teams with big ideas.",
    font: "body",
  },
  {
    label: "Body · Inter 400",
    token: "--text-base",
    sample: "Cloud saves, achievements and friends — everything syncs across your devices.",
    font: "body",
  },
  {
    label: "Mono · JetBrains Mono 500",
    token: "--text-base",
    sample: "128 402 PLAYERS ONLINE · $9.99 / MO",
    font: "mono",
  },
] as const;

export const spaceScale = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32] as const;

export const radii = ["--radius-sm", "--radius-md", "--radius-lg", "--radius-pill"] as const;

export const glows = ["none", "--glow-sm", "--glow-md", "--glow-lg"] as const;
