// Placeholder catalogue — replace image paths and prices with real
// Mo_FashionForge product photography and pricing before launch.
export const PRODUCTS = [
  {
    id: "p1",
    name: "Solara Crochet Vest",
    category: "For Him",
    price: 28000,
    image: "/assets/product-1.jpg",
    blurb: "Open-stitch vest in sage, lined collar",
  },
  {
    id: "p2",
    name: "Adaeze Halter Set",
    category: "For Her",
    price: 35000,
    image: "/assets/product-2.jpg",
    blurb: "Two-piece halter and midi skirt, taupe",
  },
  {
    id: "p3",
    name: "Bode Crochet Polo",
    category: "For Him",
    price: 24000,
    image: "/assets/product-3.jpg",
    blurb: "Ribbed collar polo, cream cotton blend",
  },
  {
    id: "p4",
    name: "Temi Wrap Dress",
    category: "For Her",
    price: 42000,
    image: "/assets/product-4.jpg",
    blurb: "Full-length wrap, blush and olive panel",
  },
  {
    id: "p5",
    name: "Lade Crop Cardigan",
    category: "For Her",
    price: 26000,
    image: "/assets/product-5.jpg",
    blurb: "Cropped cardigan, shell button trim",
  },
  {
    id: "p6",
    name: "Kunle Beach Shorts",
    category: "For Him",
    price: 19500,
    image: "/assets/product-6.jpg",
    blurb: "Drawstring crochet shorts, lined",
  },
];

export const formatNaira = (amount) =>
  `₦${amount.toLocaleString("en-NG")}`;
