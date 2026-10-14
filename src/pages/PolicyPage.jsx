import { useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { BUSINESS, SETTINGS, POLICIES, POLICY_ORDER } from "../content/policyContent";

const heading = { fontFamily: "Cormorant Garamond, serif", fontWeight: 400, color: "#0F0F0F" };
const body = { fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#3A3A3A", lineHeight: 1.85 };

function Block({ block }) {
  if (Array.isArray(block)) {
    return (
      <ul style={{ ...body, paddingLeft: "20px", margin: "0 0 16px" }}>
        {block.map((item, i) => <li key={i} style={{ marginBottom: "8px" }}>{item}</li>)}
      </ul>
    );
  }
  return <p style={{ ...body, margin: "0 0 16px" }}>{block}</p>;
}

export default function PolicyPage({ policy }) {
  const data = POLICIES[policy];

  useEffect(() => {
    document.title = `${data.title} | ${BUSINESS.name}`;
  }, [data.title]);

  return (
    <>
      <main style={{ paddingTop: "72px", minHeight: "100vh", background: "#FAF8F3" }}>
        {/* Title band */}
        <div style={{ background: "#3B4A3E", padding: "64px 24px 48px" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <h1 style={{ ...heading, color: "#FAF8F3", fontSize: "clamp(2.2rem, 5vw, 3.2rem)", lineHeight: 1.15, margin: "0 0 16px" }}>
              {data.title}
            </h1>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "rgba(250,248,243,0.75)", lineHeight: 1.7, margin: "0 0 12px" }}>
              {data.intro}
            </p>
            {!data.faq && (
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#B8973A", margin: 0 }}>
                Last updated {SETTINGS.lastUpdated}
              </p>
            )}
          </div>
        </div>

        {/* Links between the policy pages */}
        <nav aria-label="Policies" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "0 24px", background: "#FAF8F3" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", flexWrap: "wrap" }}>
            {POLICY_ORDER.map((key) => {
              const p = POLICIES[key];
              const active = key === policy;
              return (
                <Link key={key} to={p.path} aria-current={active ? "page" : undefined}
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", padding: "16px 20px 16px 0", marginRight: "12px", textDecoration: "none", color: active ? "#0F0F0F" : "#6B6B6B", borderBottom: active ? "2px solid #B8973A" : "2px solid transparent" }}>
                  {p.nav}
                </Link>
              );
            })}
          </div>
        </nav>

        <article style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 24px 24px" }}>
          {data.faq
            ? data.faq.map((item) => (
                <details key={item.q} style={{ borderBottom: "1px solid rgba(0,0,0,0.1)", padding: "18px 0" }}>
                  <summary style={{ ...heading, fontSize: "1.3rem", cursor: "pointer", lineHeight: 1.4 }}>{item.q}</summary>
                  <p style={{ ...body, margin: "12px 0 0" }}>{item.a}</p>
                  {item.link && (
                    <Link to={item.link.to} style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#B8973A", textDecoration: "none", borderBottom: "1px solid #B8973A", display: "inline-block", marginTop: "10px" }}>
                      {item.link.label}
                    </Link>
                  )}
                </details>
              ))
            : data.sections.map((section) => (
                <section key={section.heading} style={{ marginBottom: "36px" }}>
                  <h2 style={{ ...heading, fontSize: "1.6rem", margin: "0 0 12px" }}>{section.heading}</h2>
                  {section.body.map((block, i) => <Block key={i} block={block} />)}
                </section>
              ))}

          {/* Contact */}
          <div style={{ background: "#F0EDE6", padding: "28px", borderRadius: "2px", marginTop: "40px" }}>
            <h2 style={{ ...heading, fontSize: "1.4rem", margin: "0 0 8px" }}>Questions?</h2>
            <p style={{ ...body, fontSize: "14px", margin: "0 0 16px" }}>
              {BUSINESS.owner} is available {BUSINESS.hours}.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a href={BUSINESS.whatsappUrl} target="_blank" rel="noreferrer"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", background: "#0F0F0F", color: "#FAF8F3", padding: "12px 20px", textDecoration: "none" }}>
                WhatsApp
              </a>
              <a href={`mailto:${BUSINESS.email}`}
                style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid #0F0F0F", color: "#0F0F0F", padding: "12px 20px", textDecoration: "none" }}>
                Email
              </a>
            </div>
          </div>
        </article>

        <Footer />
      </main>
    </>
  );
}
