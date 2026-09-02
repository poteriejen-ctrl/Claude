import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import fs from "fs";
import path from "path";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });
const DB = process.env.NOTION_DATABASE_ID;

/* 노션 속성값을 안전하게 꺼낸다. 속성이 없거나 비어도 터지지 않게. */
function text(p) {
  if (!p) return "";
  if (p.type === "title") return (p.title || []).map((t) => t.plain_text).join("");
  if (p.type === "rich_text") return (p.rich_text || []).map((t) => t.plain_text).join("");
  return "";
}
function selectName(p) {
  return p && p.type === "select" && p.select ? p.select.name : "";
}
function dateStart(p) {
  return p && p.type === "date" && p.date ? p.date.start : "";
}
function checkbox(p) {
  return !!(p && p.type === "checkbox" && p.checkbox);
}
/* 커버 이미지.
   ⚠️ 노션에 "업로드"한 이미지는 주소가 약 1시간 뒤 만료됩니다.
      외부 URL(external)만 안전하므로, 커버는 이미지 주소를 붙여넣어 쓰세요. */
function cover(page) {
  const c = page.cover;
  if (!c) return "";
  if (c.type === "external") return c.external.url;
  return ""; // 업로드 이미지는 만료되므로 쓰지 않음
}

/* public/covers/<슬러그>.(jpg|jpeg|png|webp) 파일이 있으면 그걸 표지로 쓴다.
   노션 커버(외부 URL)가 있으면 그쪽을 우선한다. */
function localCover(slug) {
  const dir = path.join(process.cwd(), "public", "covers");
  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    if (fs.existsSync(path.join(dir, `${slug}${ext}`))) return `/covers/${slug}${ext}`;
  }
  return "";
}

function mapPost(page) {
  const p = page.properties || {};
  const title = text(p["제목"] || p["Title"] || p["Name"]);
  const slug = text(p["슬러그"] || p["Slug"]) || page.id.replace(/-/g, "");
  return {
    id: page.id,
    title,
    slug,
    description: text(p["요약"] || p["Description"]),
    category: selectName(p["카테고리"] || p["Category"]),
    date: dateStart(p["발행일"] || p["Date"]) || page.created_time.slice(0, 10),
    cover: cover(page) || localCover(slug),
  };
}

/* 발행 체크된 글만, 최신순 */
export async function getPosts() {
  if (!process.env.NOTION_TOKEN || !DB) return [];
  try {
    const res = await notion.databases.query({
      database_id: DB,
      filter: { property: "발행", checkbox: { equals: true } },
      sorts: [{ property: "발행일", direction: "descending" }],
      page_size: 100,
    });
    return res.results.map(mapPost).filter((p) => p.title);
  } catch (e) {
    /* 속성 이름이 다르면 필터 없이 한 번 더 시도 */
    try {
      const res = await notion.databases.query({ database_id: DB, page_size: 100 });
      return res.results
        .map(mapPost)
        .filter((p) => p.title)
        .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    } catch (e2) {
      console.error("[notion] 목록 조회 실패:", e2.message);
      return [];
    }
  }
}

export async function getPost(slug) {
  const posts = await getPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return null;
  const blocks = await n2m.pageToMarkdown(post.id);
  const md = n2m.toMarkdownString(blocks);
  return { ...post, markdown: md.parent || "" };
}
