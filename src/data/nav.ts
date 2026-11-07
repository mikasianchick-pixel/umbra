import { link } from "./link";

export interface NavLink {
  label: string;
  href: string;
}

// Главное меню. Ведёт только на существующие страницы и секции — без «мёртвых» ссылок.
export const mainNav: NavLink[] = [
  { label: "Store", href: link("/games") },
  { label: "How it works", href: link("/#how") },
  { label: "Umbra Pass", href: link("/#pass") },
  { label: "Design system", href: link("/system") },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Platform",
    links: [
      { label: "Store", href: link("/games") },
      { label: "Umbra Pass", href: link("/#pass") },
      { label: "FAQ", href: link("/#faq") },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Design system", href: link("/system") },
      { label: "How it works", href: link("/#how") },
    ],
  },
];
