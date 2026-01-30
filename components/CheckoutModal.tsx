
import React, { useState } from 'react';
import { CartItem, ContactInfo, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  items: CartItem[];
  contactInfo: ContactInfo;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOrderSuccess, items, contactInfo }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    transactionId: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState('');

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newOrderId = 'ORD-' + Date.now();
    setCurrentOrderId(newOrderId);

    const newOrder: Order = {
      id: newOrderId,
      customerName: formData.name,
      phone: formData.phone,
      address: formData.address,
      transactionId: formData.transactionId,
      items: [...items],
      total: total,
      date: new Date().toLocaleString('bn-BD'),
      status: 'Pending'
    };

    // Pass the new order back to App component's state
    onOrderSuccess(newOrder);
    setIsSubmitted(true);
  };

  const handleFinalClose = () => {
    setIsSubmitted(false);
    setFormData({ name: '', phone: '', address: '', transactionId: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden">
        {!isSubmitted ? (
          <>
            <div className="p-8 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="text-2xl font-black">অর্ডার কনফার্ম করুন</h3>
              <button onClick={onClose} className="hover:rotate-90 transition-transform p-1 bg-white/20 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-3xl border-2 border-blue-200">
                <p className="text-xs font-black text-blue-800 uppercase tracking-widest mb-4">পেমেন্ট মেথড</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-pink-100">
                    <span className="font-black text-pink-600 text-sm">বিকাশ (Personal)</span>
                    <span className="font-black text-lg text-gray-900">{contactInfo.bkashNumber}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-orange-100">
                    <span className="font-black text-orange-600 text-sm">নগদ (Personal)</span>
                    <span className="font-black text-lg text-gray-900">{contactInfo.nagadNumber}</span>
                  </div>
                </div>
                <p className="mt-4 text-xs font-bold text-blue-700/70 text-center leading-relaxed">
                  উপরের নম্বরগুলোর যেকোনোটিতে <span className="text-blue-900 text-sm font-black underline">৳{total}</span> সেন্ড মানি করে নিচের ফর্মটি পূরণ করুন।
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-gray-900 text-sm uppercase tracking-widest border-b pb-3">আপনার তথ্য</h4>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">পুরো নাম</label>
                  <input required className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3 outline-none focus:border-blue-500 focus:bg-white transition font-semibold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="আপনার নাম" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">মোবাইল নাম্বার</label>
                  <input required type="tel" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3 outline-none focus:border-blue-500 focus:bg-white transition font-bold font-mono" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="017XXXXXXXX" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">ডেলিভারি ঠিকানা</label>
                  <textarea required rows={2} className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3 outline-none focus:border-blue-500 focus:bg-white transition font-semibold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="গ্রাম, থানা, জেলা..." />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">ট্রানজেকশন আইডি (অপশনাল)</label>
                  <input className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3 outline-none focus:border-pink-500 focus:bg-white transition font-mono" value={formData.transactionId} onChange={e => setFormData({...formData, transactionId: e.target.value})} placeholder="BKash/Nagad TrxID" />
                </div>
              </div>

              <button type="submit" className="w-full bg-gray-900 text-white py-5 rounded-[1.5rem] font-black hover:bg-black transition-all shadow-xl active:scale-95 text-lg">
                অর্ডার সম্পন্ন করুন ৳{total}
              </button>
            </form>
          </>
        ) : (
          <div className="p-16 text-center space-y-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white animate-ping"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-gray-900">অর্ডার সফল হয়েছে!</h3>
              <p className="text-gray-500 font-bold px-4">ধন্যবাদ <span className="text-blue-600">{formData.name}</span>, আমরা শীঘ্রই আপনার সাথে ফোনে যোগাযোগ করবো।</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-200 inline-block font-mono font-bold text-gray-400">
              Order ID: {currentOrderId}
            </div>
            <button onClick={handleFinalClose} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-lg shadow-blue-100">ঠিক আছে</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
