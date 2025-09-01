import { query, closePool } from '../config/database.js';

async function resetDatabase() {
  try {
    console.log('🔄 Resetting database...');

    // Drop all tables in reverse order (due to foreign key constraints)
    const dropQueries = [
      'DROP TABLE IF EXISTS admin_logs CASCADE',
      'DROP TABLE IF EXISTS reviews CASCADE',
      'DROP TABLE IF EXISTS cart_items CASCADE', 
      'DROP TABLE IF EXISTS order_items CASCADE',
      'DROP TABLE IF EXISTS orders CASCADE',
      'DROP TABLE IF EXISTS product_variants CASCADE',
      'DROP TABLE IF EXISTS product_images CASCADE',
      'DROP TABLE IF EXISTS products CASCADE',
      'DROP TABLE IF EXISTS categories CASCADE',
      'DROP TABLE IF EXISTS user_addresses CASCADE',
      'DROP TABLE IF EXISTS users CASCADE',
      'DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE'
    ];

    for (const dropQuery of dropQueries) {
      await query(dropQuery);
    }

    console.log('✅ Database reset completed!');
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  } finally {
    closePool();
  }
}

resetDatabase(); Add images
        for (let i = 0; i < product.images.length; i++) {
          await client.query(`
            INSERT INTO product_images (product_id, image_url, sort_order, is_primary)
            VALUES ($1, $2, $3, $4)
          `, [productId, product.images[i], i, i === 0]);
        }

        // Link product to category