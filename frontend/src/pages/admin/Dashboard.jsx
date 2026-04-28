import { useState, useEffect } from 'react';
import api from '../../api/axios';

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const fmtDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_STYLE = {
  diproses: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  dikirim:  'bg-blue-50  text-blue-700  border-blue-200',
  selesai:  'bg-green-50 text-green-700 border-green-200',
};

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/orders'), api.get('/products')])
      .then(([o, p]) => { setOrders(o.data); setProducts(p.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders.filter(o => o.status === 'selesai').reduce((a, o) => a + Number(o.total_price), 0);
  const lowStock = products.filter(p => p.stock < 5).length;

  if (loading) return <div className="p-6 text-gray-400">Memuat dashboard...</div>;

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold text-gray-800 mb-5">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Produk', value: products.length, icon: '📦', color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Pesanan', value: orders.length, icon: '🛒', color: 'bg-purple-50 text-purple-600' },
          { label: 'Stok Menipis', value: lowStock, icon: '⚠️', color: 'bg-red-50 text-red-600' },
          { label: 'Pendapatan', value: fmt(totalRevenue), icon: '💰', color: 'bg-green-50 text-green-600', small: true },
        ].map(({ label, value, icon, color, small }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg mb-3 ${color}`}>{icon}</div>
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`font-bold text-gray-800 ${small ? 'text-base' : 'text-2xl'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Pesanan Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-400">
                <th className="text-left px-4 py-2.5">ID</th>
                <th className="text-left px-4 py-2.5">Pembeli</th>
                <th className="text-left px-4 py-2.5">Tanggal</th>
                <th className="text-left px-4 py-2.5">Total</th>
                <th className="text-left px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((order) => (
                <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium">#{order.id}</td>
                  <td className="px-4 py-3 text-gray-600">{order.buyer_name}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(order.created_at)}</td>
                  <td className="px-4 py-3 font-medium">{fmt(order.total_price)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_STYLE[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low stock warning */}
      {lowStock > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-red-700 mb-2">⚠️ Produk Stok Menipis</h2>
          <div className="space-y-1">
            {products.filter(p => p.stock < 5).map(p => (
              <div key={p.id} className="flex justify-between text-xs text-red-600">
                <span>{p.name}</span>
                <span className="font-medium">Sisa {p.stock} unit</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
