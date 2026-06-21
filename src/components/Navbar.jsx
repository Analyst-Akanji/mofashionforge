import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";

const NAV_LINKS = [
  { label: "Shop", href: "#shop" },
  { label: "For Him", href: "#for-him" },
  { label: "For Her", href: "#for-her" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-linen/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        <a
          href="#top"
          className={`font-display text-2xl tracking-wide transition-colors ${
            scrolled ? "text-umber" : "text-white"
          }`}
        >
          Mo<span className="text-terracotta">_</span>FashionForge
        </a>
        <ul
          className={`hidden md:flex items-center gap-9 text-sm tracking-wide transition-colors ${
            scrolled ? "text-umber/80" : "text-white/90"
          }`}
        >
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="hover:text-terracotta transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-5">
          <button
            aria-label="View cart"
            className={`transition-colors hover:text-terracotta ${
              scrolled ? "text-umber" : "text-white"
            }`}
          >
            <ShoppingBag size={20} />
          </button>
          <a
            href="#shop"
            className="bg-umber text-cardwhite text-sm px-5 py-2.5 rounded-full hover:bg-terracotta transition-colors"
          >
            Shop the Edit
          </a>
        </div>

        <button
          className={`md:hidden transition-colors ${
            scrolled ? "text-umber" : "text-white"
          }`}
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-linen border-t border-umber/10 px-6 py-6">
          <ul className="flex flex-col gap-5 text-umber text-base">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#shop"
            onClick={() => setOpen(false)}
            className="mt-6 block text-center bg-umber text-cardwhite px-5 py-3 rounded-full"
          >
            Shop the Edit
          </a>
        </div>
      )}
    </header>
  );
}