import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nama wajib diisi';
    if (!form.email.includes('@')) errs.email = 'Email tidak valid';
    if (form.password.length < 6) errs.password = 'Password minimal 6 karakter';
    if (form.password !== form.confirm) errs.confirm = 'Password tidak cocok';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Link to="/" className="text-2xl font-bold">
            <span className="text-[#1a1a2e]">PC</span>
            <span className="text-yellow-500">Parts</span>
          </Link>
          <p className="text-gray-500 text-sm mt-1">Buat akun baru</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm mb-4">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Nama Lengkap', type: 'text', placeholder: 'Nama kamu' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'email@example.com' },
              { key: 'password', label: 'Password', type: 'password', placeholder: 'Minimal 6 karakter' },
              { key: 'confirm', label: 'Konfirmasi Password', type: 'password', placeholder: 'Ulangi password' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs text-gray-500 block mb-1">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={set(key)}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 ${errors[key] ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1a2e] text-yellow-400 rounded-xl py-2.5 font-semibold text-sm hover:bg-[#0f3460] transition-colors disabled:opacity-60"
            >
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-blue-900 font-medium hover:underline">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
