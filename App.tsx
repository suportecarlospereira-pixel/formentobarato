
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Settings,
  Plus,
  Edit2,
  Trash2,
  Users,
  Map,
  Package,
  Save,
  Clock,
  Home,
  Loader2,
  CheckCircle,
  AlertTriangle,
  LogOut,
  User as UserIcon,
  X,
  MapPin,
  Carrot,     // Hortifruti
  Beef,       // Açougue
  Beer,       // Bebidas
  ShoppingBasket, // Mercearia
  Croissant,  // Padaria
  Sparkles,   // Limpeza
  LayoutGrid,  // Todos
  DollarSign, // Vendas
  Image as ImageIcon, // Banners
  TrendingUp,
  Receipt,
  ChefHat
} from 'lucide-react';
import { Product, CartItem, Category, User, Neighborhood, Order, Banner } from './types';
import { CATEGORIES } from './constants';
import { ProductCard } from './components/ProductCard';
import { AIChef } from './components/AIChef';
import { AuthModal } from './components/AuthModal';
import { AdminProductModal } from './components/AdminProductModal';
import { AdminBannerModal } from './components/AdminBannerModal';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { HeroCarousel } from './components/HeroCarousel';
import { storageService } from './services/storageService';

// --- Toast Component ---
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-gray-800'
  };

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertTriangle size={20} />,
    info: <ShoppingBag size={20} />
  };

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-full shadow-lg text-white ${bgColors[type]} animate-toast min-w-[300px] max-w-[90vw]`}>
      {icons[type]}
      <span className="font-medium text-sm flex-1">{message}</span>
      <button onClick={onClose}><X size={16} className="opacity-80" /></button>
    </div>
  );
};

// --- Category Icon Helper ---
const getCategoryIcon = (category: string) => {
  switch(category) {
    case 'Hortifruti': return <Carrot size={20} />;
    case 'Açougue': return <Beef size={20} />;
    case 'Bebidas': return <Beer size={20} />;
    case 'Mercearia': return <ShoppingBasket size={20} />;
    case 'Padaria': return <Croissant size={20} />;
    case 'Limpeza': return <Sparkles size={20} />;
    default: return <LayoutGrid size={20} />;
  }
};

const App: React.FC = () => {
  // Global Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChefOpen, setIsChefOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false); 
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'info'} | null>(null);
  
  // Admin State
  const [activeAdminTab, setActiveAdminTab] = useState<'products' | 'neighborhoods' | 'users' | 'banners' | 'sales'>('products');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [editingNeighborhood, setEditingNeighborhood] = useState<string | null>(null);
  const [tempFee, setTempFee] = useState<string>('');

  // Checkout State
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhoodId: 'cordeiros'
  });

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const refreshData = async () => {
    const [loadedProducts, loadedNeighborhoods, loadedBanners] = await Promise.all([
      storageService.getProducts(),
      storageService.getNeighborhoods(),
      storageService.getBanners()
    ]);
    setProducts(loadedProducts);
    setNeighborhoods(loadedNeighborhoods);
    setBanners(loadedBanners);
    
    if (user) {
      const allOrders = await storageService.getOrders();
      if (user.role === 'admin') {
         setUserOrders(allOrders); // Admin sees all
         const loadedUsers = await storageService.getUsers();
         setUsers(loadedUsers);
      } else {
         setUserOrders(allOrders.filter(o => o.userId === user.id));
      }
    }
  };

  // Load Data on Mount (Async)
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [loadedProducts, loadedNeighborhoods, loadedBanners] = await Promise.all([
          storageService.getProducts(),
          storageService.getNeighborhoods(),
          storageService.getBanners()
        ]);
        
        setProducts(loadedProducts);
        setNeighborhoods(loadedNeighborhoods);
        setBanners(loadedBanners);
        
        const currentUser = storageService.getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          if (currentUser.address) {
            setDeliveryAddress({
              street: currentUser.address.street,
              number: currentUser.address.number,
              complement: currentUser.address.complement || '',
              neighborhoodId: currentUser.address.neighborhoodId
            });
          }
          const allOrders = await storageService.getOrders();
          if (currentUser.role === 'admin') {
             setUserOrders(allOrders);
             const loadedUsers = await storageService.getUsers();
             setUsers(loadedUsers);
          } else {
             setUserOrders(allOrders.filter(o => o.userId === currentUser.id));
          }
        }
      } catch (error) {
        console.error("Failed to load data", error);
        showToast("Erro ao carregar dados. Verifique sua conexão.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleLogin = async (loggedInUser: User) => {
    setUser(loggedInUser);
    if (loggedInUser.address) {
       setDeliveryAddress({
        street: loggedInUser.address.street,
        number: loggedInUser.address.number,
        complement: loggedInUser.address.complement || '',
        neighborhoodId: loggedInUser.address.neighborhoodId
      });
    }
    
    await refreshData();
    showToast(`Bem-vindo, ${loggedInUser.name.split(' ')[0]}!`);

    if (loggedInUser.role === 'admin') {
      setIsAdminMode(true);
    }
  };

  const handleLogout = async () => {
    await storageService.logout();
    setUser(null);
    setIsAdminMode(false);
    setCart([]);
    setUserOrders([]);
    showToast("Você saiu da conta.", "info");
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, products]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Admin Stats
  const adminStats = useMemo(() => {
    if (!userOrders.length) return { revenue: 0, count: 0, average: 0 };
    const revenue = userOrders.reduce((acc, order) => acc + order.total + order.deliveryFee, 0);
    const count = userOrders.length;
    return {
      revenue,
      count,
      average: revenue / count
    };
  }, [userOrders]);

  const selectedNeighborhood = neighborhoods.find(n => n.id === deliveryAddress.neighborhoodId);
  const deliveryFee = selectedNeighborhood ? selectedNeighborhood.deliveryFee : 0;
  const finalTotal = cartTotal + deliveryFee;

  // Handlers
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
           showToast(`Estoque máximo atingido para ${product.name}`, "error");
           return prev; 
        }
        showToast(`+1 ${product.name} adicionado!`, "success");
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      if (product.stock <= 0) return prev;
      showToast(`${product.name} adicionado à cesta!`, "success");
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => 
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  const handleInitiateCheckout = async () => {
    if (!user) {
      setIsCartOpen(false);
      setIsAuthOpen(true);
      showToast("Faça login para continuar.", "info");
      return;
    }

    if (!deliveryAddress.street || !deliveryAddress.number) {
      showToast("Preencha o endereço de entrega.", "error");
      return;
    }

    // Verify Stock
    for (const item of cart) {
      const product = products.find(p => p.id === item.id);
      if (!product || product.stock < item.quantity) {
        showToast(`O produto ${item.name} não tem estoque suficiente.`, "error");
        return;
      }
    }

    await storageService.updateUserAddress(user.email, {
       street: deliveryAddress.street,
       number: deliveryAddress.number,
       complement: deliveryAddress.complement,
       neighborhoodId: deliveryAddress.neighborhoodId
    });

    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = async () => {
    // Optimistic Update
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(c => c.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    });

    setProducts(updatedProducts);
    await refreshData();

    setCart([]);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
    setIsOrderHistoryOpen(true); 
    showToast("Pedido realizado com sucesso!", "success");
  };

  // Admin Handlers
  const handleSaveProduct = async (product: Product) => {
    let newProducts = [...products];
    const index = newProducts.findIndex(p => p.id === product.id);
    if (index >= 0) {
      newProducts[index] = product;
    } else {
      newProducts.push(product);
    }
    setProducts(newProducts);
    
    await storageService.saveSingleProduct(product);
    await refreshData();
    setIsProductModalOpen(false);
    showToast("Produto salvo!", "success");
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      const newProducts = products.filter(p => p.id !== id);
      setProducts(newProducts);
      await storageService.deleteProduct(id);
      showToast("Produto removido.", "info");
    }
  };

  const handleSaveBanner = async (banner: Banner) => {
    const newBanners = [...banners, banner];
    setBanners(newBanners);
    await storageService.saveBanners(newBanners);
    showToast("Banner adicionado!", "success");
  };

  const handleDeleteBanner = async (id: string) => {
    if (confirm('Remover este banner?')) {
       const newBanners = banners.filter(b => b.id !== id);
       setBanners(newBanners);
       await storageService.saveBanners(newBanners);
       showToast("Banner removido.", "info");
    }
  };

  const handleEditNeighborhood = (hood: Neighborhood) => {
    setEditingNeighborhood(hood.id);
    setTempFee(hood.deliveryFee.toString());
  };

  const handleSaveNeighborhood = async (id: string) => {
    const updatedNeighborhoods = neighborhoods.map(n => {
      if (n.id === id) {
        return { ...n, deliveryFee: parseFloat(tempFee) || 0 };
      }
      return n;
    });
    setNeighborhoods(updatedNeighborhoods);
    await storageService.saveNeighborhoods(updatedNeighborhoods);
    setEditingNeighborhood(null);
    showToast("Taxa de entrega atualizada!", "success");
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    await storageService.updateOrderStatus(orderId, status);
    // Optimistic
    setUserOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    showToast(`Status atualizado para ${status}`, "success");
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategory]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-red-600">
        <div className="bg-white p-6 rounded-full shadow-xl mb-4">
          <ShoppingBag size={48} className="animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
           <Loader2 size={24} className="animate-spin" />
           <span className="font-bold text-lg">Carregando Formento Express...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0 relative bg-gray-50 pt-safe">
      
      {/* Toast Notification */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Navbar (Top) */}
      <nav className="bg-gray-900 text-white sticky top-0 z-40 shadow-lg pb-safe pt-safe-top md:pt-0 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
              setSelectedCategory('Todos');
              setIsAdminMode(false);
            }}>
              <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center transform rotate-3 shadow-lg">
                <ShoppingBag className="text-white" size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight">FORMENTO</span>
                <span className="text-[0.65rem] text-red-500 font-bold tracking-[0.2em] uppercase">Express</span>
              </div>
            </div>

            {/* Desktop Search */}
            {!isAdminMode && (
              <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
                <input 
                  type="text"
                  placeholder="Busque por produtos, marcas..."
                  className="w-full bg-gray-800 text-white border-none rounded-full py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-red-600 text-sm transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            )}

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {/* Chef IA Button (Desktop) */}
              {!isAdminMode && (
                <button
                  onClick={() => setIsChefOpen(true)}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-full font-bold transition-all shadow-md active:scale-95"
                >
                  <Sparkles size={16} className="text-yellow-300 fill-yellow-300" />
                  <span className="text-sm">Chef IA</span>
                </button>
              )}

              {user?.role === 'admin' && (
                <button 
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${isAdminMode ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                >
                  <Settings size={14} />
                  {isAdminMode ? 'Sair Admin' : 'Painel Admin'}
                </button>
              )}
              {user ? (
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsOrderHistoryOpen(true)} className="p-2 hover:bg-gray-800 rounded-full" title="Pedidos">
                    <Clock size={20} />
                  </button>
                  <div className="flex flex-col items-end border-l border-gray-700 pl-3">
                    <span className="text-sm font-semibold">{getGreeting()}, {user.name.split(' ')[0]}</span>
                  </div>
                  <button onClick={handleLogout} className="bg-gray-800 p-2 rounded-full hover:bg-red-900" title="Sair"><LogOut size={18} /></button>
                </div>
              ) : (
                <button onClick={() => setIsAuthOpen(true)} className="flex items-center gap-2 text-sm font-medium hover:text-red-400">
                  <UserIcon size={20} /> Entrar
                </button>
              )}
               {!isAdminMode && (
                <button onClick={() => setIsCartOpen(true)} className="relative bg-gray-800 p-2.5 rounded-full hover:bg-gray-700 transition-transform active:scale-95">
                  <ShoppingBag size={20} />
                  {cartItemCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-900 animate-bounce">{cartItemCount}</span>}
                </button>
              )}
            </div>
            
            {/* Mobile Actions (Right Side) */}
             <div className="md:hidden flex items-center gap-3">
               {user?.role === 'admin' && (
                  <button onClick={() => setIsAdminMode(!isAdminMode)} className="text-gray-300">
                    <Settings size={22} />
                  </button>
               )}
               {!isAdminMode && (
                 <button onClick={() => setIsCartOpen(true)} className="relative text-white">
                    <ShoppingBag size={24} />
                    {cartItemCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full border border-gray-900">{cartItemCount}</span>}
                 </button>
               )}
             </div>

          </div>
        </div>

        {/* Mobile Search Bar */}
        {!isAdminMode && (
          <div className="md:hidden px-4 pb-3">
            <div className="relative">
              <input 
                type="text"
                placeholder="Buscar produtos..."
                className="w-full bg-gray-800 text-white border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-red-600 text-sm placeholder-gray-400 shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
        )}
      </nav>

      {/* Category Scroll with Icons */}
      {!isAdminMode && (
        <div className="bg-white border-b border-gray-200 sticky top-[7rem] md:top-16 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex overflow-x-auto py-4 px-4 gap-4 no-scrollbar snap-x">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`snap-start flex flex-col items-center gap-2 min-w-[70px] transition-all duration-200 group`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-300 ${
                    selectedCategory === category 
                      ? 'bg-red-600 text-white shadow-red-200 shadow-lg scale-110' 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                  }`}>
                    {getCategoryIcon(category)}
                  </div>
                  <span className={`text-xs font-medium ${
                    selectedCategory === category ? 'text-red-600 font-bold' : 'text-gray-600'
                  }`}>
                    {category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {isAdminMode ? (
          /* --- ADMIN DASHBOARD --- */
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto no-scrollbar">
              <button onClick={() => setActiveAdminTab('products')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeAdminTab === 'products' ? 'bg-red-100 text-red-700' : 'text-gray-600'}`}><Package size={18} /> Produtos</button>
              <button onClick={() => setActiveAdminTab('sales')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeAdminTab === 'sales' ? 'bg-red-100 text-red-700' : 'text-gray-600'}`}><DollarSign size={18} /> Vendas</button>
              <button onClick={() => setActiveAdminTab('banners')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeAdminTab === 'banners' ? 'bg-red-100 text-red-700' : 'text-gray-600'}`}><ImageIcon size={18} /> Banners</button>
              <button onClick={() => setActiveAdminTab('neighborhoods')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeAdminTab === 'neighborhoods' ? 'bg-red-100 text-red-700' : 'text-gray-600'}`}><Map size={18} /> Bairros</button>
              <button onClick={() => setActiveAdminTab('users')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeAdminTab === 'users' ? 'bg-red-100 text-red-700' : 'text-gray-600'}`}><Users size={18} /> Clientes</button>
            </div>
            
            {/* Products Tab */}
            {activeAdminTab === 'products' && (
              <>
                <button onClick={() => { setEditingProduct(undefined); setIsProductModalOpen(true); }} className="w-full bg-red-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg mb-4"><Plus size={20} /> Novo Produto</button>
                <div className="space-y-3">
                  {products.map(product => (
                    <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                      <img src={product.image} className="w-16 h-16 rounded-lg object-cover bg-gray-200" alt="" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate">{product.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-red-600 font-bold">R$ {product.price.toFixed(2)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${product.stock < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>Est: {product.stock}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                         <button onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }} className="p-2 text-blue-600 bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                         <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-600 bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Sales Dashboard Tab */}
            {activeAdminTab === 'sales' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-2 opacity-80"><DollarSign size={18}/> Faturamento</div>
                    <div className="text-2xl font-bold">R$ {adminStats.revenue.toFixed(2)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-2 opacity-80"><Receipt size={18}/> Pedidos</div>
                    <div className="text-2xl font-bold">{adminStats.count}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-2 opacity-80"><TrendingUp size={18}/> Ticket Médio</div>
                    <div className="text-2xl font-bold">R$ {adminStats.average.toFixed(2)}</div>
                  </div>
                </div>

                {/* Orders List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 font-bold text-gray-800">Histórico de Pedidos</div>
                  <div className="divide-y divide-gray-100">
                    {userOrders.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">Nenhuma venda registrada ainda.</div>
                    ) : (
                      userOrders.map(order => (
                        <div key={order.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs text-gray-400">#{order.id}</span>
                              <span className="text-sm font-bold text-gray-900">{order.userName}</span>
                            </div>
                            <div className="text-xs text-gray-500 flex flex-col md:flex-row gap-1 md:gap-4">
                              <span>{new Date(order.date).toLocaleString()}</span>
                              <span>{order.paymentMethod === 'pix' ? 'PIX' : order.paymentMethod === 'credit_card' ? 'Cartão' : 'Dinheiro'}</span>
                            </div>
                            <div className="mt-1 font-medium text-red-600">R$ {(order.total + order.deliveryFee).toFixed(2)}</div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                             <select 
                               value={order.status} 
                               onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                               className={`text-xs font-bold px-3 py-1.5 rounded-full border-none outline-none cursor-pointer ${
                                 order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                 order.status === 'delivering' ? 'bg-blue-100 text-blue-700' :
                                 order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                 'bg-yellow-100 text-yellow-700'
                               }`}
                             >
                               <option value="pending">Pendente</option>
                               <option value="preparing">Preparando</option>
                               <option value="delivering">Em Entrega</option>
                               <option value="completed">Concluído</option>
                               <option value="cancelled">Cancelado</option>
                             </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Banners Tab */}
            {activeAdminTab === 'banners' && (
              <>
                 <button onClick={() => setIsBannerModalOpen(true)} className="w-full bg-red-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg mb-4"><Plus size={20} /> Novo Banner</button>
                 <div className="space-y-4">
                   {banners.map(banner => (
                     <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative group">
                        <img src={banner.imageUrl} alt={banner.title} className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-end p-4">
                           <div className="text-white">
                             <h3 className="font-bold">{banner.title}</h3>
                             <p className="text-xs opacity-90">{banner.subtitle}</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteBanner(banner.id)} 
                          className="absolute top-2 right-2 bg-white/20 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                     </div>
                   ))}
                   {banners.length === 0 && <p className="text-center text-gray-500 py-4">Nenhum banner ativo. A tela inicial mostrará apenas a lista.</p>}
                 </div>
              </>
            )}

             {/* Neighborhoods Tab */}
             {activeAdminTab === 'neighborhoods' && (
               <div className="space-y-3">
                  {neighborhoods.map(hood => (
                    <div key={hood.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                       <span className="font-medium">{hood.name}</span>
                       <div className="flex items-center gap-2">
                         {editingNeighborhood === hood.id ? (
                           <>
                             <input type="number" className="w-20 border rounded p-1 text-center" value={tempFee} onChange={(e) => setTempFee(e.target.value)} />
                             <button onClick={() => handleSaveNeighborhood(hood.id)} className="text-green-600"><Save size={20} /></button>
                           </>
                         ) : (
                           <>
                             <span className="text-gray-600">R$ {hood.deliveryFee.toFixed(2)}</span>
                             <button onClick={() => handleEditNeighborhood(hood)} className="text-blue-600"><Edit2 size={18} /></button>
                           </>
                         )}
                       </div>
                    </div>
                  ))}
               </div>
             )}
             {/* Users Tab */}
             {activeAdminTab === 'users' && (
               <div className="space-y-3">
                 {users.map(u => (
                    <div key={u.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                       <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{u.name}</span>
                          {u.role === 'admin' && <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded font-bold">ADMIN</span>}
                       </div>
                       <p className="text-sm text-gray-500">{u.email}</p>
                       <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><MapPin size={12}/> {u.address ? neighborhoods.find(n => n.id === u.address?.neighborhoodId)?.name : 'Sem endereço'}</p>
                    </div>
                 ))}
               </div>
             )}
          </div>
        ) : (
          /* --- USER VIEW --- */
          <>
            {selectedCategory === 'Todos' && !searchQuery && (
               <div className="mb-2">
                 {user && <h3 className="text-lg font-bold text-gray-800 mb-4">{getGreeting()}, {user.name.split(' ')[0]}! 👋</h3>}
                 
                 {/* Dynamic Carousel Component */}
                 <HeroCarousel 
                    banners={banners} 
                    onBannerClick={(cat) => cat && setSelectedCategory(cat)} 
                 />

              </div>
            )}

            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              {selectedCategory === 'Todos' ? 'Destaques' : selectedCategory}
              <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{filteredProducts.length}</span>
            </h2>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 pb-safe">
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    cartItem={cart.find(c => c.id === product.id)}
                    onAdd={addToCart}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">Nenhum produto encontrado.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center py-3 pb-safe z-40 text-xs font-medium text-gray-500 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => { setIsCartOpen(false); setIsOrderHistoryOpen(false); setIsAdminMode(false); }}
          className={`flex flex-col items-center gap-1 transition-colors ${!isCartOpen && !isOrderHistoryOpen && !isAdminMode ? 'text-red-600' : ''}`}
        >
          <Home size={24} strokeWidth={!isCartOpen && !isOrderHistoryOpen ? 2.5 : 2} />
          <span>Início</span>
        </button>
        
        <button 
          onClick={() => {
             if(user) { setIsOrderHistoryOpen(true); setIsCartOpen(false); } 
             else { setIsAuthOpen(true); showToast("Faça login para ver seus pedidos", "info"); }
          }}
          className={`flex flex-col items-center gap-1 transition-colors ${isOrderHistoryOpen ? 'text-red-600' : ''}`}
        >
          <Clock size={24} strokeWidth={isOrderHistoryOpen ? 2.5 : 2} />
          <span>Pedidos</span>
        </button>

        {!isAdminMode && (
          <button 
             onClick={() => setIsChefOpen(true)}
             className="flex flex-col items-center gap-1 -mt-8"
          >
             <div className="bg-gray-900 p-3 rounded-full shadow-lg border-4 border-gray-50 text-white transform transition-transform active:scale-95">
               <Sparkles size={24} className="text-yellow-400 fill-current" />
             </div>
             <span className="font-bold text-gray-900">Chef IA</span>
          </button>
        )}

        <button 
          onClick={() => { setIsCartOpen(true); setIsOrderHistoryOpen(false); }}
          className={`flex flex-col items-center gap-1 relative transition-colors ${isCartOpen ? 'text-red-600' : ''}`}
        >
          <div className="relative">
             <ShoppingBag size={24} strokeWidth={isCartOpen ? 2.5 : 2} />
             {cartItemCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border-2 border-gray-900 animate-bounce">{cartItemCount}</span>}
          </div>
          <span>Cesta</span>
        </button>

        <button 
           onClick={() => {
             if (user) { 
                if (window.confirm('Deseja sair?')) handleLogout();
             } else {
                setIsAuthOpen(true);
             }
           }}
           className="flex flex-col items-center gap-1"
        >
          {user ? (
             <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-red-700 font-bold text-xs border border-red-200">
                {user.name.charAt(0)}
             </div>
          ) : (
             <UserIcon size={24} />
          )}
          <span>{user ? 'Perfil' : 'Entrar'}</span>
        </button>
      </div>

      {/* Cart Sidebar / Bottom Sheet */}
      {isCartOpen && !isAdminMode && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-end md:items-stretch justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
          
          <div className="relative w-full md:max-w-md h-[85vh] md:h-full bg-white shadow-2xl flex flex-col rounded-t-2xl md:rounded-none animate-slide-up md:animate-none">
            
            {/* Cart Handle for Mobile */}
            <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={() => setIsCartOpen(false)}>
              <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>

            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2"><ShoppingBag size={20} /> Seu Carrinho</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400 bg-gray-100 rounded-full p-1 hover:bg-gray-200 transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <ShoppingBag size={48} />
                  <p>Carrinho vazio</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-3 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                    <img src={item.image} alt="" className="w-16 h-16 object-cover rounded-md bg-gray-100" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                         <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                         <span className="font-bold text-sm">R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">R$ {item.price.toFixed(2)} / {item.unit}</p>
                      
                      <div className="flex items-center gap-3">
                         <div className="flex items-center border border-gray-200 rounded-lg">
                           <button onClick={() => removeFromCart(item.id)} className="px-2 py-1 text-red-600 font-bold active:bg-gray-100 rounded-l-lg">-</button>
                           <span className="px-2 text-sm font-medium">{item.quantity}</span>
                           <button onClick={() => addToCart(item)} className="px-2 py-1 text-green-600 font-bold active:bg-gray-100 rounded-r-lg">+</button>
                         </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-200 pb-safe">
                 {/* Address Mini Summary */}
                 <div className="bg-white p-3 rounded-xl border border-gray-200 mb-3 text-sm shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                       <MapPin size={14} /> Entrega
                    </div>
                    {user ? (
                      <div className="flex flex-col gap-2">
                         <input className="bg-gray-50 border rounded p-2 text-sm w-full" placeholder="Rua" value={deliveryAddress.street} onChange={e => setDeliveryAddress({...deliveryAddress, street: e.target.value})} />
                         <div className="flex gap-2">
                           <input className="bg-gray-50 border rounded p-2 text-sm w-20" placeholder="Nº" value={deliveryAddress.number} onChange={e => setDeliveryAddress({...deliveryAddress, number: e.target.value})} />
                           <select className="bg-gray-50 border rounded p-2 text-sm flex-1" value={deliveryAddress.neighborhoodId} onChange={e => setDeliveryAddress({...deliveryAddress, neighborhoodId: e.target.value})}>
                              {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name} (+R${n.deliveryFee})</option>)}
                           </select>
                         </div>
                      </div>
                    ) : (
                      <button onClick={() => setIsAuthOpen(true)} className="text-red-600 font-bold text-xs underline">Faça login para definir endereço</button>
                    )}
                 </div>

                 <div className="flex justify-between text-lg font-bold mb-3">
                    <span>Total</span>
                    <span>R$ {finalTotal.toFixed(2)}</span>
                 </div>
                 <button onClick={handleInitiateCheckout} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-200 active:scale-[0.98] transition-transform">
                    Ir para Pagamento
                 </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <AIChef cartItems={cart} isOpen={isChefOpen} onClose={() => setIsChefOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={handleLogin} />
      <AdminProductModal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
        onSave={handleSaveProduct}
        initialData={editingProduct}
      />
      <AdminBannerModal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        onSave={handleSaveBanner}
      />
      
      {user && (
        <>
          <CheckoutModal 
            isOpen={isCheckoutOpen} 
            onClose={() => setIsCheckoutOpen(false)}
            cart={cart}
            user={user}
            total={finalTotal}
            deliveryFee={deliveryFee}
            address={deliveryAddress}
            neighborhoods={neighborhoods}
            onSuccess={handleCheckoutSuccess}
          />
          <OrderHistoryModal 
            isOpen={isOrderHistoryOpen}
            onClose={() => setIsOrderHistoryOpen(false)}
            orders={userOrders}
          />
        </>
      )}

    </div>
  );
};

export default App;
