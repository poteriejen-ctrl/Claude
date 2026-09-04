import { getPosts } from "../../../lib/notion";

function corsHeaders() {
  return { "Access-Control-Allow-Origin": "*" };
}

export const revalidate = 60;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 1, 10);

    const posts = await getPosts();
    const latest = posts.slice(0, limit).map((p) => ({
      title: p.title,
      slug: p.slug,
      category: p.category,
      description: p.description,
      date: p.date,
      cover: p.cover || null,
    }));

    return new Response(JSON.stringify({ posts: latest }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  } catch (e) {
    return new Response(JSON.stringify({ posts: [], error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }
}
