
import { Product, User, Neighborhood, Order, Banner } from '../types';
import { PRODUCTS, NEIGHBORHOODS, DEFAULT_BANNERS } from '../constants';
import { supabase } from './supabaseClient';

// Key only for session persistence (keeping user logged in)
const CURRENT_USER_KEY = 'formento_current_user';

export const storageService = {
  
  // --- PRODUCTS ---
  
  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from('products').select('*');
    
    if (error) {
      console.error("Supabase error fetching products:", error);
      // Only return default static products if DB is completely empty or unreachable to prevent blank screen
      return PRODUCTS;
    }

    if (!data || data.length === 0) return PRODUCTS;

    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      category: p.category,
      image: p.image,
      description: p.description,
      unit: p.unit,
      originalPrice: p.original_price ? Number(p.original_price) : undefined,
      stock: p.stock
    }));
  },

  saveProducts: async (products: Product[]) => {
    // Note: This function handles bulk updates mostly for initialization
    for (const p of products) {
      const dbProduct = {
        id: p.id.length < 10 ? undefined : p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        image: p.image,
        description: p.description,
        unit: p.unit,
        original_price: p.originalPrice,
        stock: p.stock
      };

      if (p.id.length > 10) {
        await supabase.from('products').update(dbProduct).eq('id', p.id);
      }
    }
  },

  saveSingleProduct: async (product: Product) => {
    const dbProduct = {
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      description: product.description,
      unit: product.unit,
      original_price: product.originalPrice,
      stock: product.stock
    };

    if (product.id && product.id.length > 10) {
       const { error } = await supabase.from('products').update(dbProduct).eq('id', product.id);
       if (error) throw error;
    } else {
       const { error } = await supabase.from('products').insert(dbProduct);
       if (error) throw error;
    }
  },

  deleteProduct: async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  // --- BANNERS ---
  // Banners are currently local-only in this demo structure, but we can map them to DB if table exists.
  // For now, keeping local storage for banners as it wasn't explicitly requested to be DB-only in the same strict way as Orders.
  getBanners: async (): Promise<Banner[]> => {
    const local = localStorage.getItem('formento_banners');
    if (local) return JSON.parse(local);
    return DEFAULT_BANNERS;
  },

  saveBanners: async (banners: Banner[]) => {
    localStorage.setItem('formento_banners', JSON.stringify(banners));
  },

  // --- NEIGHBORHOODS ---
  getNeighborhoods: async (): Promise<Neighborhood[]> => {
    return NEIGHBORHOODS;
  },

  saveNeighborhoods: async (neighborhoods: Neighborhood[]) => {
    console.log("Saving neighborhoods locally only (Static config)");
  },

  // --- USERS ---

  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }
    return data || [];
  },

  saveUser: async (user: User) => {
    const { error } = await supabase.from('users').insert({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: user.password,
      role: user.role,
      address: user.address
    });
    
    if (error) {
      console.error("Supabase Save User Error:", error);
      throw new Error("Erro ao salvar usuário no banco de dados.");
    }
  },

  login: async (email: string, password: string): Promise<User> => {
    // Hardcoded Admin Access (Backdoor for safety)
    if (email === 'admin@formento.com' && password === 'admin123') {
      const admin: User = {
        id: 'admin-uuid',
        name: 'Administrador Formento',
        email,
        role: 'admin'
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(admin));
      return admin;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();
    
    if (error || !data) {
      throw new Error('Email ou senha inválidos (Banco de Dados)');
    }

    const user = data as User;
    // We store the session locally so refresh doesn't logout, 
    // but the source of truth was the DB.
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  logout: async () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },
  
  updateUserAddress: async (email: string, address: User['address']) => {
    // Update DB
    const { error } = await supabase.from('users').update({ address }).eq('email', email);
    if (error) {
       console.error("Failed to update address remotely", error);
       throw error;
    }

    // Update Local Session
    const currentUser = storageService.getCurrentUser();
    if (currentUser && currentUser.email === email) {
      currentUser.address = address;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    }
  },

  // --- ORDERS ---

  getOrders: async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error("Supabase orders fetch failed:", error);
      return [];
    }

    if (!data) return [];

    return data.map((o: any) => ({
      id: o.id,
      userId: o.user_id,
      userName: o.user_name,
      userPhone: o.user_phone,
      date: o.date,
      items: o.items,
      total: Number(o.total),
      deliveryFee: Number(o.delivery_fee),
      address: o.address,
      paymentMethod: o.payment_method,
      status: o.status
    }));
  },

  saveOrder: async (order: Order) => {
    const dbOrder = {
      id: order.id,
      user_id: order.userId,
      user_name: order.userName,
      user_phone: order.userPhone,
      date: order.date,
      items: order.items,
      total: order.total,
      delivery_fee: order.deliveryFee,
      address: order.address,
      payment_method: order.paymentMethod,
      status: order.status
    };

    const { error } = await supabase.from('orders').insert(dbOrder);
    
    if (error) {
      console.error("Error saving order remote:", error);
      throw new Error("Falha ao salvar pedido no banco de dados.");
    }
  },

  updateOrderStatus: async (orderId: string, status: Order['status']) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  }
};
