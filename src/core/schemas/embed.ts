const YOUTUBE_ID = /^[\w-]{6,20}$/;

// Mengubah alamat biasa menjadi alamat embed. Hanya situs yang diizinkan, selain itu null.
export function toEmbedUrl(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  const host = u.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = u.pathname.slice(1);
    return YOUTUBE_ID.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    const fromPath = u.pathname.match(/^\/(?:embed|shorts)\/([\w-]{6,20})/)?.[1];
    const id = u.pathname === "/watch" ? u.searchParams.get("v") : fromPath;
    return id && YOUTUBE_ID.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = u.pathname.match(/^\/(?:video\/)?(\d+)/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }

  if (host === "loom.com") {
    const id = u.pathname.match(/^\/(?:share|embed)\/([\w-]+)/)?.[1];
    return id ? `https://www.loom.com/embed/${id}` : null;
  }

  if (host === "figma.com") {
    if (u.pathname.startsWith("/embed")) return u.toString();
    if (/^\/(file|design|proto|board)\//.test(u.pathname)) {
      return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(u.toString())}`;
    }
    return null;
  }

  if (host === "google.com" && u.pathname.startsWith("/maps/embed")) return u.toString();

  return null;
}