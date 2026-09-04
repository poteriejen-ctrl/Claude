import "./globals.css";

export const metadata = {
  title: "유연마인드짐 블로그",
  description: "심리학과 마음공부, 명상법을 나누는 유연마인드짐의 이야기",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=IBM+Plex+Sans+KR:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="blog-topbar">
          <div className="wrap">
            <a className="blog-brand" href="http://localhost:8844/">유연마인드짐</a>
            <a className="blog-back" href="/blog">블로그 목록</a>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
