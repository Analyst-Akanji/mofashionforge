export default function StoryBanner() {
  return (
    <section className="reveal py-8 px-6 md:px-10 max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 rounded-[28px] overflow-hidden bg-cardwhite">
        <div className="order-2 md:order-1 p-10 md:p-14 flex flex-col justify-center">
          <p className="text-xs tracking-wider2 uppercase text-sage mb-4">
            Our Story
          </p>
          <h2 className="font-display text-2xl md:text-3xl text-umber leading-snug">
            Crochet isn't a trend here — it's a discipline.
          </h2>
          <p className="mt-5 text-umber/70 text-sm md:text-base leading-relaxed max-w-md">
            Mo_FashionForge designs premium crochet pieces for men and women
            who want their clothing to carry the same intention they bring
            to everything else they wear. Every outfit is one of a kind,
            shaped by hand around the person who will wear it.
          </p>
          <a
            href="#contact"
            className="mt-7 text-sm text-umber border-b border-umber/30 pb-1 w-fit hover:border-terracotta hover:text-terracotta transition-colors"
          >
            Commission a piece
          </a>
        </div>
        <div className="order-1 md:order-2 min-h-[320px] md:min-h-[440px]">
          <img
            src="/assets/story-tools.jpg"
            alt="Crochet hooks and cream yarn in a woven basket"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
