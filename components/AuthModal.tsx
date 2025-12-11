import React, { useState } from 'react';
import { X, User, Lock, MapPin, Mail, Loader2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import { User as UserType } from '../types';
import { NEIGHBORHOODS } from '../constants';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhoodId, setNeighborhoodId] = useState('cordeiros');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const user = await storageService.login(email, password);
        onLoginSuccess(user);
        onClose();
      } else {
        const newUser: UserType = {
          id: crypto.randomUUID(),
          name,
          email,
          password,
          role: 'customer',
          address: {
            street,
            number,
            neighborhoodId
          }
        };
        await storageService.saveUser(newUser);
        const loggedUser = await storageService.login(email, password);
        onLoginSuccess(loggedUser);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm md:p-4">
      <div className="bg-white w-full md:max-w-md md:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl animate-slide-up md:animate-fade-in max-h-[90vh] overflow-y-auto">
        
        {/* Mobile Handle */}
        <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={onClose}>
           <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        <div className="bg-gray-900 p-6 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold">{isLogin ? 'Entrar' : 'Criar Conta'}</h2>
          <button onClick={onClose} className="hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 pb-safe">
          {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nome</label>
                <div className="relative">
                  <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 outline-none" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
              <div className="relative">
                <input type="email" required className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 outline-none" placeholder="email@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Senha</label>
              <div className="relative">
                <input type="password" required className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 outline-none" placeholder="******" value={password} onChange={e => setPassword(e.target.value)} />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            {!isLogin && (
              <div className="pt-2 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Endereço de Entrega</h3>
                <div className="grid grid-cols-3 gap-3">
                   <input type="text" required className="col-span-2 w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm outline-none" placeholder="Rua" value={street} onChange={e => setStreet(e.target.value)} />
                   <input type="text" required className="col-span-1 w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm outline-none" placeholder="Nº" value={number} onChange={e => setNumber(e.target.value)} />
                   <select className="col-span-3 w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm outline-none" value={neighborhoodId} onChange={e => setNeighborhoodId(e.target.value)}>
                      {NEIGHBORHOODS.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                   </select>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-red-600 text-white py-4 md:py-3 rounded-xl font-bold text-lg md:text-base mt-4 shadow-lg shadow-red-200 flex justify-center items-center gap-2"
            >
              {loading && <Loader2 size={20} className="animate-spin" />}
              {isLogin ? 'Entrar' : 'Cadastrar'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-gray-600 font-medium py-2">
              {isLogin ? 'Criar nova conta' : 'Já tenho conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};