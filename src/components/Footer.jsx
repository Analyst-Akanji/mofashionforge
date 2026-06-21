import { MessageCircle } from "lucide-react";

function InstagramIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="px-6 md:px-10 max-w-6xl mx-auto py-12 border-t border-umber/10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <span className="font-display text-xl text-umber">
          Mo<span className="text-terracotta">_</span>FashionForge
        </span>

        <div className="flex items-center gap-5 text-umber/70">
          <a
            href="https://instagram.com/Mo_FashionForge"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="hover:text-terracotta transition-colors"
          >
            <InstagramIcon />
          </a>
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
            className="hover:text-terracotta transition-colors"
          >
            <MessageCircle size={18} />
          </a>
        </div>

        <p className="text-xs text-umber/50">
          Built by Argon Industries
        </p>
      </div>
    </footer>
  );
}
