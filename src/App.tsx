
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, LineChart, Line, Cell, Legend, PieChart as RePieChart, Pie
} from 'recharts';
import { 
  LayoutDashboard, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  PieChart, 
  PlusCircle, 
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Settings,
  HelpCircle,
  Menu,
  X,
  Target,
  Eye,
  UserCheck,
  Trash2,
  Copy,
  Link,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  Globe,
  Database,
  CloudLightning,
  MousePointer2,
  Users,
  BarChart3,
  Package,
  ArrowRightLeft,
  Lock,
  Mail,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { DailyMetric, DashboardStats, AIInsight, Product } from './types';
import { INITIAL_METRICS, INITIAL_PRODUCTS, CURRENCY, GTQ_TO_BRL, DEFAULT_SHIPPING_GTQ } from './constants';
import { getFinancialInsights } from './geminiService';

type ViewType = 'dashboard' | 'integrations' | 'ads' | 'orders' | 'products';
type PeriodType = 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom' | 'all';

interface Order {
  id: string;
  customer: string;
  date: string;
  amount: number;
  status: 'Pendente' | 'Pago' | 'Enviado' | 'Entregue' | 'Cancelado';
  source: string;
  trackingCode?: string;
}

const App: React.FC = () => {
  // Estado de Autenticação
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Estados do Dashboard
  const [metrics, setMetrics] = useState<DailyMetric[]>(INITIAL_METRICS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('this_month');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>(new Date().toLocaleTimeString());
  
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Lógica de Login
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    // Simulação de autenticação
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsAuthLoading(false);
    }, 1200);
  };

  // Filtragem de Métricas
  const filteredMetrics = useMemo(() => {
    const getRange = (period: PeriodType) => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      switch (period) {
        case 'today': return { start: todayStr, end: todayStr };
        case 'yesterday': {
          const d = new Date(); d.setDate(d.getDate() - 1);
          return { start: d.toISOString().split('T')[0], end: d.toISOString().split('T')[0] };
        }
        case 'this_month': {
          const d = new Date(); d.setDate(1);
          return { start: d.toISOString().split('T')[0], end: todayStr };
        }
        default: return { start: '1970-01-01', end: '2099-12-31' };
      }
    };
    const range = getRange(selectedPeriod);
    return metrics.filter(m => m.date >= range.start && m.date <= range.end);
  }, [metrics, selectedPeriod]);

  const stats: DashboardStats = useMemo(() => {
    const totalRevenue = filteredMetrics.reduce((acc, m) => acc + m.revenue, 0);
    const totalAdSpend = filteredMetrics.reduce((acc, m) => acc + m.adSpend, 0);
    const totalProfit = filteredMetrics.reduce((acc, m) => acc + m.netProfit, 0);
    const totalOrders = filteredMetrics.reduce((acc, m) => acc + m.orders, 0);
    return {
      totalRevenue, totalAdSpend, totalProfit, totalOrders,
      avgRoi: totalAdSpend > 0 ? (totalProfit / totalAdSpend) * 100 : 0,
      avgRoas: totalAdSpend > 0 ? totalRevenue / totalAdSpend : 0,
      avgCac: totalOrders > 0 ? totalAdSpend / totalOrders : 0
    };
  }, [filteredMetrics]);

  const orders: Order[] = useMemo(() => {
    const statuses: Order['status'][] = ['Pago', 'Pendente', 'Enviado', 'Entregue'];
    return Array.from({ length: 12 }).map((_, i) => ({
      id: `GT-${92834 + i}`,
      customer: `Cliente Guatemala ${i + 1}`,
      date: new Date(Date.now() - i * 3600000 * 4).toLocaleString('pt-BR'),
      amount: (150 + Math.random() * 500) * GTQ_TO_BRL,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      source: 'Droplatam Cloud',
      trackingCode: `GTQ${Math.random().toString(36).substring(7).toUpperCase()}`
    }));
  }, [isSyncing, isLoggedIn]);

  const platformData = [
    { name: 'Facebook Ads', value: 70, color: '#1877F2' },
    { name: 'Google Ads', value: 20, color: '#EA4335' },
    { name: 'TikTok Ads', value: 10, color: '#000000' },
  ];

  const handleSyncOrders = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync(new Date().toLocaleTimeString());
    }, 1500);
  };

  const fetchInsights = async () => {
    if (!isLoggedIn) return;
    setIsLoadingInsights(true);
    const result = await getFinancialInsights(filteredMetrics);
    setInsights(result);
    setIsLoadingInsights(false);
  };

  useEffect(() => { if (isLoggedIn) fetchInsights(); }, [selectedPeriod, isLoggedIn]);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const shipping = newEntry.shippingCosts || (newEntry.orders * DEFAULT_SHIPPING_GTQ);
    const pCost = newEntry.productCosts || 0;
    const profitGTQ = newEntry.revenue - newEntry.adSpend - shipping - pCost;
    
    const entryInBrl: DailyMetric = {
      ...newEntry,
      revenue: newEntry.revenue * GTQ_TO_BRL,
      adSpend: newEntry.adSpend * GTQ_TO_BRL,
      shippingCosts: shipping * GTQ_TO_BRL,
      productCosts: pCost * GTQ_TO_BRL,
      netProfit: profitGTQ * GTQ_TO_BRL
    };
    
    setMetrics([...metrics, entryInBrl].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setIsEntryModalOpen(false);
    setNewEntry({ date: new Date().toISOString().split('T')[0], revenue: 0, adSpend: 0, netProfit: 0, orders: 0, shippingCosts: 0, productCosts: 0 });
  };

  const [newEntry, setNewEntry] = useState<DailyMetric>({
    date: new Date().toISOString().split('T')[0], revenue: 0, adSpend: 0, netProfit: 0, orders: 0, shippingCosts: 0, productCosts: 0
  });

  // TELA DE LOGIN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Decorativo de fundo */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full"></div>

        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[40px] shadow-2xl animate-in fade-in zoom-in duration-500 relative z-10">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-blue-600 p-4 rounded-3xl mb-6 shadow-xl shadow-blue-600/20">
              <Target className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter italic">TrackingGT</h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] mt-2">Guatemala Ops • Dashboard</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-5 top-4.5 text-slate-500" />
                <input 
                  type="email" 
                  placeholder="Seu e-mail" 
                  className="w-full bg-white/5 border border-white/10 p-4 pl-14 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-5 top-4.5 text-slate-500" />
                <input 
                  type="password" 
                  placeholder="Sua senha" 
                  className="w-full bg-white/5 border border-white/10 p-4 pl-14 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isAuthLoading}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 uppercase tracking-[0.3em] text-[10px] transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              {isAuthLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {authMode === 'login' ? 'Acessar Dashboard' : 'Criar minha conta'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors"
            >
              {authMode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // INTERFACE PRINCIPAL
  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden text-slate-900">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-[#0F172A] hidden md:flex flex-col h-full z-20`}>
        <div className="p-8 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Target className="text-white w-6 h-6" />
          </div>
          {isSidebarOpen && <span className="font-black text-xl tracking-tighter text-white italic">TrackingGT</span>}
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-1.5">
          <NavItem icon={<LayoutDashboard />} label="Dashboard" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} collapsed={!isSidebarOpen} />
          <NavItem icon={<Package />} label="Produtos" active={currentView === 'products'} onClick={() => setCurrentView('products')} collapsed={!isSidebarOpen} />
          <NavItem icon={<TrendingUp />} label="Marketing" active={currentView === 'ads'} onClick={() => setCurrentView('ads')} collapsed={!isSidebarOpen} />
          <NavItem icon={<ShoppingBag />} label="Pedidos" active={currentView === 'orders'} onClick={() => setCurrentView('orders')} collapsed={!isSidebarOpen} />
          <NavItem icon={<RefreshCw />} label="Integrações" active={currentView === 'integrations'} onClick={() => setCurrentView('integrations')} collapsed={!isSidebarOpen} />
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center gap-4 px-5 py-3 text-red-400/60 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all">
             <LogOut className="w-5 h-5 shrink-0" />
             {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">Sair</span>}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-full flex items-center justify-center p-3 text-slate-500 hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {currentView === 'dashboard' ? 'Overview Geral' : 
               currentView === 'products' ? 'Performance de Produtos' : 
               currentView === 'ads' ? 'Marketing & Ads' : 
               currentView === 'orders' ? 'Gestão de Pedidos' : 'Integrações'}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Guatemala Ops • Autenticado</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 mr-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               Sincronizando Live
            </div>
            <button className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 transition-all shadow-sm">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Este Mês</span>
            </button>
            <button onClick={() => setIsEntryModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-200">
              Lançar Dados
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
          
          {/* VIEW: DASHBOARD */}
          {currentView === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard label="Receita Bruta" value={`${CURRENCY} ${stats.totalRevenue.toLocaleString()}`} trend="+14.2%" trendUp icon={<DollarSign />} bgColor="bg-blue-50 text-blue-600" />
                <KpiCard label="Lucro Líquido" value={`${CURRENCY} ${stats.totalProfit.toLocaleString()}`} trend="+9.1%" trendUp icon={<TrendingUp />} bgColor="bg-emerald-50 text-emerald-600" info="Deduzido: Ads, Frete e Custo Prod" />
                <KpiCard label="Gasto Marketing" value={`${CURRENCY} ${stats.totalAdSpend.toLocaleString()}`} trend="+5.4%" trendUp={false} icon={<Zap />} bgColor="bg-orange-50 text-orange-600" />
                <KpiCard label="ROI Médio" value={`${stats.avgRoi.toFixed(0)}%`} trend="+2.5%" trendUp icon={<PieChart />} bgColor="bg-purple-50 text-purple-600" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                  <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                    <Zap className="w-5 h-5 text-blue-600" /> Curva de Crescimento (BRL)
                  </h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={filteredMetrics}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/></linearGradient>
                          <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" tickFormatter={(v) => v.split('-').reverse().slice(0,2).join('/')} tick={{fontSize: 10, fontWeight: 700}} axisLine={false} />
                        <YAxis tick={{fontSize: 10, fontWeight: 700}} axisLine={false} />
                        <Tooltip contentStyle={{borderRadius: '24px', border: 'none'}} />
                        <Area type="monotone" dataKey="revenue" name="Receita" stroke="#2563eb" fillOpacity={1} fill="url(#colorRev)" strokeWidth={4} />
                        <Area type="monotone" dataKey="netProfit" name="Lucro" stroke="#10b981" fillOpacity={1} fill="url(#colorProf)" strokeWidth={4} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#0F172A] p-8 rounded-[40px] text-white flex flex-col shadow-2xl relative overflow-hidden group">
                   <div className="absolute -right-10 -top-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                      <Target className="w-48 h-48" />
                   </div>
                   <div className="flex items-center justify-between mb-8 relative">
                      <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-blue-400">Insights Inteligentes</h3>
                      {isLoadingInsights ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4 text-blue-500" />}
                   </div>
                   <div className="space-y-6 flex-1 relative">
                      {insights.length > 0 ? insights.map((insight, i) => (
                        <div key={i} className="p-6 bg-white/5 rounded-[28px] border border-white/5 hover:bg-white/10 transition-all">
                           <p className="text-[10px] font-black uppercase text-blue-300 mb-2 tracking-widest">{insight.title}</p>
                           <p className="text-sm font-medium leading-relaxed text-slate-300">{insight.description}</p>
                        </div>
                      )) : (
                        <div className="p-8 text-center opacity-30">
                           <Info className="w-10 h-10 mx-auto mb-4" />
                           <p className="text-xs font-bold uppercase tracking-widest">Nenhum insight gerado</p>
                        </div>
                      )}
                   </div>
                   <button onClick={fetchInsights} className="mt-8 w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all relative z-10">Recalcular com IA</button>
                </div>
              </div>
            </>
          )}

          {/* VIEW: PRODUCTS */}
          {currentView === 'products' && (
            <div className="space-y-8">
               <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-10 border-b border-slate-100 bg-white flex items-center justify-between">
                     <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-[0.3em]">Performance por SKU</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                          <th className="px-10 py-6">Nome</th>
                          <th className="px-8 py-6 text-center">Pedidos</th>
                          <th className="px-8 py-6 text-center">Taxa Entrega</th>
                          <th className="px-8 py-6 text-center">Faturamento</th>
                          <th className="px-8 py-6 text-center">Custo Prod</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {products.map((product) => (
                          <tr key={product.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="px-10 py-6">
                               <div className="flex items-center gap-6">
                                  <img src={product.image} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                                  <span className="text-sm font-black text-slate-800 leading-tight max-w-[200px]">{product.name}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-center text-sm font-bold">{product.orders}</td>
                            <td className="px-8 py-6 text-center">
                               <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${product.deliveryRate > 30 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                 {product.deliveryRate}%
                               </span>
                            </td>
                            <td className="px-8 py-6 text-center">
                               <span className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black">
                                 {CURRENCY} {product.grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                               </span>
                            </td>
                            <td className="px-8 py-6 text-center">
                               <span className="px-4 py-1.5 bg-red-50 text-red-500 rounded-full text-[10px] font-black">
                                 {CURRENCY} {product.productCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                               </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          )}

          {/* VIEW: MARKETING / ADS (RESTORED) */}
          {currentView === 'ads' && (
            <div className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <KpiCard label="Ads Spend" value={`${CURRENCY} ${stats.totalAdSpend.toLocaleString()}`} trend="+8%" trendUp={false} icon={<MousePointer2 />} bgColor="bg-blue-50 text-blue-600" />
                 <KpiCard label="ROAS" value={`${stats.avgRoas.toFixed(2)}x`} trend="+0.1" trendUp icon={<Zap />} bgColor="bg-yellow-50 text-yellow-600" />
                 <KpiCard label="CAC Real" value={`${CURRENCY} ${stats.avgCac.toFixed(2)}`} trend="-5%" trendUp icon={<Users />} bgColor="bg-emerald-50 text-emerald-600" />
                 <KpiCard label="CPM GT" value={`Q 14.80`} trend="+1%" trendUp={false} icon={<Eye />} bgColor="bg-slate-50 text-slate-600" />
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                    <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-[0.3em] mb-10">Escalabilidade: Gasto vs Retorno</h3>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={filteredMetrics}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} />
                          <YAxis tick={{fontSize: 10, fontWeight: 700}} axisLine={false} />
                          <Tooltip contentStyle={{borderRadius: '20px', border: 'none'}} />
                          <Legend />
                          <Bar dataKey="adSpend" name="Gasto Ads" fill="#2563eb" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="revenue" name="Vendas" fill="#10b981" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col justify-center">
                    <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-[0.3em] mb-8 text-center">Origem das Vendas</h3>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie data={platformData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {platformData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <Tooltip />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-8 space-y-3">
                       {platformData.map((p, i) => (
                         <div key={i} className="flex justify-between items-center text-xs font-bold">
                            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor: p.color}}></div> {p.name}</span>
                            <span className="text-slate-400">{p.value}%</span>
                         </div>
                       ))}
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* VIEW: ORDERS (RESTORED) */}
          {currentView === 'orders' && (
            <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <SummaryCard label="Total Pedidos" value={stats.totalOrders.toLocaleString()} icon={<ShoppingBag className="w-5 h-5 text-blue-500" />} />
                 <SummaryCard label="Droplatam Cloud" value="Ativo" icon={<Globe className="w-5 h-5 text-emerald-500" />} />
                 <SummaryCard label="Pendentes" value="18" icon={<Truck className="w-5 h-5 text-orange-500" />} />
                 <SummaryCard label="Último Sync" value={lastSync} icon={<Clock className="w-5 h-5 text-slate-400" />} />
               </div>

               <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                     <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-[0.3em]">Gestão de Encomendas GT</h3>
                     <button onClick={handleSyncOrders} className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isSyncing ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`}>
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Sincronizando...' : 'Atualizar Nuvem'}
                     </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                          <th className="px-8 py-6">ID</th>
                          <th className="px-8 py-6">Cliente</th>
                          <th className="px-8 py-6 text-center">Status</th>
                          <th className="px-8 py-6 text-center">Rastreio</th>
                          <th className="px-8 py-6 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-blue-50/10 transition-colors">
                            <td className="px-8 py-6 text-sm font-black">{order.id}</td>
                            <td className="px-8 py-6 text-xs font-bold text-slate-500">{order.customer}</td>
                            <td className="px-8 py-6 text-center">
                               <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                                 order.status === 'Pago' ? 'bg-emerald-50 text-emerald-600' : 
                                 order.status === 'Enviado' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                               }`}>{order.status}</span>
                            </td>
                            <td className="px-8 py-6 text-center text-xs font-mono font-bold text-slate-400">{order.trackingCode}</td>
                            <td className="px-8 py-6 text-right text-sm font-black">{CURRENCY} {order.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          )}

          {/* VIEW: INTEGRATIONS */}
          {currentView === 'integrations' && (
             <div className="max-w-4xl mx-auto py-10 space-y-8">
                <div className="bg-[#0F172A] p-12 rounded-[50px] border border-white/5 shadow-xl flex items-center gap-12 text-white">
                   <div className="w-24 h-24 bg-blue-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-600/20">
                      <CloudLightning className="w-12 h-12" />
                   </div>
                   <div>
                      <h2 className="text-3xl font-black tracking-tighter italic">Nuvem Droplatam Cloud</h2>
                      <p className="text-slate-400 font-medium mt-1">Conexão API ativa com centro de distribuição na Guatemala.</p>
                      <div className="flex items-center gap-4 mt-6">
                         <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                            Status: Online
                         </div>
                         <span className="text-[10px] font-bold text-slate-500 uppercase">Token Expira em 18 dias</span>
                      </div>
                   </div>
                </div>
             </div>
          )}

        </div>

        {/* Modal de Lançamento */}
        {isEntryModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-sm animate-in zoom-in duration-200">
            <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden">
              <div className="p-10 border-b border-slate-50 bg-slate-50/40 flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tighter">Balanço Manual (GT)</h3>
                <button onClick={() => setIsEntryModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleAddEntry} className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest">Data do Lançamento</label>
                    <input type="date" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={newEntry.date} onChange={e => setNewEntry({...newEntry, date: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest">Faturamento Real (Q)</label>
                    <input type="number" step="0.01" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={newEntry.revenue || ''} onChange={e => setNewEntry({...newEntry, revenue: Number(e.target.value)})} required />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest">Gasto Ads (Q)</label>
                    <input type="number" step="0.01" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={newEntry.adSpend || ''} onChange={e => setNewEntry({...newEntry, adSpend: Number(e.target.value)})} required />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest">Custos de Frete (Q)</label>
                    <input type="number" step="0.01" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={newEntry.shippingCosts || ''} onChange={e => setNewEntry({...newEntry, shippingCosts: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest">Custo de Produtos (Q)</label>
                    <input type="number" step="0.01" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={newEntry.productCosts || ''} onChange={e => setNewEntry({...newEntry, productCosts: Number(e.target.value)})} />
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-[24px] shadow-2xl shadow-blue-400/20 uppercase tracking-[0.3em] text-[10px] hover:bg-blue-700 transition-all">Sincronizar Lançamento</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- Sub-componentes ---

const NavItem: React.FC<{icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void, collapsed?: boolean}> = ({ icon, label, active, onClick, collapsed }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
    <div className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} shrink-0`}>{icon}</div>
    {!collapsed && <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>}
  </button>
);

const KpiCard: React.FC<{label: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode, bgColor: string, info?: string}> = ({ label, value, trend, trendUp, icon, bgColor, info }) => (
  <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
    <div className="flex justify-between items-start mb-10">
      <div className={`${bgColor} p-4 rounded-2xl transition-transform group-hover:scale-110`}>{icon}</div>
      <div className={`flex items-center gap-1 text-[10px] font-black px-3 py-1.5 rounded-xl ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
        {trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {trend}
      </div>
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
    <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h4>
    {info && <p className="text-[9px] font-bold text-slate-300 uppercase mt-4 tracking-widest leading-relaxed">{info}</p>}
  </div>
);

const SummaryCard: React.FC<{label: string, value: string, icon: React.ReactNode}> = ({ label, value, icon }) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-5">
    <div className="bg-slate-50 p-4 rounded-2xl">{icon}</div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <h4 className="text-xl font-black text-slate-800 tracking-tight">{value}</h4>
    </div>
  </div>
);

export default App;
