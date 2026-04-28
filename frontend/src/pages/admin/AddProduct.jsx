import { useState } from 'react';
import api from '../../api/axios';

export default function AddProduct() {
  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    category_id: '',
    description: ''
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', form.price);
    formData.append('stock', form.stock);
    formData.append('category_id', form.category_id);
    formData.append('description', form.description);

    if (image) {
      formData.append('image', image); // 🔥 WAJIB SAMA DENGAN multer
    }

    try {
      setLoading(true);

      await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // 🔥 PENTING
        },
      });

      alert('Produk berhasil ditambahkan');

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

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Gagal tambah produk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 max-w-md">

      <input
        className="border p-2 w-full"
        placeholder="Nama produk"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        className="border p-2 w-full"
        type="number"
        placeholder="Harga"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
      />

      <input
        className="border p-2 w-full"
        type="number"
        placeholder="Stok"
        value={form.stock}
        onChange={(e) => setForm({ ...form, stock: e.target.value })}
      />

      <input
        className="border p-2 w-full"
        placeholder="Category ID"
        value={form.category_id}
        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
      />

      <textarea
        className="border p-2 w-full"
        placeholder="Deskripsi"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      {/* 🔥 UPLOAD GAMBAR */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          setImage(file);

          // 🔥 PREVIEW
          if (file) {
            setPreview(URL.createObjectURL(file));
          }
        }}
      />

      {/* 🔥 PREVIEW GAMBAR */}
      {preview && (
        <img
          src={preview}
          alt="preview"
          className="w-32 h-32 object-cover rounded"
        />
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {loading ? 'Uploading...' : 'Tambah Produk'}
      </button>
    </form>
  );
}