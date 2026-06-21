import { useState, useEffect } from "react";

// Cycles through an array of image paths every `intervalMs`.
// Returns the current index so components can crossfade between them.
export default function useImageRotator(images, intervalMs = 5000) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [images.length, intervalMs]);

  return index;
}