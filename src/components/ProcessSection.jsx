const STEPS = [
  {
    n: "01",
    title: "Strand selected",
    text: "Every order starts with yarn chosen for the piece — weight, fibre, and color matched to the design.",
  },
  {
    n: "02",
    title: "Measured to you",
    text: "We take your measurements before a single stitch is made. No standard sizing, no guesswork.",
  },
  {
    n: "03",
    title: "Hand-hooked",
    text: "Each garment is crocheted by hand, row by row — typically 5 to 9 days depending on the piece.",
  },
  {
    n: "04",
    title: "Finished & delivered",
    text: "Steamed, trimmed, and packed with care. Delivered across Nigeria, shipped internationally on request.",
  },
];

export default function ProcessSection() {
  return (
    <section
      id="process"
      className="py-20 px-6 md:px-10 max-w-6xl mx-auto"
    >
      <div className="reveal mb-12 max-w-lg">
        <p className="text-xs tracking-wider2 uppercase text-sage mb-3">
          The Process
        </p>
        <h2 className="font-display text-3xl md:text-4xl text-umber">
          Four steps from yarn to outfit
        </h2>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {STEPS.map((step, i) => (
          <div
            key={step.n}
            className="reveal"
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <span className="font-display text-sm text-terracotta">
              {step.n}
            </span>
            <h3 className="font-display text-xl text-umber mt-2 mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-umber/65 leading-relaxed">
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
