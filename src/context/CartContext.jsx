import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { track } from "../lib/analytics";

const CartContext = createContext(null);
const STORAGE_KEY = "mff_cart_v1";
const MAX_QTY = 10;

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Prices are kept in kobo, the same as the products table.
export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable (private mode etc.) - cart just won't persist */
    }
  }, [items]);

  // A cart line is a piece plus a size, so the same top in L and in XL are two separate lines.
  // `id` is the line id (used by setQty/removeItem); `productId` is the real product id.
  const lineIdFor = (product, size) => (size ? `${product.id}::${size}` : product.id);

  const addItem = useCallback((product, qty = 1, size = null) => {
    track("add_to_cart", { product_id: product.id, meta: { size: size || null, qty } });
    const lineId = lineIdFor(product, size);
    setItems((prev) => {
      const existing = prev.find((i) => i.id === lineId);
      if (existing) {
        return prev.map((i) =>
          i.id === lineId ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i
        );
      }
      return [
        ...prev,
        {
          id: lineId,
          productId: product.id,
          size: size || null,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || null,
          qty,
        },
      ];
    });
  }, []);

  // "Buy Now": make sure the piece is in the cart (keeps its quantity if already there).
  const buyNow = useCallback((product, size = null) => {
    track("add_to_cart", { product_id: product.id, meta: { size: size || null, qty: 1, buy_now: true } });
    const lineId = lineIdFor(product, size);
    setItems((prev) =>
      prev.some((i) => i.id === lineId)
        ? prev
        : [
            ...prev,
            {
              id: lineId,
              productId: product.id,
              size: size || null,
              name: product.name,
              price: product.price,
              image: product.images?.[0] || null,
              qty: 1,
            },
          ]
    );
  }, []);

  const setQty = useCallback((id, qty) => {
    const clamped = Math.max(1, Math.min(MAX_QTY, qty));
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: clamped } : i)));
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      addItem,
      buyNow,
      setQty,
      removeItem,
      clear,
      count: items.reduce((sum, i) => sum + i.qty, 0),
      total: items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }),
    [items, addItem, buyNow, setQty, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
