import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const SURVEY_DB = process.env.NOTION_SURVEY_DATABASE_ID;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request) {
  try {
    const raw = await request.text();
    const params = new URLSearchParams(raw);

    const topics = params.getAll("topic").filter(Boolean);
    const otherText = (params.get("topicOther") || "").trim();
    let note = (params.get("note") || "").trim();
    if (topics.includes("기타") && otherText) {
      note = note ? `[기타 주제: ${otherText}]\n${note}` : `[기타 주제: ${otherText}]`;
    }

    if (!SURVEY_DB) {
      throw new Error("NOTION_SURVEY_DATABASE_ID 환경변수가 설정되지 않았습니다.");
    }

    await notion.pages.create({
      parent: { database_id: SURVEY_DB },
      properties: {
        "기관명": { title: [{ text: { content: params.get("org") || "" } }] },
        "소재지": { rich_text: [{ text: { content: params.get("loc") || "" } }] },
        "담당자": { rich_text: [{ text: { content: params.get("manager") || "" } }] },
        "연락처": { phone_number: params.get("phone") || null },
        "이메일": { email: params.get("email") || null },
        "예상인원": { rich_text: [{ text: { content: params.get("headcount") || "" } }] },
        "희망일정": { rich_text: [{ text: { content: params.get("schedule") || "" } }] },
        "관심주제": { multi_select: topics.map((name) => ({ name })) },
        "요청사항": { rich_text: [{ text: { content: note } }] },
        "접수일": { date: { start: new Date().toISOString().slice(0, 10) } },
        "상태": { select: { name: "신규" } },
      },
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  } catch (e) {
    console.error("[api/survey] 노션 저장 실패:", e.message);
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }
}
