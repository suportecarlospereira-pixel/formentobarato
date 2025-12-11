import { Neighborhood, Product, Category } from './types';

export const CATEGORIES: Category[] = [
  'Todos',
  'Hortifruti',
  'Açougue',
  'Bebidas',
  'Mercearia',
  'Padaria',
  'Limpeza'
];

export const NEIGHBORHOODS: Neighborhood[] = [
  { id: 'cordeiros', name: 'Cordeiros (Nossa Loja)', deliveryFee: 5.00 },
  { id: 'santa_regina', name: 'Santa Regina', deliveryFee: 12.00 }, // New
  { id: 'volta_de_cima', name: 'Volta de Cima', deliveryFee: 25.00 }, // New
  { id: 'sao_vicente', name: 'São Vicente', deliveryFee: 7.00 },
  { id: 'cidade_nova', name: 'Cidade Nova', deliveryFee: 8.00 },
  { id: 'sao_joao', name: 'São João', deliveryFee: 9.00 },
  { id: 'centro', name: 'Centro', deliveryFee: 10.00 },
  { id: 'fazenda', name: 'Fazenda', deliveryFee: 12.00 },
  { id: 'dom_bosco', name: 'Dom Bosco', deliveryFee: 11.00 },
  { id: 'itaipava', name: 'Itaipava', deliveryFee: 20.00 },
  { id: 'cabecudas', name: 'Cabeçudas', deliveryFee: 18.00 },
  { id: 'praia_brava', name: 'Praia Brava', deliveryFee: 22.00 },
  { id: 'murta', name: 'Murta', deliveryFee: 6.00 },
];

export const PRODUCTS: Product[] = [
  // Hortifruti
  {
    id: '1',
    name: 'Banana Prata',
    price: 6.99,
    category: 'Hortifruti',
    image: 'https://picsum.photos/400/300?random=1',
    description: 'Banana prata selecionada, preço por kg.',
    unit: 'kg',
    stock: 50
  },
  {
    id: '2',
    name: 'Tomate Italiano',
    price: 8.49,
    category: 'Hortifruti',
    image: 'https://picsum.photos/400/300?random=2',
    description: 'Tomate italiano fresco e maduro.',
    unit: 'kg',
    originalPrice: 10.90,
    stock: 30
  },
  {
    id: '3',
    name: 'Alface Americana',
    price: 3.99,
    category: 'Hortifruti',
    image: 'https://picsum.photos/400/300?random=3',
    description: 'Unidade de alface americana higienizada.',
    unit: 'un',
    stock: 20
  },
  // Açougue
  {
    id: '4',
    name: 'Picanha Bovina',
    price: 69.90,
    category: 'Açougue',
    image: 'https://picsum.photos/400/300?random=4',
    description: 'Picanha bovina tipo A, peça inteira ou fatiada.',
    unit: 'kg',
    originalPrice: 89.90,
    stock: 10
  },
  {
    id: '5',
    name: 'Filé de Peito de Frango',
    price: 22.90,
    category: 'Açougue',
    image: 'https://picsum.photos/400/300?random=5',
    description: 'Filé de peito de frango congelado IQF.',
    unit: 'kg',
    stock: 40
  },
  {
    id: '6',
    name: 'Linguiça Toscana',
    price: 18.90,
    category: 'Açougue',
    image: 'https://picsum.photos/400/300?random=6',
    description: 'Linguiça toscana para churrasco.',
    unit: 'kg',
    stock: 25
  },
  // Bebidas
  {
    id: '7',
    name: 'Coca-Cola 2L',
    price: 9.99,
    category: 'Bebidas',
    image: 'https://picsum.photos/400/300?random=7',
    description: 'Refrigerante Coca-Cola Original 2 Litros.',
    unit: 'un',
    stock: 100
  },
  {
    id: '8',
    name: 'Cerveja Heineken 330ml',
    price: 6.49,
    category: 'Bebidas',
    image: 'https://picsum.photos/400/300?random=8',
    description: 'Cerveja Heineken Long Neck 330ml.',
    unit: 'un',
    stock: 120
  },
  // Mercearia
  {
    id: '9',
    name: 'Arroz Branco 5kg',
    price: 28.90,
    category: 'Mercearia',
    image: 'https://picsum.photos/400/300?random=9',
    description: 'Arroz branco tipo 1, pacote de 5kg.',
    unit: 'un',
    stock: 50
  },
  {
    id: '10',
    name: 'Feijão Preto 1kg',
    price: 8.90,
    category: 'Mercearia',
    image: 'https://picsum.photos/400/300?random=10',
    description: 'Feijão preto nobre.',
    unit: 'un',
    stock: 60
  },
  // Padaria
  {
    id: '11',
    name: 'Pão Francês',
    price: 14.90,
    category: 'Padaria',
    image: 'https://picsum.photos/400/300?random=11',
    description: 'Pão francês fresquinho, fornadas a cada hora.',
    unit: 'kg',
    stock: 0 
  },
  // Limpeza
  {
    id: '12',
    name: 'Sabão em Pó 1.6kg',
    price: 24.90,
    category: 'Limpeza',
    image: 'https://picsum.photos/400/300?random=12',
    description: 'Lava roupas em pó, limpeza profunda.',
    unit: 'un',
    stock: 30
  }
];