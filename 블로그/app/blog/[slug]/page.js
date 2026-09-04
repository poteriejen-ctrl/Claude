import { getPost, getPosts } from "../../../lib/notion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} · 유연마인드짐 블로그`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return notFound();

  return (
    <main className="post-detail">
      <div className="wrap">
        {post.category && <span className="cat">{post.category}</span>}
        <h1>{post.title}</h1>
        {post.date && <time>{post.date}</time>}
        {post.cover && (
          <div className="post-cover" style={{ backgroundImage: `url(${post.cover})` }} />
        )}
        <div className="post-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.markdown}</ReactMarkdown>
        </div>
      </div>
    </main>
  );
}
