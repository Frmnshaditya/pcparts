import { useState, useEffect } from 'react';
import api from '../../api/axios';

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const fmtDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_STYLE = {
  diproses: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  dikirim:  'bg-blue-50  text-blue-700  border-blue-200',
  selesai:  'bg-green-50 text-green-700 border-green-200',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.put(`/orders/${id}/status`, { status });
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal update status');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filterStatus ? orders.filter(o => o.status === filterStatus) : orders;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold text-gray-800">Kelola Pesanan</h1>
        <div className="flex gap-2">
          {['', 'diproses', 'dikirim', 'selesai'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                filterStatus === s ? 'bg-[#1a1a2e] text-yellow-400 border-[#1a1a2e]' : 'border-gray-200 text-gray-500 hover:border-gray-400'
              }`}
            >
              {s === '' ? 'Semua' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Memuat pesanan...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">📭</div>
          <p>Tidak ada pesanan</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">Pembeli</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Tanggal</th>
                  <th className="text-left px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <>
                    <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50/50 cursor-pointer"
                      onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                      <td className="px-4 py-3 font-medium text-gray-700">#{order.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{order.buyer_name}</p>
                        <p className="text-xs text-gray-400">{order.buyer_email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">{fmtDate(order.created_at)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{fmt(order.total_price)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_STYLE[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-gray-300 text-xs">{expanded === order.id ? '▲' : '▼'}</span>
                      </td>
                    </tr>

                    {/* Detail expand */}
                    {expanded === order.id && (
                      <tr key={`${order.id}-detail`} className="bg-blue-50/30">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-gray-500 mb-2">Item Pesanan</p>
                              <div className="space-y-1">
                                {order.items?.map((item, i) => (
                                  <div key={i} className="flex justify-between text-xs text-gray-600 bg-white rounded-lg px-3 py-2">
                                    <span>{item.name} × {item.quantity}</span>
                                    <span className="font-medium">{fmt(item.price * item.quantity)}</span>
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-gray-400 mt-2">
                                📍 {order.shipping_address}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 mb-2">Update Status</p>
                              <div className="flex flex-col gap-2">
                                {['diproses', 'dikirim', 'selesai'].map((s) => (
                                  <button
                                    key={s}
                                    onClick={(e) => { e.stopPropagation(); updateStatus(order.id, s); }}
                                    disabled={order.status === s || updating === order.id}
                                    className={`text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all disabled:opacity-50 ${
                                      order.status === s
                                        ? `${STATUS_STYLE[s]} cursor-default`
                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                  >
                                    {order.status === s ? '✓ ' : ''}{s.charAt(0).toUpperCase() + s.slice(1)}
                                    {order.status === s ? ' (saat ini)' : ''}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
