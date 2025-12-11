import React from 'react';
import { X, Package, Clock, MapPin, CreditCard } from 'lucide-react';
import { Order } from '../types';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ isOpen, onClose, orders }) => {
  if (!isOpen) return null;

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'delivering': return 'bg-blue-100 text-blue-700';
      case 'preparing': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm md:p-4">
      <div className="bg-white w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl flex flex-col h-[85vh] md:max-h-[85vh] animate-slide-up md:animate-fade-in">
        
        {/* Mobile Handle */}
        <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={onClose}>
           <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        <div className="bg-gray-900 p-6 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-2">
            <Package size={24} />
            <h2 className="text-xl font-bold">Meus Pedidos</h2>
          </div>
          <button onClick={onClose}><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 space-y-4 pb-safe">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package size={48} className="mx-auto mb-4 opacity-20" />
              <p>Você ainda não fez nenhum pedido.</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs text-gray-400 font-mono">#{order.id}</span>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Clock size={12} />
                      {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                    {order.status === 'preparing' ? 'Preparando' : order.status}
                  </span>
                </div>
                <div className="space-y-1 mb-4">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700"><span className="font-bold">{item.quantity}x</span> {item.name}</span>
                      <span className="text-gray-500">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-3 text-sm">
                   <div className="flex justify-between font-bold text-gray-900">
                      <span>Total</span>
                      <span>R$ {(order.total + order.deliveryFee).toFixed(2)}</span>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};