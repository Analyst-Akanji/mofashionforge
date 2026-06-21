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

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black/35" />

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {HERO_IMAGES.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>

      <a
        href="#intro"
        aria-label="Scroll to learn more"
        className="absolute bottom-5 right-6 md:right-10 z-10 text-white/80 hover:text-white transition-colors animate-bounce"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </a>
    </section>
  );
}