// robots.txt: всё открыто, кроме служебной страницы превью; ссылка на карту сайта — полным адресом.
// На GitHub Pages сайт лежит в папке /umbra/, поэтому поисковики этот файл не увидят (он работает
// только в корне домена) — но он пригодится, если сайт переедет на свой домен.
import type { APIRoute } from "astro";
import { link } from "@/data/link";

export const GET: APIRoute = ({ site }) =>
  new Response(
    `User-agent: *\nAllow: /\nDisallow: ${link("/og")}\n\nSitemap: ${new URL(link("/sitemap.xml"), site).href}\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
