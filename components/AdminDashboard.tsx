'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  CreditCard,
  Calculator,
  Truck,
  Settings,
  Search,
  Bell,
  Calendar as CalendarIcon,
  DollarSign,
  TrendingUp,
  Percent,
  ShoppingBag,
  LogOut,
  RefreshCw,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  Phone,
  Check,
  X,
  SlidersHorizontal,
  Flame,
  Sparkles,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Mail,
  Lock,
  ChevronRight,
  TrendingDown,
  Building2,
  Receipt,
  UserCheck,
  PackageCheck,
  Bike,
  Plus,
  Save,
  Printer,
} from 'lucide-react';
import { SpartanHelmetIcon, ParthenonIcon, LaurelWreathIcon } from '@/components/GreekOrnament';
import { MENU_ITEMS, NEIGHBORHOOD_FEES } from '@/lib/data';
import { MenuItem } from '@/types/burger';
import { auth, googleAuthProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { KDS_STATUSES } from '@/components/OrderLiveTracker';
import { ThermalReceiptModal } from '@/components/ThermalReceipt';
import {
  AdminCalculosHub,
  IfoodDailyBatchWidget,
  loadErpStateFromStorage,
  persistErpStateToStorage,
  ERP_SYNC_EVENT,
  IFOOD_FEE_RATE,
  detectChannelType,
  matchesPeriodFilter,
  getPeriodLabel,
  UnifiedErpState,
} from '@/components/AdminCalculosHub';

export type AdminNavTab = 'dashboard' | 'orders' | 'calculos' | 'delivery' | 'settings';
type PeriodFilter = 'today' | 'week' | 'month' | 'year' | 'all';

interface OrderItem {
  id: string;
  menuItemId?: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  doneness?: string;
  selectedToppings?: Array<{ name: string; price?: number }>;
  isComboUpgrade?: boolean;
  comboDrink?: string;
  notes?: string;
}

export function AdminDashboard({ initialTab = 'dashboard' }: { initialTab?: AdminNavTab } = {}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [ownerName, setOwnerName] = useState('Gabriel Olímpio');
  const [ownerEmail, setOwnerEmail] = useState('gabrielolimpiobsb@gmail.com');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Clock ticker for real-time dashboard monitoring
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Navigation & Filters
  const [activeTab, setActiveTab] = useState<AdminNavTab>(initialTab);
  const handleSwitchTab = (nextTab: AdminNavTab) => {
    setActiveTab(nextTab);
    if (typeof window !== 'undefined') {
      const targetUrl = nextTab === 'calculos' ? '/admin-calculos' : '/admin';
      if (window.location.pathname !== targetUrl) {
        window.history.pushState(null, '', targetUrl);
      }
    }
  };
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('today');
  const [globalSearch, setGlobalSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Master Data from Cloud SQL & API
  const [loadingData, setLoadingData] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adminData, setAdminData] = useState<any | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Unified ERP & iFood Daily Sales State (shared with /admin-calculos)
  const [erpState, setErpState] = useState<UnifiedErpState>(() => loadErpStateFromStorage());

  const handleSaveErpFromDashboard = React.useCallback((next: UnifiedErpState) => {
    setErpState(next);
    persistErpStateToStorage(next);
  }, []);

  useEffect(() => {
    const syncHandler = () => {
      setErpState(loadErpStateFromStorage());
    };
    window.addEventListener(ERP_SYNC_EVENT, syncHandler);
    return () => window.removeEventListener(ERP_SYNC_EVENT, syncHandler);
  }, []);

  // Menu Management State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Cost & Price Edit Modal
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editCostPrice, setEditCostPrice] = useState<string>('');
  const [editName, setEditName] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Order Details Modal
  const [inspectingOrder, setInspectingOrder] = useState<any | null>(null);
  const [orderStatusUpdating, setOrderStatusUpdating] = useState<number | null>(null);

  // Thermal Receipt Printing Modal
  const [printingOrder, setPrintingOrder] = useState<any | null>(null);

  // Calendar
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // 1. Check Auth on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const storedToken = localStorage.getItem('teseu_admin_token');
        const headers: Record<string, string> = {};
        if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;

        const res = await fetch('/api/admin/auth', { headers });
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          if (data.ownerName) setOwnerName(data.ownerName);
          if (data.email) setOwnerEmail(data.email);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  // 2. Fetch Master Data
  const fetchMasterData = React.useCallback(async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      const storedToken = localStorage.getItem('teseu_admin_token');
      const headers: Record<string, string> = {};
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;

      // Fetch admin data and menu items with overrides in parallel
      const [dataRes, menuRes] = await Promise.all([
        fetch('/api/admin/data', { headers }),
        fetch('/api/admin/menu'),
      ]);

      if (dataRes.ok) {
        const data = await dataRes.json();
        setAdminData(data);
      } else if (dataRes.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      if (menuRes.ok) {
        const menuJson = await menuRes.json();
        if (menuJson.items) {
          setMenuItems(menuJson.items);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoadingData(false);
      if (isManual) setIsRefreshing(false);
    }
  }, []);

  // Poll master data periodically to stay 100% in sync with kitchen and clients
  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;
    const runFetch = async () => {
      if (isMounted) {
        await fetchMasterData();
      }
    };
    runFetch();

    const timer = setInterval(() => {
      if (isMounted) {
        fetchMasterData(false);
      }
    }, 6000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [isAuthenticated, fetchMasterData]);



  // Handle Google Login
  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsAuthenticating(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;
      const userEmail = (user.email || '').toLowerCase().trim();

      const idToken = await user.getIdToken();
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          idToken,
          ownerName: user.displayName || 'Gabriel Olímpio',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.token) {
          localStorage.setItem('teseu_admin_token', data.token);
        }
        setIsAuthenticated(true);
        if (data.ownerName) setOwnerName(data.ownerName);
        if (data.email) setOwnerEmail(data.email);
        fetchMasterData();
      } else {
        setAuthError(data.error || 'Acesso negado para esta conta Google.');
      }
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      setAuthError('Não foi possível autenticar via Google neste navegador. Use seu e-mail e chave cadastrados.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    localStorage.removeItem('teseu_admin_token');
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
    setAdminData(null);
  };

  // Handle Toggle Stock (Ativo / Esgotado)
  const handleToggleStock = async (itemId: string, currentStatus: number | undefined) => {
    const nextStatus = currentStatus === 0 ? 1 : 0;
    try {
      const storedToken = localStorage.getItem('teseu_admin_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;

      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          itemId,
          action: 'toggle_stock',
          isAvailable: nextStatus,
        }),
      });

      if (res.ok) {
        setMenuItems((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, isAvailable: nextStatus } : i))
        );
        setActionSuccess(`Estoque de "${itemId}" alterado para ${nextStatus === 1 ? 'EM ESTOQUE' : 'ESGOTADO'}.`);
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Failed to toggle stock:', err);
    }
  };

  // Open Cost & Price Editor Modal
  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditDescription(item.description);
    setEditPrice(item.price.toFixed(2));
    setEditCostPrice(item.costPrice !== undefined ? item.costPrice.toFixed(2) : (item.price * 0.35).toFixed(2));
  };

  // Handle Save Product Cost & Price Edit
  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsSavingProduct(true);
    try {
      const storedToken = localStorage.getItem('teseu_admin_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;

      const priceNum = parseFloat(editPrice.replace(',', '.'));
      const costNum = parseFloat(editCostPrice.replace(',', '.'));

      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          itemId: editingItem.id,
          name: editName.trim(),
          description: editDescription.trim(),
          price: isNaN(priceNum) ? editingItem.price : priceNum,
          costPrice: isNaN(costNum) ? undefined : costNum,
        }),
      });

      if (res.ok) {
        setMenuItems((prev) =>
          prev.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  name: editName.trim(),
                  description: editDescription.trim(),
                  price: isNaN(priceNum) ? i.price : priceNum,
                  costPrice: isNaN(costNum) ? i.costPrice : costNum,
                }
              : i
          )
        );
        setActionSuccess(`Produto "${editName}" atualizado com sucesso! Novo Custo: R$ ${costNum.toFixed(2)} | Preço: R$ ${priceNum.toFixed(2)}.`);
        setTimeout(() => setActionSuccess(null), 4000);
        setEditingItem(null);
        fetchMasterData(true);
      }
    } catch (err) {
      console.error('Failed to save product:', err);
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Handle Order Status Update directly from Admin
  const handleUpdateOrderStatus = async (orderId: number, nextStatus: string) => {
    setOrderStatusUpdating(orderId);
    try {
      const storedToken = localStorage.getItem('teseu_admin_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;

      const res = await fetch('/api/kitchen/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          orderId,
          action: 'update_status',
          targetStatus: nextStatus,
        }),
      });

      if (res.ok) {
        setActionSuccess(`Status do pedido atualizado para "${nextStatus}".`);
        setTimeout(() => setActionSuccess(null), 3000);
        fetchMasterData(true);
        if (inspectingOrder && inspectingOrder.id === orderId) {
          setInspectingOrder((prev: any) => ({ ...prev, status: nextStatus }));
        }
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setOrderStatusUpdating(null);
    }
  };

  // ==========================================
  // REAL DATA COMPUTATION (Zero Fake Data)
  // ==========================================
  const allOrders: any[] = useMemo(() => adminData?.orders || [], [adminData?.orders]);
  const financialRecords: any[] = useMemo(() => adminData?.financialRecords || [], [adminData?.financialRecords]);

  // Filter orders by period if selected
  const filteredOrders = useMemo(() => {
    if (!allOrders.length) return [];
    if (periodFilter === 'all') return allOrders;

    return allOrders.filter((order) => matchesPeriodFilter(order.createdAt, undefined, periodFilter));
  }, [allOrders, periodFilter]);

  // Filter ERP logs (iFood daily batches & KDS completions) by the same periodFilter
  const filteredErpLogs = useMemo(() => {
    const logs = erpState?.logs || [];
    if (!logs.length) return [];
    if (periodFilter === 'all') return logs;

    return logs.filter((log) => matchesPeriodFilter(log.timestamp, log.dateKey, periodFilter));
  }, [erpState?.logs, periodFilter]);

  // Pre-calculate sales counts for each period button (Hoje, 7d, Mês, Tudo)
  const periodSalesCounts = useMemo(() => {
    const logs = erpState?.logs || [];
    const countForPeriod = (p: PeriodFilter) => {
      const ordersInPeriod = allOrders.filter((o) => matchesPeriodFilter(o.createdAt, undefined, p)).length;
      const erpUnitsInPeriod = logs
        .filter((l) => matchesPeriodFilter(l.timestamp, l.dateKey, p))
        .reduce((acc, l) => acc + Math.max(1, Number(l.salesCount || 1)), 0);
      return ordersInPeriod + erpUnitsInPeriod;
    };
    return {
      today: countForPeriod('today'),
      week: countForPeriod('week'),
      month: countForPeriod('month'),
      year: countForPeriod('year'),
      all: countForPeriod('all'),
    };
  }, [allOrders, erpState?.logs]);

  // Real financial aggregates separating Compras pelo Site (0% taxa iFood) vs Compras do iFood (26,2% taxa)
  const realFinancials = useMemo(() => {
    // 1. COMPRAS PELO SITE (0% DE TAXA DO IFOOD)
    let siteGrossRev = 0;
    let siteProdCost = 0;
    let siteOrdersCount = 0;
    let completedCount = 0;

    // 2. COMPRAS DO IFOOD (COM TAXA OFICIAL DE 26,2% DO IFOOD)
    let ifoodGrossRev = 0;
    let ifoodFee262Total = 0;
    let ifoodProdCost = 0;
    let ifoodOrdersCount = 0;

    const paymentMap: Record<string, { count: number; total: number }> = {
      pix: { count: 0, total: 0 },
      card: { count: 0, total: 0 },
      cash: { count: 0, total: 0 },
    };

    const neighborhoodMap: Record<string, { count: number; revenue: number }> = {};

    // Process orders placed directly on the Website (Sem taxa de 26,2% do iFood)
    filteredOrders.forEach((o) => {
      const orderTotal = (o.total || 0) / 100;
      siteGrossRev += orderTotal;
      siteOrdersCount += 1;

      if (o.status === 'completed' || o.productionCost) {
        completedCount++;
        const cost = o.productionCost ? o.productionCost / 100 : Math.round(orderTotal * 0.35 * 100) / 100;
        siteProdCost += cost;
      } else {
        siteProdCost += Math.round(orderTotal * 0.35 * 100) / 100;
      }

      const method = (o.paymentMethod || 'pix').toLowerCase();
      if (method.includes('card') || method.includes('cartão') || method.includes('cartao')) {
        paymentMap.card.count++;
        paymentMap.card.total += orderTotal;
      } else if (method.includes('dinheiro') || method.includes('cash')) {
        paymentMap.cash.count++;
        paymentMap.cash.total += orderTotal;
      } else {
        paymentMap.pix.count++;
        paymentMap.pix.total += orderTotal;
      }

      if (o.customerAddress) {
        let matched = 'Outros / Balcão';
        for (const hood of Object.keys(NEIGHBORHOOD_FEES)) {
          const baseName = hood.split('/')[0].trim().toLowerCase();
          if (o.customerAddress.toLowerCase().includes(baseName)) {
            matched = hood;
            break;
          }
        }
        if (!neighborhoodMap[matched]) {
          neighborhoodMap[matched] = { count: 0, revenue: 0 };
        }
        neighborhoodMap[matched].count++;
        neighborhoodMap[matched].revenue += orderTotal;
      }
    });

    // Process daily sales deductions from ERP / Baixa Diária (iFood 26,2% vs Site 0%)
    filteredErpLogs.forEach((log) => {
      const cType = log.channelType || detectChannelType(log.channel);
      const salesQty = log.salesCount || 1;
      const rev = Number(log.revenue) || 0;
      const cost = Number(log.totalCost) || 0;

      if (cType === 'IFOOD') {
        const fee = log.ifoodFee !== undefined ? Number(log.ifoodFee) : Math.round(rev * IFOOD_FEE_RATE * 100) / 100;
        ifoodGrossRev += rev;
        ifoodFee262Total += fee;
        ifoodProdCost += cost;
        ifoodOrdersCount += salesQty;
        completedCount += salesQty;
      } else {
        // Baixa manual de vendas do Site (0% de taxa do iFood)
        siteGrossRev += rev;
        siteProdCost += cost;
        siteOrdersCount += salesQty;
        completedCount += salesQty;
        paymentMap.pix.count += salesQty;
        paymentMap.pix.total += rev;
      }
    });

    // Lucro Líquido do Site (Sem taxa de 26,2% do iFood)
    const siteNetProfit = Math.round((siteGrossRev - siteProdCost) * 100) / 100;
    // Lucro Líquido do iFood (Descontando os 26,2% do iFood + CMV)
    const ifoodNetRevenueAfterFee = Math.round((ifoodGrossRev - ifoodFee262Total) * 100) / 100;
    const ifoodNetProfit = Math.round((ifoodGrossRev - ifoodFee262Total - ifoodProdCost) * 100) / 100;

    // Cálculos Gerais Consolidados no Dashboard (Site + iFood)
    const grossRev = Math.round((siteGrossRev + ifoodGrossRev) * 100) / 100;
    const prodCost = Math.round((siteProdCost + ifoodProdCost) * 100) / 100;
    const netProfit = Math.round((siteNetProfit + ifoodNetProfit) * 100) / 100;
    const totalOrders = siteOrdersCount + ifoodOrdersCount;
    const avgTicket = totalOrders > 0 ? grossRev / totalOrders : 0;
    const marginPercent = grossRev > 0 ? ((netProfit / grossRev) * 100).toFixed(1) : '0.0';

    const totalPayRev = siteGrossRev > 0 ? siteGrossRev : 1;
    const pixShare = Math.round((paymentMap.pix.total / totalPayRev) * 100);
    const cardShare = Math.round((paymentMap.card.total / totalPayRev) * 100);
    const cashShare = Math.max(0, 100 - pixShare - cardShare);

    const topHoods = Object.entries(neighborhoodMap)
      .map(([name, data]) => ({
        name,
        count: data.count,
        revenue: data.revenue,
        percent: filteredOrders.length > 0 ? Math.round((data.count / filteredOrders.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      grossRevenue: grossRev,
      productionCost: prodCost,
      ifoodFeeTotal: Math.round(ifoodFee262Total * 100) / 100,
      netProfit,
      avgTicket,
      marginPercent,
      totalOrders,
      completedCount,
      siteStats: {
        ordersCount: siteOrdersCount,
        grossRevenue: Math.round(siteGrossRev * 100) / 100,
        productionCost: Math.round(siteProdCost * 100) / 100,
        netProfit: siteNetProfit,
      },
      ifoodStats: {
        ordersCount: ifoodOrdersCount,
        grossRevenue: Math.round(ifoodGrossRev * 100) / 100,
        ifoodFee262: Math.round(ifoodFee262Total * 100) / 100,
        netRevenueAfterFee: ifoodNetRevenueAfterFee,
        productionCost: Math.round(ifoodProdCost * 100) / 100,
        netProfit: ifoodNetProfit,
      },
      paymentMap,
      pixShare,
      cardShare,
      cashShare,
      topHoods,
    };
  }, [filteredOrders, filteredErpLogs]);

  // Filtered Menu Items
  const displayedMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (
        menuSearch &&
        !item.name.toLowerCase().includes(menuSearch.toLowerCase()) &&
        !item.description.toLowerCase().includes(menuSearch.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [menuItems, selectedCategory, menuSearch]);

  // Calendar Orders
  const calendarOrdersByDate: Record<string, any[]> = adminData?.calendarOrdersByDate || {};
  const ordersOnSelectedDate = calendarOrdersByDate[selectedCalendarDate] || [];

  // ==========================================
  // RENDER: Security Gate / Lockscreen (#F5F5F5)
  // Strict, clean, no passwords/emails visible
  // ==========================================
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-4 selection:bg-[#F5CB5C] selection:text-black">
        <div className="w-full max-w-md p-8 bg-white border-2 border-[#CD9C20]/40 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] text-center relative overflow-hidden">
          {/* Imperial Gold top bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#CD9C20] via-[#F5CB5C] to-[#CD9C20]" />

          {/* Official Brand Logo */}
          <div className="relative h-12 w-48 mx-auto mb-4">
            <Image
              src="/logo.png"
              alt="Teseu Burger"
              fill
              priority
              referrerPolicy="no-referrer"
              className="object-contain"
              sizes="192px"
            />
          </div>

          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[#F8F6F0] border border-[#CD9C20]/50 flex items-center justify-center shadow-xs">
            <SpartanHelmetIcon size={26} color="#CD9C20" />
          </div>

          <span className="text-[11px] font-bold tracking-[0.2em] text-[#CD9C20] uppercase block font-sans">
            ACESSO RESTRITO • SUPER-ADMIN
          </span>

          <h2 className="font-extrabold text-2xl tracking-tight text-[#161616] mt-1 font-display">
            Painel Administrativo
          </h2>

          <p className="text-xs text-neutral-500 mt-2 leading-relaxed max-w-xs mx-auto">
            Acesso exclusivo do proprietário. Autenticação restrita e monitorada.
          </p>

          {/* Entrada Exclusiva com Conta Google */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isAuthenticating}
              className="w-full py-3.5 px-4 rounded-xl border border-slate-300 hover:border-[#CD9C20] bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-xs"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Entrar com Conta Google</span>
            </button>
          </div>

          {authError && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{authError}</span>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center">
            <Link
              href="/"
              className="text-xs font-medium text-slate-500 hover:text-[#CD9C20] transition-colors"
            >
              ← Voltar à Loja Principal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: Main Admin Dashboard (#F5F5F5)
  // Visual identity matching the site and Kitchen Panel
  // ==========================================
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex font-sans selection:bg-[#F5CB5C] selection:text-black text-[#1C1C1C] w-full max-w-full overflow-x-hidden">
      {/* 1. LEFT SIDEBAR (OBSIDIAN DOCK MATCHING KITCHEN DISPLAY) */}
      <aside className="w-64 shrink-0 bg-[#161616] text-white border-r border-black/20 flex flex-col justify-between p-4 hidden md:flex fixed inset-y-0 left-0 h-screen z-40 shadow-xl overflow-y-auto">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-2 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#222222] border border-[#CD9C20]/50 flex items-center justify-center text-[#F5CB5C] shadow-md shrink-0">
              <SpartanHelmetIcon size={22} color="#F5CB5C" />
            </div>
            <div className="min-w-0">
              <div className="relative h-6 w-28">
                <Image
                  src="/logo.png"
                  alt="Teseu Burger"
                  fill
                  priority
                  referrerPolicy="no-referrer"
                  className="object-contain object-left"
                  sizes="112px"
                />
              </div>
              <span className="text-[10px] font-bold tracking-widest text-[#CD9C20] uppercase block mt-0.5 font-ancient">
                ADMIN MASTER
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'orders', label: 'Pedidos / KDS', icon: ClipboardList, badge: allOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length },
              { id: 'calculos', label: 'Cardápio, Estoque & Cálculos (iFood)', icon: Calculator },
              { id: 'delivery', label: 'Bairros & Logística', icon: Truck },
              { id: 'settings', label: 'Configurações', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSwitchTab(tab.id as AdminNavTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#CD9C20]/20 text-[#F5CB5C] border border-[#CD9C20]/50 shadow-[0_0_12px_rgba(205,156,32,0.25)] font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#F5CB5C]' : 'text-neutral-400'}`} />
                    <span className="text-left">{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-[#F5CB5C] text-black' : 'bg-white/10 text-[#F5CB5C]'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-2 pt-4 border-t border-white/10">
          <Link
            href="/cozinha"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-medium border border-white/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-[#F5CB5C]" />
              <span>Abrir Painel da Cozinha</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          </Link>

          <Link
            href="/cardapio"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 text-xs font-medium border border-white/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <LaurelWreathIcon size={16} color="#CD9C20" />
              <span>Ver Cardápio do Cliente</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 text-xs font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#CD9C20]/20 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          {/* Title & Mobile Selector */}
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <select
                value={activeTab}
                onChange={(e) => handleSwitchTab(e.target.value as AdminNavTab)}
                className="py-1.5 px-2.5 rounded-lg text-xs font-bold uppercase bg-white text-slate-800 border border-[#CD9C20]/40"
              >
                <option value="dashboard">Dashboard</option>
                <option value="orders">Pedidos / KDS</option>
                <option value="calculos">Cardápio, Estoque &amp; Cálculos</option>
                <option value="delivery">Bairros</option>
                <option value="settings">Configurações</option>
              </select>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg uppercase tracking-wider text-[#161616] font-display">
                  {activeTab === 'dashboard' && 'PAINEL DE ADMINISTRAÇÃO'}
                  {activeTab === 'orders' && 'CONTROLE DE PEDIDOS & KDS'}
                  {activeTab === 'calculos' && 'CARDÁPIO, ESTOQUE, CUSTOS & IFOOD (/ADMIN-CALCULOS)'}
                  {activeTab === 'delivery' && 'LOGÍSTICA POR BAIRRO'}
                  {activeTab === 'settings' && 'CONFIGURAÇÕES DA LOJA'}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold font-mono">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>{ownerEmail}</span>
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 hidden sm:block">
                Sincronizado em tempo real com a Cozinha e Clientes
              </span>
            </div>
          </div>

          {/* Center: GIANT DIGITAL CLOCK (MATCHING KITCHEN DISPLAY) */}
          <div className="font-display font-black text-xl sm:text-2xl text-[#1C1C1C] tracking-wider px-4 py-1 rounded-xl bg-[#F8F6F0] border border-[#CD9C20]/30 shadow-xs">
            <span suppressHydrationWarning>
              {currentTime.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* Period Filter Pills */}
            <div className="flex items-center gap-1 bg-[#F8F6F0] p-1 rounded-xl border border-[#CD9C20]/30 text-xs font-semibold">
              {(['today', 'week', 'month', 'all'] as PeriodFilter[]).map((period) => {
                const isActive = periodFilter === period;
                const count = periodSalesCounts[period];
                return (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setPeriodFilter(period)}
                    title={`Filtrar todo o sistema por: ${getPeriodLabel(period)} (${count} vendas)`}
                    className={`px-2.5 py-1 rounded-lg text-xs font-display font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-[#161616] text-[#F5CB5C] shadow-sm ring-1 ring-[#CD9C20]'
                        : 'text-neutral-600 hover:text-black hover:bg-white/60'
                    }`}
                  >
                    <span>
                      {period === 'today' && 'Hoje'}
                      {period === 'week' && '7d'}
                      {period === 'month' && 'Mês'}
                      {period === 'all' && 'Tudo'}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                        isActive
                          ? 'bg-[#CD9C20]/25 text-[#F5CB5C]'
                          : 'bg-black/5 text-neutral-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Manual Refresh */}
            <button
              onClick={() => fetchMasterData(true)}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white border border-[#CD9C20]/30 hover:bg-[#F8F6F0] text-neutral-700 transition-colors shadow-xs"
              title="Atualizar dados agora"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#CD9C20]' : ''}`} />
            </button>
          </div>
        </header>

        {/* Action success alert */}
        {actionSuccess && (
          <div className="m-4 mb-0 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="p-4 sm:p-8 space-y-6">
            {/* Top 4 Consolidated KPI Cards (Site 0% Taxa + iFood 26,2% Taxa) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Receita Bruta Geral (Site + iFood) */}
              <div className="bg-white border border-[#CD9C20]/30 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#CD9C20]/60 transition-all relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#CD9C20]" />
                <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold mb-1">
                  <span className="font-display uppercase tracking-wider text-[11px]">RECEITA BRUTA ({getPeriodLabel(periodFilter).split(' ')[0].toUpperCase()})</span>
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    Site + iFood
                  </span>
                </div>
                <div className="font-extrabold text-2xl text-[#161616] mt-1 font-display">
                  R$ {realFinancials.grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-neutral-600 mt-1.5 pt-1.5 border-t border-neutral-100 flex items-center justify-between font-mono">
                  <span>Site: R$ {realFinancials.siteStats.grossRevenue.toFixed(2)}</span>
                  <span>iFood: R$ {realFinancials.ifoodStats.grossRevenue.toFixed(2)}</span>
                </div>
              </div>

              {/* Card 2: Lucro Líquido Real Geral (CMV Deduzido + 26,2% apenas no iFood) */}
              <div className="bg-white border border-[#CD9C20]/30 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#CD9C20]/60 transition-all relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold mb-1">
                  <span className="font-display uppercase tracking-wider text-[11px]">LUCRO LÍQUIDO REAL</span>
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {realFinancials.marginPercent}% Margem
                  </span>
                </div>
                <div className="font-extrabold text-2xl text-emerald-700 mt-1 font-display">
                  R$ {realFinancials.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-neutral-600 mt-1.5 pt-1.5 border-t border-neutral-100 flex items-center justify-between font-mono">
                  <span>CMV: -R$ {realFinancials.productionCost.toFixed(2)}</span>
                  <span className="text-amber-700">Taxa iFood: -R$ {realFinancials.ifoodFeeTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Card 3: Ticket Médio Geral */}
              <div className="bg-white border border-[#CD9C20]/30 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#CD9C20]/60 transition-all relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#F5CB5C]" />
                <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold mb-1">
                  <span className="font-display uppercase tracking-wider text-[11px]">TICKET MÉDIO GERAL</span>
                  <span className="text-[#CD9C20] bg-[#F8F6F0] border border-[#CD9C20]/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    Médio
                  </span>
                </div>
                <div className="font-extrabold text-2xl text-[#161616] mt-1 font-display">
                  R$ {realFinancials.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-neutral-500 mt-1.5 pt-1.5 border-t border-neutral-100">
                  Média por venda (Site + iFood)
                </div>
              </div>

              {/* Card 4: Total de Vendas (Site + iFood) */}
              <div className="bg-white border border-[#CD9C20]/30 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#CD9C20]/60 transition-all relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#161616]" />
                <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold mb-1">
                  <span className="font-display uppercase tracking-wider text-[11px]">TOTAL DE VENDAS</span>
                  <span className="text-[#161616] bg-[#F8F6F0] border border-[#CD9C20]/40 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {realFinancials.completedCount} Concluídas
                  </span>
                </div>
                <div className="font-extrabold text-2xl text-[#161616] mt-1 font-display">
                  {realFinancials.totalOrders}
                </div>
                <div className="text-[11px] text-neutral-600 mt-1.5 pt-1.5 border-t border-neutral-100 flex items-center justify-between font-bold">
                  <span className="text-emerald-700">{realFinancials.siteStats.ordersCount} pelo Site (0%)</span>
                  <span className="text-[#161616]">{realFinancials.ifoodStats.ordersCount} pelo iFood (26,2%)</span>
                </div>
              </div>
            </div>

            {/* SEPARAÇÃO CLARA DE CANAIS: COMPRAS PELO SITE (SEM TAXA 26,2%) vs. COMPRAS PELO IFOOD (COM TAXA 26,2%) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Canal 1: Compras pelo Site (Sem Taxa 26,2% do iFood) */}
              <div className="bg-white border-2 border-emerald-500/40 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 block">
                        CANAL DIRETO • ZERO TAXA DE APLICATIVO (0%)
                      </span>
                      <h3 className="font-extrabold text-base text-[#161616] font-display uppercase">
                        Compras pelo Site (Sem Taxa de 26,2% do iFood)
                      </h3>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                    {realFinancials.siteStats.ordersCount} {realFinancials.siteStats.ordersCount === 1 ? 'venda' : 'vendas'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-[#F8F6F0] p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Receita Bruta Site</span>
                    <strong className="text-sm sm:text-base font-black text-slate-900 font-mono">
                      R$ {realFinancials.siteStats.grossRevenue.toFixed(2)}
                    </strong>
                    <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">Taxa iFood: R$ 0,00</span>
                  </div>
                  <div className="bg-[#F8F6F0] p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Custo Insumos (CMV)</span>
                    <strong className="text-sm sm:text-base font-black text-slate-700 font-mono">
                      - R$ {realFinancials.siteStats.productionCost.toFixed(2)}
                    </strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Ficha Técnica</span>
                  </div>
                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Lucro Líquido Site</span>
                    <strong className="text-sm sm:text-base font-black text-emerald-700 font-mono">
                      R$ {realFinancials.siteStats.netProfit.toFixed(2)}
                    </strong>
                    <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">100% Livre p/ Loja</span>
                  </div>
                </div>
              </div>

              {/* Canal 2: Compras pelo iFood (Com Taxa Oficial de 26,2% do iFood) */}
              <div className="bg-white border-2 border-[#CD9C20]/60 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#161616] border border-[#CD9C20] flex items-center justify-center text-[#F5CB5C] shrink-0">
                      <Bike className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#CD9C20] block">
                        CANAL PARCEIRO • TAXA ÚNICA DE 26,2% (CMV ÷ 0,783)
                      </span>
                      <h3 className="font-extrabold text-base text-[#161616] font-display uppercase">
                        Compras pelo iFood (Com Taxa de 26,2%)
                      </h3>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#161616] text-[#F5CB5C] border border-[#CD9C20]/40 text-xs font-extrabold">
                    {realFinancials.ifoodStats.ordersCount} {realFinancials.ifoodStats.ordersCount === 1 ? 'venda' : 'vendas'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="bg-[#F8F6F0] p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Bruto iFood</span>
                    <strong className="text-sm font-black text-slate-900 font-mono">
                      R$ {realFinancials.ifoodStats.grossRevenue.toFixed(2)}
                    </strong>
                  </div>
                  <div className="bg-[#F8F6F0] p-3 rounded-xl border border-amber-200">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">Taxa iFood (26,2%)</span>
                    <strong className="text-sm font-black text-amber-700 font-mono">
                      - R$ {realFinancials.ifoodStats.ifoodFee262.toFixed(2)}
                    </strong>
                  </div>
                  <div className="bg-[#F8F6F0] p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">CMV iFood</span>
                    <strong className="text-sm font-black text-slate-700 font-mono">
                      - R$ {realFinancials.ifoodStats.productionCost.toFixed(2)}
                    </strong>
                  </div>
                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Lucro Real iFood</span>
                    <strong className="text-sm font-black text-emerald-700 font-mono">
                      R$ {realFinancials.ifoodStats.netProfit.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* SISTEMA DIRETO NO DASHBOARD PARA DAR BAIXA DE QUANTAS VENDAS FEZ NO IFOOD NO DIA */}
            <IfoodDailyBatchWidget
              erpState={erpState}
              onSaveErpState={handleSaveErpFromDashboard}
              onNotify={(msg) => {
                setActionSuccess(msg);
                setTimeout(() => setActionSuccess(null), 5000);
              }}
              compact
              activePeriodFilter={periodFilter}
            />

            {/* Mid Section: Payment Methods + Delivery Neighborhoods + Real Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Payment Methods Breakdown */}
              <div className="bg-white border border-[#CD9C20]/30 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
                  <h3 className="font-bold text-sm text-[#161616] font-display uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#CD9C20]" />
                    <span>MÉTODOS DE PAGAMENTO</span>
                  </h3>
                  <span className="text-[10px] text-[#CD9C20] font-bold font-mono">100% Real</span>
                </div>

                <div className="space-y-4">
                  {/* PIX */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-xs" />
                        PIX
                      </span>
                      <span className="font-bold text-[#161616]">
                        {realFinancials.pixShare}% • R$ {realFinancials.paymentMap.pix.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${realFinancials.pixShare}%` }} />
                    </div>
                  </div>

                  {/* Cartão */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-xs" />
                        Cartão de Crédito / Débito
                      </span>
                      <span className="font-bold text-[#161616]">
                        {realFinancials.cardShare}% • R$ {realFinancials.paymentMap.card.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${realFinancials.cardShare}%` }} />
                    </div>
                  </div>

                  {/* Dinheiro */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-xs" />
                        Dinheiro
                      </span>
                      <span className="font-bold text-[#161616]">
                        {realFinancials.cashShare}% • R$ {realFinancials.paymentMap.cash.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${realFinancials.cashShare}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 p-3 bg-[#F8F6F0] border border-[#CD9C20]/25 rounded-xl text-xs text-neutral-600">
                  Total faturado no período: <strong className="text-[#161616]">R$ {realFinancials.grossRevenue.toFixed(2)}</strong>
                </div>
              </div>

              {/* Delivery Neighborhoods Ranking */}
              <div className="bg-white border border-[#CD9C20]/30 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
                  <h3 className="font-bold text-sm text-[#161616] font-display uppercase tracking-wider flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#CD9C20]" />
                    <span>BAIRROS COM MAIS PEDIDOS</span>
                  </h3>
                  <span className="text-[10px] text-[#CD9C20] font-bold font-mono">Logística</span>
                </div>

                {realFinancials.topHoods.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span>Nenhum pedido com entrega registrado ainda.</span>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {realFinancials.topHoods.slice(0, 5).map((hood, idx) => (
                      <div key={hood.name}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-700 truncate max-w-[160px]">
                            {idx + 1}. {hood.name}
                          </span>
                          <span className="font-bold text-slate-900">
                            {hood.count} ped. ({hood.percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-600 rounded-full" style={{ width: `${Math.max(hood.percent, 8)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Menu Stock Overview */}
              <div className="bg-white border border-[#CD9C20]/30 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
                    <h3 className="font-bold text-sm text-[#161616] font-display uppercase tracking-wider flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 text-[#CD9C20]" />
                      <span>ESTOQUE RÁPIDO & CMV</span>
                    </h3>
                    <button
                      onClick={() => handleSwitchTab('calculos')}
                      className="text-xs text-[#CD9C20] font-bold hover:underline"
                    >
                      Ver Todos →
                    </button>
                  </div>

                  <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
                    Altere a disponibilidade do item no site em tempo real e edite o custo unitário.
                  </p>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {menuItems.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 bg-[#F8F6F0] border border-[#CD9C20]/20 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="truncate mr-2">
                          <p className="font-bold text-[#161616] truncate">{item.name}</p>
                          <p className="text-[11px] text-neutral-500">
                            Preço: R$ {item.price.toFixed(2)} | Custo: R$ {(item.costPrice || item.price * 0.35).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1 rounded-lg hover:bg-white text-neutral-700 border border-transparent hover:border-[#CD9C20]/30 transition-all"
                            title="Editar Custo e Preço"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStock(item.id, item.isAvailable)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                              item.isAvailable === 0
                                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            }`}
                          >
                            {item.isAvailable === 0 ? 'OFF' : 'ON'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-neutral-100 text-center">
                  <button
                    onClick={() => handleSwitchTab('calculos')}
                    className="w-full py-2 bg-[#F8F6F0] hover:bg-[#161616] text-[#161616] hover:text-[#F5CB5C] border border-[#CD9C20]/30 text-xs font-bold font-display uppercase tracking-wider rounded-xl transition-all"
                  >
                    Abrir Cardápio, Estoque &amp; Cálculos
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Section: Live Orders Pipeline */}
            <div className="bg-white border border-[#CD9C20]/30 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
                <div>
                  <h3 className="font-bold text-base text-[#161616] font-display uppercase tracking-wider flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-[#CD9C20]" />
                    <span>ÚLTIMOS PEDIDOS EM TEMPO REAL</span>
                  </h3>
                  <span className="text-xs text-neutral-500">
                    Sincronizados com a chapa da Cozinha
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-[#CD9C20] font-bold hover:underline"
                >
                  Ver Painel KDS Completo →
                </button>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-600 text-sm">Nenhum pedido direto do site neste período ({getPeriodLabel(periodFilter)}).</p>
                  <p className="text-slate-400 mt-1">Altere o filtro acima (Hoje, 7d, Mês, Tudo) ou faça um pedido no site para visualizá-lo aqui.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Pedido</th>
                        <th className="py-2.5 px-3">Cliente</th>
                        <th className="py-2.5 px-3">Total</th>
                        <th className="py-2.5 px-3">Pagamento</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Horário</th>
                        <th className="py-2.5 px-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.slice(0, 6).map((order) => {
                        const statusObj = KDS_STATUSES.find(s => s.key === order.status);
                        const isCompleted = order.status === 'completed';
                        return (
                          <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3 font-bold font-mono text-slate-900">
                              #{order.orderNumber}
                            </td>
                            <td className="py-3 px-3">
                              <p className="font-semibold text-slate-800">{order.customerName}</p>
                              <p className="text-[11px] text-slate-400">{order.customerPhone}</p>
                            </td>
                            <td className="py-3 px-3 font-bold text-slate-900">
                              R$ {(order.total / 100).toFixed(2)}
                            </td>
                            <td className="py-3 px-3 uppercase text-[11px] font-medium text-slate-600">
                              {order.paymentMethod}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusObj?.color || 'bg-slate-100 text-slate-700 border-slate-300'}`}>
                                {statusObj?.label || order.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-400 text-[11px]">
                              {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => setInspectingOrder(order)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
                              >
                                Ver Ficha
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT & KDS SYNC */}
        {activeTab === 'orders' && (
          <div className="p-4 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 uppercase">
                  Fila de Pedidos & Controle de Produção
                </h3>
                <p className="text-xs text-slate-500">
                  Visualize todas as comandas e atualize o status diretamente para o cliente e cozinha.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/cozinha"
                  target="_blank"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Flame className="w-4 h-4" />
                  <span>Modo Cozinha (KDS Chapa)</span>
                </Link>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Pedido</th>
                      <th className="py-3 px-3">Cliente</th>
                      <th className="py-3 px-3">Endereço / Bairro</th>
                      <th className="py-3 px-3">Itens</th>
                      <th className="py-3 px-3">Total</th>
                      <th className="py-3 px-3">Status Atual</th>
                      <th className="py-3 px-3 text-right">Avançar Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((order) => {
                      const statusObj = KDS_STATUSES.find(s => s.key === order.status);
                      let items: any[] = [];
                      try {
                        items = JSON.parse(order.itemsJson);
                      } catch {
                        items = [];
                      }

                      return (
                        <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 font-bold font-mono text-slate-900">
                            #{order.orderNumber}
                          </td>
                          <td className="py-3 px-3">
                            <p className="font-bold text-slate-900">{order.customerName}</p>
                            <a
                              href={`https://wa.me/55${order.customerPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-emerald-700 font-medium hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{order.customerPhone}</span>
                            </a>
                          </td>
                          <td className="py-3 px-3 text-slate-600 max-w-[200px] truncate text-[11px]">
                            {order.customerAddress || 'Retirada no Templo'}
                          </td>
                          <td className="py-3 px-3">
                            <div className="text-[11px] text-slate-700">
                              {items.map((it, idx) => (
                                <span key={idx} className="block truncate max-w-[180px]">
                                  {it.quantity}x {it.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900">
                            R$ {(order.total / 100).toFixed(2)}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusObj?.color || 'bg-slate-100 text-slate-700'}`}>
                              {statusObj?.label || order.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {order.status === 'awaiting_payment' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'payment_confirmed')}
                                  disabled={orderStatusUpdating === order.id}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors"
                                >
                                  Validar Pago
                                </button>
                              )}
                              {order.status === 'payment_confirmed' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                                  disabled={orderStatusUpdating === order.id}
                                  className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold rounded-lg transition-colors"
                                >
                                  Para a Chapa
                                </button>
                              )}
                              {order.status === 'preparing' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                                  disabled={orderStatusUpdating === order.id}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-colors"
                                >
                                  Pronto
                                </button>
                              )}
                              {order.status === 'ready' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'out_for_delivery')}
                                  disabled={orderStatusUpdating === order.id}
                                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-lg transition-colors"
                                >
                                  Despachar
                                </button>
                              )}
                              {order.status === 'out_for_delivery' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                  disabled={orderStatusUpdating === order.id}
                                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-lg transition-colors"
                                >
                                  Concluir
                                </button>
                              )}
                              <button
                                onClick={() => setInspectingOrder(order)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg"
                              >
                                Detalhes
                              </button>
                              <button
                                onClick={() => setPrintingOrder(order)}
                                className="p-1.5 bg-[#161616] hover:bg-black text-[#F5CB5C] border border-[#CD9C20]/40 rounded-lg transition-colors"
                                title="Imprimir Comanda Térmica"
                              >
                                <Printer className="w-3.5 h-3.5 text-[#CD9C20]" />
                              </button>
                              <Link
                                href={`/comanda/${order.orderNumber}`}
                                target="_blank"
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-black rounded-lg transition-colors"
                                title="Abrir Comanda em Nova Aba"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3 (UNIFIED): CARDÁPIO, ESTOQUE, CUSTOS & IFOOD (/admin-calculos) */}
        {activeTab === 'calculos' && (
          <div className="p-4 sm:p-8 space-y-8">
            <AdminCalculosHub
              periodFilter={periodFilter}
              onPeriodFilterChange={(next) => setPeriodFilter(next)}
            />
          </div>
        )}

        {/* TAB 5: DELIVERY & GEOGRAPHY */}
        {activeTab === 'delivery' && (
          <div className="p-4 sm:p-8 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-extrabold text-lg text-slate-900 uppercase">
                Inteligência Geográfica & Logística de Entrega ({getPeriodLabel(periodFilter)})
              </h3>
              <p className="text-xs text-slate-500">
                Ranking de bairros atendidos e taxas configuradas para tomadas de decisão comercial.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ranking por Volume */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h4 className="font-bold text-sm text-slate-900 uppercase mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>Ranking de Volume por Bairro</span>
                </h4>

                <div className="space-y-3">
                  {Object.entries(NEIGHBORHOOD_FEES).map(([name, fee]) => {
                    const matchedCount = filteredOrders.filter(o => 
                      o.customerAddress && o.customerAddress.toLowerCase().includes(name.split('/')[0].trim().toLowerCase())
                    ).length;

                    return (
                      <div key={name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{name}</p>
                          <p className="text-[11px] text-slate-400">Taxa de Entrega: R$ {fee.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-slate-900 text-sm">{matchedCount}</span>
                          <span className="text-[10px] text-slate-400 block">pedidos</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Taxas e Prazos */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h4 className="font-bold text-sm text-slate-900 uppercase mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Tempo Médio & Regras de Despacho</span>
                </h4>

                <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                  <div className="p-4 bg-amber-50/60 border border-amber-200/60 rounded-xl">
                    <p className="font-bold text-slate-900 text-sm mb-1">Tempo Médio Estimado: 30 - 45 min</p>
                    <p className="text-slate-600">
                      Os pedidos entram como &quot;Aguardando Comprovante&quot; até confirmação pela equipe da cozinha no WhatsApp. Uma vez confirmados, o tempo médio de chapa é de 12 minutos.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="font-bold text-slate-900 mb-1">Rotas de Motoboys</p>
                    <p className="text-slate-500">
                      Bairros centrais (Consolação, Jardins, Bela Vista) possuem prioridade de entrega rápida.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS & SECURITY */}
        {activeTab === 'settings' && (
          <div className="p-4 sm:p-8 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-extrabold text-lg text-slate-900 uppercase">
                Segurança & Configurações da Plataforma
              </h3>
              <p className="text-xs text-slate-500">
                Status de isolamento de rotas, contas autorizadas e integridade do banco de dados Cloud SQL.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                <h4 className="font-bold text-sm text-slate-900 uppercase flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Isolamento e Controle de Acesso</span>
                </h4>

                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                  <p className="font-bold mb-1">Sessão Autenticada com Sucesso</p>
                  <p className="text-[11px] text-emerald-800">
                    O acesso a esta rota é restrito ao e-mail proprietário autorizado. Usuários sem token válido são automaticamente bloqueados e redirecionados.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Operador Atual:</span>
                    <strong className="text-slate-900">{ownerName}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Perfil:</span>
                    <strong className="text-slate-900 font-mono">super-admin</strong>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Sessão:</span>
                    <span className="text-emerald-700 font-bold">Ativa & Segura (24h)</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl transition-colors border border-rose-200"
                >
                  Encerrar Sessão no Navegador
                </button>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                <h4 className="font-bold text-sm text-slate-900 uppercase flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>Banco de Dados & Integração</span>
                </h4>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
                  <p className="font-bold text-slate-900 mb-1">Cloud SQL PostgreSQL</p>
                  <p className="text-[11px] text-slate-500">
                    Tabelas ativas: orders, menu_overrides, financial_records, users. Pedidos criados no checkout são gravados de forma persistente.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Total de Pedidos Gravados:</span>
                    <strong className="text-slate-900">{allOrders.length}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Produtos no Menu:</span>
                    <strong className="text-slate-900">{menuItems.length} itens</strong>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Painel da Cozinha (KDS):</span>
                    <strong className="text-emerald-700 font-bold">Conectado (Sync 4s)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: EDIT PRODUCT COST & SELLING PRICE */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm uppercase">Editar Preço e Custo (CMV)</h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProductEdit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Descrição
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Preço de Venda (R$)
                  </label>
                  <input
                    type="text"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                    placeholder="34.90"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl text-slate-900 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Custo Insumos CMV (R$)
                  </label>
                  <input
                    type="text"
                    value={editCostPrice}
                    onChange={(e) => setEditCostPrice(e.target.value)}
                    required
                    placeholder="12.40"
                    className="w-full py-2 px-3 bg-rose-50/50 border border-rose-200 focus:border-rose-500 rounded-xl text-rose-800 font-bold outline-none"
                  />
                </div>
              </div>

              {/* Live Margin Calculation Preview */}
              {(() => {
                const p = parseFloat(editPrice.replace(',', '.')) || 0;
                const c = parseFloat(editCostPrice.replace(',', '.')) || 0;
                const prof = Math.max(0, p - c);
                const marg = p > 0 ? ((prof / p) * 100).toFixed(1) : '0.0';

                return (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-800 font-bold uppercase block">Lucro Bruto Unitário</span>
                      <span className="text-base font-extrabold text-emerald-900">R$ {prof.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-800 font-bold uppercase block">Margem de Lucro</span>
                      <span className="text-base font-extrabold text-emerald-900">{marg}%</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  {isSavingProduct ? (
                    <span>Salvando...</span>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Salvar Alterações</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ORDER DETAILS (DRILL DOWN) */}
      {inspectingOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase">Ficha do Pedido</span>
                <h3 className="font-extrabold text-slate-900 text-base font-mono">
                  #{inspectingOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setInspectingOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              {/* Customer Info */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                <p className="font-bold text-slate-900 text-sm">{inspectingOrder.customerName}</p>
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{inspectingOrder.customerPhone}</span>
                </p>
                <p className="text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>{inspectingOrder.customerAddress || 'Retirada no Templo'}</span>
                </p>
              </div>

              {/* Items List */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-2">
                  Itens Consumidos
                </span>
                {(() => {
                  let items: any[] = [];
                  try {
                    items = JSON.parse(inspectingOrder.itemsJson);
                  } catch {
                    items = [];
                  }
                  return (
                    <div className="space-y-2">
                      {items.map((it, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-start">
                          <div>
                            <span className="font-bold text-slate-900">{it.quantity}x {it.name}</span>
                            {it.doneness && <p className="text-[10px] text-amber-700">Ponto: {it.doneness}</p>}
                            {it.notes && <p className="text-[10px] text-slate-500 italic">Obs: {it.notes}</p>}
                          </div>
                          <span className="font-bold text-slate-800">
                            R$ {(it.totalPrice || it.unitPrice * it.quantity || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Financial Breakdown */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>R$ {(inspectingOrder.subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxa de Entrega:</span>
                  <span>R$ {(inspectingOrder.deliveryFee / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total do Pedido:</span>
                  <span>R$ {(inspectingOrder.total / 100).toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPrintingOrder(inspectingOrder)}
                    className="px-3.5 py-2 bg-[#161616] hover:bg-black text-[#F5CB5C] border border-[#CD9C20]/40 font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#CD9C20]" />
                    <span>Imprimir Comanda</span>
                  </button>
                  <Link
                    href={`/comanda/${inspectingOrder.orderNumber}`}
                    target="_blank"
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1 transition-colors"
                    title="Abrir comanda em página inteira sem iframe"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/55${inspectingOrder.customerPhone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp Cliente</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setInspectingOrder(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thermal Receipt Print Modal & Hidden Print Area */}
      {printingOrder && (
        <ThermalReceiptModal
          order={printingOrder}
          onClose={() => setPrintingOrder(null)}
        />
      )}
    </div>
  );
}
