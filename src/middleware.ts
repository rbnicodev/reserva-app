import { defineMiddleware } from "astro:middleware";

const STATIC_PREFIXES = ["/@", "/src/", "/node_modules/", "/_astro/"];

/**
 * Las rutas `/{hash}/...` las resuelve la app React (basename = hash).
 * Se reescriben internamente a `/app` sin cambiar la URL del navegador.
 */
export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;
  const esRutaApp =
    pathname !== "/" &&
    pathname !== "/app" &&
    !STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) &&
    !pathname.split("/").pop()?.includes(".");

  return esRutaApp ? context.rewrite("/app") : next();
});
