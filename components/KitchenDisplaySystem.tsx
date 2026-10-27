'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Flame,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Bike,
  PackageCheck,
  AlertCircle,
  MessageSquare,
  Search,
  Volume2,
  VolumeX,
  Lock,
  LogOut,
  Check,
  RefreshCw,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  LayoutGrid,
  HelpCircle,
  Sparkles,
  Columns3,
  ListFilter,
  CheckSquare,
  Square,
  ArrowRight,
  ExternalLink,
  Mail,
  Key,
  Eye,
  EyeOff,
} from 'lucide-react';
import { LaurelWreathIcon, SpartanHelmetIcon } from '@/components/GreekOrnament';
import { KDS_STATUSES } from '@/components/OrderLiveTracker';
import { auth, googleAuthProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';

interface KitchenOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string | null;
  deliveryMethod: string;
  paymentMethod: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes?: string | null;
  itemsJson: string;
  productionCost?: number | null;
  grossProfit?: number | null;
  profitMargin?: string | null;
  createdAt: string;
  paymentConfirmedAt?: string | null;
  preparedAt?: string | null;
  dispatchedAt?: string | null;
  completedAt?: string | null;
}

export function KitchenDisplaySystem() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [operatorName, setOperatorName] = useState<string>('Gabriel Olímpio');
  const [operatorEmail, setOperatorEmail] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // KDS Operational State
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('awaiting_payment');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'columns' | 'grid'>('columns');

  // Track checked items per order (interactive kitchen prep checklist)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const prevOrderCountRef = useRef(0);

  // Clock ticker for operational kitchen timing
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio API Synthesizer for high-pitch kitchen bell alert
  const playKitchenChime = React.useCallback(() => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio autoplay policy fallback
    }
  }, [soundEnabled]);

  // 1. Check existing session on mount (supports localStorage Bearer token & cookie)
  useEffect(() => {
    async function checkSession() {
      try {
        const storedToken = localStorage.getItem('teseu_kitchen_token');
        const headers: Record<string, string> = {};
        if (storedToken) {
          headers['Authorization'] = `Bearer ${storedToken}`;
        }

        const res = await fetch('/api/kitchen/auth', { headers });
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          if (data.operator) setOperatorName(data.operator);
          if (data.email) {
            setOperatorEmail(data.email);
            setEmailInput(data.email);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  // 2. Poll Kitchen Orders in real time (every 4 seconds)
  const fetchKitchenOrders = React.useCallback(async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      const storedToken = localStorage.getItem('teseu_kitchen_token');
      const headers: Record<string, string> = {};
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`;
      }

      const res = await fetch('/api/kitchen/orders', { headers });
      if (res.ok) {
        const data = await res.json();
        const incomingOrders: KitchenOrder[] = data.orders || [];

        if (incomingOrders.length > prevOrderCountRef.current && prevOrderCountRef.current > 0) {
          playKitchenChime();
        }
        prevOrderCountRef.current = incomingOrders.length;
        setOrders(incomingOrders);
      } else if (res.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Error fetching kitchen orders:', err);
    } finally {
      if (isManual) setIsRefreshing(false);
    }
  }, [playKitchenChime]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;

    const loadOrders = async () => {
      try {
        const storedToken = localStorage.getItem('teseu_kitchen_token');
        const headers: Record<string, string> = {};
        if (storedToken) {
          headers['Authorization'] = `Bearer ${storedToken}`;
        }

        const res = await fetch('/api/kitchen/orders', { headers });
        if (res.ok && isMounted) {
          const data = await res.json();
          const incomingOrders: KitchenOrder[] = data.orders || [];
          if (incomingOrders.length > prevOrderCountRef.current && prevOrderCountRef.current > 0) {
            playKitchenChime();
          }
          prevOrderCountRef.current = incomingOrders.length;
          setOrders(incomingOrders);
        } else if (res.status === 401 && isMounted) {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error fetching kitchen orders:', err);
      }
    };

    loadOrders();
    const interval = setInterval(loadOrders, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAuthenticated, playKitchenChime]);

  // Handle Email & Passcode Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const normalized = emailInput.toLowerCase().trim();
    if (normalized !== 'gabrielolimpiobsb@gmail.com') {
      setAuthError('Acesso Negado: Apenas o e-mail gabrielolimpiobsb@gmail.com possui autorização para o Painel da Cozinha.');
      return;
    }

    setIsAuthenticating(true);

    try {
      const res = await fetch('/api/kitchen/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalized,
          passcode: passcodeInput.trim(),
          operatorName: operatorName.trim() || 'Gabriel Olímpio',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.token) {
          localStorage.setItem('teseu_kitchen_token', data.token);
        }
        setIsAuthenticated(true);
        if (data.email) setOperatorEmail(data.email);
        setPasscodeInput('');
        fetchKitchenOrders();
      } else {
        setAuthError(data.error || 'Acesso negado.');
      }
    } catch {
      setAuthError('Falha ao comunicar com o servidor.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Google Sign-In for Kitchen Display
  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsAuthenticating(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;
      const userEmail = (user.email || '').toLowerCase().trim();

      if (userEmail !== 'gabrielolimpiobsb@gmail.com') {
        await auth.signOut();
        setAuthError(`Acesso Negado: A conta Google (${userEmail}) não tem permissão. Somente gabrielolimpiobsb@gmail.com pode acessar a Cozinha.`);
        setIsAuthenticating(false);
        return;
      }

      const idToken = await user.getIdToken();
      const res = await fetch('/api/kitchen/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          idToken,
          operatorName: user.displayName || 'Gabriel Olímpio',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.token) {
          localStorage.setItem('teseu_kitchen_token', data.token);
        }
        setIsAuthenticated(true);
        if (data.operator) setOperatorName(data.operator);
        if (data.email) setOperatorEmail(data.email);
        fetchKitchenOrders();
      } else {
        setAuthError(data.error || 'Acesso negado.');
      }
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      setAuthError('Não foi possível abrir o popup do Google neste ambiente. Use a validação direta por e-mail e chave abaixo.');
    } finally {
      setIsAuthenticating(false);
    }
  };



  // Handle Logout (Lock Terminal)
  const handleLogout = async () => {
    localStorage.removeItem('teseu_kitchen_token');
    await fetch('/api/kitchen/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
    setOrders([]);
  };

  // Handle manual WhatsApp payment validation
  const handleConfirmPayment = async (orderId: number, orderNumber: string) => {
    try {
      const storedToken = localStorage.getItem('teseu_kitchen_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;

      const res = await fetch('/api/kitchen/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          orderId,
          action: 'confirm_payment',
        }),
      });

      if (res.ok) {
        setActionSuccessMessage(`✓ Comprovante validado! Pedido #${orderNumber} liberado para a chapa.`);
        setTimeout(() => setActionSuccessMessage(null), 4000);
        fetchKitchenOrders();
      }
    } catch (err) {
      console.error('Failed to confirm payment:', err);
    }
  };

  // Handle status update
  const handleUpdateStatus = async (orderId: number, orderNumber: string, nextStatus: string) => {
    try {
      const storedToken = localStorage.getItem('teseu_kitchen_token');
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

      const data = await res.json();

      if (res.ok) {
        if (nextStatus === 'completed' && data.financials) {
          const f = data.financials;
          setActionSuccessMessage(
            `🎉 Pedido #${orderNumber} CONCLUÍDO! Receita: R$ ${f.grossRevenue.toFixed(2)} | Lucro: R$ ${f.grossProfit.toFixed(
              2
            )} (${f.profitMargin}) gravado para o Admin.`
          );
        } else {
          const statusObj = KDS_STATUSES.find((s) => s.key === nextStatus);
          setActionSuccessMessage(`Pedido #${orderNumber} atualizado para "${statusObj?.label || nextStatus}".`);
        }
        setTimeout(() => setActionSuccessMessage(null), 4500);
        fetchKitchenOrders();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Toggle item checkbox
  const toggleItemCheck = (key: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // ==========================================
  // RENDER: Security Gate / Lockscreen (#F5F5F5 Background)
  // ==========================================
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] text-slate-800 flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-white">
        <div className="w-full max-w-md p-8 bg-white border border-slate-200 rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.05)] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

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
            KITCHEN DISPLAY SYSTEM (KDS)
          </span>

          <h2 className="font-extrabold text-2xl tracking-tight text-slate-900 mt-1">
            Painel da Cozinha
          </h2>

          <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-xs mx-auto">
            Terminal operacional da chapa e expedição. Insira suas credenciais para gerenciar pedidos.
          </p>

          {/* Option 1: Google Sign-In */}
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
                E-mail do Operador
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="cozinha@dominio.com"
                  required
                  className="w-full py-2.5 pl-3.5 pr-9 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:bg-white rounded-xl text-slate-900 text-xs outline-none transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Chave / Senha do Terminal
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
                  <span>Validando operador...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Acessar Painel da Cozinha</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center">
            <Link
              href="/"
              className="text-xs font-medium text-slate-500 hover:text-amber-600 transition-colors"
            >
              ← Voltar à Loja Principal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: Full Kitchen Display System (KDS)
  // Background: #F5F5F5, Organization matching attached image!
  // ==========================================
  // Filter counts
  const countAwaiting = orders.filter((o) => o.status === 'awaiting_payment').length;
  const countPreparing = orders.filter((o) => o.status === 'preparing' || o.status === 'payment_confirmed').length;
  const countReady = orders.filter((o) => o.status === 'ready' || o.status === 'awaiting_courier' || o.status === 'out_for_delivery').length;
  const countCompleted = orders.filter((o) => o.status === 'completed').length;
  const countAll = orders.length;

  // Filtered orders based on selected top pill
  const activeOrders = orders.filter((order) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = order.orderNumber.toLowerCase().includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.includes(q);
      const matchItems = order.itemsJson.toLowerCase().includes(q);
      if (!matchNumber && !matchName && !matchPhone && !matchItems) return false;
    }

    if (selectedFilter === 'awaiting_payment') {
      return order.status === 'awaiting_payment';
    }
    if (selectedFilter === 'preparing') {
      return order.status === 'preparing' || order.status === 'payment_confirmed';
    }
    if (selectedFilter === 'ready') {
      return order.status === 'ready' || order.status === 'awaiting_courier' || order.status === 'out_for_delivery';
    }
    if (selectedFilter === 'completed') {
      return order.status === 'completed';
    }
    return true; // 'all'
  });

  // Split into 3 columns as structured in the reference image:
  // 1. NEW ORDERS (recent, < 7 min)
  // 2. PENDING CONFIRMATION / MEDIUM (7 to 15 min)
  // 3. URGENT / FOLLOW-UP (> 15 min)
  // (Or if filter is 'all', split by workflow status)
  const isAwaitingTab = selectedFilter === 'awaiting_payment';

  // Sub-columns for Awaiting Payment (matching reference image: NEW ORDERS, PENDING CONFIRMATION, URGENT / FOLLOW-UP)
  const newOrders = activeOrders.filter((o) => {
    const elapsed = Math.floor((currentTime.getTime() - new Date(o.createdAt).getTime()) / 60000);
    return elapsed < 7;
  });

  const pendingConfirmation = activeOrders.filter((o) => {
    const elapsed = Math.floor((currentTime.getTime() - new Date(o.createdAt).getTime()) / 60000);
    return elapsed >= 7 && elapsed <= 15;
  });

  const urgentFollowUp = activeOrders.filter((o) => {
    const elapsed = Math.floor((currentTime.getTime() - new Date(o.createdAt).getTime()) / 60000);
    return elapsed > 15;
  });

  // Render individual Order Card strictly matching the anatomy in the reference image
  const renderOrderCard = (order: KitchenOrder) => {
    let parsedItems: any[] = [];
    try {
      parsedItems = JSON.parse(order.itemsJson);
    } catch {
      parsedItems = [];
    }

    const orderDate = new Date(order.createdAt);
    const elapsedMinutes = Math.floor((currentTime.getTime() - orderDate.getTime()) / 60000);

    // Urgent pill color: red (>15m), amber/orange (7-15m), neutral/soft (<7m)
    const isUrgent = elapsedMinutes > 15;
    const isMedium = elapsedMinutes >= 7 && elapsedMinutes <= 15;

    const timerBadgeClass = isUrgent
      ? 'bg-rose-500 text-white font-black'
      : isMedium
      ? 'bg-amber-500 text-black font-black'
      : 'bg-neutral-200 text-neutral-800 font-bold';

    const whatsappCustomerUrl = `https://wa.me/55${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
      `Olá ${order.customerName}, tudo bem? Aqui é da cozinha do Teseu Burger sobre o seu pedido #${order.orderNumber}!`
    )}`;

    const isAwaitingPayment = order.status === 'awaiting_payment';
    const isPaymentConfirmed = order.status === 'payment_confirmed';
    const isPreparing = order.status === 'preparing';
    const isReady = order.status === 'ready';
    const isAwaitingCourier = order.status === 'awaiting_courier';
    const isOutForDelivery = order.status === 'out_for_delivery';
    const isCompleted = order.status === 'completed';

    return (
      <div
        key={order.id}
        className={`bg-white rounded-2xl border-2 p-5 flex flex-col justify-between transition-all shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${
          isUrgent
            ? 'border-rose-400 ring-2 ring-rose-400/20'
            : isAwaitingPayment
            ? 'border-[#E2DDD2] hover:border-[#CD9C20]'
            : isPreparing
            ? 'border-orange-300 ring-2 ring-orange-400/20'
            : isCompleted
            ? 'border-neutral-200 opacity-80'
            : 'border-[#CD9C20]/40'
        }`}
      >
        <div>
          {/* Card Top Row: Giant Order Number + Elapsed Time + Customer Name */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-black text-3xl sm:text-4xl text-[#1C1C1C] tracking-tight">
                  #{order.orderNumber.replace(/^(TB-|PED-)/, '')}
                </span>
                <span className="text-xs font-mono text-neutral-400 font-semibold">
                  ({order.orderNumber})
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 font-ancient block mt-0.5">
                {order.deliveryMethod === 'delivery' ? '🛵 Entrega em Domicílio' : '🏛️ Retirada no Balcão'}
              </span>
            </div>

            <div className="text-right shrink-0">
              <span
                suppressHydrationWarning
                className={`inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-full ${timerBadgeClass}`}
              >
                <Clock className="w-3 h-3 stroke-[2.5]" />
                <span>{elapsedMinutes}m atrás</span>
              </span>
              <h5 className="font-display font-bold text-sm text-[#1C1C1C] mt-1 truncate max-w-[140px]">
                {order.customerName}
              </h5>
            </div>
          </div>

          {/* Delivery Address snippet if present */}
          {order.customerAddress && (
            <div className="mb-3.5 p-2 rounded-lg bg-[#F8F6F0] border border-neutral-200 text-[11px] text-neutral-700 flex items-start gap-1.5 leading-snug">
              <MapPin className="w-3.5 h-3.5 text-[#CD9C20] shrink-0 mt-0.5" />
              <span className="line-clamp-2">{order.customerAddress}</span>
            </div>
          )}

          {/* Checkbox Items List (Cooking Prep Checklist matching image) */}
          <div className="space-y-2.5 mb-5 divide-y divide-neutral-100">
            {parsedItems.map((item: any, idx: number) => {
              const itemKey = `${order.id}-${idx}`;
              const isChecked = !!checkedItems[itemKey];

              return (
                <div
                  key={idx}
                  className={`pt-2.5 first:pt-0 cursor-pointer select-none transition-opacity ${
                    isChecked ? 'opacity-40' : 'opacity-100'
                  }`}
                  onClick={() => toggleItemCheck(itemKey)}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 text-neutral-400 hover:text-[#CD9C20] transition-colors shrink-0">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#CD9C20] stroke-[2.5]" />
                      ) : (
                        <Square className="w-4 h-4 stroke-[2]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1 text-sm">
                        <span
                          className={`font-display font-bold text-[#1C1C1C] leading-snug ${
                            isChecked ? 'line-through text-neutral-400' : ''
                          }`}
                        >
                          <span className="text-[#CD9C20] font-black">{item.quantity}x</span> {item.name}
                        </span>
                        <span className="font-mono text-[11px] text-neutral-400 font-semibold shrink-0">
                          R$ {(item.totalPrice || item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      {/* Doneness Tag */}
                      {item.doneness && (
                        <p className="text-[11px] text-amber-700 font-medium mt-0.5 pl-1 flex items-center gap-1">
                          <span>•</span>
                          <span>Ponto: <strong>{item.doneness}</strong></span>
                        </p>
                      )}

                      {/* Observation Notes (e.g. • No Onions / Sem cebola) */}
                      {item.notes && (
                        <p className="text-[11px] text-rose-700 font-bold mt-0.5 pl-1 flex items-center gap-1 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>Obs: {item.notes}</span>
                        </p>
                      )}

                      {/* Extra toppings */}
                      {item.selectedToppings && item.selectedToppings.length > 0 && (
                        <p className="text-[11px] text-emerald-700 font-medium mt-0.5 pl-1">
                          • Extras: {item.selectedToppings.map((t: any) => t.name).join(', ')}
                        </p>
                      )}

                      {/* Combo breakdown (Fries + Drink) */}
                      {item.isComboUpgrade && (
                        <div className="mt-1 pl-2 text-[11px] text-neutral-600 font-medium space-y-0.5 border-l-2 border-[#CD9C20]/40">
                          <p>• 1x Batatas Espartanas</p>
                          <p>• 1x {item.comboDrink || 'Bebida Gelada'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button Area (Luminous WhatsApp button or Status progression) */}
        <div className="pt-3 border-t border-neutral-100 space-y-2">
          {/* 1. Luminous WhatsApp Payment Confirmation Button (Matching Image!) */}
          {isAwaitingPayment && (
            <button
              type="button"
              onClick={() => handleConfirmPayment(order.id, order.orderNumber)}
              className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.98] text-[#0B0B0B] font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-[0_4px_18px_rgba(37,211,102,0.38)] flex items-center justify-center gap-2 transition-all"
            >
              <MessageSquare className="w-4 h-4 fill-black stroke-black" />
              <span>CONFIRMAR PAGAMENTO WHATSAPP</span>
            </button>
          )}

          {/* 2. Step: Payment Confirmed -> Iniciar Preparo na Chapa */}
          {isPaymentConfirmed && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(order.id, order.orderNumber, 'preparing')}
              className="w-full py-3.5 px-4 bg-[#EA580C] hover:bg-[#d44e08] active:scale-[0.98] text-white font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-[0_4px_18px_rgba(234,88,12,0.35)] flex items-center justify-center gap-2 transition-all"
            >
              <Flame className="w-4 h-4" />
              <span>COLOCAR NA CHAPA (EM PREPARO)</span>
            </button>
          )}

          {/* 3. Step: Em Preparo -> Pronto & Embalado */}
          {isPreparing && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(order.id, order.orderNumber, 'ready')}
              className="w-full py-3.5 px-4 bg-[#2563EB] hover:bg-[#1d4ed8] active:scale-[0.98] text-white font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-[0_4px_18px_rgba(37,99,235,0.35)] flex items-center justify-center gap-2 transition-all"
            >
              <PackageCheck className="w-4 h-4" />
              <span>FINALIZAR LANCHE & EMBALAR</span>
            </button>
          )}

          {/* 4. Step: Pronto -> Despacho / Entregador */}
          {isReady && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleUpdateStatus(order.id, order.orderNumber, 'awaiting_courier')}
                className="py-2.5 px-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-display font-bold text-[11px] uppercase tracking-wider transition-all text-center"
              >
                Aguardar Motoboy
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(order.id, order.orderNumber, 'out_for_delivery')}
                className="py-2.5 px-2 rounded-xl bg-[#9333EA] hover:bg-[#7e22ce] text-white font-display font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-sm"
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Saiu Entrega</span>
              </button>
            </div>
          )}

          {/* 5. Step: Aguardando Entregador -> Saiu para Entrega */}
          {isAwaitingCourier && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(order.id, order.orderNumber, 'out_for_delivery')}
              className="w-full py-3 px-4 bg-[#9333EA] hover:bg-[#7e22ce] active:scale-[0.98] text-white font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Bike className="w-4 h-4" />
              <span>DESPACHAR (SAIU PARA ENTREGA)</span>
            </button>
          )}

          {/* 6. Step: Saiu para Entrega -> Pedido Concluído (Gera financeiro para Admin) */}
          {isOutForDelivery && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(order.id, order.orderNumber, 'completed')}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>CONCLUIR PEDIDO (GRAVAR LUCRO)</span>
            </button>
          )}

          {/* 7. Step: Concluído */}
          {isCompleted && (
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <span className="text-[11px] text-emerald-800 font-display font-bold uppercase block">
                ✓ Pedido Concluído
              </span>
              {order.grossProfit && (
                <span className="text-[10px] text-neutral-600 font-mono mt-0.5 block">
                  Lucro Real: R$ {(order.grossProfit / 100).toFixed(2).replace('.', ',')} ({order.profitMargin})
                </span>
              )}
            </div>
          )}

          {/* Secondary Action Row: WhatsApp Chat Link + Customer View Link */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-500">
            <a
              href={whatsappCustomerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              <Phone className="w-3 h-3 text-emerald-600" />
              <span>Abrir WhatsApp</span>
            </a>

            <Link
              href={`/pedido/${order.orderNumber}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-neutral-500 hover:text-[#CD9C20] font-ancient"
            >
              <span>Ver do Cliente</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1C1C1C] flex font-sans selection:bg-[#F5CB5C] selection:text-black">
      {/* ========================================================= */}
      {/* 1. LEFT ICON SIDEBAR DOCK (MATCHING ATTACHED IMAGE)       */}
      {/* ========================================================= */}
      <aside className="w-16 sm:w-20 bg-[#161616] text-white flex flex-col items-center justify-between py-5 shrink-0 border-r border-black/20 shadow-xl z-30">
        {/* Top: Burger / Helmet Logo */}
        <div className="flex flex-col items-center gap-6">
          <Link
            href="/"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#222222] border border-[#CD9C20]/40 flex items-center justify-center hover:scale-105 transition-transform shadow-md"
            title="Teseu Burger • Início"
          >
            <SpartanHelmetIcon size={22} color="#F5CB5C" />
          </Link>

          {/* Navigation Icons Dock */}
          <nav className="flex flex-col items-center gap-3">
            <Link
              href="/"
              className="p-3 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Ir para o Cardápio do Cliente"
            >
              <LaurelWreathIcon size={20} color="#888888" />
            </Link>

            <button
              onClick={() => setSelectedFilter('awaiting_payment')}
              className={`p-3 rounded-xl transition-all relative ${
                selectedFilter === 'awaiting_payment'
                  ? 'bg-[#CD9C20]/20 text-[#F5CB5C] border border-[#CD9C20]/50 shadow-[0_0_12px_rgba(205,156,32,0.3)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
              title="Aguardando Pagamento"
            >
              <LayoutGrid className="w-5 h-5" />
              {countAwaiting > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {countAwaiting}
                </span>
              )}
            </button>

            <button
              onClick={() => setSelectedFilter('preparing')}
              className={`p-3 rounded-xl transition-all ${
                selectedFilter === 'preparing'
                  ? 'bg-[#CD9C20]/20 text-[#F5CB5C] border border-[#CD9C20]/50'
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
              title="Na Chapa (Em Preparo)"
            >
              <Flame className="w-5 h-5" />
            </button>

            <button
              onClick={() => setSelectedFilter('ready')}
              className={`p-3 rounded-xl transition-all ${
                selectedFilter === 'ready'
                  ? 'bg-[#CD9C20]/20 text-[#F5CB5C] border border-[#CD9C20]/50'
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
              title="Prontos & Expedição"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
          </nav>
        </div>

        {/* Bottom Dock Icons: Sound, Refresh, Logout */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-white/5 text-neutral-400 border-white/10'
            }`}
            title={soundEnabled ? 'Sino Ligado' : 'Mudo'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => fetchKitchenOrders(true)}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-colors"
            title="Recarregar Pedidos"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#F5CB5C]' : ''}`} />
          </button>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 transition-colors"
            title="Bloquear Terminal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN KDS VIEWPORT AREA                                 */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP HEADER BAR (MATCHING ATTACHED IMAGE) */}
        <header className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 shadow-xs z-20">
          {/* Left: Brand + Title */}
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-28 sm:w-32 shrink-0">
              <Image
                src="/logo.png"
                alt="Teseu Burger"
                fill
                priority
                referrerPolicy="no-referrer"
                className="object-contain object-left"
                sizes="128px"
              />
            </div>
            <div className="hidden md:flex items-center gap-2.5 border-l border-neutral-300 pl-3">
              <span className="font-display font-black text-xs uppercase tracking-wider text-neutral-800">
                KITCHEN DISPLAY (KDS)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>{operatorEmail}</span>
              </span>
            </div>
          </div>

          {/* Center: GIANT DIGITAL CLOCK (MATCHING IMAGE "14:12") */}
          <div className="font-display font-black text-2xl sm:text-3xl text-[#1C1C1C] tracking-wider px-4 py-1 rounded-xl bg-[#F8F6F0] border border-[#CD9C20]/30 shadow-xs">
            <span suppressHydrationWarning>
              {currentTime.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Right: PILL STATUS BUTTONS WITH LIVE COUNTERS */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSelectedFilter('awaiting_payment')}
              className={`py-2 px-3.5 rounded-full text-xs font-display font-black uppercase transition-all whitespace-nowrap shadow-xs ${
                selectedFilter === 'awaiting_payment'
                  ? 'bg-[#1C1C1C] text-[#F5CB5C] shadow-md ring-2 ring-[#CD9C20]'
                  : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
              }`}
            >
              <span>Aguardando Pagamento ({countAwaiting})</span>
            </button>

            <button
              onClick={() => setSelectedFilter('preparing')}
              className={`py-2 px-3.5 rounded-full text-xs font-display font-black uppercase transition-all whitespace-nowrap shadow-xs ${
                selectedFilter === 'preparing'
                  ? 'bg-[#EA580C] text-white shadow-md ring-2 ring-orange-400'
                  : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
              }`}
            >
              <span>Em Preparo ({countPreparing})</span>
            </button>

            <button
              onClick={() => setSelectedFilter('ready')}
              className={`py-2 px-3.5 rounded-full text-xs font-display font-black uppercase transition-all whitespace-nowrap shadow-xs ${
                selectedFilter === 'ready'
                  ? 'bg-[#16A34A] text-white shadow-md ring-2 ring-emerald-400'
                  : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
              }`}
            >
              <span>Pronto ({countReady})</span>
            </button>

            <button
              onClick={() => setSelectedFilter('all')}
              className={`py-2 px-3 rounded-full text-xs font-display font-bold uppercase transition-all whitespace-nowrap ${
                selectedFilter === 'all'
                  ? 'bg-neutral-800 text-white'
                  : 'bg-white text-neutral-600 border border-neutral-300 hover:bg-neutral-100'
              }`}
            >
              <span>Todos ({countAll})</span>
            </button>
          </div>
        </header>

        {/* ACTION SUCCESS TOAST */}
        {actionSuccessMessage && (
          <div className="bg-[#1C1C1C] text-[#F5CB5C] px-4 py-2.5 text-center text-xs font-display font-bold flex items-center justify-center gap-2 border-b border-[#CD9C20] animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* SUBHEADER: Active View Title + Quick Search */}
        <div className="bg-[#EFEAE0] border-b border-[#DCD5C8] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-display font-black text-sm uppercase tracking-wider text-[#1C1C1C]">
              {selectedFilter === 'awaiting_payment'
                ? 'AGUARDANDO PAGAMENTO'
                : selectedFilter === 'preparing'
                ? 'NA CHAPA & EM PREPARO'
                : selectedFilter === 'ready'
                ? 'PRONTOS & EXPEDIÇÃO'
                : 'TODAS AS COMANDAS'}
            </h2>
            <span className="text-xs font-ancient text-neutral-600">
              ({activeOrders.length} {activeOrders.length === 1 ? 'pedido' : 'pedidos'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar comanda ou cliente..."
                className="py-1 px-3 pl-8 bg-white border border-neutral-300 focus:border-[#CD9C20] rounded-lg text-xs text-neutral-800 outline-none w-48 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2 pointer-events-none" />
            </div>

            <button
              onClick={() => setViewMode(viewMode === 'columns' ? 'grid' : 'columns')}
              className="p-1.5 rounded-lg bg-white border border-neutral-300 text-neutral-700 hover:text-black transition-colors"
              title={viewMode === 'columns' ? 'Alternar para Grade' : 'Alternar para 3 Colunas'}
            >
              {viewMode === 'columns' ? <LayoutGrid className="w-4 h-4" /> : <Columns3 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. KANBAN 3-COLUMN DISPLAY (MATCHING ATTACHED IMAGE)       */}
        {/* Background: #F5F5F5                                       */}
        {/* ========================================================= */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#F5F5F5]">
          {activeOrders.length === 0 ? (
            <div className="min-h-[55vh] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-neutral-300 rounded-3xl max-w-md mx-auto bg-white/70">
              <div className="w-16 h-16 rounded-full bg-[#FBF9F5] border border-[#CD9C20]/40 flex items-center justify-center mb-4 shadow-xs">
                <Flame className="w-8 h-8 text-[#CD9C20]" />
              </div>
              <h3 className="font-display font-black text-lg uppercase tracking-wider text-[#1C1C1C]">
                Chapa do Olimpo a Postos
              </h3>
              <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
                Nenhum pedido aguardando ação nesta fila. Assim que um cliente finalizar o pedido no site, ele aparecerá aqui instantaneamente com aviso sonoro.
              </p>
            </div>
          ) : viewMode === 'columns' && isAwaitingTab ? (
            /* 3-COLUMN KANBAN (EXACTLY AS IN THE USER'S ATTACHED SCREENSHOT) */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* COLUMN 1: NEW ORDERS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b-2 border-neutral-300">
                  <h3 className="font-display font-black text-xs uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                    <span>NOVOS PEDIDOS</span>
                    <span className="text-[10px] bg-neutral-200 text-neutral-800 px-1.5 py-0.2 rounded-full font-mono">
                      {newOrders.length}
                    </span>
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-500">&lt; 7m</span>
                </div>

                {newOrders.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400 border border-dashed border-neutral-200 rounded-xl bg-white/50">
                    Sem novos pedidos recentes
                  </div>
                ) : (
                  newOrders.map((order) => renderOrderCard(order))
                )}
              </div>

              {/* COLUMN 2: PENDING CONFIRMATION */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b-2 border-amber-400">
                  <h3 className="font-display font-black text-xs uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <span>CONFIRMAÇÃO PENDENTE</span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full font-mono">
                      {pendingConfirmation.length}
                    </span>
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-500">7m - 15m</span>
                </div>

                {pendingConfirmation.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400 border border-dashed border-neutral-200 rounded-xl bg-white/50">
                    Nenhum pedido nesta faixa
                  </div>
                ) : (
                  pendingConfirmation.map((order) => renderOrderCard(order))
                )}
              </div>

              {/* COLUMN 3: URGENT / FOLLOW-UP */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b-2 border-rose-500">
                  <h3 className="font-display font-black text-xs uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                    <span>URGENTE / ATENÇÃO</span>
                    <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded-full font-mono">
                      {urgentFollowUp.length}
                    </span>
                  </h3>
                  <span className="text-[10px] font-mono text-rose-600 font-bold">&gt; 15m</span>
                </div>

                {urgentFollowUp.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400 border border-dashed border-neutral-200 rounded-xl bg-white/50">
                    Sem pedidos urgentes
                  </div>
                ) : (
                  urgentFollowUp.map((order) => renderOrderCard(order))
                )}
              </div>
            </div>
          ) : (
            /* RESPONSIVE GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
              {activeOrders.map((order) => renderOrderCard(order))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
