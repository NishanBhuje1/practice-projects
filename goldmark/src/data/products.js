import { Product } from "../store/useStore";

export const products = [
  {
    id: "pearl-stud-earrings",
    name: "Pearl Stud Earrings",
    price: 125.0,
    description:
      "Elegant pearl stud earrings crafted with lustrous freshwater pearls and 14k gold settings. Perfect for everyday elegance or special occasions.",
    category: "earrings",
    images: [
      "https://ext.same-assets.com/1238728203/654226175.jpeg",
      "https://ext.same-assets.com/1238728203/3361564994.jpeg",
    ],
    variants: {
      size: ["6mm", "8mm", "10mm"],
      material: ["14k Gold", "18k Gold", "Sterling Silver"],
    },
    inStock: true,
    featured: true,
  },
  {
    id: "wave-bangle",
    name: "Wave Bangle",
    price: 115.0,
    description:
      "Fluid wave-inspired bangle bracelet that captures the essence of ocean movement. Handcrafted in premium gold with a brushed finish.",
    category: "bracelets",
    images: [
      "https://ext.same-assets.com/1238728203/542897615.jpeg",
      "https://ext.same-assets.com/1238728203/2086380595.jpeg",
    ],
    variants: {
      size: ["Small", "Medium", "Large"],
      material: ["14k Gold", "18k Gold"],
    },
    inStock: true,
    featured: true,
  },
  {
    id: "collar-necklace",
    name: "Collar Necklace",
    price: 165.0,
    description:
      "Modern collar necklace with minimalist design. Features a sleek curved silhouette that complements any neckline beautifully.",
    category: "necklaces",
    images: [
      "https://ext.same-assets.com/1238728203/3957704093.jpeg",
      "https://ext.same-assets.com/1238728203/179942575.jpeg",
    ],
    variants: {
      size: ['16"', '18"', '20"'],
      material: ["14k Gold", "18k Gold", "Rose Gold"],
    },
    inStock: true,
    featured: true,
  },
  {
    id: "golden-loop-earrings",
    name: "Golden Loop Earrings",
    price: 100.0,
    description:
      "Contemporary loop earrings with a modern twist. These versatile hoops add sophistication to any outfit.",
    category: "earrings",
    images: [
      "https://ext.same-assets.com/1238728203/3478848801.jpeg",
      "https://ext.same-assets.com/1238728203/1833856914.jpeg",
    ],
    variants: {
      size: ["Small (20mm)", "Medium (30mm)", "Large (40mm)"],
      material: ["14k Gold", "18k Gold", "Rose Gold"],
    },
    inStock: true,
    featured: true,
  },
  {
    id: "textured-statement-ring",
    name: "Textured Statement Ring",
    price: 185.0,
    description:
      "Bold statement ring featuring intricate texture work and a lustrous pearl centerpiece. A true conversation starter.",
    category: "rings",
    images: ["https://ext.same-assets.com/1238728203/2442032724.jpeg"],
    variants: {
      size: ["5", "6", "7", "8", "9", "10"],
      material: ["14k Gold", "18k Gold"],
    },
    inStock: true,
    featured: false,
  },
  {
    id: "teardrop-pearl-earrings",
    name: "Teardrop Pearl Earrings",
    price: 145.0,
    description:
      "Elegant teardrop-shaped earrings featuring lustrous pearls in sculptural gold settings.",
    category: "earrings",
    images: ["https://ext.same-assets.com/1238728203/3707858008.jpeg"],
    variants: {
      material: ["14k Gold", "18k Gold", "Rose Gold"],
    },
    inStock: true,
    featured: false,
  },
  {
    id: "flowing-wave-necklace",
    name: "Flowing Wave Necklace",
    price: 220.0,
    description:
      "Sculptural necklace inspired by flowing water. The organic curves create beautiful movement and light reflection.",
    category: "necklaces",
    images: ["https://ext.same-assets.com/1238728203/2793049852.jpeg"],
    variants: {
      size: ['16"', '18"', '20"'],
      material: ["14k Gold", "18k Gold"],
    },
    inStock: true,
    featured: false,
  },
  {
    id: "textured-cuff-bracelet",
    name: "Textured Cuff Bracelet",
    price: 195.0,
    description:
      "Wide cuff bracelet with intricate textural details. Features a sophisticated pattern that catches light beautifully.",
    category: "bracelets",
    images: ["https://ext.same-assets.com/1238728203/1863269298.jpeg"],
    variants: {
      size: ["Small", "Medium", "Large"],
      material: ["14k Gold", "18k Gold"],
    },
    inStock: true,
    featured: false,
  },
  {
    id: "classic-solitaire-ring",
    name: "Classic Solitaire Ring",
    price: 350.0,
    description:
      "Timeless solitaire ring featuring a brilliant cut stone in a classic six-prong setting. Perfect for engagements or special occasions.",
    category: "rings",
    images: ["https://ext.same-assets.com/1238728203/2442032724.jpeg"],
    variants: {
      size: ["4", "5", "6", "7", "8", "9", "10", "11"],
      material: ["14k Gold", "18k Gold", "Platinum"],
    },
    inStock: true,
    featured: false,
  },
  {
    id: "delicate-chain-necklace",
    name: "Delicate Chain Necklace",
    price: 85.0,
    description:
      "Fine chain necklace perfect for layering or wearing alone. Features our signature clasp design.",
    category: "necklaces",
    images: ["https://ext.same-assets.com/1238728203/2793049852.jpeg"],
    variants: {
      size: ['14"', '16"', '18"', '20"'],
      material: ["14k Gold", "18k Gold", "Sterling Silver"],
    },
    inStock: true,
    featured: false,
  },
];
