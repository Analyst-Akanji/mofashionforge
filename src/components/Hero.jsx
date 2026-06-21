import StitchUnderline from "./StitchUnderline";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative pt-32 md:pt-40 pb-20 px-6 md:px-10 max-w-6xl mx-auto"
    >
      <div className="grid md:grid-cols-12 gap-8 items-end">
        <div className="md:col-span-7">
          <p className="text-xs tracking-wider2 uppercase text-sage mb-5">
            Handcrafted, stitch by stitch — Osogbo, Nigeria
          </p>
          <h1 className="font-display text-[2.6rem] leading-[1.08] md:text-[4.2rem] md:leading-[1.05] text-umber">
            Crochet, worn
            <br />
            like it was made
            <br />
            <StitchUnderline>for one body.</StitchUnderline>
          </h1>
          <p className="mt-7 text-umber/70 text-base md:text-lg max-w-md leading-relaxed">
            Premium crochet outfits for men and women — every piece made to
            order, one hook, one strand, one fit at a time.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#shop"
              className="bg-terracotta text-cardwhite px-7 py-3.5 rounded-full text-sm tracking-wide hover:bg-terracotta-dark transition-colors"
            >
              Explore the Collection
            </a>
            <a
              href="#process"
              className="text-umber text-sm tracking-wide border-b border-umber/30 pb-1 hover:border-umber transition-colors"
            >
              See how it's made
            </a>
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="relative rounded-[28px] overflow-hidden picot-edge">
            <img
              src="/assets/hero-yarn.jpg"
              alt="Hands holding stacked balls of pink, olive, and taupe yarn"
              className="w-full h-[420px] md:h-[520px] object-cover"
            />
          </div>
          <div className="flex items-center gap-3 mt-6 pl-2">
            <div className="flex -space-x-2">
              <span className="w-7 h-7 rounded-full bg-[#E8B6C2] border-2 border-linen" />
              <span className="w-7 h-7 rounded-full bg-sage border-2 border-linen" />
              <span className="w-7 h-7 rounded-full bg-taupe border-2 border-linen" />
            </div>
            <p className="text-xs text-umber/60">
              Dyed, sourced &amp; finished by hand
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
