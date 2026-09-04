import { getPosts } from "../../lib/notion";

export const revalidate = 60;

export const metadata = {
  title: "블로그 · 유연마인드짐",
};

export default async function BlogListPage({ searchParams }) {
  const { category } = await searchParams;
  const allPosts = await getPosts();
  const posts = category ? allPosts.filter((post) => post.category === category) : allPosts;

  return (
    <main>
      <section className="blog-hero">
        <div className="wrap">
          <h1>블로그</h1>
          <p>명상법과 마음의 작동 원리, 수련의 기록을 나눕니다.</p>
          {category && (
            <p className="filter-tag">
              <span className="cat">{category}</span>
              <a href="/blog">전체 글 보기</a>
            </p>
          )}
        </div>
      </section>

      <div className="wrap">
        {posts.length === 0 ? (
          <p className="empty-state">
            {category ? `"${category}" 카테고리에 아직 발행된 글이 없습니다.` : "아직 발행된 글이 없습니다."}
          </p>
        ) : (
          <div className="post-grid">
            {posts.map((post) => (
              <a key={post.id} className="post-card" href={`/blog/${post.slug}`}>
                <div
                  className="thumb"
                  style={post.cover ? { backgroundImage: `url(${post.cover})` } : undefined}
                />
                {post.category && <span className="cat">{post.category}</span>}
                <h3>{post.title}</h3>
                {post.description && <p>{post.description}</p>}
                {post.date && <time>{post.date}</time>}
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
