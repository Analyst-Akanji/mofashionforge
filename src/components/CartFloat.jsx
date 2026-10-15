import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartFloat() {
  const { count } = useCart();
  const { pathname } = useLocation();

  if (!count || pathname === "/checkout") return null;

  return (
    <Link
      to="/checkout"
      aria-label={`View cart, ${count} item${count > 1 ? "s" : ""}`}
      style={{
        position: "fixed",
        right: "24px",
        bottom: "88px", // sits just above the WhatsApp button
        zIndex: 999,
        background: "#0F0F0F",
        color: "#FAF8F3",
        border: "1px solid #B8973A",
        fontFamily: "Inter, sans-serif",
        fontSize: "12px",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        textDecoration: "none",
        padding: "12px 18px",
        borderRadius: "999px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
      }}
    >
      Cart · {count}
    </Link>
  );
}
