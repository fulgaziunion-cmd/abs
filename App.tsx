
import React, { useState, useEffect, useMemo } from 'react';
import { Product, CartItem, Category, ContactInfo, Order } from './types.ts';
import { INITIAL_PRODUCTS } from './constants.tsx';
import Navbar from './components/Navbar.tsx';
import ProductCard from './components/ProductCard.tsx';
import CartSidebar from './components/CartSidebar.tsx';
import AddProductForm from './components/AddProductForm.tsx';
import EditProductForm from './components/EditProductForm.tsx';
import CheckoutModal from './components/CheckoutModal.tsx';
import { getAIAssistantResponse } from './services/geminiService.ts';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'shop' | 'services' | 'admin'>('home');
  const [adminTab, setAdminTab] = useState<'inventory' | 'orders'>('inventory');
  
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('abs_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('abs_orders');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditingContact, setIsEditingContact] = useState(false);

  const [contactInfo, setContactInfo] = useState<ContactInfo>(() => {
    try {
      const saved = localStorage.getItem('abs_contact_info');
      return saved ? JSON.parse(saved) : { 
        phone: '01XXXXXXXXX', 
        email: 'info@abslibrary.com', 
        address: 'ঢাকা, বাংলাদেশ',
        facebookUrl: 'https://facebook.com',
        bkashNumber: '017XXXXXXXX',
        nagadNumber: '018XXXXXXXX',
        servicesProvided: '১. কম্পিউটার উইন্ডোজ সেটআপ\n২. হার্ডওয়্যার রিপেয়ারিং\n৩. সফটওয়্যার ইনস্টলেশন\n৪. প্রিন্টার সার্ভিসিং\n৫. ডাটা রিকভারি'
      };
    } catch (e) {
      return { phone: '', email: '', address: '', facebookUrl: '', bkashNumber: '', nagadNumber: '', servicesProvided: '' };
    }
  });

  const ADMIN_PWD = localStorage.getItem('abs_admin_pwd') || 'rdh5050';

  useEffect(() => {
    localStorage.setItem('abs_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('abs_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('abs_contact_info', JSON.stringify(contactInfo));
  }, [contactInfo]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.author && p.author.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, products]);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleAddOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setIsCheckoutOpen(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginInput === ADMIN_PWD) {
      setIsLoggedIn(true);
      setLoginInput('');
    } else {
      alert('ভুল পাসওয়ার্ড!');
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('প্রোডাক্টটি ডিলিট করতে চান?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingContact(false);
    alert('সেটিংস সেভ হয়েছে!');
  };

  const handleAiChat = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = (e.currentTarget.elements.namedItem('aiInput') as HTMLInputElement).value;
    if (!input) return;
    setIsAiLoading(true);
    const response = await getAIAssistantResponse(input);
    setAiResponse(response);
    setIsAiLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar 
        onSearch={setSearchQuery} 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)}
        onNavigate={(v) => { setView(v); window.scrollTo(0,0); }}
      />

      <main className="flex-1">
        {view === 'home' && (
          <div className="animate-fade-in">
            <section className="relative h-[400px] md:h-[500px] flex items-center bg-blue-900 text-white overflow-hidden">
              <div className="absolute inset-0 z-0 opacity-20">
                <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="Hero" />
              </div>
              <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 text-center md:text-left">
                <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight">ABS লাইব্রেরি ও কম্পিউটার</h1>
                <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-xl">পড়াশোনা এবং প্রযুক্তি - সব সমাধান এক জায়গায়।</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => setView('shop')} className="bg-white text-blue-900 px-8 py-3 rounded-xl font-black hover:scale-105 transition shadow-xl">শপ</button>
                  <button onClick={() => setView('services')} className="bg-blue-600 border-2 border-blue-400 px-8 py-3 rounded-xl font-black hover:bg-blue-500 transition">সার্ভিসসমূহ</button>
                </div>
              </div>
            </section>

            <section className="py-12 bg-white border-b">
              <div className="max-w-3xl mx-auto px-4">
                <div className="bg-blue-50 p-6 md:p-10 rounded-[2.5rem] border-2 border-blue-100 shadow-inner">
                  <h3 className="text-xl font-black mb-2 text-blue-900">স্মার্ট সেলস অ্যাসিস্ট্যান্ট</h3>
                  <form onSubmit={handleAiChat} className="flex flex-col sm:flex-row gap-2">
                    <input name="aiInput" className="flex-1 px-5 py-3 rounded-2xl border-2 outline-none font-semibold" placeholder="কিভাবে সাহায্য করতে পারি?" />
                    <button type="submit" disabled={isAiLoading} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-700 transition disabled:opacity-50">
                      {isAiLoading ? 'ভাবছি...' : 'জিজ্ঞাসা'}
                    </button>
                  </form>
                  {aiResponse && <div className="mt-6 p-5 bg-white rounded-2xl border-l-4 border-blue-600 shadow-sm font-medium">{aiResponse}</div>}
                </div>
              </div>
            </section>
          </div>
        )}

        {view === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />)}
            </div>
          </div>
        )}

        {view === 'services' && (
          <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
            <div className="bg-white rounded-[2rem] shadow-xl p-8 border">
              <h2 className="text-3xl font-black text-center mb-8 text-gray-900">কম্পিউটার সার্ভিসসমূহ</h2>
              <div className="whitespace-pre-wrap text-lg leading-relaxed text-gray-700 bg-gray-50 p-8 rounded-2xl border">
                {contactInfo.servicesProvided}
              </div>
              <div className="mt-12 text-center p-8 bg-gray-900 rounded-[2rem] text-white">
                <h3 className="text-xl font-bold mb-3 text-gray-400">কল করুন</h3>
                <a href={`tel:${contactInfo.phone}`} className="text-blue-400 text-3xl font-black">{contactInfo.phone}</a>
              </div>
            </div>
          </div>
        )}

        {view === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
            {!isLoggedIn ? (
              <div className="max-w-md mx-auto bg-white p-10 rounded-[2.5rem] shadow-2xl border">
                <h2 className="text-2xl font-black mb-8 text-center text-gray-800">অ্যাডমিন লগইন</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      className="w-full px-5 py-4 rounded-2xl border-2 focus:border-blue-500 outline-none font-bold"
                      placeholder="পাসওয়ার্ড"
                      value={loginInput}
                      onChange={e => setLoginInput(e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-gray-400">
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition">লগইন</button>
                </form>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-between items-center bg-white p-6 rounded-3xl border shadow-sm">
                  <h2 className="text-2xl font-black">অ্যাডমিন ড্যাশবোর্ড</h2>
                  <div className="flex gap-2">
                    <button onClick={() => setAdminTab('inventory')} className={`px-4 py-2 rounded-xl font-bold ${adminTab === 'inventory' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>ইনভেন্টরি</button>
                    <button onClick={() => setAdminTab('orders')} className={`px-4 py-2 rounded-xl font-bold ${adminTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>অর্ডার ({orders.length})</button>
                    <button onClick={() => setIsEditingContact(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold">সেটিংস</button>
                    <button onClick={() => setIsLoggedIn(false)} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold">লগ আউট</button>
                  </div>
                </div>

                {adminTab === 'inventory' ? (
                  <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center">
                      <h3 className="text-xl font-black">প্রোডাক্ট লিস্ট</h3>
                      <button onClick={() => setIsAddingProduct(true)} className="bg-green-600 text-white px-5 py-2 rounded-xl font-bold">+ নতুন</button>
                    </div>
                    {isAddingProduct && <AddProductForm onAdd={(p) => { setProducts(prev => [p, ...prev]); setIsAddingProduct(false); }} onCancel={() => setIsAddingProduct(false)} />}
                    {editingProduct && <EditProductForm product={editingProduct} onSave={(p) => { setProducts(prev => prev.map(old => old.id === p.id ? p : old)); setEditingProduct(null); }} onCancel={() => setEditingProduct(null)} />}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-black text-gray-400 uppercase tracking-widest border-b">
                          <tr><th className="px-6 py-4">প্রোডাক্ট</th><th className="px-6 py-4">দাম</th><th className="px-6 py-4 text-right">অ্যাকশন</th></tr>
                        </thead>
                        <tbody className="divide-y">
                          {products.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 font-bold">{p.name}</td>
                              <td className="px-6 py-4 font-black text-blue-700">৳{p.price}</td>
                              <td className="px-6 py-4 text-right">
                                <button onClick={() => setEditingProduct(p)} className="text-blue-600 font-bold mr-4">এডিট</button>
                                <button onClick={() => handleDeleteProduct(p.id)} className="text-red-600 font-bold">ডিলিট</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {orders.length === 0 ? <p className="text-center py-20 text-gray-400">অর্ডার নেই</p> : orders.map(o => (
                      <div key={o.id} className="bg-white p-6 rounded-2xl border shadow-sm flex justify-between items-center">
                        <div>
                          <p className="font-black text-lg">{o.customerName}</p>
                          <p className="text-sm text-gray-500">{o.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-blue-600">৳{o.total}</p>
                          <p className="text-xs text-gray-400">{o.id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {isEditingContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 border">
            <h3 className="text-2xl font-black mb-8 text-center">সেটিংস পরিবর্তন</h3>
            <form onSubmit={handleSaveContact} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-400">ফোন</label><input className="w-full border-2 rounded-xl px-4 py-3" value={contactInfo.phone} onChange={e => setContactInfo({...contactInfo, phone: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-gray-400">ইমেইল</label><input className="w-full border-2 rounded-xl px-4 py-3" value={contactInfo.email} onChange={e => setContactInfo({...contactInfo, email: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-pink-600">বিকাশ</label><input className="w-full border-2 border-pink-100 rounded-xl px-4 py-3 font-bold" value={contactInfo.bkashNumber} onChange={e => setContactInfo({...contactInfo, bkashNumber: e.target.value})} /></div>
                <div><label className="text-xs font-bold text-orange-600">নগদ</label><input className="w-full border-2 border-orange-100 rounded-xl px-4 py-3 font-bold" value={contactInfo.nagadNumber} onChange={e => setContactInfo({...contactInfo, nagadNumber: e.target.value})} /></div>
              </div>
              <div><label className="text-xs font-bold text-gray-400">ঠিকানা</label><input className="w-full border-2 rounded-xl px-4 py-3" value={contactInfo.address} onChange={e => setContactInfo({...contactInfo, address: e.target.value})} /></div>
              <div><label className="text-xs font-bold text-gray-400">সার্ভিসসমূহ</label><textarea rows={4} className="w-full border-2 rounded-xl px-4 py-3" value={contactInfo.servicesProvided} onChange={e => setContactInfo({...contactInfo, servicesProvided: e.target.value})} /></div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black">সেভ করুন</button>
                <button type="button" onClick={() => setIsEditingContact(false)} className="flex-1 bg-gray-100 py-4 rounded-xl font-bold">বাতিল</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h2 className="text-white text-2xl font-black mb-4">ABS L&C</h2>
            <p className="text-sm">বিশ্বস্ততার সাথে বই এবং কম্পিউটার সার্ভিস।</p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">কন্টাক্ট</h3>
            <p className="text-sm">ফোন: {contactInfo.phone}</p>
            <p className="text-sm">ঠিকানা: {contactInfo.address}</p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">পেমেন্ট</h3>
            <p className="text-pink-500 text-sm">বিকাশ: {contactInfo.bkashNumber}</p>
            <p className="text-orange-500 text-sm">নগদ: {contactInfo.nagadNumber}</p>
          </div>
        </div>
      </footer>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onRemove={handleRemoveFromCart} onUpdateQty={handleUpdateQty} onCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} onOrderSuccess={handleAddOrder} items={cart} contactInfo={contactInfo} />
    </div>
  );
};

export default App;
