import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQty = async (id, qty) => {
    if (qty < 1) return;
    try {
      await api.put(`/cart/${id}`, { quantity: qty });
      setCart(cart.map(item => item.id === id ? { ...item, quantity: qty } : item));
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal update');
    }
  };

  const removeItem = async (id) => {
    try {
      await api.delete(`/cart/${id}`);
      setCart(cart.filter(item => item.id !== id));
    } catch (err) {
      alert('Gagal menghapus item');
    }
  };

  const validate = () => {
    const errs = {};
    if (!address.trim()) errs.address = 'Alamat pengiriman wajib diisi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const checkout = async () => {
    if (!validate()) return;
    setCheckingOut(true);
    try {
      const items = cart.map(c => ({ product_id: c.product_id, quantity: c.quantity }));
      await api.post('/orders', { items, shipping_address: address });
      setCart([]);
      setAddress('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout gagal, coba lagi');
    } finally {
      setCheckingOut(false);
    }
  };

  const subtotal = cart.reduce((a, x) => a + x.price * x.quantity, 0);
  const ongkir = 15000;

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-center text-gray-400">Memuat keranjang...</div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-lg font-semibold mb-4">Keranjang Belanja</h1>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-4 flex items-start gap-3">
          <span className="text-xl">✅</span>
          <div>
            <p className="font-medium text-sm">Pesanan berhasil dibuat!</p>
            <p className="text-xs mt-0.5 text-green-600">Kami akan segera memproses pesanan Anda. Cek riwayat pesanan untuk detail.</p>
          </div>
        </div>
      )}

      {cart.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-gray-500 mb-4">Keranjang kamu masih kosong</p>
          <Link to="/" className="bg-[#1a1a2e] text-yellow-400 px-6 py-2.5 rounded-xl text-sm font-medium">
            Belanja Sekarang
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
                <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                  🔧
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{fmt(item.price)} / pcs</p>
                  <p className="text-sm font-semibold text-blue-900 mt-0.5">
                    {fmt(item.price * item.quantity)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                    className="w-7 h-7 border border-gray-200 rounded-lg text-sm flex items-center justify-center hover:bg-gray-50"
                  >−</button>
                  <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="w-7 h-7 border border-gray-200 rounded-lg text-sm flex items-center justify-center hover:bg-gray-50 disabled:opacity-40"
                  >+</button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-400 hover:text-red-600 text-lg ml-1 flex-shrink-0"
                >✕</button>
              </div>
            ))}
          </div>

          {/* Ringkasan & Checkout */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="font-medium text-sm mb-3">Ringkasan Pesanan</h2>
            <div className="space-y-2 text-sm text-gray-500 mb-3">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} produk)</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkos Kirim (JNE Reg)</span>
                <span>{fmt(ongkir)}</span>
              </div>
            </div>
            <div className="flex justify-between font-semibold text-base border-t pt-3 mb-4">
              <span>Total Pembayaran</span>
              <span className="text-blue-900">{fmt(subtotal + ongkir)}</span>
            </div>

            <div className="mb-1">
              <label className="text-xs text-gray-500 block mb-1">Alamat Pengiriman *</label>
              <textarea
                rows={2}
                placeholder="Masukkan alamat lengkap (jalan, kelurahan, kota, kode pos)..."
                value={address}
                onChange={(e) => { setAddress(e.target.value); setErrors({}); }}
                className={`w-full border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-900/20 ${errors.address ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>

            <button
              onClick={checkout}
              disabled={checkingOut}
              className="w-full mt-3 bg-[#1a1a2e] text-yellow-400 rounded-xl py-3 font-semibold text-sm hover:bg-[#0f3460] transition-colors disabled:opacity-60"
            >
              {checkingOut ? 'Memproses...' : 'Checkout Sekarang →'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
