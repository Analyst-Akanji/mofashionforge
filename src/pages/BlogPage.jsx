import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image, published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      setPosts(data || []);
      setLoading(false);
    }
    fetchPosts();
  }, []);

  return (
    <>
      <main style={{ paddingTop: "72px", minHeight: "100vh", background: "#FAF8F3" }}>
        <PageHero
          image="/assets/hero-about.jpg"
          label="The Journal"
          title="Stories from<br /><em>Mo_FashionForge</em>"
          subtitle="Crochet care, collection stories, and the art of handmade fashion."
        />

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "64px 24px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "#6B6B6B", fontStyle: "italic" }}>
                Loading...
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", color: "#6B6B6B", fontStyle: "italic" }}>
                No posts yet — check back soon.
              </p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#6B6B6B", marginTop: "12px" }}>
                Morayo will be sharing crochet tips, collection stories, and more.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px" }} className="blog-grid">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <article style={{ background: "#F0EDE6", borderRadius: "2px", overflow: "hidden", height: "100%" }}>
                    {post.featured_image ? (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
                      />
                    ) : (
                      <div style={{ width: "100%", aspectRatio: "16/9", background: "#3B4A3E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", color: "rgba(250,248,243,0.3)", fontStyle: "italic" }}>MF</span>
                      </div>
                    )}
                    <div style={{ padding: "24px" }}>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#B8973A", margin: "0 0 10px" }}>
                        {post.published_at ? formatDate(post.published_at) : ""}
                      </p>
                      <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", fontWeight: 400, color: "#0F0F0F", margin: "0 0 12px", lineHeight: 1.3 }}>
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#6B6B6B", lineHeight: 1.7, margin: "0 0 16px" }}>
                          {post.excerpt}
                        </p>
                      )}
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#B8973A", borderBottom: "1px solid #B8973A", paddingBottom: "2px" }}>
                        Read More →
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .blog-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .blog-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </>
  );
}
