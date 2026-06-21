// The signature element: a hand-drawn stitch line that "pulls taut" under
// key words on load, referencing a single strand of yarn being drawn through.
export default function StitchUnderline({ children, className = "" }) {
  return (
    <span className={`stitch-underline ${className}`}>
      {children}
      <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
        <path d="M2 8 Q 20 2, 38 8 T 74 8 T 110 8 T 146 8 T 182 8 T 198 8" />
      </svg>
    </span>
  );
}
