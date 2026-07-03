export default function PageHero({ image, label, title, subtitle }) {
  return (
    <div style={{
      position: "relative",
      padding: "120px 24px 80px",
      overflow: "hidden",
      minHeight: "320px",
      display: "flex",
      alignItems: "flex-end",
    }}>
      {/* Background image */}
      <img
        src={image}
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
        }}
      />
      {/* Dark overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to bottom, rgba(15,15,15,0.5) 0%, rgba(15,15,15,0.75) 100%)",
      }} />
      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "1200px", width: "100%", margin: "0 auto" }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#B8973A", display: "block", marginBottom: "12px" }}>
          {label}
        </span>
        <h1
          style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(2.8rem, 6vw, 4.5rem)", fontWeight: 300, color: "#FAF8F3", margin: 0, lineHeight: 1.1 }}
          dangerouslySetInnerHTML={{ __html: title }}
        />
        {subtitle && (
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "rgba(250,248,243,0.7)", margin: "16px 0 0", maxWidth: "480px", lineHeight: 1.7 }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
