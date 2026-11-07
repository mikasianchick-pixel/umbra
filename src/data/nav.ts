export interface NavLink {
  label: string;
  href: string;
}

// Главное меню. Ведёт только на существующие страницы и секции — без «мёртвых» ссылок.
export const mainNav: NavLink[] = [
  { label: "Store", href: "/games" },
  { label: "How it works", href: "/#how" },
  { label: "Umbra Pass", href: "/#pass" },
  { label: "Design system", href: "/system" },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Platform",
    links: [
      { label: "Store", href: "/games" },
      { label: "Umbra Pass", href: "/#pass" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Design system", href: "/system" },
      { label: "How it works", href: "/#how" },
    ],
  },
];
