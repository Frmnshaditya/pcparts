import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const fmtDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

const STATUS_STYLE = {
  diproses: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  dikirim:  'bg-blue-50  text-blue-700  border-blue-200',
  selesai:  'bg-green-50 text-green-700 border-green-200',
};
const STATUS_LABEL = { diproses: '⏳ Diproses', dikirim: '🚚 Dikirim', selesai: '✅ Selesai' };

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my')
      .then(({ data }) => setOrders(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-10 text-center text-gray-400">Memuat pesanan...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-lg font-semibold mb-4">Riwayat Pesanan</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-500 mb-4">Belum ada pesanan</p>
          <Link to="/" className="bg-[#1a1a2e] text-yellow-400 px-6 py-2.5 rounded-xl text-sm font-medium">
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold">Pesanan #{order.id}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmtDate(order.created_at)}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full border font-medium ${STATUS_STYLE[order.status]}`}>
                  {STATUS_LABEL[order.status]}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-3 mb-3">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs text-gray-600 py-1">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div>
                  <p className="text-xs text-gray-400">Alamat: {order.shipping_address}</p>
                </div>
                <p className="text-sm font-bold text-blue-900">{fmt(order.total_price)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
