import { Product, User, Neighborhood, Order } from '../types';
import { PRODUCTS, NEIGHBORHOODS } from '../constants';
import { supabase } from './supabaseClient';

// Keys for Local Fallback (Caso o Supabase falhe ou esteja sem chave)
const CURRENT_USER_KEY = 'formento_current_user';

export const storageService = {
  
  // --- PRODUCTS ---
  
  getProducts: async (): Promise<Product[]> => {
    try {
      const { data, error } = await supabase.from('products').select('*');
      
      if (error || !data || data.length === 0) {
        console.warn("Supabase empty or error, using local fallback:", error);
        // Se não tiver nada no banco ainda, retorna os produtos de exemplo
        return PRODUCTS;
      }

      // Mapear campos do banco (snake_case) para o frontend (camelCase) se necessário
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
    } catch (e) {
      console.error("Connection error", e);
      return PRODUCTS;
    }
  },

  saveProducts: async (products: Product[]) => {
    // Nota: Esta função salva TODOS os produtos. 
    // No Supabase idealmente faríamos 'upsert' item a item, mas para manter simples:
    
    for (const p of products) {
      const dbProduct = {
        id: p.id.length < 10 ? undefined : p.id, // Se for ID curto (ex: '1'), deixa o Supabase gerar UUID
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
        // Update existing
        await supabase.from('products').update(dbProduct).eq('id', p.id);
      } else {
        // Insert new (skips products with temporary IDs 1,2,3 from constants unless forced)
        // Para simplificar o admin: deletamos o produto antigo e criamos novo se for edição complexa
        // Mas aqui vamos apenas inserir se não existir UUID
        // Em um app real, o AdminProductModal deve lidar com criar/editar individualmente
      }
    }
  },

  // Helper para salvar UM produto (usado no Admin)
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
       await supabase.from('products').update(dbProduct).eq('id', product.id);
    } else {
       await supabase.from('products').insert(dbProduct);
    }
  },

  deleteProduct: async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
  },

  // --- NEIGHBORHOODS ---
  // Bairros geralmente mudam pouco, podemos manter hardcoded ou criar tabela.
  // Vamos manter no código por enquanto para economizar tempo de setup SQL
  getNeighborhoods: async (): Promise<Neighborhood[]> => {
    return NEIGHBORHOODS;
  },

  saveNeighborhoods: async (neighborhoods: Neighborhood[]) => {
    // Implementar tabela 'neighborhoods' no futuro se necessário
    console.log("Saving neighborhoods locally only");
  },

  // --- USERS ---

  getUsers: async (): Promise<User[]> => {
    const { data } = await supabase.from('users').select('*');
    return data || [];
  },

  saveUser: async (user: User) => {
    const { error } = await supabase.from('users').insert({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      address: user.address
    });
    if (error) throw error;
  },

  login: async (email: string, password: string): Promise<User> => {
    // Admin Hardcoded Backdoor
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

    // Busca usuário na tabela customizada 'users'
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();
    
    if (error || !data) {
      throw new Error('Credenciais inválidas');
    }

    const user = data as User;
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
    await supabase.from('users').update({ address }).eq('email', email);
    
    // Update local cache
    const currentUser = storageService.getCurrentUser();
    if (currentUser && currentUser.email === email) {
      currentUser.address = address;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    }
  },

  // --- ORDERS ---

  getOrders: async (): Promise<Order[]> => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('date', { ascending: false });
    
    if (!data) return [];

    return data.map((o: any) => ({
      id: o.id,
      userId: o.user_id,
      userName: o.user_name,
      date: o.date,
      items: o.items, // JSONB comes automatically parsed
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
      date: order.date,
      items: order.items,
      total: order.total,
      delivery_fee: order.deliveryFee,
      address: order.address,
      payment_method: order.paymentMethod,
      status: order.status
    };

    const { error } = await supabase.from('orders').insert(dbOrder);
    if (error) console.error("Error saving order:", error);
  },

  updateOrderStatus: async (orderId: string, status: Order['status']) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
  }
};
