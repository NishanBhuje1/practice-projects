import bcrypt from "bcryptjs";
import { query, closePool, transaction } from "../config/database.js";

const seedData = {
  categories: [
    {
      name: "Rings",
      slug: "rings",
      description: "Elegant rings for every occasion",
      image_url: "https://ext.same-assets.com/1238728203/2442032724.jpeg",
      sort_order: 1,
    },
    {
      name: "Necklaces",
      slug: "necklaces",
      description: "Beautiful necklaces to complete your look",
      image_url: "https://ext.same-assets.com/1238728203/2793049852.jpeg",
      sort_order: 2,
    },
    {
      name: "Earrings",
      slug: "earrings",
      description: "Stunning earrings for timeless beauty",
      image_url: "https://ext.same-assets.com/1238728203/3707858008.jpeg",
      sort_order: 3,
    },
    {
      name: "Bracelets",
      slug: "bracelets",
      description: "Sophisticated bracelets for your wrists",
      image_url: "https://ext.same-assets.com/1238728203/1863269298.jpeg",
      sort_order: 4,
    },
  ],

  products: [
    {
      name: "Pearl Stud Earrings",
      slug: "pearl-stud-earrings",
      description:
        "Elegant pearl stud earrings crafted with lustrous freshwater pearls and 14k gold settings. Perfect for everyday elegance or special occasions.",
      price: 125.0,
      category_slug: "earrings",
      sku: "GM-PSE-001",
      stock_quantity: 25,
      is_featured: true,
      images: [
        "https://ext.same-assets.com/1238728203/654226175.jpeg",
        "https://ext.same-assets.com/1238728203/3361564994.jpeg",
      ],
      variants: {
        size: ["6mm", "8mm", "10mm"],
        material: ["14k Gold", "18k Gold", "Sterling Silver"],
      },
    },
    {
      name: "Wave Bangle",
      slug: "wave-bangle",
      description:
        "Fluid wave-inspired bangle bracelet that captures the essence of ocean movement. Handcrafted in premium gold with a brushed finish.",
      price: 115.0,
      category_slug: "bracelets",
      sku: "GM-WB-001",
      stock_quantity: 15,
      is_featured: true,
      images: [
        "https://ext.same-assets.com/1238728203/542897615.jpeg",
        "https://ext.same-assets.com/1238728203/2086380595.jpeg",
      ],
      variants: {
        size: ["Small", "Medium", "Large"],
        material: ["14k Gold", "18k Gold"],
      },
    },
    {
      name: "Collar Necklace",
      slug: "collar-necklace",
      description:
        "Modern collar necklace with minimalist design. Features a sleek curved silhouette that complements any neckline beautifully.",
      price: 165.0,
      category_slug: "necklaces",
      sku: "GM-CN-001",
      stock_quantity: 20,
      is_featured: true,
      images: [
        "https://ext.same-assets.com/1238728203/3957704093.jpeg",
        "https://ext.same-assets.com/1238728203/179942575.jpeg",
      ],
      variants: {
        size: ['16"', '18"', '20"'],
        material: ["14k Gold", "18k Gold", "Rose Gold"],
      },
    },
    {
      name: "Golden Loop Earrings",
      slug: "golden-loop-earrings",
      description:
        "Contemporary loop earrings with a modern twist. These versatile hoops add sophistication to any outfit.",
      price: 100.0,
      category_slug: "earrings",
      sku: "GM-GLE-001",
      stock_quantity: 30,
      is_featured: true,
      images: [
        "https://ext.same-assets.com/1238728203/3478848801.jpeg",
        "https://ext.same-assets.com/1238728203/1833856914.jpeg",
      ],
      variants: {
        size: ["Small (20mm)", "Medium (30mm)", "Large (40mm)"],
        material: ["14k Gold", "18k Gold", "Rose Gold"],
      },
    },
    {
      name: "Textured Statement Ring",
      slug: "textured-statement-ring",
      description:
        "Bold statement ring featuring intricate texture work and a lustrous pearl centerpiece. A true conversation starter.",
      price: 185.0,
      category_slug: "rings",
      sku: "GM-TSR-001",
      stock_quantity: 12,
      is_featured: false,
      images: ["https://ext.same-assets.com/1238728203/2442032724.jpeg"],
      variants: {
        size: ["5", "6", "7", "8", "9", "10"],
        material: ["14k Gold", "18k Gold"],
      },
    },
  ],
};

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    await transaction(async (client) => {
      // Create admin user
      const adminPassword = await bcrypt.hash(
        process.env.DEFAULT_ADMIN_PASSWORD || "goldmark123",
        12
      );

      const adminResult = await client.query(
        `
        INSERT INTO users (email, password_hash, first_name, last_name, is_admin)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `,
        [
          process.env.DEFAULT_ADMIN_EMAIL || "admin@goldmark.com",
          adminPassword,
          "Admin",
          "User",
          true,
        ]
      );

      if (adminResult.rows.length > 0) {
        console.log("✅ Admin user created");
      } else {
        console.log("ℹ️ Admin user already exists");
      }

      // Seed categories
      console.log("📁 Seeding categories...");
      for (const category of seedData.categories) {
        const result = await client.query(
          `
          INSERT INTO categories (name, slug, description, image_url, sort_order)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (slug) DO NOTHING
          RETURNING id
        `,
          [
            category.name,
            category.slug,
            category.description,
            category.image_url,
            category.sort_order,
          ]
        );

        if (result.rows.length > 0) {
          console.log(`  ✅ Created category: ${category.name}`);
        }
      }

      // Get category IDs
      const categoriesResult = await client.query(
        "SELECT id, slug FROM categories"
      );
      const categoryMap = {};
      categoriesResult.rows.forEach((cat) => {
        categoryMap[cat.slug] = cat.id;
      });

      // Seed products
      console.log("📦 Seeding products...");
      for (const product of seedData.products) {
        const categoryId = categoryMap[product.category_slug];
        if (!categoryId) continue;

        const productResult = await client.query(
          `
          INSERT INTO products (name, slug, description, price, category_id, sku, stock_quantity, is_featured)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (slug) DO NOTHING
          RETURNING id
        `,
          [
            product.name,
            product.slug,
            product.description,
            product.price,
            categoryId,
            product.sku,
            product.stock_quantity,
            product.is_featured,
          ]
        );

        if (productResult.rows.length === 0) continue;

        const productId = productResult.rows[0].id;
        console.log(`  ✅ Created product: ${product.name}`);

        // Add variants
        if (product.variants) {
          for (const [variantType, variantValues] of Object.entries(
            product.variants
          )) {
            for (const variantValue of variantValues) {
              await client.query(
                `
                INSERT INTO product_variants (product_id, variant_type, variant_value, stock_quantity)
                VALUES ($1, $2, $3, $4)
              `,
                [
                  productId,
                  variantType,
                  variantValue,
                  Math.floor(product.stock_quantity / variantValues.length),
                ]
              );
            }
          }
        }
      }
    });

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    closePool();
  }
}

seedDatabase();
