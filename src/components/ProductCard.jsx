import { formatNaira } from "../data/products";

export default function ProductCard({ product }) {
  return (
    <article className="scroll-snap-item w-[280px] md:w-[320px] group">
      <div className="relative rounded-t-[20px] overflow-hidden picot-edge bg-cardwhite">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-[360px] object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <span className="absolute top-4 left-4 bg-linen/90 text-umber text-[11px] tracking-wide uppercase px-3 py-1 rounded-full">
          {product.category}
        </span>
      </div>
      <div className="bg-cardwhite rounded-b-[20px] px-5 pt-4 pb-5 -mt-px">
        <h3 className="font-display text-lg text-umber">{product.name}</h3>
        <p className="text-sm text-umber/60 mt-1">{product.blurb}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-terracotta font-medium">
            {formatNaira(product.price)}
          </span>
          <button className="text-xs tracking-wide uppercase text-umber border-b border-umber/30 pb-0.5 hover:border-terracotta hover:text-terracotta transition-colors">
            Enquire
          </button>
        </div>
      </div>
    </article>
  );
}
