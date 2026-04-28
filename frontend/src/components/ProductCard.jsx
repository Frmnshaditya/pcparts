import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const ICONS = {
  'GPU / VGA Card': '🎮',
  'CPU / Processor': '⚡',
  RAM: '🔧',
  'Storage (SSD/HDD)': '💾',
  Motherboard: '🖥️',
  'Power Supply': '🔌',
  Casing: '📦',
  'Pendingin / Cooling': '❄️'
};

export default function ProductCard({ product, onCartUpdate }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await api.post('/cart', {
        product_id: product.id,
        quantity: 1,
      });

      setAdded(true);
      onCartUpdate?.();
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambahkan ke keranjang');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 HANDLE SEMUA SUMBER GAMBAR
  const imageSrc =
    product.image
      ? `http://localhost:5000/uploads/${product.image}`
      : product.image_url
      ? product.image_url
      : null;

  const icon = ICONS[product.category_name] || '🔩';

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200">

      {/* 🔥 IMAGE */}
      <div className="h-40 bg-gray-100 overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-5xl text-gray-300">
            {icon}
          </div>
        )}
      </div>

      {/* 🔽 CONTENT */}
      <div className="p-3 space-y-1">

        <p className="text-xs text-gray-400">
          {product.category_name || 'Uncategorized'}
        </p>

        <p className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[36px]">
          {product.name}
        </p>

        <p className="text-base font-bold text-blue-900">
          {fmt(product.price)}
        </p>

        <p className={`text-xs ${
          product.stock < 5 ? 'text-red-500' : 'text-gray-400'
        }`}>
          Stok: {product.stock}
        </p>

        <button
          onClick={handleAdd}
          disabled={loading || product.stock === 0}
          className={`w-full py-2 rounded-lg text-xs font-semibold transition-all ${
            added
              ? 'bg-green-500 text-white'
              : product.stock === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-[#1a1a2e] text-yellow-400 hover:bg-[#0f3460]'
          }`}
        >
          {added
            ? '✓ Ditambahkan'
            : product.stock === 0
            ? 'Stok Habis'
            : '+ Keranjang'}
        </button>
      </div>
    </div>
  );
}