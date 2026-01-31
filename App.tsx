
import React, { useState, useEffect, useMemo } from 'react';
import { Product, CartItem, Category, ContactInfo, Order } from './types';
import { INITIAL_PRODUCTS } from './constants';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CartSidebar from './components/CartSidebar';
import AddProductForm from './components/AddProductForm';
import EditProductForm from './components/EditProductForm';
import CheckoutModal from './components/CheckoutModal';
import { getAIAssistantResponse } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'shop' | 'services' | 'admin'>('home');
  const [adminTab, setAdminTab] = useState<'inventory' | 'orders'>('inventory');
  
  // Products State with LocalStorage sync
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('abs_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  // Orders State with LocalStorage sync
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

  // Admin UI States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditingContact, setIsEditingContact] = useState(false);

  // Business Settings State
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

  // Password for admin (Default: rdh5050)
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
      alert('ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।');
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই প্রোডাক্টটি মুছে ফেলতে চান?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingContact(false);
    alert('বিজনেস ইনফরমেশন সেভ হয়েছে!');
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
            <section className="relative h-[450px] md:h-[550px] flex items-center bg-blue-900 text-white overflow-hidden">
              <div className="absolute inset-0 z-0 opacity-20">
                <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="Hero" />
              </div>
              <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 text-center md:text-left">
                <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight">ABS লাইব্রেরি ও কম্পিউটার</h1>
                <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-xl">পড়াশোনা এবং প্রযুক্তি - আপনার প্রয়োজনীয় সব সমাধান এখন এক ঠিকানায়।</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => setView('shop')} className="bg-white text-blue-900 px-8 py-3 rounded-xl font-black hover:scale-105 transition shadow-xl">কেনাকাটা করুন</button>
                  <button onClick={() => setView('services')} className="bg-blue-600 border-2 border-blue-400 px-8 py-3 rounded-xl font-black hover:bg-blue-500 transition">সার্ভিসসমূহ</button>
                </div>
              </div>
            </section>

            <section className="py-12 bg-white">
              <div className="max-w-3xl mx-auto px-4">
                <div className="bg-blue-50 p-6 md:p-10 rounded-[2.5rem] border-2 border-blue-100 shadow-inner">
                  <h3 className="text-xl font-black mb-2 text-blue-900">স্মার্ট সেলস অ্যাসিস্ট্যান্ট</h3>
                  <p className="text-sm text-blue-700/70 mb-6 font-bold">আমাদের পণ্য বা সার্ভিস সম্পর্কে যেকোনো প্রশ্ন করুন।</p>
                  <form onSubmit={handleAiChat} className="flex flex-col sm:flex-row gap-2">
                    <input name="aiInput" className="flex-1 px-5 py-3 rounded-2xl border-2 focus:border-blue-500 outline-none font-semibold" placeholder="কিভাবে সাহায্য করতে পারি?" />
                    <button type="submit" disabled={isAiLoading} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-700 transition disabled:opacity-50">
                      {isAiLoading ? 'ভাবছি...' : 'জিজ্ঞাসা করুন'}
                    </button>
                  </form>
                  {aiResponse && <div className="mt-6 p-5 bg-white rounded-2xl border-l-4 border-blue-600 shadow-sm text-gray-700 leading-relaxed font-medium">{aiResponse}</div>}
                </div>
              </div>
            </section>
          </div>
        )}

        {view === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-8">
              <aside className="w-full md:w-64">
                <div className="bg-white p-6 rounded-3xl border shadow-sm sticky top-24">
                  <h3 className="text-xs font-black mb-4 text-gray-400 uppercase tracking-widest">ক্যাটাগরি</h3>
                  <div className="flex md:flex-col overflow-x-auto md:overflow-visible gap-2">
                    {['All', 'Bookstore', 'Stationery', 'Computer Accessories'].map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => setActiveCategory(cat as any)} 
                        className={`whitespace-nowrap text-left px-4 py-3 rounded-xl text-sm font-bold transition ${activeCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'hover:bg-gray-100 text-gray-600'}`}
                      >
                        {cat === 'All' ? 'সবগুলো' : cat === 'Bookstore' ? 'বইঘর' : cat === 'Stationery' ? 'স্টেশনারি' : 'কম্পিউটার পার্টস'}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
              <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />)}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'services' && (
          <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 animate-fade-in">
            <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border border-gray-100">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 text-center">কম্পিউটার সার্ভিসসমূহ</h2>
              <div className="whitespace-pre-wrap text-base md:text-lg leading-relaxed text-gray-700 bg-blue-50/50 p-6 md:p-10 rounded-3xl border border-blue-100 shadow-inner font-medium">
                {contactInfo.servicesProvided}
              </div>
              <div className="mt-12 text-center p-8 bg-gray-900 rounded-[2.5rem] text-white shadow-2xl">
                <h3 className="text-xl font-bold mb-3 text-gray-400">সার্ভিস নিতে সরাসরি কল করুন</h3>
                <a href={`tel:${contactInfo.phone}`} className="text-blue-400 text-3xl md:text-4xl font-black mb-4 block hover:scale-105 transition">{contactInfo.phone}</a>
                <p className="text-gray-500 font-bold">ঠিকানা: {contactInfo.address}</p>
              </div>
            </div>
          </div>
        )}

        {view === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
            {!isLoggedIn ? (
              <div className="max-w-md mx-auto bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border">
                <h2 className="text-2xl font-black mb-8 text-center text-gray-800 uppercase tracking-widest">অ্যাডমিন লগইন</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      className="w-full px-5 py-4 rounded-2xl border-2 focus:border-blue-500 outline-none font-bold"
                      placeholder="পাসওয়ার্ড লিখুন"
                      value={loginInput}
                      onChange={e => setLoginInput(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-4 text-gray-400 hover:text-blue-600 transition"
                    >
                      {showPassword ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                      )}
                    </button>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-lg">লগইন</button>
                </form>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-3xl border shadow-sm">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900">অ্যাডমিন ড্যাশবোর্ড</h2>
                    <p className="text-sm font-bold text-gray-500">আপনার শপের যাবতীয় তথ্য পরিচালনা করুন</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setAdminTab('inventory')} className={`px-5 py-2.5 rounded-xl font-bold transition ${adminTab === 'inventory' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200'}`}>ইনভেন্টরি</button>
                    <button onClick={() => setAdminTab('orders')} className={`px-5 py-2.5 rounded-xl font-bold transition ${adminTab === 'orders' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200'}`}>অর্ডারসমূহ ({orders.length})</button>
                    <button onClick={() => setIsEditingContact(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      সেটিংস
                    </button>
                    <button onClick={() => setIsLoggedIn(false)} className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold hover:bg-red-600 hover:text-white transition border border-red-100">লগ আউট</button>
                  </div>
                </div>

                {adminTab === 'inventory' ? (
                  <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden animate-fade-in">
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                      <h3 className="text-xl font-black text-gray-800">সব প্রোডাক্ট</h3>
                      <button onClick={() => setIsAddingProduct(true)} className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-100">+ নতুন প্রোডাক্ট</button>
                    </div>
                    {isAddingProduct && <AddProductForm onAdd={(p) => { setProducts(prev => [p, ...prev]); setIsAddingProduct(false); }} onCancel={() => setIsAddingProduct(false)} />}
                    {editingProduct && <EditProductForm product={editingProduct} onSave={(p) => { setProducts(prev => prev.map(old => old.id === p.id ? p : old)); setEditingProduct(null); }} onCancel={() => setEditingProduct(null)} />}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-black text-gray-400 uppercase tracking-widest border-b">
                          <tr>
                            <th className="px-6 py-4">প্রোডাক্ট</th>
                            <th className="px-6 py-4">দাম</th>
                            <th className="px-6 py-4">ক্যাটাগরি</th>
                            <th className="px-6 py-4 text-right">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {products.map(p => (
                            <tr key={p.id} className="hover:bg-blue-50/20 transition">
                              <td className="px-6 py-4 flex items-center gap-3">
                                <img src={p.image} className="w-12 h-12 rounded-xl object-cover border shadow-sm" alt={p.name} />
                                <span className="font-bold text-gray-900">{p.name}</span>
                              </td>
                              <td className="px-6 py-4 font-black text-blue-700">৳{p.price}</td>
                              <td className="px-6 py-4 text-sm font-bold text-gray-500">{p.category}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setEditingProduct(p)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition">
                                    এডিট
                                  </button>
                                  <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition">
                                    ডিলিট
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6 animate-fade-in">
                    {orders.length === 0 ? (
                      <div className="bg-white p-20 text-center rounded-[2rem] border-2 border-dashed">
                        <p className="text-gray-400 font-bold text-xl">এখনো কোনো অর্ডার আসেনি।</p>
                      </div>
                    ) : (
                      orders.map(order => (
                        <div key={order.id} className="bg-white p-6 rounded-[2rem] border shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">{order.id}</span>
                              <span className="text-gray-400 text-[10px] font-bold">{order.date}</span>
                            </div>
                            <h4 className="font-black text-xl text-gray-900">{order.customerName}</h4>
                            <p className="text-sm font-bold text-gray-600 flex items-center gap-2">
                              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                              {order.phone}
                            </p>
                            <p className="text-sm font-semibold text-gray-500">{order.address}</p>
                            {order.transactionId && <span className="text-[10px] font-black bg-pink-50 text-pink-600 px-3 py-1 rounded-full border border-pink-100">TRX: {order.transactionId}</span>}
                          </div>
                          <div className="bg-gray-50 p-6 rounded-3xl md:w-80 border shadow-inner">
                            <h5 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">আইটেমসমূহ</h5>
                            <ul className="text-xs space-y-3">
                              {order.items.map((item, idx) => (
                                <li key={idx} className="flex justify-between font-bold text-gray-700">
                                  <span>{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                                  <span className="font-black">৳{item.price * item.quantity}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="border-t-2 border-dashed mt-5 pt-4 flex justify-between font-black text-blue-700 text-lg">
                              <span>মোট বিল:</span>
                              <span>৳{order.total}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Settings Modal */}
      {isEditingContact && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-8 md:p-10 overflow-y-auto max-h-[90vh] border">
            <h3 className="text-2xl font-black mb-8 text-gray-800 uppercase tracking-widest text-center">বিজনেস সেটিংস</h3>
            <form onSubmit={handleSaveContact} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">ফোন নম্বর</label>
                  <input className="w-full bg-gray-50 border-2 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold" value={contactInfo.phone} onChange={e => setContactInfo({...contactInfo, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">ইমেইল</label>
                  <input className="w-full bg-gray-50 border-2 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold" value={contactInfo.email} onChange={e => setContactInfo({...contactInfo, email: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-pink-500 uppercase tracking-widest mb-2 ml-1">বিকাশ নম্বর (Personal)</label>
                  <input className="w-full bg-pink-50/30 border-2 border-pink-100 rounded-2xl px-5 py-4 outline-none focus:border-pink-500 transition font-black text-pink-700" value={contactInfo.bkashNumber} onChange={e => setContactInfo({...contactInfo, bkashNumber: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-black text-orange-500 uppercase tracking-widest mb-2 ml-1">নগদ নম্বর (Personal)</label>
                  <input className="w-full bg-orange-50/30 border-2 border-orange-100 rounded-2xl px-5 py-4 outline-none focus:border-orange-500 transition font-black text-orange-700" value={contactInfo.nagadNumber} onChange={e => setContactInfo({...contactInfo, nagadNumber: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">ঠিকানা</label>
                <input className="w-full bg-gray-50 border-2 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-bold" value={contactInfo.address} onChange={e => setContactInfo({...contactInfo, address: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">সার্ভিসসমূহ (তালিকা)</label>
                <textarea rows={5} className="w-full bg-gray-50 border-2 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition font-medium text-sm leading-relaxed" value={contactInfo.servicesProvided} onChange={e => setContactInfo({...contactInfo, servicesProvided: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-5 rounded-[1.5rem] font-black shadow-xl hover:bg-blue-700 transition active:scale-95">সেভ করুন</button>
                <button type="button" onClick={() => setIsEditingContact(false)} className="flex-1 bg-gray-100 text-gray-700 py-5 rounded-[1.5rem] font-bold hover:bg-gray-200 transition">বাতিল</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <h2 className="text-white text-3xl font-black tracking-tighter">ABS <span className="text-blue-500">Library & Computer</span></h2>
              <p className="max-w-sm mx-auto md:mx-0 text-gray-500 leading-relaxed font-medium">আমরা সততা ও বিশ্বাসের সাথে দীর্ঘ সময় ধরে বই এবং প্রযুক্তিগত সেবা প্রদান করে আসছি।</p>
              <div className="flex gap-4 justify-center md:justify-start">
                <a href={contactInfo.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:scale-110 transition shadow-xl">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-white font-black mb-6 uppercase text-xs tracking-widest">মেনু</h3>
              <ul className="space-y-4 text-sm font-bold">
                <li><button onClick={() => setView('shop')} className="hover:text-white transition">প্রোডাক্ট লিস্ট</button></li>
                <li><button onClick={() => setView('services')} className="hover:text-white transition">সার্ভিসসমূহ</button></li>
                <li><button onClick={() => setView('admin')} className="hover:text-white transition">অ্যাডমিন লগইন</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-black mb-6 uppercase text-xs tracking-widest">কন্টাক্ট</h3>
              <ul className="space-y-4 text-sm font-bold">
                <li className="text-blue-400">ফোন: {contactInfo.phone}</li>
                <li className="text-pink-500">বিকাশ: {contactInfo.bkashNumber}</li>
                <li className="text-orange-500">নগদ: {contactInfo.nagadNumber}</li>
                <li className="text-gray-500 font-medium">ঠিকানা: {contactInfo.address}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-16 pt-10 text-[10px] font-black text-center tracking-widest uppercase text-gray-700">
            &copy; {new Date().getFullYear()} ABS Library & Computer. All Rights Reserved.
          </div>
        </div>
      </footer>

      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart}
        onRemove={handleRemoveFromCart}
        onUpdateQty={handleUpdateQty}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        onOrderSuccess={handleAddOrder}
        items={cart}
        contactInfo={contactInfo}
      />
    </div>
  );
};

export default App;
