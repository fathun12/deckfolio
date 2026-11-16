// Gaya untuk file HTML offline. File offline harus mandiri, jadi tidak bisa memakai
// globals.css. Token warna di bawah DUPLIKAT dari src/styles/globals.css:
// kalau Anda mengganti warna di sana, ganti juga di sini.

const DARK =
  "--paper:#0a0a0a;--surface:#121212;--ink:#f2f0ea;--muted:#9a9a93;--line:#f2f0ea;--line-soft:#2a2a28;--accent:#e2592a;--accent-ink:#0a0a0a;--inverse:#f2f0ea;--inverse-ink:#0a0a0a;";

export const HTML_STYLE = `
:root{--paper:#f7f5f0;--surface:#ffffff;--ink:#0a0a0a;--muted:#6b6b66;--line:#0a0a0a;--line-soft:#d9d6cd;--accent:#c2410c;--accent-ink:#ffffff;--inverse:#0a0a0a;--inverse-ink:#f7f5f0;
--sans:Inter,ui-sans-serif,system-ui,"Segoe UI",Roboto,sans-serif;
--display:"Space Grotesk",Inter,ui-sans-serif,system-ui,"Segoe UI",sans-serif;
--mono:"JetBrains Mono",ui-monospace,"Cascadia Mono",Consolas,monospace}
:root[data-theme="dark"]{${DARK}}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){${DARK}}}
*{box-sizing:border-box;margin:0}
[hidden]{display:none!important}
html,body{height:100%}
body{height:100vh;height:100dvh;display:flex;flex-direction:column;background:var(--paper);color:var(--ink);font-family:var(--sans);line-height:1.5;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4,h5{font-family:var(--display);letter-spacing:-.025em}
::selection{background:var(--accent);color:var(--accent-ink)}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
button{font:inherit;color:inherit}
a{color:inherit}
figure{margin:0}
img{display:block;max-width:100%}
.mono{font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:.1em}
.muted{color:var(--muted)}
.accent{color:var(--accent)}
.mt{margin-top:.5rem}
.progress{height:2px;background:var(--line-soft)}
.progress i{display:block;height:100%;width:0;background:var(--accent);transition:width .3s}
.stage{flex:1;overflow-y:auto;display:flex;flex-direction:column}
.slide{display:none;flex:1;flex-direction:column;justify-content:center;width:100%;max-width:64rem;margin:0 auto;padding:3rem 1.5rem}
.slide.active{display:flex;animation:fade-in .35s ease-out both}
.title{margin-top:.75rem;font-size:3rem;line-height:1;font-weight:700;text-transform:uppercase}
.content{margin-top:2.5rem;display:flex;flex-direction:column;gap:2rem;font-size:1.125rem}
@media (min-width:768px){.slide{padding:3rem}.title{font-size:4.5rem}.content{font-size:1.25rem}}
.panel{border:1px solid var(--line);background:var(--inverse);color:var(--inverse-ink);padding:2.5rem}
.cover-title{font-size:3rem;line-height:1;font-weight:700;text-transform:uppercase;margin-top:1rem}
.cover-sub{margin-top:1rem;font-size:1.25rem;opacity:.85}
.cover-stats{margin-top:1.5rem}
.cover-img{margin-top:1.5rem;width:100%;border:1px solid var(--line)}
@media (min-width:768px){.cover-title{font-size:4.5rem}}
.bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.75rem;border-top:1px solid var(--line);padding:.75rem 1rem}
.bar .group{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}
.hint{display:none}
@media (min-width:1024px){.hint{display:block}}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;border:1px solid var(--line);background:transparent;color:var(--ink);padding:.375rem .75rem;font-size:.75rem;font-weight:500;line-height:1.5;cursor:pointer;text-decoration:none;transition:background-color .15s,color .15s}
.btn:hover:not(:disabled){background:var(--inverse);color:var(--inverse-ink)}
.btn:disabled{opacity:.4;cursor:default}
.btn-solid{display:inline-flex;align-items:center;gap:.5rem;border:1px solid var(--line);background:var(--inverse);color:var(--inverse-ink);padding:.5rem 1rem;font-size:.875rem;font-weight:500;text-decoration:none;transition:background-color .15s,color .15s}
.btn-solid:hover{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.link{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:4px}
.link:hover{color:var(--accent)}
.prose{max-width:65ch}
.prose>*+*{margin-top:1rem}
.prose p{line-height:1.625}
.prose ul{list-style:disc;padding-left:1.25rem}
.prose ol{list-style:decimal;padding-left:1.25rem}
.prose li+li{margin-top:.25rem}
.prose code{background:var(--line-soft);padding:0 .25rem;font-family:var(--mono);font-size:.9em}
.h1{font-size:1.875rem;font-weight:700}
.h2{font-size:1.5rem;font-weight:600}
.h3{font-size:1.125rem;font-weight:600}
figure img{width:100%;border:1px solid var(--line)}
figcaption{margin-top:.5rem}
.note{border:1px dashed var(--line-soft);padding:1rem;color:var(--muted)}
.gal-tools{display:flex;justify-content:flex-end;gap:.5rem;margin-bottom:.75rem}
.gal{display:flex;gap:1rem;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;scrollbar-width:none}
.gal::-webkit-scrollbar{display:none}
.gal figure{flex:0 0 85%;scroll-snap-align:start}
.gal img{aspect-ratio:3/2;object-fit:cover}
@media (min-width:768px){.gal figure{flex-basis:48%}}
blockquote{border-left:1px solid var(--line);padding-left:1.5rem}
.q{font-family:var(--display);font-size:1.5rem;line-height:1.375}
blockquote footer{margin-top:.75rem}
.stats{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;border:1px solid var(--line);background:var(--line)}
.stats>div{background:var(--surface);padding:1rem}
.stats dd{margin-top:.5rem;font-family:var(--display);font-size:1.875rem;font-weight:700}
@media (min-width:768px){.stats{grid-template-columns:repeat(4,1fr)}}
aside{border-left:2px solid var(--accent);padding-left:1rem}
aside p+p{margin-top:.5rem;line-height:1.625}
hr{border:0;border-top:1px solid var(--line)}
pre{overflow-x:auto;border:1px solid var(--line);background:var(--surface);padding:1rem;font-family:var(--mono);font-size:.875rem}
.bento{display:grid;grid-template-columns:1fr;border-top:1px solid var(--line);border-left:1px solid var(--line)}
.cell{border-right:1px solid var(--line);border-bottom:1px solid var(--line);background:var(--surface);padding:1.5rem}
.cell img{width:100%;aspect-ratio:16/9;object-fit:cover;margin-bottom:1rem}
.cell p.mono{margin-bottom:.5rem}
.cell h3{font-size:1.25rem;font-weight:600}
.cell .text{margin-top:.5rem;font-size:.875rem;color:var(--muted);white-space:pre-line}
@media (min-width:640px){.bento{grid-template-columns:repeat(2,1fr)}.cell.span2{grid-column:span 2}}
@media (min-width:1024px){.bento{grid-template-columns:repeat(3,1fr)}}
.embed{display:flex;flex-direction:column;gap:.5rem;border:1px solid var(--line);padding:1.5rem}
.edge{position:fixed;left:0;top:0;bottom:3.5rem;width:12px;z-index:10}
.toc{display:none;position:fixed;inset:0;z-index:20}
.toc.open{display:block}
.scrim{position:absolute;inset:0;width:100%;border:0;background:rgb(0 0 0 / .3);cursor:default;animation:fade-in .35s ease-out both}
.toc nav{position:absolute;top:0;bottom:0;left:0;width:20rem;max-width:85%;overflow-y:auto;border-right:1px solid var(--line);background:var(--paper);padding:1.5rem;animation:slide-in-left .3s cubic-bezier(.22,1,.36,1) both}
.toc-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem}
.toc ol{list-style:none;padding:0}
.toc ol ol{margin:.25rem 0 0 1rem}
.toc li+li{margin-top:.25rem}
.toc a,.toc .plain{display:flex;align-items:baseline;gap:.75rem;border-left:1px solid var(--line-soft);padding:.375rem 0 .375rem .75rem;font-size:.875rem;color:var(--muted);text-decoration:none;transition:color .15s}
.toc a:hover{color:var(--ink)}
.toc a[aria-current="true"]{border-color:var(--accent);color:var(--ink)}
@keyframes fade-in{from{opacity:0}to{opacity:1}}
@keyframes slide-in-left{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
`;