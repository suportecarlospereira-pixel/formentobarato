import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon } from 'lucide-react';
import { Product, Category } from '../types';
import { CATEGORIES } from '../constants';

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialData?: Product;
}

export const AdminProductModal: React.FC<AdminProductModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: 'Mercearia',
    description: '',
    unit: 'un',
    image: 'https://picsum.photos/400/300',
    stock: 0
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        price: 0,
        category: 'Mercearia',
        description: '',
        unit: 'un',
        image: 'https://picsum.photos/400/300',
        stock: 50
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const productToSave: Product = {
      id: initialData?.id || crypto.randomUUID(),
      name: formData.name!,
      price: Number(formData.price),
      category: formData.category as string,
      image: formData.image || 'https://picsum.photos/400/300',
      description: formData.description || '',
      unit: formData.unit || 'un',
      originalPrice: formData.originalPrice,
      stock: Number(formData.stock)
    };

    onSave(productToSave);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="bg-gray-900 p-4 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold">{initialData ? 'Editar Produto' : 'Novo Produto'}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="label-text">Nome do Produto</label>
            <input 
              type="text" 
              required
              className="input-field" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Preço (R$)</label>
              <input 
                type="number" 
                step="0.01"
                required
                className="input-field" 
                value={formData.price}
                onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <label className="label-text">Estoque (Qtd)</label>
              <input 
                type="number" 
                required
                min="0"
                className="input-field" 
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Categoria</label>
              <select 
                className="input-field"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {CATEGORIES.filter(c => c !== 'Todos').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
             <div>
              <label className="label-text">Unidade (Ex: kg, un)</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value})}
              />
            </div>
          </div>
          
           <div>
              <label className="label-text">Preço Original (Opcional - Oferta)</label>
              <input 
                type="number" 
                step="0.01"
                className="input-field" 
                value={formData.originalPrice || ''}
                onChange={e => setFormData({...formData, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined})}
              />
            </div>

          <div>
            <label className="label-text">URL da Imagem</label>
            <div className="relative">
              <input 
                type="text" 
                className="input-field pl-10" 
                value={formData.image}
                onChange={e => setFormData({...formData, image: e.target.value})}
              />
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          <div>
            <label className="label-text">Descrição</label>
            <textarea 
              className="input-field h-24 resize-none" 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 flex items-center justify-center gap-2">
            <Save size={18} />
            Salvar Produto
          </button>
        </form>
      </div>
      <style>{`
        .label-text { display: block; font-size: 0.75rem; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 0.25rem; }
        .input-field { width: 100%; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.625rem; font-size: 0.875rem; outline: none; }
        .input-field:focus { border-color: #ef4444; ring: 2px solid #ef4444; }
      `}</style>
    </div>
  );
};