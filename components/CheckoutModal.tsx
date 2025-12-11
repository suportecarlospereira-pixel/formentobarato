import React, { useState } from 'react';
import { X, CreditCard, QrCode, Banknote, CheckCircle, Copy, Loader2 } from 'lucide-react';
import { User, Neighborhood, CartItem, PaymentMethod, Order } from '../types';
import { storageService } from '../services/storageService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  user: User;
  total: number;
  deliveryFee: number;
  address: { street: string, number: string, complement?: string, neighborhoodId: string };
  neighborhoods: Neighborhood[];
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  isOpen, onClose, cart, user, total, deliveryFee, address, neighborhoods, onSuccess 
}) => {
  const [step, setStep] = useState<'method' | 'details' | 'processing' | 'success'>('method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });

  const pixCode = "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913FORMENTO EXPRESS6006ITAJAI62070503***6304E2CA";

  if (!isOpen) return null;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    alert("Código PIX copiado!");
  };

  const handleConfirmOrder = () => {
    if (!selectedMethod) return;

    setStep('processing');
    
    setTimeout(() => {
      const hoodName = neighborhoods.find(n => n.id === address.neighborhoodId)?.name || 'Desconhecido';
      
      const newOrder: Order = {
        id: crypto.randomUUID().slice(0, 8).toUpperCase(),
        userId: user.id,
        userName: user.name,
        date: new Date().toISOString(),
        items: cart,
        total: total,
        deliveryFee: deliveryFee,
        address: `${address.street}, ${address.number} ${address.complement ? `(${address.complement})` : ''} - ${hoodName}`,
        paymentMethod: selectedMethod,
        status: 'preparing' 
      };

      storageService.saveOrder(newOrder);
      setStep('success');
    }, 2000);
  };

  const renderMethodSelection = () => (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Forma de Pagamento</h3>
      
      <button onClick={() => { setSelectedMethod('pix'); setStep('details'); }} className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-green-500 bg-white">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-lg text-green-600"><QrCode size={24} /></div>
          <div className="text-left"><span className="block font-bold text-gray-900">PIX</span><span className="text-xs text-green-600">Aprovado na hora</span></div>
        </div>
      </button>

      <button onClick={() => { setSelectedMethod('credit_card'); setStep('details'); }} className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-red-500 bg-white">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-lg text-red-600"><CreditCard size={24} /></div>
          <div className="text-left"><span className="block font-bold text-gray-900">Cartão de Crédito</span></div>
        </div>
      </button>

      <button onClick={() => { setSelectedMethod('cash'); setStep('details'); }} className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-500 bg-white">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-2 rounded-lg text-gray-600"><Banknote size={24} /></div>
          <div className="text-left"><span className="block font-bold text-gray-900">Dinheiro</span><span className="text-xs text-gray-500">Pagar na entrega</span></div>
        </div>
      </button>
    </div>
  );

  const renderDetails = () => {
    if (selectedMethod === 'pix') {
      return (
        <div className="text-center space-y-6">
          <div className="bg-white p-4 border border-gray-200 rounded-xl inline-block">
             <div className="w-40 h-40 bg-gray-900 mx-auto flex items-center justify-center text-white text-xs">QR CODE</div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 font-medium">Copia e Cola</p>
            <div className="flex gap-2">
              <input type="text" value={pixCode} readOnly className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-500 truncate" />
              <button onClick={handleCopyPix} className="bg-gray-200 p-2 rounded-lg"><Copy size={16} /></button>
            </div>
          </div>
          <button onClick={handleConfirmOrder} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">Já paguei</button>
        </div>
      );
    }
    if (selectedMethod === 'credit_card') {
      return (
        <div className="space-y-4">
           <input type="text" placeholder="Número do Cartão" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none" value={cardData.number} onChange={e => setCardData({...cardData, number: e.target.value})} />
           <input type="text" placeholder="Nome no Cartão" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none" value={cardData.name} onChange={e => setCardData({...cardData, name: e.target.value})} />
           <div className="flex gap-3">
             <input type="text" placeholder="MM/AA" className="w-1/2 bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none" value={cardData.expiry} onChange={e => setCardData({...cardData, expiry: e.target.value})} />
             <input type="text" placeholder="CVV" className="w-1/2 bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none" value={cardData.cvv} onChange={e => setCardData({...cardData, cvv: e.target.value})} />
           </div>
           <button onClick={handleConfirmOrder} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold mt-2">Pagar R$ {total.toFixed(2)}</button>
        </div>
      );
    }
    return (
      <div className="text-center space-y-4">
        <p className="text-gray-600">Pague ao entregador.</p>
        <button onClick={handleConfirmOrder} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold">Confirmar Pedido</button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm md:p-4">
      <div className="bg-white w-full md:max-w-md md:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-slide-up md:animate-fade-in">
        
        {/* Mobile Handle */}
        <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={onClose}>
           <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        <div className="bg-gray-900 p-4 flex justify-between items-center text-white shrink-0">
          <h2 className="text-lg font-bold">Checkout</h2>
          {step !== 'success' && step !== 'processing' && <button onClick={onClose}><X size={20} /></button>}
        </div>

        <div className="p-6 overflow-y-auto pb-safe">
          {step === 'processing' && (
             <div className="flex flex-col items-center justify-center py-12">
               <Loader2 size={48} className="text-red-600 animate-spin mb-4" />
               <p className="text-gray-600 font-medium">Processando...</p>
             </div>
          )}
          {step === 'success' && (
             <div className="flex flex-col items-center justify-center py-6 text-center">
               <CheckCircle size={48} className="text-green-600 mb-4" />
               <h3 className="text-2xl font-bold text-gray-900 mb-2">Sucesso!</h3>
               <p className="text-gray-600 mb-6">Pedido recebido.</p>
               <button onClick={onSuccess} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold">Acompanhar</button>
             </div>
          )}
          {step === 'method' && renderMethodSelection()}
          {step === 'details' && (
            <>
              <button onClick={() => setStep('method')} className="text-sm text-gray-500 mb-4 hover:underline">&larr; Voltar</button>
              {renderDetails()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};