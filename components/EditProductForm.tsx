
import React, { useState } from 'react';
import { Product, Category } from '../types';

interface EditProductFormProps {
  product: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Product>(product);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl p-8 overflow-y-auto max-h-[90vh] border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black text-gray-900">প্রোডাক্ট এডিট করুন</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-red-500 transition">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">প্রোডাক্টের নাম</label>
              <input
                required
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3 outline-none focus:border-blue-500 focus:bg-white transition font-bold"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">দাম (৳)</label>
              <input
                required
                type="number"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3 outline-none focus:border-blue-500 focus:bg-white transition font-black text-blue-700"
                value={formData.price}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">ছবি লিঙ্ক (Image URL)</label>
              <input
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3 outline-none focus:border-blue-500 focus:bg-white transition font-mono text-xs"
                value={formData.image}
                onChange={e => setFormData({...formData, image: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">ক্যাটাগরি</label>
              <select
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3 outline-none focus:border-blue-500 focus:bg-white transition font-bold"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as Category})}
              >
                <option value="Bookstore">বইঘর (Bookstore)</option>
                <option value="Stationery">স্টেশনারি (Stationery)</option>
                <option value="Computer Accessories">কম্পিউটার এক্সেসরিজ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">বিবরণ (Description)</label>
              <textarea
                rows={3}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-3 outline-none focus:border-blue-500 focus:bg-white transition font-medium text-sm"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-lg shadow-blue-100">আপডেট করুন</button>
              <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-200 transition">বাতিল</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductForm;
