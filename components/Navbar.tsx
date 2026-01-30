
import React, { useState } from 'react';

interface NavbarProps {
  onSearch: (query: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onNavigate: (view: 'home' | 'shop' | 'services' | 'admin') => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearch, cartCount, onOpenCart, onNavigate }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 
              className="text-2xl font-bold text-blue-600 cursor-pointer"
              onClick={() => onNavigate('home')}
            >
              ABS <span className="text-gray-800">L&C</span>
            </h1>
            <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-600">
              <button onClick={() => onNavigate('home')} className="hover:text-blue-600 transition">হোম</button>
              <button onClick={() => onNavigate('shop')} className="hover:text-blue-600 transition">কেনাকাটা</button>
              <button onClick={() => onNavigate('services')} className="hover:text-blue-600 transition">আমাদের সার্ভিসসমূহ</button>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-4 hidden sm:block">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                placeholder="বই, স্টেশনারি বা পার্টস খুঁজুন..."
                className="w-full bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>
            </form>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onNavigate('admin')}
              className="text-gray-600 hover:text-blue-600 text-sm font-medium"
            >
              অ্যাডমিন
            </button>
            <button 
              onClick={onOpenCart}
              className="relative p-2 text-gray-600 hover:text-blue-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
