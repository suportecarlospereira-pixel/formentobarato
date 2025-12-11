import React from 'react';
import { Plus, Minus, AlertCircle } from 'lucide-react';
import { Product, CartItem } from '../types';

interface ProductCardProps {
  product: Product;
  cartItem?: CartItem;
  onAdd: (product: Product) => void;
  onRemove: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, cartItem, onAdd, onRemove }) => {
  const quantity = cartItem?.quantity || 0;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isMaxStockReached = quantity >= product.stock;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col ${isOutOfStock ? 'opacity-70' : ''}`}>
      <div className="relative h-32 md:h-48 w-full bg-gray-200">
        <img 
          src={product.image} 
          alt={product.name} 
          className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale' : ''}`}
          loading="lazy"
        />
        {product.originalPrice && !isOutOfStock && (
          <div className="absolute top-1 left-1 md:top-2 md:left-2 bg-red-600 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-full">
            OFERTA
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-gray-900 text-white font-bold px-2 py-1 rounded text-xs">ESGOTADO</span>
          </div>
        )}
      </div>
      
      <div className="p-3 flex flex-col flex-grow">
        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-0.5 truncate">{product.category}</span>
        <h3 className="text-gray-900 font-semibold text-sm md:text-lg leading-tight mb-1 line-clamp-2 min-h-[2.5em]">{product.name}</h3>
        
        {isLowStock && !isOutOfStock && (
           <p className="text-[10px] text-orange-600 font-semibold mb-1 flex items-center gap-1">
             <AlertCircle size={10} />
             Só {product.stock} un
           </p>
        )}
        
        <div className="mt-auto flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div className="flex flex-col">
            {product.originalPrice && !isOutOfStock && (
              <span className="text-[10px] text-gray-400 line-through">R$ {product.originalPrice.toFixed(2).replace('.', ',')}</span>
            )}
            <span className={`font-bold text-sm md:text-xl ${isOutOfStock ? 'text-gray-400' : 'text-red-600'}`}>
              R$ {product.price.toFixed(2).replace('.', ',')}
              <span className="text-[10px] text-gray-500 font-normal ml-1">/{product.unit}</span>
            </span>
          </div>

          <div className="w-full md:w-auto">
            {!isOutOfStock ? (
              quantity > 0 ? (
                <div className="flex items-center justify-between bg-gray-100 rounded-lg p-1 w-full md:w-auto">
                  <button 
                    onClick={() => onRemove(product.id)}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-red-600 shadow-sm active:bg-gray-200"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-semibold text-gray-900 text-sm">{quantity}</span>
                  <button 
                    onClick={() => !isMaxStockReached && onAdd(product)}
                    disabled={isMaxStockReached}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-white shadow-sm ${
                      isMaxStockReached ? 'bg-gray-400' : 'bg-red-600 active:bg-red-700'
                    }`}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => onAdd(product)}
                  className="w-full md:w-auto bg-red-600 text-white px-3 py-2 rounded-lg text-xs md:text-sm font-bold active:bg-red-700 transition-colors shadow-sm"
                >
                  Adicionar
                </button>
              )
            ) : (
               <button disabled className="w-full bg-gray-100 text-gray-400 px-2 py-2 rounded-lg text-xs font-semibold cursor-not-allowed">
                 Indisponível
               </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};