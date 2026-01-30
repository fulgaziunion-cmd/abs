
import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'b1',
    name: 'Introduction to Algorithms',
    price: 1200,
    category: 'Bookstore',
    description: 'A comprehensive guide to algorithm design and analysis.',
    image: 'https://picsum.photos/seed/book1/400/500',
    author: 'Thomas H. Cormen'
  },
  {
    id: 'b2',
    name: 'The Alchemist',
    price: 350,
    category: 'Bookstore',
    description: 'A magical story about following your dreams.',
    image: 'https://picsum.photos/seed/book2/400/500',
    author: 'Paulo Coelho'
  },
  {
    id: 's1',
    name: 'Parker Vector Fountain Pen',
    price: 850,
    category: 'Stationery',
    description: 'Elegant writing instrument for professionals.',
    image: 'https://picsum.photos/seed/pen1/400/500'
  },
  {
    id: 's2',
    name: 'A4 Paper Bundle (500 Sheets)',
    price: 450,
    category: 'Stationery',
    description: 'High-quality 80GSM printing paper.',
    image: 'https://picsum.photos/seed/paper/400/500'
  },
  {
    id: 'c1',
    name: 'Logitech MX Master 3S',
    price: 9500,
    category: 'Computer Accessories',
    description: 'Advanced wireless mouse with ergonomic design.',
    image: 'https://picsum.photos/seed/mouse/400/500',
    specs: '8000 DPI, MagSpeed Scroll'
  },
  {
    id: 'c2',
    name: 'Samsung 980 Pro 1TB SSD',
    price: 12500,
    category: 'Computer Accessories',
    description: 'NVMe M.2 internal gaming SSD.',
    image: 'https://picsum.photos/seed/ssd/400/500',
    specs: 'PCIe 4.0, 7000MB/s Read'
  }
];

export const APP_THEME = {
  primary: 'blue-600',
  secondary: 'gray-100',
  accent: 'blue-500',
  textMain: 'gray-900',
  textMuted: 'gray-500'
};
