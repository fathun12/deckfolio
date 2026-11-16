// Membuat proyek demo "House Showcase (Demo)" milik emailmu (email pertama di ALLOWED_EMAILS).
// Syarat: kamu sudah pernah login sekali (supaya baris profiles ada).
// Jalankan: npm run db:seed

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ownerEmail = (process.env.ALLOWED_EMAILS ?? "").split(",")[0]?.trim().toLowerCase();

if (!url || !key || !ownerEmail) {
  console.error("Missing env values. Check .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function must(result, label) {
  if (result.error) {
    console.error(`${label} failed:`, result.error.message);
    process.exit(1);
  }
  return result.data;
}

const SLUG = "demo-house-showcase";

const profile = must(
  await supabase.from("profiles").select("id").eq("email", ownerEmail).maybeSingle(),
  "Find profile"
);
if (!profile) {
  console.error(`No profile for ${ownerEmail}. Sign in once on the website, then run this again.`);
  process.exit(1);
}

const existing = must(
  await supabase.from("projects").select("id").eq("slug", SLUG).maybeSingle(),
  "Check existing"
);
if (existing) {
  console.log("Demo project already exists. Delete it in the dashboard first to re-seed.");
  process.exit(0);
}

// ---------- helpers ----------
const placeholder = (label) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><rect width="100%" height="100%" fill="#1a1a1a"/><text x="50%" y="50%" fill="#8a8a85" font-family="monospace" font-size="44" text-anchor="middle">${label}</text></svg>`
  )}`;

const t = (text, marks) => ({ type: "text", text, ...(marks ? { marks } : {}) });
const para = (...nodes) => ({ type: "paragraph", content: nodes });
const doc = (...paras) => ({ type: "doc", content: paras });

const richText = (content) => ({ id: randomUUID(), type: "text", content });
const image = (label, caption) => ({
  id: randomUUID(),
  type: "image",
  url: placeholder(label),
  alt: label,
  caption,
});
const gallery = (labels) => ({
  id: randomUUID(),
  type: "gallery",
  images: labels.map((label) => ({ url: placeholder(label), alt: label, caption: label })),
});
const reasoning = (text) => ({ id: randomUUID(), type: "reasoning", title: "Design reasoning", text });
const stat = (items) => ({ id: randomUUID(), type: "stat", items });
const button = (label, target) => ({ id: randomUUID(), type: "button", label, ...target });
const quote = (text, cite) => ({ id: randomUUID(), type: "quote", text, cite });
const divider = () => ({ id: randomUUID(), type: "divider" });

// ---------- ids ----------
const ids = {
  plan: randomUUID(),
  foyer: randomUUID(),
  living: randomUUID(),
  bed: randomUUID(),
  office: randomUUID(),
  bath: randomUUID(),
};
const sectionIds = { floor: randomUUID(), rooms: randomUUID() };

// ---------- project ----------
const project = must(
  await supabase
    .from("projects")
    .insert({
      owner_id: profile.id,
      slug: SLUG,
      title: "House Showcase (Demo)",
      subtitle: "Modern house, brutalism, with courtyard",
      stats: ["1 FLOOR", "1 BEDROOM", "2 BATHROOMS", "255 M2"],
      visibility: "public",
    })
    .select("id")
    .single(),
  "Insert project"
);

must(
  await supabase.from("sections").insert([
    { id: sectionIds.floor, project_id: project.id, title: "Floor Plan", position: 0 },
    { id: sectionIds.rooms, project_id: project.id, title: "Rooms", position: 1 },
  ]),
  "Insert sections"
);

const slides = [
  {
    id: ids.plan,
    section_id: sectionIds.floor,
    title: "Floor Plan",
    blocks: [
      richText(
        doc(
          para(
            t("A single-storey layout organised around an open courtyard. Start with the "),
            t("foyer", [{ type: "link", attrs: { slideId: ids.foyer } }]),
            t(", or jump straight to the "),
            t("living room", [{ type: "link", attrs: { slideId: ids.living } }]),
            t(".")
          )
        )
      ),
      image("Floor plan", "Ground floor, 255 m2"),
      stat([
        { label: "Floors", value: "1" },
        { label: "Bedrooms", value: "1" },
        { label: "Bathrooms", value: "2" },
        { label: "Area", value: "255 m2" },
      ]),
      button("Go to the rooms", { slideId: ids.foyer }),
    ],
  },
  {
    id: ids.foyer,
    section_id: sectionIds.rooms,
    title: "Foyer",
    blocks: [
      richText(
        doc(
          para(
            t("A transitional space that works as a "),
            t("living room", [{ type: "bold" }]),
            t(" and separates the private area from the public one.")
          )
        )
      ),
      gallery(["Foyer / top view", "Foyer / sofa", "Foyer / courtyard"]),
      reasoning("Located at the front, it is separated from the private area, ensuring privacy from outsiders."),
      button("Next: living room", { slideId: ids.living }),
    ],
  },
  {
    id: ids.living,
    section_id: sectionIds.rooms,
    title: "Living Room",
    blocks: [
      richText(doc(para(t("A living room with an open-concept kitchen design that flows seamlessly into the dining area.")))),
      image("Living room", "Open-concept kitchen and lounge"),
      quote("Concrete, wood and light. Nothing more.", "Design note"),
      reasoning("Material contrast keeps the raw structure visible while wood adds warmth."),
    ],
  },
  {
    id: ids.bed,
    section_id: sectionIds.rooms,
    title: "Bed Room",
    blocks: [
      richText(doc(para(t("A bedroom with an en suite bathroom.")))),
      gallery(["Bed room / bed", "Bed room / wardrobe"]),
      divider(),
      button("See the office", { slideId: ids.office }),
    ],
  },
  {
    id: ids.office,
    section_id: sectionIds.rooms,
    title: "Office Room",
    blocks: [
      richText(doc(para(t("A space used for work, facing the courtyard for daylight and calm.")))),
      image("Office room", "Desk facing the courtyard"),
    ],
  },
  {
    id: ids.bath,
    section_id: sectionIds.rooms,
    title: "Bath Room",
    blocks: [
      richText(doc(para(t("Two bathrooms: one en suite, one shared with guests.")))),
      stat([
        { label: "Bathrooms", value: "2" },
        { label: "En suite", value: "1" },
      ]),
      button("Back to the floor plan", { slideId: ids.plan }),
    ],
  },
];

must(
  await supabase.from("slides").insert(
    slides.map((slide, position) => ({ ...slide, project_id: project.id, position }))
  ),
  "Insert slides"
);

console.log(`Demo created: /p/${SLUG} (owner: ${ownerEmail})`);