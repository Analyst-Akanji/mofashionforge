import { useState } from "react";

export default function ContactSection() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: wire to backend / email service
    setSent(true);
  };

  return (
    <section
      id="contact"
      className="reveal py-20 px-6 md:px-10 max-w-6xl mx-auto"
    >
      <div className="bg-umber rounded-[28px] px-8 md:px-16 py-14 md:py-16 grid md:grid-cols-2 gap-10">
        <div>
          <p className="text-xs tracking-wider2 uppercase text-terracotta mb-4">
            Commission a Piece
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-cardwhite leading-snug">
            Tell us what
            <br />
            you have in mind.
          </h2>
          <p className="mt-5 text-cardwhite/60 text-sm max-w-xs leading-relaxed">
            Share your measurements, color preference, and occasion — we'll
            reply with a quote and timeline within 24 hours.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            required
            placeholder="Full name"
            className="bg-cardwhite/10 text-cardwhite placeholder:text-cardwhite/40 rounded-xl px-4 py-3 text-sm outline-none focus-visible:outline-terracotta"
          />
          <input
            type="tel"
            required
            placeholder="Phone or WhatsApp number"
            className="bg-cardwhite/10 text-cardwhite placeholder:text-cardwhite/40 rounded-xl px-4 py-3 text-sm outline-none focus-visible:outline-terracotta"
          />
          <textarea
            required
            rows={3}
            placeholder="What would you like made?"
            className="bg-cardwhite/10 text-cardwhite placeholder:text-cardwhite/40 rounded-xl px-4 py-3 text-sm outline-none resize-none focus-visible:outline-terracotta"
          />
          <button
            type="submit"
            className="bg-terracotta text-cardwhite rounded-full px-6 py-3.5 text-sm tracking-wide hover:bg-terracotta-dark transition-colors"
          >
            {sent ? "Sent — we'll be in touch" : "Send Enquiry"}
          </button>
        </form>
      </div>
    </section>
  );
}
