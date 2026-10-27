'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  CreditCard,
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
} from 'lucide-react';
import { SpartanHelmetIcon, ParthenonIcon } from '@/components/GreekOrnament';
import { MENU_ITEMS, NEIGHBORHOOD_FEES } from '@/lib/data';
import { MenuItem } from '@/types/burger';
import { auth, googleAuthProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { KDS_STATUSES } from '@/components/OrderLiveTracker';

type AdminNavTab = 'dashboard' | 'orders' | 'menu' | 'financials' | 'delivery' | 'settings';
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

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [ownerName, setOwnerName] = useState('Gabriel Olímpio');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Navigation & Filters
  const [activeTab, setActiveTab] = useState<AdminNavTab>('dashboard');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');
  const [globalSearch, setGlobalSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Master Data from Cloud SQL & API
  const [loadingData, setLoadingData] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adminData, setAdminData] = useState<any | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

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

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const emailTrimmed = emailInput.trim();
    const passTrimmed = passcodeInput.trim();

    if (!emailTrimmed || !passTrimmed) {
      setAuthError('Por favor, informe seu e-mail e chave de acesso.');
      return;
    }

    setIsAuthenticating(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailTrimmed,
          passcode: passTrimmed,
          ownerName: ownerName.trim() || 'Gabriel Olímpio',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.token) {
          localStorage.setItem('teseu_admin_token', data.token);
        }
        setIsAuthenticated(true);
        setOwnerEmail(data.email);
        if (data.ownerName) setOwnerName(data.ownerName);
        setPasscodeInput('');
        fetchMasterData();
      } else {
        setAuthError(data.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
      }
    } catch {
      setAuthError('Falha ao comunicar com o servidor de autenticação.');
    } finally {
      setIsAuthenticating(false);
    }
  };

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

    const now = new Date();
    return allOrders.filter((order) => {
      const orderDate = new Date(order.createdAt || now);
      if (periodFilter === 'today') {
        return (
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      if (periodFilter === 'week') {
        const diffMs = now.getTime() - orderDate.getTime();
        return diffMs <= 7 * 24 * 60 * 60 * 1000;
      }
      if (periodFilter === 'month') {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      if (periodFilter === 'year') {
        return orderDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [allOrders, periodFilter]);

  // Real financial aggregates
  const realFinancials = useMemo(() => {
    let grossRev = 0;
    let prodCost = 0;
    let completedCount = 0;

    const paymentMap: Record<string, { count: number; total: number }> = {
      pix: { count: 0, total: 0 },
      card: { count: 0, total: 0 },
      cash: { count: 0, total: 0 },
    };

    const neighborhoodMap: Record<string, { count: number; revenue: number }> = {};

    filteredOrders.forEach((o) => {
      const orderTotal = (o.total || 0) / 100;
      grossRev += orderTotal;

      // Production cost & gross profit
      if (o.status === 'completed' || o.productionCost) {
        completedCount++;
        const cost = o.productionCost ? o.productionCost / 100 : Math.round(orderTotal * 0.35 * 100) / 100;
        prodCost += cost;
      } else {
        // Estimated CMV for active orders
        prodCost += Math.round(orderTotal * 0.35 * 100) / 100;
      }

      // Payment method
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

      // Neighborhood mapping
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

    const netProfit = Math.max(0, grossRev - prodCost);
    const avgTicket = filteredOrders.length > 0 ? grossRev / filteredOrders.length : 0;
    const marginPercent = grossRev > 0 ? ((netProfit / grossRev) * 100).toFixed(1) : '0.0';

    const totalPayRev = grossRev > 0 ? grossRev : 1;
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
      netProfit,
      avgTicket,
      marginPercent,
      totalOrders: filteredOrders.length,
      completedCount,
      paymentMap,
      pixShare,
      cardShare,
      cashShare,
      topHoods,
    };
  }, [filteredOrders]);

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
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-white">
        <div className="w-full max-w-md p-8 bg-white border border-slate-200 rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.05)] text-center relative overflow-hidden">
          {/* Subtle top brand bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

          {/* Logo */}
          <div className="relative h-12 w-44 mx-auto mb-4">
            <Image
              src="/logo.png"
              alt="Teseu Burger"
              fill
              priority
              referrerPolicy="no-referrer"
              className="object-contain"
              sizes="176px"
            />
          </div>

          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-xs">
            <SpartanHelmetIcon size={24} color="#d97706" />
          </div>

          <span className="text-[11px] font-bold tracking-[0.2em] text-amber-600 uppercase block font-sans">
            ACESSO RESTRITO • SUPER-ADMIN
          </span>

          <h2 className="font-extrabold text-2xl tracking-tight text-slate-900 mt-1">
            Painel Administrativo
          </h2>

          <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-xs mx-auto">
            Área de controle exclusivo da gestão. Insira suas credenciais autorizadas para continuar.
          </p>

          {/* Google Sign-In */}
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isAuthenticating}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-amber-500 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-xs"
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

            <div className="flex items-center gap-2 my-2 text-[10px] text-slate-400 uppercase tracking-widest font-medium">
              <div className="h-px bg-slate-200 flex-1" />
              <span>ou login por credencial</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left mt-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1">
                E-mail do Administrador
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@dominio.com"
                  required
                  className="w-full py-2.5 pl-3.5 pr-9 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-xl text-slate-900 text-xs outline-none transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Senha / Chave de Segurança
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full py-2.5 pl-3.5 pr-10 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-xl text-slate-900 text-xs outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              {isAuthenticating ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Validando credenciais...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Acessar Painel Admin</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center">
            <Link
              href="/"
              className="text-xs font-medium text-slate-500 hover:text-amber-600 transition-colors"
            >
              ← Voltar à Loja
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: Main Admin Dashboard (#F5F5F5)
  // Clean, high-readability, inspired by reference
  // ==========================================
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex font-sans selection:bg-amber-500 selection:text-white">
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-64 shrink-0 bg-white border-r border-slate-200 text-slate-800 flex flex-col justify-between p-4 hidden md:flex sticky top-0 h-screen z-30 shadow-xs">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <SpartanHelmetIcon size={22} color="#ffffff" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-wider uppercase text-slate-900 leading-tight">
                TESEU BURGER
              </h1>
              <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase block">
                ADMIN MASTER
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'orders', label: 'Pedidos / KDS', icon: ClipboardList, badge: allOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length },
              { id: 'menu', label: 'Cardápio & Estoque (CMV)', icon: UtensilsCrossed },
              { id: 'financials', label: 'Financeiro & Lucro', icon: CreditCard },
              { id: 'delivery', label: 'Bairros & Logística', icon: Truck },
              { id: 'settings', label: 'Configurações', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminNavTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white text-amber-600' : 'bg-amber-100 text-amber-700'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <Link
            href="/cozinha"
            target="_blank"
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-orange-600" />
              <span>Abrir Painel da Cozinha</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xs">
          {/* Title & Mobile Selector */}
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as AdminNavTab)}
                className="py-1.5 px-2.5 rounded-lg text-xs font-bold uppercase bg-white text-slate-800 border border-slate-300"
              >
                <option value="dashboard">Dashboard</option>
                <option value="orders">Pedidos / KDS</option>
                <option value="menu">Cardápio & Estoque</option>
                <option value="financials">Financeiro</option>
                <option value="delivery">Bairros</option>
                <option value="settings">Configurações</option>
              </select>
            </div>
            <div>
              <h2 className="font-extrabold text-lg sm:text-xl uppercase tracking-wider text-slate-900">
                {activeTab === 'dashboard' && 'PAINEL DE ADMINISTRAÇÃO'}
                {activeTab === 'orders' && 'CONTROLE DE PEDIDOS & KDS'}
                {activeTab === 'menu' && 'GESTÃO DE CARDÁPIO & CMV'}
                {activeTab === 'financials' && 'RELATÓRIO FINANCEIRO'}
                {activeTab === 'delivery' && 'LOGÍSTICA POR BAIRRO'}
                {activeTab === 'settings' && 'CONFIGURAÇÕES DA LOJA'}
              </h2>
              <span className="text-[11px] text-slate-500 hidden sm:block">
                Sincronizado em tempo real com a Cozinha e Clientes
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Buscar pedido, cliente, produto..."
                className="w-full py-2 pl-9 pr-4 rounded-xl text-xs bg-slate-50 text-slate-800 border border-slate-200 focus:border-amber-500 focus:bg-white outline-none transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* Period Filter Dropdown */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
              {(['today', 'week', 'month', 'all'] as PeriodFilter[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setPeriodFilter(period)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    periodFilter === period
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {period === 'today' && 'Hoje'}
                  {period === 'week' && '7d'}
                  {period === 'month' && 'Mês'}
                  {period === 'all' && 'Tudo'}
                </button>
              ))}
            </div>

            {/* Manual Refresh */}
            <button
              onClick={() => fetchMasterData(true)}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
              title="Atualizar dados agora"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
            </button>

            {/* Profile */}
            <div className="flex items-center gap-2 pl-2 pr-3 py-1 bg-white border border-slate-200 rounded-xl text-slate-800 shadow-xs">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[11px] font-bold leading-tight text-slate-900">
                  {ownerName || 'Gabriel Olímpio'}
                </div>
                <span className="text-[9px] text-slate-400 block font-mono leading-none">
                  {ownerEmail || 'Super-Admin'}
                </span>
              </div>
            </div>
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
            {/* Top 4 KPI Cards (Exatamente como na imagem de referência) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Receita Bruta */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                  <span>RECEITA BRUTA</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    Vendas
                  </span>
                </div>
                <div className="font-extrabold text-2xl text-slate-900 mt-1">
                  R$ {realFinancials.grossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Calculado sobre {realFinancials.totalOrders} pedidos</span>
                </div>
              </div>

              {/* Card 2: Lucro Líquido Real (CMV Deduzido) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                  <span>LUCRO REAL (CMV DEDUZIDO)</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {realFinancials.marginPercent}% Margem
                  </span>
                </div>
                <div className="font-extrabold text-2xl text-emerald-700 mt-1">
                  R$ {realFinancials.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Custo Produção: R$ {realFinancials.productionCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Card 3: Ticket Médio */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                  <span>TICKET MÉDIO</span>
                  <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    Médio
                  </span>
                </div>
                <div className="font-extrabold text-2xl text-slate-900 mt-1">
                  R$ {realFinancials.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Por pedido finalizado
                </div>
              </div>

              {/* Card 4: Total de Pedidos */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                  <span>TOTAL DE PEDIDOS</span>
                  <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {realFinancials.completedCount} Concluídos
                  </span>
                </div>
                <div className="font-extrabold text-2xl text-slate-900 mt-1">
                  {realFinancials.totalOrders}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {allOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length} em andamento na chapa
                </div>
              </div>
            </div>

            {/* Mid Section: Payment Methods + Delivery Neighborhoods + Real Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Payment Methods Breakdown */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    <span>MÉTODOS DE PAGAMENTO</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold">100% Real</span>
                </div>

                <div className="space-y-4">
                  {/* PIX */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        PIX
                      </span>
                      <span className="font-bold text-slate-900">
                        {realFinancials.pixShare}% • R$ {realFinancials.paymentMap.pix.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${realFinancials.pixShare}%` }} />
                    </div>
                  </div>

                  {/* Cartão */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                        Cartão de Crédito / Débito
                      </span>
                      <span className="font-bold text-slate-900">
                        {realFinancials.cardShare}% • R$ {realFinancials.paymentMap.card.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${realFinancials.cardShare}%` }} />
                    </div>
                  </div>

                  {/* Dinheiro */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                        Dinheiro
                      </span>
                      <span className="font-bold text-slate-900">
                        {realFinancials.cashShare}% • R$ {realFinancials.paymentMap.cash.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${realFinancials.cashShare}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600">
                  Total faturado no período: <strong className="text-slate-900">R$ {realFinancials.grossRevenue.toFixed(2)}</strong>
                </div>
              </div>

              {/* Delivery Neighborhoods Ranking */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-600" />
                    <span>BAIRROS COM MAIS PEDIDOS</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold">Logística</span>
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
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                      <span>ESTOQUE RÁPIDO & CMV</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('menu')}
                      className="text-xs text-amber-600 font-semibold hover:underline"
                    >
                      Ver Todos →
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                    Altere a disponibilidade do item no site em tempo real e edite o custo unitário.
                  </p>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {menuItems.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="truncate mr-2">
                          <p className="font-bold text-slate-900 truncate">{item.name}</p>
                          <p className="text-[11px] text-slate-500">
                            Preço: R$ {item.price.toFixed(2)} | Custo: R$ {(item.costPrice || item.price * 0.35).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1 rounded-lg hover:bg-slate-200 text-slate-600"
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

                <div className="pt-3 mt-3 border-t border-slate-100 text-center">
                  <button
                    onClick={() => setActiveTab('menu')}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    Gerenciar Cardápio Completo
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Section: Live Orders Pipeline */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-amber-600" />
                    <span>ÚLTIMOS PEDIDOS EM TEMPO REAL</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    Sincronizados com a chapa da Cozinha
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-amber-600 font-semibold hover:underline"
                >
                  Ver Painel KDS Completo →
                </button>
              </div>

              {allOrders.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-600 text-sm">Nenhum pedido no banco de dados.</p>
                  <p className="text-slate-400 mt-1">Faça um pedido de teste no site para visualizá-lo aqui e na cozinha.</p>
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
                      {allOrders.slice(0, 6).map((order) => {
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
                    {allOrders.map((order) => {
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
                                Ver Detalhes
                              </button>
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

        {/* TAB 3: MENU MANAGEMENT & COST (CMV) EDITING */}
        {activeTab === 'menu' && (
          <div className="p-4 sm:p-8 space-y-6">
            {/* Header with Search and Category filters */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 uppercase">
                    Gestão de Cardápio, Estoque & Custos (CMV)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Defina o custo de cada produto para calcular o lucro bruto real com precisão matemática.
                  </p>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="Filtrar produtos..."
                    className="w-full py-2 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-amber-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Categories */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['all', 'legends', 'smash', 'especiais', 'combos', 'sides', 'bebidas', 'sobremesas'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl uppercase font-bold text-[11px] whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'all' && 'Todos os Itens'}
                    {cat === 'legends' && 'As Lendas'}
                    {cat === 'smash' && 'Smashes'}
                    {cat === 'especiais' && 'Especiais'}
                    {cat === 'combos' && 'Combos'}
                    {cat === 'sides' && 'Acompanhamentos'}
                    {cat === 'bebidas' && 'Bebidas'}
                    {cat === 'sobremesas' && 'Sobremesas'}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Table */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Produto</th>
                      <th className="py-3 px-3">Categoria</th>
                      <th className="py-3 px-3">Preço Venda</th>
                      <th className="py-3 px-3">Custo Unitário (CMV)</th>
                      <th className="py-3 px-3">Lucro Unitário</th>
                      <th className="py-3 px-3">Margem %</th>
                      <th className="py-3 px-3">Status Estoque</th>
                      <th className="py-3 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedMenuItems.map((item) => {
                      const cost = item.costPrice !== undefined ? item.costPrice : Math.round(item.price * 0.35 * 100) / 100;
                      const unitProfit = Math.max(0, item.price - cost);
                      const margin = item.price > 0 ? ((unitProfit / item.price) * 100).toFixed(1) : '0.0';
                      const isSoldOut = item.isAvailable === 0;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3">
                            <p className="font-bold text-slate-900">{item.name}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
                          </td>
                          <td className="py-3 px-3 uppercase text-[10px] font-bold text-slate-500">
                            {item.category}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900">
                            R$ {item.price.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 font-bold text-rose-700 bg-rose-50/50 rounded-lg">
                            R$ {cost.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 font-bold text-emerald-700 bg-emerald-50/50 rounded-lg">
                            R$ {unitProfit.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 font-extrabold text-slate-900">
                            {margin}%
                          </td>
                          <td className="py-3 px-3">
                            <button
                              type="button"
                              onClick={() => handleToggleStock(item.id, item.isAvailable)}
                              className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                                isSoldOut
                                  ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${isSoldOut ? 'bg-rose-600' : 'bg-emerald-600'}`} />
                              <span>{isSoldOut ? 'Esgotado (OFF)' : 'Em Estoque (ON)'}</span>
                            </button>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => openEditModal(item)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 ml-auto"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                              <span>Editar Custo & Preço</span>
                            </button>
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

        {/* TAB 4: FINANCIALS & PROFIT REPORT */}
        {activeTab === 'financials' && (
          <div className="p-4 sm:p-8 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-extrabold text-lg text-slate-900 uppercase">
                Demonstrativo de Resultados Financeiros
              </h3>
              <p className="text-xs text-slate-500">
                Auditoria de receita bruta, deduções de custo de mercadoria vendida (CMV) e lucro operacional real.
              </p>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-500 uppercase">Receita Bruta Acumulada</span>
                <p className="font-black text-2xl text-slate-900 mt-1">
                  R$ {realFinancials.grossRevenue.toFixed(2)}
                </p>
                <span className="text-[11px] text-slate-400">Total transacionado</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-500 uppercase">Custo Total de Produção (CMV)</span>
                <p className="font-black text-2xl text-rose-700 mt-1">
                  R$ {realFinancials.productionCost.toFixed(2)}
                </p>
                <span className="text-[11px] text-slate-400">Insumos, pães, carnes e embalagens</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-500 uppercase">Lucro Líquido Real</span>
                <p className="font-black text-2xl text-emerald-700 mt-1">
                  R$ {realFinancials.netProfit.toFixed(2)}
                </p>
                <span className="text-[11px] text-emerald-600 font-bold">Margem líquida de {realFinancials.marginPercent}%</span>
              </div>
            </div>

            {/* Financial Records List from completed orders */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h4 className="font-bold text-sm text-slate-900 uppercase mb-3">
                Histórico de Pedidos Concluídos com Auditoria Financeira
              </h4>

              {allOrders.filter(o => o.status === 'completed').length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <span>Nenhum pedido marcado como &quot;Concluído&quot; ainda. Na Cozinha ou na aba Pedidos, conclua um pedido para gravar o registro de lucro.</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Pedido</th>
                        <th className="py-2.5 px-3">Cliente</th>
                        <th className="py-2.5 px-3">Receita Bruta</th>
                        <th className="py-2.5 px-3">Custo Produção</th>
                        <th className="py-2.5 px-3">Lucro Líquido</th>
                        <th className="py-2.5 px-3">Margem</th>
                        <th className="py-2.5 px-3">Pagamento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allOrders.filter(o => o.status === 'completed').map((order) => {
                        const rev = order.total / 100;
                        const cost = order.productionCost ? order.productionCost / 100 : rev * 0.35;
                        const profit = order.grossProfit ? order.grossProfit / 100 : rev - cost;
                        const margin = rev > 0 ? `${((profit / rev) * 100).toFixed(1)}%` : '0%';

                        return (
                          <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-slate-900">
                              #{order.orderNumber}
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-800">
                              {order.customerName}
                            </td>
                            <td className="py-3 px-3 font-bold text-slate-900">
                              R$ {rev.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-rose-700 font-semibold">
                              R$ {cost.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-emerald-700 font-extrabold">
                              R$ {profit.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 font-bold text-slate-800">
                              {order.profitMargin || margin}
                            </td>
                            <td className="py-3 px-3 uppercase text-slate-600">
                              {order.paymentMethod}
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

        {/* TAB 5: DELIVERY & GEOGRAPHY */}
        {activeTab === 'delivery' && (
          <div className="p-4 sm:p-8 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-extrabold text-lg text-slate-900 uppercase">
                Inteligência Geográfica & Logística de Entrega
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
                    const matchedCount = allOrders.filter(o => 
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
              <div className="flex items-center justify-end gap-2 pt-2">
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
      )}
    </div>
  );
}
