import { useEffect, useState } from "react";

// Each image has a focus point ("x% y%") that decides which part stays visible when the photo is
// cropped to fill the screen. The first number is left-to-right, the second is top-to-bottom:
//   y = 0%  -> keep the TOP of the photo (heads, faces)
//   y = 50% -> keep the middle (the default)
//   y = 100% -> keep the BOTTOM
// If a head is still cut off, make y smaller. If too much empty space shows above, make it bigger.
//
// The file names must match the files in public/assets EXACTLY (capital letters and the .jpg
// ending included). Any image that can't be found is skipped, and its name is printed in the
// browser console (F12 -> Console) as "Hero image not found: ...".
const HERO_IMAGES = [
  { src: "/assets/hero-1.jpg", position: "50% 3%" },  // tall full-length photo: keep the very top so her head shows
  { src: "/assets/hero-2.jpg", position: "50% 25%" }, // seated photo: her head sits in the upper third
  { src: "/assets/hero-3.jpg", position: "50% 50%" },
  { src: "/assets/hero-4.jpg", position: "50% 50%" },
  { src: "/assets/hero-5.jpg", position: "50% 50%" },
];

const INTERVAL_MS = 5000;

export default function Hero() {
  const [ready, setReady] = useState([]); // only the images that really loaded, in the order above
  const [tick, setTick] = useState(0);

  // Check every image once. Missing or broken ones are dropped instead of showing a blank slide.
  useEffect(() => {
    let cancelled = false;
    const loaded = new Set();
    HERO_IMAGES.forEach((img) => {
      const probe = new Image();
      probe.onload = () => {
        if (cancelled) return;
        loaded.add(img.src);
        setReady(HERO_IMAGES.filter((h) => loaded.has(h.src)));
      };
      probe.onerror = () => console.warn(`Hero image not found: ${img.src}`);
      probe.src = img.src;
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (ready.length < 2) return;
    const timer = setInterval(() => setTick((t) => t + 1), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [ready.length]);

  const activeIndex = ready.length ? tick % ready.length : 0;

  return (
    <section
      id="top"
      className="relative h-screen min-h-[640px] w-full overflow-hidden bg-[#2a0a0e]"
    >
      {ready.map((img, i) => (
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

      {ready.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {ready.map((img, i) => (
            <span
              key={img.src}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

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
