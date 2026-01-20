
import { DailyMetric, Product } from './types';

// Taxa de conversão aproximada: 1 Quetzal = 0.64 Real
export const GTQ_TO_BRL = 0.64;
export const DEFAULT_SHIPPING_GTQ = 33;

const getRelativeDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const INITIAL_METRICS: DailyMetric[] = [
  { date: getRelativeDate(0), revenue: 15500, adSpend: 4200, netProfit: 0, orders: 55, shippingCosts: 1815, productCosts: 3800 },
  { date: getRelativeDate(1), revenue: 14200, adSpend: 3500, netProfit: 0, orders: 52, shippingCosts: 1716, productCosts: 4100 },
  { date: getRelativeDate(2), revenue: 11800, adSpend: 3800, netProfit: 0, orders: 38, shippingCosts: 1254, productCosts: 3700 },
].map(m => {
  // Lucro Líquido = Receita - Ads - Frete - Custo de Produto
  const profit = (m.revenue - m.adSpend - m.shippingCosts - m.productCosts) * GTQ_TO_BRL;
  return {
    ...m,
    revenue: m.revenue * GTQ_TO_BRL,
    adSpend: m.adSpend * GTQ_TO_BRL,
    netProfit: profit,
    shippingCosts: m.shippingCosts * GTQ_TO_BRL,
    productCosts: m.productCosts * GTQ_TO_BRL,
  };
});

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'BOLSO TRIBAL – NUEVA EDICION ESPECIAL',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=100&h=100&fit=crop',
    orders: 12,
    deliveryRate: 25,
    grossRevenue: 205.42,
    predictedRevenue: 821.64,
    productCost: 0
  },
  {
    id: '2',
    name: 'Conjunto manga rangla adidas Ref: 2266',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100&h=100&fit=crop',
    orders: 1,
    deliveryRate: 0,
    grossRevenue: 0,
    predictedRevenue: 0,
    productCost: 0
  },
  {
    id: '3',
    name: 'CAMISETA COL + GORRA ADIDAS IMPORT 1.1',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop',
    orders: 45,
    deliveryRate: 68,
    grossRevenue: 4250.00,
    predictedRevenue: 6250.00,
    productCost: 1200.00
  }
];

export const CURRENCY = 'R$';
