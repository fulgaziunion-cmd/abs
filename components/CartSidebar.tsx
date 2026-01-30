
import React from 'react';
import { CartItem } from '../types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onCheckout: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, items, onRemove, onUpdateQty, onCheckout }) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              </div>
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <button onClick={onClose} className="mt-4 text-blue-600 font-semibold hover:underline">Start Shopping</button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex space-x-4">
                <img src={item.image} className="w-20 h-24 object-cover rounded-lg border" alt={item.name} />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h4>
                  <p className="text-sm text-blue-600 font-bold mt-1">৳{item.price}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2 border rounded-md">
                      <button 
                        onClick={() => onUpdateQty(item.id, -1)}
                        className="px-2 py-1 text-gray-500 hover:bg-gray-50"
                      >-</button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQty(item.id, 1)}
                        className="px-2 py-1 text-gray-500 hover:bg-gray-50"
                      >+</button>
                    </div>
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="text-xs text-red-500 hover:underline"
                    >Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
            <span>Subtotal</span>
            <span className="text-xl font-bold">৳{total}</span>
          </div>
          <button
            onClick={onCheckout}
            disabled={items.length === 0}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-200"
          >
            Checkout with bKash / Nagad
          </button>
          <p className="mt-4 text-xs text-center text-gray-500">
            Secure payments & Local Delivery supported
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
