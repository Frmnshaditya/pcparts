import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import ProductCard from '../../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  const [loading, setLoading] = useState(true);

  // =============================
  // FETCH PRODUCTS
  // =============================
  const fetchProducts = useCallback(async () => {
    setLoading(true);

    try {
      const params = {};
      if (search) params.search = search;
      if (catFilter) params.category_id = catFilter;

      const { data } = await api.get('/products', { params });
      setProducts(data);

    } catch (err) {
      console.error('Gagal fetch produk:', err);
    } finally {
      setLoading(false);
    }
  }, [search, catFilter]);

  // =============================
  // FETCH CATEGORIES (ONCE)
  // =============================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
      } catch (err) {
        console.error('Gagal fetch kategori:', err);
      }
    };

    fetchCategories();
  }, []);

  // =============================
  // FETCH PRODUCTS (WITH DEBOUNCE)
  // =============================
  useEffect(() => {
    const delay = setTimeout(fetchProducts, 300);
    return () => clearTimeout(delay);
  }, [fetchProducts]);

  // =============================
  // UI
  // =============================
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* ================= HERO ================= */}
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#0f3460] rounded-2xl p-6 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-semibold mb-1">
            Sparepart Komputer Terlengkap
          </h1>
          <p className="text-gray-400 text-sm">
            GPU, CPU, RAM, SSD, Motherboard & lainnya
          </p>
        </div>

        <div className="hidden sm:block bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-sm px-4 py-2 rounded-xl">
          🔥 Harga Terbaik
        </div>
      </div>

      {/* ================= SEARCH & FILTER ================= */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Cari produk (RTX, Ryzen, SSD...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/30 bg-white"
        />

        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/30"
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* ================= CATEGORY CHIPS ================= */}
      <div className="flex gap-2 flex-wrap mb-5">
        <button
          onClick={() => setCatFilter('')}
          className={`px-3 py-1 rounded-full text-xs border transition ${
            catFilter === ''
              ? 'bg-[#1a1a2e] text-yellow-400 border-[#1a1a2e]'
              : 'border-gray-200 text-gray-500 hover:border-gray-400'
          }`}
        >
          Semua
        </button>

        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCatFilter(String(c.id))}
            className={`px-3 py-1 rounded-full text-xs border transition ${
              catFilter === String(c.id)
                ? 'bg-[#1a1a2e] text-yellow-400 border-[#1a1a2e]'
                : 'border-gray-200 text-gray-500 hover:border-gray-400'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* ================= PRODUCT GRID ================= */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white border rounded-xl overflow-hidden animate-pulse">
              <div className="h-28 bg-gray-100" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🔍</div>
          <p>Produk tidak ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}