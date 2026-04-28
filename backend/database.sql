-- Buat database
CREATE DATABASE IF NOT EXISTS pcparts_db;
USE pcparts_db;

-- Tabel users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'buyer') DEFAULT 'buyer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel products
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  stock INT DEFAULT 0,
  image_url VARCHAR(255),
  category_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Tabel orders
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  shipping_address TEXT NOT NULL,
  status ENUM('diproses','dikirim','selesai') DEFAULT 'diproses',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabel order_items
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Tabel cart
CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  UNIQUE KEY unique_cart (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Seed: Admin default (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@pcparts.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Seed: Kategori
INSERT INTO categories (name) VALUES
('GPU / VGA Card'),
('CPU / Processor'),
('RAM'),
('Storage (SSD/HDD)'),
('Motherboard'),
('Power Supply'),
('Casing'),
('Pendingin / Cooling');

-- Seed: Produk contoh
INSERT INTO products (name, description, price, stock, category_id) VALUES
('ASUS RTX 4060 Ti 8GB', 'GPU gaming mid-range terbaik untuk 1080p dan 1440p gaming', 6500000, 10, 1),
('MSI RTX 4070 12GB', 'GPU performa tinggi untuk gaming 1440p ultra settings', 9800000, 5, 1),
('AMD Ryzen 5 7600X', 'Processor 6-core 12-thread, boost hingga 5.3GHz', 3200000, 8, 2),
('Intel Core i5-14600K', 'Processor 14-core, performa terbaik di kelasnya', 4100000, 6, 2),
('Corsair Vengeance DDR5 16GB', 'RAM DDR5 5600MHz, kompatibel dengan platform Intel & AMD terbaru', 875000, 15, 3),
('G.Skill Trident Z5 32GB', 'RAM DDR5 6000MHz dual kit, ideal untuk workstation', 1650000, 7, 3),
('Samsung 990 Pro NVMe 1TB', 'SSD NVMe PCIe 4.0, kecepatan baca hingga 7450 MB/s', 1100000, 12, 4),
('Seagate Barracuda HDD 2TB', 'HDD 7200RPM untuk penyimpanan data yang besar', 650000, 20, 4),
('ASUS ROG Strix B650-E', 'Motherboard AM5 untuk Ryzen 7000 series, WiFi 6E', 4500000, 4, 5),
('MSI MAG B760M Mortar', 'Motherboard LGA1700 mATX, mendukung DDR5', 2100000, 6, 5),
('Corsair RM750x 750W', 'PSU 80+ Gold, fully modular, diam dan efisien', 1350000, 9, 6),
('Deepcool AK620 CPU Cooler', 'Dual tower CPU cooler, performa setara AIO 240mm', 650000, 11, 8);
