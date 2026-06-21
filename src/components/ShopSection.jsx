import { useState } from "react";
import { PRODUCTS } from "../data/products";
import ProductCard from "./ProductCard";

const FILTERS = ["All", "For Him", "For Her"];

export default function ShopSection() {
  const [filter, setFilter] = useState("All");

  const visible =
    filter === "All"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === filter);

  return (
    <section id="shop" className="py-20 px-6 md:px-10 max-w-6xl mx-auto">
      <div className="reveal flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div>
          <p className="text-xs tracking-wider2 uppercase text-sage mb-3">
            The Edit
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-umber">
            Made to order, made to fit
          </h2>
        </div>

        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                filter === f
                  ? "bg-umber text-cardwhite border-umber"
                  : "border-umber/20 text-umber/70 hover:border-umber/50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="reveal scroll-snap-row">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
