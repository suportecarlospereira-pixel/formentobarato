
import React, { useState } from 'react';
import { X, Save, Image as ImageIcon } from 'lucide-react';
import { Banner } from '../types';
import { CATEGORIES } from '../constants';

interface AdminBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (banner: Banner) => void;
}

export const AdminBannerModal: React.FC<AdminBannerModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Banner>>({
    title: '',
    subtitle: '',
    imageUrl: '',
    targetCategory: 'Todos',
    active: true
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) return;

    const bannerToSave: Banner = {
      id: crypto.randomUUID(),
      title: formData.title!,
      subtitle: formData.subtitle || '',
      imageUrl: formData.imageUrl!,
      targetCategory: formData.targetCategory || 'Todos',
      active: true
    };

    onSave(bannerToSave);
    setFormData({
      title: '',
      subtitle: '',
      imageUrl: '',
      targetCategory: 'Todos',
      active: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="bg-gray-900 p-4 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold">Novo Banner Promocional</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Título do Banner</label>
            <input 
              type="text" 
              required
              placeholder="Ex: Oferta de Carnes"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-red-500" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Subtítulo (Opcional)</label>
            <input 
              type="text" 
              placeholder="Ex: Preços baixos no fim de semana"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-red-500" 
              value={formData.subtitle}
              onChange={e => setFormData({...formData, subtitle: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">URL da Imagem</label>
            <div className="relative">
              <input 
                type="text" 
                required
                placeholder="https://..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 pl-10 outline-none focus:ring-2 focus:ring-red-500" 
                value={formData.imageUrl}
                onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              />
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Recomendado: Imagens horizontais de alta qualidade.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Link para Categoria</label>
            <select 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-red-500"
              value={formData.targetCategory}
              onChange={e => setFormData({...formData, targetCategory: e.target.value})}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 flex items-center justify-center gap-2 mt-4">
            <Save size={18} />
            Adicionar ao Carrossel
          </button>
        </form>
      </div>
    </div>
  );
};
