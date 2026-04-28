import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user && user.role === 'buyer') {
      api.get('/cart').then(({ data }) => {
        setCartCount(data.reduce((a, x) => a + x.quantity, 0));
      }).catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-[#1a1a2e] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold">
          <span className="text-white">PC</span>
          <span className="text-yellow-400">Parts</span>
        </Link>

        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="text-gray-400 hidden sm:block">Halo, {user.name}</span>

              {user.role === 'admin' ? (
                <Link to="/admin" className="bg-yellow-400 text-gray-900 px-3 py-1.5 rounded-lg font-medium text-xs">
                  Dashboard Admin
                </Link>
              ) : (
                <>
                  <Link to="/orders" className="text-gray-300 hover:text-white text-xs">Pesanan</Link>
                  <Link to="/cart" className="relative text-gray-300 hover:text-white">
                    <span className="text-sm">🛒</span>
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="border border-gray-600 text-gray-300 hover:border-gray-400 px-3 py-1.5 rounded-lg text-xs"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white text-xs">Masuk</Link>
              <Link to="/register" className="bg-yellow-400 text-gray-900 px-3 py-1.5 rounded-lg font-medium text-xs">
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
