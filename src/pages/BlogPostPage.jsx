import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Footer from "../components/Footer";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (!data) { setNotFound(true); }
      else { setPost(data); }
      setLoading(false);
    }
    fetchPost();
  }, [slug]);

  if (loading) return (
    <main style={{ paddingTop: "72px", minHeight: "100vh", background: "#FAF8F3", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "#6B6B6B", fontStyle: "italic" }}>Loading...</p>
    </main>
  );

  if (notFound) return (
    <main style={{ paddingTop: "72px", minHeight: "100vh", background: "#FAF8F3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", color: "#6B6B6B", fontStyle: "italic" }}>Post not found.</p>
      <Link to="/blog" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#B8973A", textDecoration: "none", borderBottom: "1px solid #B8973A", marginTop: "24px" }}>
        ← Back to Journal
      </Link>
    </main>
  );

  return (
    <>
      <main style={{ paddingTop: "72px", minHeight: "100vh", background: "#FAF8F3" }}>

        {/* Featured image hero */}
        {post.featured_image && (
          <div style={{ width: "100%", maxHeight: "500px", overflow: "hidden" }}>
            <img src={post.featured_image} alt={post.title} style={{ width: "100%", height: "500px", objectFit: "cover", objectPosition: "center", display: "block" }} />
          </div>
        )}

        {/* Article content */}
        <article style={{ maxWidth: "720px", margin: "0 auto", padding: "64px 24px" }}>
          <Link to="/blog" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#B8973A", textDecoration: "none", borderBottom: "1px solid #B8973A", display: "inline-block", marginBottom: "40px" }}>
            ← Back to Journal
          </Link>

          {post.published_at && (
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#B8973A", margin: "0 0 16px" }}>
              {formatDate(post.published_at)}
            </p>
          )}

          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(2.4rem, 5vw, 3.5rem)", fontWeight: 400, color: "#0F0F0F", margin: "0 0 24px", lineHeight: 1.15 }}>
            {post.title}
          </h1>

          {post.excerpt && (
            <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.3rem", fontStyle: "italic", color: "#3B4A3E", lineHeight: 1.6, margin: "0 0 40px", paddingBottom: "40px", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
              {post.excerpt}
            </p>
          )}

          <div style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: "#1A1A1A", lineHeight: 1.9 }}>
            {post.content.split("\n\n").map((para, i) => (
              <p key={i} style={{ marginBottom: "24px" }}>{para}</p>
            ))}
          </div>

          {/* Author */}
          <div style={{ marginTop: "64px", paddingTop: "32px", borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#3B4A3E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", color: "#FAF8F3" }}>M</span>
            </div>
            <div>
              <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.1rem", color: "#0F0F0F", margin: 0 }}>Morayo</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6B6B6B", margin: 0 }}>Founder & Creative Director, Mo_FashionForge</p>
            </div>
          </div>
        </article>

        <Footer />
      </main>
    </>
  );
}
