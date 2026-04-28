import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Nama kategori wajib diisi'); return; }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
      } else {
        await api.post('/categories', form);
      }
      setForm({ name: '' });
      setEditingId(null);
      setError('');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c) => {
    setForm({ name: c.name });
    setEditingId(c.id);
    setError('');
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus kategori "${name}"? Produk di kategori ini akan kehilangan kategorinya.`)) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus');
    }
  };

  const handleCancel = () => { setForm({ name: '' }); setEditingId(null); setError(''); };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-lg font-semibold text-gray-800 mb-5">Kelola Kategori</h1>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
        <h2 className="text-sm font-semibold mb-3 text-gray-700">
          {editingId ? '✏️ Edit Kategori' : '➕ Tambah Kategori'}
        </h2>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={form.name}
              onChange={(e) => { setForm({ name: e.target.value }); setError(''); }}
              placeholder="Nama kategori, contoh: GPU / VGA Card"
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 ${error ? 'border-red-400' : 'border-gray-200'}`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <button type="submit" disabled={saving}
            className="bg-[#1a1a2e] text-yellow-400 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap disabled:opacity-60">
            {saving ? 'Menyimpan...' : editingId ? 'Simpan' : '+ Tambah'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancel}
              className="border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm">
              Batal
            </button>
          )}
        </form>
      </div>

      {/* Daftar kategori */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Daftar Kategori ({categories.length})</h2>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">Memuat...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">Belum ada kategori</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {categories.map((c) => (
              <div key={c.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50">
                <div>
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.product_count} produk</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(c)}
                    className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1 rounded-lg text-xs">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(c.id, c.name)}
                    className="border border-red-200 text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg text-xs">
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
