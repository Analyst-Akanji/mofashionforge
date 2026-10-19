import useImageRotator from "../hooks/useImageRotator";

// Each image has a focus point ("x% y%") that decides which part stays visible when the photo is
// cropped to fill the screen. The first number is left-to-right, the second is top-to-bottom:
//   y = 0%  -> keep the TOP of the photo (heads, faces)
//   y = 50% -> keep the middle (the default)
//   y = 100% -> keep the BOTTOM
// If a head is still cut off, make y smaller. If too much empty space shows above, make it bigger.
const HERO_IMAGES = [
  { src: "/assets/hero-1.jpg", position: "50% 3%" },  // tall full-length photo: keep the very top so her head shows
  { src: "/assets/hero-2.jpg", position: "50% 25%" }, // seated photo: her head sits in the upper third
  { src: "/assets/hero-3.jpg", position: "50% 50%" },
  { src: "/assets/hero-4.jpg", position: "50% 50%" },
  { src: "/assets/hero-5.jpg", position: "50% 50%" },
];

export default function Hero() {
  const activeIndex = useImageRotator(
    HERO_IMAGES.map((img) => img.src),
    5000
  );

  return (
    <section
      id="top"
      className="relative h-screen min-h-[640px] w-full overflow-hidden"
    >
      {HERO_IMAGES.map((img, i) => (
        <img
          key={img.src}
          src={img.src}
          alt="Mo_FashionForge handwoven crochet piece"
          style={{ objectPosition: img.position }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
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
