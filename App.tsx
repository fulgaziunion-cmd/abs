
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
  
  // Initialize products from localStorage or use defaults
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('abs_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  // Initialize orders from localStorage
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

  // Admin States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [isEditingContact, setIsEditingContact] = useState(false);

  // Persisted Settings
  const [storedPassword, setStoredPassword] = useState(() => localStorage.getItem('abs_admin_pwd') || 'rdh5050');
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

  // Automatically sync state with localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('abs_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('abs_orders', JSON.stringify(orders));
  }, [orders]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.author && p.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
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
    setIsCartOpen(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginInput === storedPassword) {
      setIsLoggedIn(true);
      setLoginInput('');
    } else {
      alert('ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasswordInput.length < 4) {
      alert('পাসওয়ার্ড অন্তত ৪ অক্ষরের হতে হবে।');
      return;
    }
    localStorage.setItem('abs_admin_pwd', newPasswordInput);
    setStoredPassword(newPasswordInput);
    setNewPasswordInput('');
    setIsChangingPassword(false);
    alert('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('abs_contact_info', JSON.stringify(contactInfo));
    setIsEditingContact(false);
    alert('তথ্য আপডেট করা হয়েছে!');
  };

  // --- DELETE LOGIC ---
  const handleDeleteOrder = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    if (window.confirm('পুরো অর্ডারটি কি ডিলিট করতে চান?')) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  const handleDeleteOrderItem = (e: React.MouseEvent, orderId: string, itemId: string) => {
    e.stopPropagation();
    if (window.confirm('আপনি কি নিশ্চিত যে এই আইটেমটি অর্ডার থেকে বাদ দিতে চান?')) {
      setOrders(prev => {
        return prev.map(order => {
          if (order.id === orderId) {
            const updatedItems = order.items.filter(item => item.id !== itemId);
            if (updatedItems.length === 0) return null; // Remove order if it becomes empty

            return {
              ...order,
              items: updatedItems,
              total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            };
          }
          return order;
        }).filter(o => o !== null) as Order[];
      });
    }
  };

  const handleDeleteProduct = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(window.confirm('আপনি কি নিশ্চিত যে এই প্রোডাক্টটি মুছে ফেলতে চান?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const addNewProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
    setIsAddingProduct(false);
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    setEditingProduct(null);
  };

  const handleAiChat = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = (e.currentTarget.elements.namedItem('aiInput') as HTMLInputElement).value;
    if (!input) return;
    
    setIsAiLoading(true);
    const response = await getAIAssistantResponse(input);
    setAiResponse(response || "দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না।");
    setIsAiLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        onSearch={setSearchQuery} 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)}
        onNavigate={(v) => { setView(v); window.scrollTo(0,0); }}
      />

      <main className="flex-1">
        {view === 'home' && (
          <div>
            <section className="relative h-[450px] md:h-[550px] flex items-center bg-blue-900 text-white overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-25" alt="Hero" />
              </div>
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl text-center md:text-left">
                  <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                    ABS লাইব্রেরি ও কম্পিউটার - আপনার বিশ্বস্ত ডিজিটাল সঙ্গী
                  </h1>
                  <p className="text-lg md:text-xl text-blue-100 mb-8">
                    বই, স্টেশনারি এবং কম্পিউটার সার্ভিস এখন আপনার হাতের নাগালে।
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <button onClick={() => setView('shop')} className="bg-white text-blue-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg">কেনাকাটা শুরু করুন</button>
                    <button onClick={() => setView('services')} className="bg-blue-600 border border-blue-400 px-8 py-3 rounded-xl font-bold hover:bg-blue-500 transition">সার্ভিসসমূহ</button>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-12 bg-blue-50">
              <div className="max-w-3xl mx-auto px-4 text-center">
                <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-blue-100">
                  <h3 className="text-xl font-bold mb-2">স্মার্ট অ্যাসিস্ট্যান্ট</h3>
                  <p className="text-sm text-gray-500 mb-6 font-medium">পণ্য বা সার্ভিস সম্পর্কে জিজ্ঞাসা করুন।</p>
                  <form onSubmit={handleAiChat} className="flex flex-col sm:flex-row gap-2">
                    <input name="aiInput" className="flex-1 px-5 py-3 rounded-xl border-2 focus:border-blue-500 outline-none transition" placeholder="এখানে লিখুন..." />
                    <button type="submit" disabled={isAiLoading} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50">
                      {isAiLoading ? 'ভাবছি...' : 'জিজ্ঞাসা করুন'}
                    </button>
                  </form>
                  {aiResponse && <div className="mt-6 p-4 bg-gray-50 rounded-xl text-left border-l-4 border-blue-600 italic text-gray-700 animate-fade-in">{aiResponse}</div>}
                </div>
              </div>
            </section>
          </div>
        )}

        {view === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="flex flex-col md:flex-row gap-8">
              <aside className="w-full md:w-64 space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-4 text-gray-800">ক্যাটাগরি</h3>
                  <div className="flex md:flex-col overflow-x-auto md:overflow-visible pb-2 md:pb-0 gap-2">
                    {['All', 'Bookstore', 'Stationery', 'Computer Accessories'].map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => setActiveCategory(cat as any)} 
                        className={`whitespace-nowrap text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition ${activeCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
                      >
                        {cat === 'All' ? 'সবগুলো' : cat === 'Bookstore' ? 'বইঘর' : cat === 'Stationery' ? 'স্টেশনারি' : 'কম্পিউটার এক্সেসরিজ'}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl border">
                  <h2 className="text-xl font-bold text-gray-900">{activeCategory === 'All' ? 'সব প্রোডাক্ট' : activeCategory}</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{filteredProducts.length} items</p>
                </div>
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed">
                    <p className="text-gray-400 font-medium">কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'services' && (
          <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
            <div className="bg-white rounded-[2rem] shadow-2xl p-6 md:p-12 border border-gray-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 z-0"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 text-center">কম্পিউটার সার্ভিসসমূহ</h2>
                <div className="whitespace-pre-wrap text-base md:text-lg leading-relaxed text-gray-700 bg-blue-50/50 p-6 md:p-10 rounded-3xl border border-blue-100 shadow-inner">
                  {contactInfo.servicesProvided}
                </div>
                <div className="mt-12 text-center p-8 bg-gray-900 rounded-[2rem] text-white shadow-xl">
                  <h3 className="text-xl font-bold mb-3">সার্ভিস নিতে সরাসরি কল করুন</h3>
                  <a href={`tel:${contactInfo.phone}`} className="text-blue-400 text-2xl md:text-3xl font-black mb-4 block hover:text-blue-300 transition">{contactInfo.phone}</a>
                  <p className="text-gray-400 text-sm">ঠিকানা: {contactInfo.address}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
            {!isLoggedIn ? (
              <div className="max-w-md mx-auto bg-white p-8 md:p-10 rounded-3xl shadow-2xl border">
                <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">অ্যাডমিন লগইন</h2>
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">পাসওয়ার্ড</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        className="w-full px-4 py-3 rounded-xl border-2 focus:border-blue-500 outline-none transition"
                        placeholder="••••••••"
                        value={loginInput}
                        onChange={e => setLoginInput(e.target.value)}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-blue-600">
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">লগইন করুন</button>
                </form>
              </div>
            ) : (
              <div>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6 bg-white p-6 rounded-3xl border shadow-sm">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900">অ্যাডমিন ড্যাশবোর্ড</h2>
                    <p className="text-sm font-medium text-gray-500">আপনার শপের সকল তথ্য এখানে পরিচালনা করুন।</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setAdminTab('inventory')} className={`px-5 py-2.5 rounded-xl font-bold transition ${adminTab === 'inventory' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>ইনভেন্টরি</button>
                    <button onClick={() => setAdminTab('orders')} className={`px-5 py-2.5 rounded-xl font-bold transition relative ${adminTab === 'orders' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      অর্ডারসমূহ 
                      {orders.length > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center ring-2 ring-white">{orders.length}</span>}
                    </button>
                    <button onClick={() => setIsEditingContact(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">সেটিংস</button>
                    <button onClick={() => setIsLoggedIn(false)} className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-bold hover:bg-red-600 hover:text-white transition border border-red-100">লগ আউট</button>
                  </div>
                </div>

                {adminTab === 'inventory' ? (
                  <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-800">প্রোডাক্ট লিস্ট</h3>
                      <button onClick={() => setIsAddingProduct(true)} className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-100">+ নতুন প্রোডাক্ট</button>
                    </div>
                    {isAddingProduct && <AddProductForm onAdd={addNewProduct} onCancel={() => setIsAddingProduct(false)} />}
                    {editingProduct && <EditProductForm product={editingProduct} onSave={updateProduct} onCancel={() => setEditingProduct(null)} />}
                    
                    <div className="bg-white rounded-3xl shadow-sm border overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                          <tr>
                            <th className="px-6 py-5">প্রোডাক্ট</th>
                            <th className="px-6 py-5">ক্যাটাগরি</th>
                            <th className="px-6 py-5">দাম</th>
                            <th className="px-6 py-5 text-right">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {products.map(p => (
                            <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img src={p.image} className="w-12 h-12 rounded-xl object-cover border" alt={p.name} />
                                  <span className="font-bold text-gray-900">{p.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-gray-500">{p.category}</td>
                              <td className="px-6 py-4 font-black text-blue-700">৳{p.price}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setEditingProduct(p)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition">এডিট</button>
                                  <button onClick={(e) => handleDeleteProduct(e, p.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition">ডিলিট</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="animate-fade-in space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-800">অর্ডার নোটিফিকেশন</h3>
                      {orders.length > 0 && (
                        <button onClick={() => {if(window.confirm('সব অর্ডার কি স্থায়ীভাবে মুছে ফেলতে চান?')){setOrders([]);}}} className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">সব অর্ডার মুছুন</button>
                      )}
                    </div>
                    {orders.length === 0 ? (
                      <div className="bg-white p-20 text-center rounded-[2rem] border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 font-bold text-xl">এখনো কোনো অর্ডার আসেনি।</p>
                      </div>
                    ) : (
                      <div className="grid gap-6">
                        {orders.map(order => (
                          <div key={order.id} className="bg-white p-6 rounded-3xl border-2 border-blue-50 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between gap-6 relative">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">{order.id}</span>
                                <span className="text-gray-400 text-xs font-bold">{order.date}</span>
                              </div>
                              <h4 className="font-black text-xl text-gray-900">{order.customerName}</h4>
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                                  {order.phone}
                                </p>
                                <p className="text-sm font-semibold text-gray-500 flex items-start gap-2">
                                  <svg className="w-4 h-4 text-blue-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                  {order.address}
                                </p>
                              </div>
                              {order.transactionId && (
                                <div className="bg-pink-50 text-pink-700 px-3 py-1.5 rounded-xl border border-pink-100 text-xs font-bold font-mono inline-block">
                                  Transaction ID: {order.transactionId}
                                </div>
                              )}
                            </div>
                            <div className="bg-gray-50 p-6 rounded-3xl md:w-80 border">
                              <h5 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest flex justify-between items-center">
                                অর্ডার আইটেমসমূহ 
                                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md">{order.items.length}</span>
                              </h5>
                              <ul className="text-xs space-y-3">
                                {order.items.map((item, idx) => (
                                  <li key={`${order.id}-item-${idx}`} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                      <button 
                                        onClick={(e) => handleDeleteOrderItem(e, order.id, item.id)}
                                        className="text-red-400 hover:text-red-600 transition bg-red-50 p-1.5 rounded-lg"
                                        title="আইটেমটি বাদ দিন"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                      </button>
                                      <span className="font-bold line-clamp-1">{item.name} <span className="text-blue-500">x{item.quantity}</span></span>
                                    </div>
                                    <span className="font-black text-gray-900">৳{item.price * item.quantity}</span>
                                  </li>
                                ))}
                              </ul>
                              <div className="border-t-2 border-dashed mt-5 pt-4 flex justify-between font-black text-blue-700 text-lg">
                                <span>মোট বিল:</span>
                                <span>৳{order.total}</span>
                              </div>
                            </div>
                            <div className="flex md:flex-col justify-end items-end md:items-start">
                              <button 
                                onClick={(e) => handleDeleteOrder(e, order.id)} 
                                className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white p-4 rounded-2xl border border-red-100 transition-all duration-300 shadow-sm"
                                title="পুরো অর্ডারটি ডিলিট করুন"
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {isEditingContact && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 overflow-y-auto max-h-[90vh] border">
                      <h3 className="text-2xl font-black mb-8 text-gray-800">বিজনেস সেটিংস পরিবর্তন</h3>
                      <form onSubmit={handleSaveContact} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div><label className="block text-sm font-bold mb-2">ফোন নম্বর</label><input className="w-full border-2 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition" value={contactInfo.phone} onChange={e => setContactInfo({...contactInfo, phone: e.target.value})} /></div>
                          <div><label className="block text-sm font-bold mb-2">ইমেইল</label><input className="w-full border-2 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition" value={contactInfo.email} onChange={e => setContactInfo({...contactInfo, email: e.target.value})} /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div><label className="block text-sm font-bold mb-2 text-pink-600">বিকাশ (Personal)</label><input className="w-full border-2 border-pink-100 bg-pink-50/20 rounded-xl px-4 py-3 outline-none focus:border-pink-500 transition" value={contactInfo.bkashNumber} onChange={e => setContactInfo({...contactInfo, bkashNumber: e.target.value})} /></div>
                          <div><label className="block text-sm font-bold mb-2 text-orange-600">নগদ (Personal)</label><input className="w-full border-2 border-orange-100 bg-orange-50/20 rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition" value={contactInfo.nagadNumber} onChange={e => setContactInfo({...contactInfo, nagadNumber: e.target.value})} /></div>
                        </div>
                        <div><label className="block text-sm font-bold mb-2">ঠিকানা</label><input className="w-full border-2 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition" value={contactInfo.address} onChange={e => setContactInfo({...contactInfo, address: e.target.value})} /></div>
                        <div><label className="block text-sm font-bold mb-2">সার্ভিসসমূহের বিস্তারিত তালিকা</label><textarea rows={6} className="w-full border-2 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition" value={contactInfo.servicesProvided} onChange={e => setContactInfo({...contactInfo, servicesProvided: e.target.value})} /></div>
                        <div className="flex gap-4 pt-4">
                          <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition">সেভ করুন</button>
                          <button type="button" onClick={() => setIsEditingContact(false)} className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-200 transition">বাতিল</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {isChangingPassword && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-sm border">
                      <h3 className="text-xl font-black mb-6">পাসওয়ার্ড পরিবর্তন করুন</h3>
                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <input type="password" required className="w-full px-5 py-3 rounded-xl border-2 focus:border-blue-500 outline-none transition" placeholder="নতুন পাসওয়ার্ড" value={newPasswordInput} onChange={e => setNewPasswordInput(e.target.value)} />
                        <div className="flex gap-3">
                          <button type="submit" className="flex-1 bg-green-600 text-white py-3 rounded-xl font-black shadow-md hover:bg-green-700 transition">সেভ</button>
                          <button type="button" onClick={() => setIsChangingPassword(false)} className="flex-1 bg-gray-50 text-gray-500 py-3 rounded-xl font-bold border transition hover:bg-gray-100">বাতিল</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <h2 className="text-white text-3xl font-black tracking-tighter">ABS <span className="text-blue-500">Library & Computer</span></h2>
              <p className="max-w-sm mx-auto md:mx-0 text-gray-500 leading-relaxed font-medium">২০১০ সাল থেকে আমরা সততার সাথে সেবা প্রদান করে আসছি। আপনার ডিজিটাল পথচলায় আমরা সবসময় পাশে আছি।</p>
              <div className="flex gap-4 justify-center md:justify-start">
                <a href={contactInfo.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition shadow-lg shadow-blue-900/50">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-white font-black mb-6 uppercase text-xs tracking-[0.2em]">গুরুত্বপূর্ণ লিঙ্ক</h3>
              <ul className="space-y-4 text-sm font-semibold">
                <li><button onClick={() => setView('shop')} className="hover:text-white transition-colors">সব প্রোডাক্ট</button></li>
                <li><button onClick={() => setView('services')} className="hover:text-white transition-colors">সার্ভিসসমূহ</button></li>
                <li><button onClick={() => setView('admin')} className="hover:text-white transition-colors">অ্যাডমিন প্যানেল</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-black mb-6 uppercase text-xs tracking-[0.2em]">পেমেন্ট ও কন্টাক্ট</h3>
              <ul className="space-y-4 text-sm font-bold">
                <li>ফোন: {contactInfo.phone}</li>
                <li className="text-pink-500 flex items-center gap-2 justify-center md:justify-start">
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                  বিকাশ: {contactInfo.bkashNumber}
                </li>
                <li className="text-orange-500 flex items-center gap-2 justify-center md:justify-start">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                  নগদ: {contactInfo.nagadNumber}
                </li>
                <li className="text-gray-500 font-medium">ঠিকানা: {contactInfo.address}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-16 pt-10 text-xs font-bold text-center tracking-widest uppercase text-gray-700">
            &copy; {new Date().getFullYear()} ABS Library & Computer. Built with Precision.
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
