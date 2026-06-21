import StitchUnderline from "./StitchUnderline";
import useImageRotator from "../hooks/useImageRotator";

// Replace these with Mo's real woven photography before launch.
// Keep exactly 3 images — the rotator and dots below assume 3.
const HERO_IMAGES = [
  "/assets/hero-1.jpg",
  "/assets/hero-2.jpg",
  "/assets/hero-3.jpg",
];

export default function Hero() {
  const activeIndex = useImageRotator(HERO_IMAGES, 5000);

  return (
    <section
      id="top"
      className="relative h-screen min-h-[640px] w-full overflow-hidden"
    >
      {/* Rotating background images, crossfaded */}
      {HERO_IMAGES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt="Mo_FashionForge handwoven crochet piece"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out ${
            i === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Dark gradient so white text stays legible over any photo */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/55" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <p className="text-xs tracking-wider2 uppercase text-white/80 mb-5">
          Handcrafted, stitch by stitch — Nigeria
        </p>
        <h1 className="font-display text-[2.6rem] leading-[1.08] md:text-[4.6rem] md:leading-[1.05] text-white">
          Crochet, worn
          <br />
          like it was made
          <br />
          <StitchUnderline>for one body.</StitchUnderline>
        </h1>
        <p className="mt-7 text-white/80 text-base md:text-lg max-w-md leading-relaxed">
          Premium crochet outfits for men and women — every piece made to
          order, one hook, one strand, one fit at a time.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#shop"
            className="bg-terracotta text-cardwhite px-7 py-3.5 rounded-full text-sm tracking-wide hover:bg-terracotta-dark transition-colors"
          >
            Explore the Collection
          </a>
          <a
            href="#process"
            className="text-white text-sm tracking-wide border-b border-white/40 pb-1 hover:border-white transition-colors"
          >
            See how it's made
          </a>
        </div>
      </div>

      {/* Rotation indicator dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {HERO_IMAGES.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}