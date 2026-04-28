import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    category_id: '',
    description: ''
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const fileInputRef = useRef();

  // ================= FETCH =================
  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data || []);
    } catch (err) {
      console.error('FETCH PRODUCTS ERROR:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error('FETCH CATEGORY ERROR:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ================= IMAGE =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // ================= CREATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price) {
      alert('Nama & harga wajib diisi');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', form.price);
    formData.append('stock', form.stock);
    formData.append('category_id', form.category_id);
    formData.append('description', form.description);

    if (image) {
      formData.append('image', image);
    }

    try {
      await api.post('/products', formData);

      alert('Produk berhasil ditambahkan');

      fetchProducts();

      // reset form
      setForm({
        name: '',
        price: '',
        stock: '',
        category_id: '',
        description: ''
      });

      setImage(null);
      setPreview(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Gagal tambah produk');
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    const ok = confirm('Yakin mau hapus produk ini?');
    if (!ok) return;

    setDeletingId(id);

    try {
      await api.delete(`/products/${id}`);
      alert('Produk berhasil dihapus');

      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Gagal hapus produk');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6">

      {/* ================= FORM ================= */}
      <h2 className="text-lg font-semibold mb-3">Tambah Produk</h2>

      <form onSubmit={handleSubmit} className="grid gap-2 mb-6 max-w-md">

        <input
          placeholder="Nama produk"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Harga"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="border p-2 rounded"
        />

        <input
          type="number"
          placeholder="Stok"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          className="border p-2 rounded"
        />

        {/* 🔥 DROPDOWN KATEGORI */}
        <select
          value={form.category_id}
          onChange={(e) =>
            setForm({ ...form, category_id: e.target.value })
          }
          className="border p-2 rounded"
        >
          <option value="">-- Pilih Kategori --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Deskripsi"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          className="border p-2 rounded"
        />

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="border p-2 rounded"
        />

        {preview && (
          <img
            src={preview}
            className="h-32 w-full object-cover rounded border"
          />
        )}

        <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Tambah Produk
        </button>
      </form>

      {/* ================= LIST ================= */}
      <h2 className="text-lg font-semibold mb-3">Daftar Produk</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => {
          const imageSrc =
            p.image
              ? `http://localhost:5000/uploads/${p.image}`
              : p.image_url
              ? p.image_url
              : '/no-image.png';

          return (
            <div key={p.id} className="border p-3 rounded hover:shadow">

              <img
                src={imageSrc}
                className="h-32 w-full object-cover mb-2 rounded"
                onError={(e) => {
                  e.target.src = '/no-image.png';
                }}
              />

              <p className="text-xs text-gray-400">
                {p.category_name || 'Tanpa kategori'}
              </p>

              <p className="text-sm font-semibold line-clamp-2">
                {p.name}
              </p>

              <p className="text-xs text-gray-500">
                Rp {Number(p.price).toLocaleString('id-ID')}
              </p>

              <button
                onClick={() => handleDelete(p.id)}
                disabled={deletingId === p.id}
                className="mt-2 w-full bg-red-500 text-white py-1 rounded hover:bg-red-600 disabled:opacity-50"
              >
                {deletingId === p.id ? 'Menghapus...' : 'Hapus'}
              </button>

            </div>
          );
        })}
      </div>

    </div>
  );
}