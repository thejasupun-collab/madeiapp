'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { CreditCard, Upload, Clock, CheckCircle2, XCircle, Eye, AlertCircle, Globe, Lock, TicketPercent, X } from 'lucide-react';

interface PaymentRecord {
  id: string;
  userId: string;
  userEmail: string;
  blobName: string;
  note: string;
  amount?: string;
  promoCode?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface CouponRecord {
  id: string;
  code: string;
  discountPercent: number;
  isActive: boolean;
  expiresAt?: string;
}

interface PaymentGatewayConfig {
  payhereEnabled: boolean;
  payhereMerchantId: string;
  payhereCurrency: string;
  payhereAmount: string;
  payhereSandbox?: boolean;
  paddleEnabled: boolean;
  paddleClientToken: string;
  paddlePriceId: string;
  paddleEnv?: 'sandbox' | 'production';
}

declare global {
  interface Window {
    payhere?: {
      startPayment: (payment: Record<string, unknown>) => void;
      onCompleted: (orderId: string) => void;
      onDismissed: () => void;
      onError: (error: string) => void;
    };
    Paddle?: {
      Environment?: {
        set: (env: 'sandbox' | 'production') => void;
      };
      Initialize: (options: { token: string }) => void;
      Checkout: {
        open: (options: Record<string, unknown>) => void;
      };
    };
  }
}

export default function PaymentsPage() {
  const { userProfile, firebaseUser } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [gatewayConfig, setGatewayConfig] = useState<PaymentGatewayConfig>({
    payhereEnabled: false,
    payhereMerchantId: '',
    payhereCurrency: 'LKR',
    payhereAmount: '5000',
    payhereSandbox: true,
    paddleEnabled: false,
    paddleClientToken: '',
    paddlePriceId: '',
    paddleEnv: 'sandbox',
  });
  const [gatewayLoading, setGatewayLoading] = useState(true);
  const [payhereLoading, setPayhereLoading] = useState(false);
  const [paddleLoading, setPaddleLoading] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponRecord | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoMessage, setPromoMessage] = useState('');

  const basePayhereAmount = Number(gatewayConfig.payhereAmount) || 0;
  const discountedPayhereAmount = appliedCoupon
    ? Math.max(
        0,
        Math.round((basePayhereAmount * (100 - appliedCoupon.discountPercent)) / 100),
      )
    : basePayhereAmount;
  const payhereChargeAmount = appliedCoupon
    ? String(discountedPayhereAmount)
    : gatewayConfig.payhereAmount || '5000';

  const loadScript = (src: string, globalKey: 'payhere' | 'Paddle'): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window[globalKey]) {
        resolve();
        return;
      }
      const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    if (!firebaseUser) return;

    const paymentsQuery =
      userProfile?.role === 'admin'
        ? query(collection(db, 'payments'), orderBy('createdAt', 'desc'))
        : query(
            collection(db, 'payments'),
            where('userId', '==', firebaseUser.uid),
            orderBy('createdAt', 'desc'),
          );

    const unsubscribe = onSnapshot(
      paymentsQuery,
      (snapshot) => {
        setPayments(
          snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as PaymentRecord[],
        );
        setLoading(false);
      },
      (err) => {
        console.error('Error loading payments:', err);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [firebaseUser, userProfile?.role]);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/settings/payments')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const cfg = data?.settings || data?.config || data;
        if (!cfg || typeof cfg !== 'object') return;
        setGatewayConfig((prev) => ({
          ...prev,
          payhereEnabled: Boolean(cfg.payhereEnabled),
          payhereMerchantId: String(cfg.payhereMerchantId || ''),
          payhereCurrency: String(cfg.payhereCurrency || 'LKR'),
          payhereAmount: String(cfg.payhereAmount || '5000'),
          payhereSandbox: cfg.payhereSandbox !== undefined ? Boolean(cfg.payhereSandbox) : true,
          paddleEnabled: Boolean(cfg.paddleEnabled),
          paddleClientToken: String(cfg.paddleClientToken || ''),
          paddlePriceId: String(cfg.paddlePriceId || ''),
          paddleEnv:
            cfg.paddleEnv === 'production' || cfg.paddleEnvironment === 'production'
              ? 'production'
              : 'sandbox',
        }));
      })
      .catch((err) => console.error('Error fetching payment gateway config:', err))
      .finally(() => {
        if (!cancelled) setGatewayLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !firebaseUser) {
      setError('Please select a payment slip file to upload.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setUploading(true);

    try {
      // 1. Upload file to Azure 'payments' container via /api/upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('containerName', 'payments');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.error || 'Failed to upload payment slip to Azure.');
      }

      // 2. Save record in Firestore 'payments' collection
      const newRecord = {
        userId: firebaseUser.uid,
        userEmail: firebaseUser.email || userProfile?.email || '',
        blobName: uploadData.blobName,
        note,
        amount: amount ? `${amount} LKR` : appliedCoupon ? `${discountedPayhereAmount} LKR` : 'N/A',
        promoCode: appliedCoupon?.code || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'payments'), newRecord);

      setSuccessMsg('Payment slip submitted successfully! Verification is pending.');
      setFile(null);
      setNote('');
      setAmount('');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to submit payment slip.');
    } finally {
      setUploading(false);
    }
  };

  const handleViewSlip = async (record: PaymentRecord) => {
    try {
      setViewingId(record.id);
      const res = await fetch(`/api/sas?containerName=payments&blobName=${encodeURIComponent(record.blobName)}`);
      const data = await res.json();
      if (data.success && data.sasUrl) {
        window.open(data.sasUrl, '_blank');
      } else {
        alert(data.error || 'Failed to generate secure URL for payment slip.');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching payment slip URL.');
    } finally {
      setViewingId(null);
    }
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = promoInput.trim().toUpperCase();
    setPromoError('');
    setPromoMessage('');

    if (!normalized) {
      setPromoError('Enter a promo code to continue.');
      return;
    }

    setPromoLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'coupons'));
      const couponList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as CouponRecord[];
      const match = couponList.find((coupon) => String(coupon.code || '').toUpperCase() === normalized);

      if (!match) throw new Error('That promo code was not found.');
      if (!match.isActive) throw new Error('That promo code is no longer active.');
      if (match.expiresAt) {
        const expiry = new Date(match.expiresAt).getTime();
        if (Number.isFinite(expiry) && expiry < Date.now()) {
          throw new Error('That promo code has expired.');
        }
      }

      const percent = Number(match.discountPercent);
      if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
        throw new Error('That promo code is invalid. Please contact support.');
      }

      setAppliedCoupon({ ...match, discountPercent: percent });
      const discounted = Math.max(
        0,
        Math.round(((Number(gatewayConfig.payhereAmount) || 0) * (100 - percent)) / 100),
      );
      setAmount(String(discounted));
      setPromoInput(normalized);
      setPromoMessage(`${percent}% discount applied. You now pay LKR ${discounted.toLocaleString()}.`);
    } catch (err) {
      setAppliedCoupon(null);
      setPromoError(err instanceof Error ? err.message : 'Could not validate this promo code.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedCoupon(null);
    setPromoInput('');
    setPromoError('');
    setPromoMessage('');
    setAmount('');
  };

  const handlePayHereCheckout = async () => {
    if (!firebaseUser) return;
    setError('');
    setSuccessMsg('');
    setPayhereLoading(true);

    try {
      await loadScript('https://www.payhere.lk/lib/payhere.js', 'payhere');

      const orderId = `ORDER_${Date.now()}`;
      const orderAmount = payhereChargeAmount;
      const currency = gatewayConfig.payhereCurrency || 'LKR';

      const hashRes = await fetch('/api/payhere/hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          order_id: orderId,
          amount: orderAmount,
          currency,
        }),
      });

      const hashData = await hashRes.json();
      if (!hashRes.ok || !hashData.hash) {
        throw new Error(hashData.error || 'Failed to get PayHere security hash.');
      }

      if (!window.payhere) {
        throw new Error('PayHere SDK failed to initialize.');
      }

      // Use the server-normalised amount (2 decimals) and merchant ID so the
      // hash and the checkout payload always match.
      const chargeAmount = String(hashData.amount || orderAmount);
      const merchantId = String(hashData.merchantId || gatewayConfig.payhereMerchantId);

      window.payhere.onCompleted = (completedOrderId: string) => {
        setSuccessMsg(`PayHere payment completed! Order ID: ${completedOrderId}`);
      };

      window.payhere.onDismissed = () => {
        setPayhereLoading(false);
      };

      window.payhere.onError = (payhereErr: string) => {
        setError(`PayHere error: ${payhereErr}`);
        setPayhereLoading(false);
      };

      const nameParts = (userProfile?.name || 'Student User').trim().split(/\s+/);
      const firstName = nameParts[0] || 'Student';
      const lastName = nameParts.slice(1).join(' ') || 'User';

      window.payhere.startPayment({
        sandbox: gatewayConfig.payhereSandbox ?? true,
        merchant_id: merchantId,
        return_url: `${window.location.origin}/dashboard/payments?payhere=success`,
        cancel_url: `${window.location.origin}/dashboard/payments?payhere=cancel`,
        notify_url: `${window.location.origin}/api/webhooks/payhere`,
        order_id: orderId,
        items: appliedCoupon
          ? `MadeiApp Membership Access (${appliedCoupon.code})`
          : 'MadeiApp Membership Access',
        amount: chargeAmount,
        currency,
        hash: hashData.hash,
        first_name: firstName,
        last_name: lastName,
        email: firebaseUser.email || userProfile?.email || 'student@madeiapp.com',
        phone: '0770000000',
        address: 'Colombo',
        city: 'Colombo',
        country: 'Sri Lanka',
        custom_1: firebaseUser.uid,
        custom_2: appliedCoupon?.code || '',
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to launch PayHere checkout.');
    } finally {
      setPayhereLoading(false);
    }
  };

  const handlePaddleCheckout = async () => {
    if (!firebaseUser) return;
    setError('');
    setSuccessMsg('');
    setPaddleLoading(true);

    try {
      await loadScript('https://cdn.paddle.com/paddle/v2/paddle.js', 'Paddle');

      if (!window.Paddle) {
        throw new Error('Paddle SDK failed to initialize.');
      }

      if (gatewayConfig.paddleEnv === 'sandbox' && window.Paddle.Environment) {
        window.Paddle.Environment.set('sandbox');
      }

      window.Paddle.Initialize({
        token: gatewayConfig.paddleClientToken,
      });

      window.Paddle.Checkout.open({
        items: [
          {
            priceId: gatewayConfig.paddlePriceId,
            quantity: 1,
          },
        ],
        customer: {
          email: firebaseUser.email || userProfile?.email || undefined,
        },
        customData: {
          userId: firebaseUser.uid,
        },
        settings: {
          successUrl: `${window.location.origin}/dashboard/payments?paddle=success`,
        },
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to launch Paddle checkout.');
    } finally {
      setPaddleLoading(false);
    }
  };

  const isPayHereReady = Boolean(gatewayConfig.payhereEnabled && gatewayConfig.payhereMerchantId.trim());
  const isPaddleReady = Boolean(
    gatewayConfig.paddleEnabled &&
      gatewayConfig.paddleClientToken.trim() &&
      gatewayConfig.paddlePriceId.trim()
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-950 dark:text-white tracking-tight">Payments &amp; Membership</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Choose an online payment gateway or upload a bank slip for manual verification to unlock full access.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm p-4 rounded-xl flex items-start gap-2"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span className="break-words">{error}</span>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm p-4 rounded-xl flex items-start gap-2"
        >
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span className="break-words">{successMsg}</span>
        </div>
      )}

      {/* Promo code */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <TicketPercent className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Have a Promo Code?
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Apply a valid code to reduce your PayHere checkout and the bank slip amount below.
            </p>
          </div>
        </div>

        <form onSubmit={handleApplyPromo} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
            placeholder="e.g. SAVE20"
            aria-label="Promo code"
            disabled={Boolean(appliedCoupon) || promoLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono uppercase tracking-wide text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
          />
          {appliedCoupon ? (
            <button
              type="button"
              onClick={handleRemovePromo}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 text-sm font-semibold transition"
            >
              <X className="h-4 w-4" />
              Remove Code
            </button>
          ) : (
            <button
              type="submit"
              disabled={promoLoading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition disabled:opacity-50"
            >
              {promoLoading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              ) : (
                <TicketPercent className="h-4 w-4" />
              )}
              {promoLoading ? 'Checking...' : 'Apply Code'}
            </button>
          )}
        </form>

        {promoError && (
          <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-4 w-4" />
            {promoError}
          </p>
        )}

        {promoMessage && (
          <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            {promoMessage}
          </p>
        )}

        {appliedCoupon && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-500/30">
              <TicketPercent className="h-3.5 w-3.5" />
              {appliedCoupon.code} · {appliedCoupon.discountPercent}% OFF
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              PayHere:{' '}
              <span className="line-through text-gray-400 dark:text-gray-500">
                LKR {basePayhereAmount.toLocaleString()}
              </span>{' '}
              → <span className="font-bold text-emerald-600 dark:text-emerald-400">LKR {discountedPayhereAmount.toLocaleString()}</span>
            </span>
          </div>
        )}
      </div>

      {/* Online Payment Gateways */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PayHere (Sri Lanka - LKR) */}
        <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border p-5 sm:p-6 flex flex-col justify-between transition ${isPayHereReady ? 'border-indigo-200 dark:border-indigo-500/40' : 'border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/60'}`}>
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">PayHere (Sri Lanka - LKR)</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Local cards, FriMi &amp; mobile wallets</p>
                </div>
              </div>
              {!gatewayLoading && !isPayHereReady && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  <Lock className="h-3 w-3" />
                  Not Available Yet
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Instant local checkout in Sri Lankan Rupees (LKR) via PayHere.</p>
          </div>
          <div className="space-y-3">
            {isPayHereReady && (
              <div className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 text-sm font-semibold">
                <div className="flex items-center justify-between gap-2">
                  <span>Membership Price</span>
                  <span className="flex items-center gap-2">
                    {appliedCoupon && (
                      <span className="line-through text-indigo-400 dark:text-indigo-500 font-normal">
                        {basePayhereAmount.toLocaleString()}
                      </span>
                    )}
                    <span>
                      {appliedCoupon
                        ? discountedPayhereAmount.toLocaleString()
                        : gatewayConfig.payhereAmount}{' '}
                      {gatewayConfig.payhereCurrency || 'LKR'}
                    </span>
                  </span>
                </div>
                {appliedCoupon && (
                  <p className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    Promo {appliedCoupon.code} · {appliedCoupon.discountPercent}% off
                  </p>
                )}
              </div>
            )}
            <button
              type="button"
              disabled={!isPayHereReady || payhereLoading || gatewayLoading}
              onClick={handlePayHereCheckout}
              className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 ${
                isPayHereReady ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {payhereLoading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span>{isPayHereReady ? 'Pay with PayHere' : 'Not Available Yet'}</span>
                </>
              )}
            </button>
          </div>
        </div>
        {/* Paddle (International Cards) */}
        <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border p-5 sm:p-6 flex flex-col justify-between transition ${isPaddleReady ? 'border-emerald-200 dark:border-emerald-500/40' : 'border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/60'}`}>
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Paddle (International Cards)</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Visa, Mastercard, Apple Pay &amp; PayPal</p>
                </div>
              </div>
              {!gatewayLoading && !isPaddleReady && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  <Lock className="h-3 w-3" />
                  Not Available Yet
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Pay securely with international cards from anywhere in the world via Paddle.</p>
          </div>
          <button
            type="button"
            disabled={!isPaddleReady || paddleLoading || gatewayLoading}
            onClick={handlePaddleCheckout}
            className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 ${
              isPaddleReady ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {paddleLoading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            ) : (
              <>
                <Globe className="h-4 w-4" />
                <span>{isPaddleReady ? 'Pay with Card (Paddle)' : 'Not Available Yet'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Submission Form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 md:p-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Bank Slip Upload
        </h2>

        {appliedCoupon && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            <TicketPercent className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
              Promo <strong>{appliedCoupon.code}</strong> applied: please transfer{' '}
              <strong>LKR {discountedPayhereAmount.toLocaleString()}</strong> instead of LKR{' '}
              {basePayhereAmount.toLocaleString()}, then upload the bank slip below.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmitPayment} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Amount (LKR)
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={appliedCoupon ? String(discountedPayhereAmount) : 'e.g. 5000'}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              {appliedCoupon && (
                <p className="mt-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Discounted promo amount applied (LKR {discountedPayhereAmount.toLocaleString()}).
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reference Note / Bank Details
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Bank Transfer Ref #123456"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Upload Slip File (Image or PDF) <span className="text-rose-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl hover:border-indigo-500 transition bg-gray-50/50 dark:bg-gray-800/40">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none">
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept="image/*,application/pdf"
                      required
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, PDF up to 10MB</p>
                {file && (
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-2 bg-indigo-50 dark:bg-indigo-500/10 py-1 px-3 rounded-full inline-block">
                    Selected: {file.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-medium shadow-md shadow-indigo-100 dark:shadow-indigo-950/40 transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Submit Payment Slip to Azure
              </>
            )}
          </button>
        </form>
      </div>

      {/* Past Submissions */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 md:p-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Your Payment Submissions</h2>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
            No payment slips submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Note</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {payments.map((record) => {
                  const statusColors = {
                    pending:
                      'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
                    approved:
                      'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
                    rejected:
                      'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30',
                  };
                  const StatusIcon = {
                    pending: Clock,
                    approved: CheckCircle2,
                    rejected: XCircle,
                  }[record.status];

                  return (
                    <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-900 dark:text-gray-100">
                        {record.amount || 'N/A'}
                        {record.promoCode && (
                          <span className="block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Promo {record.promoCode}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300 max-w-xs truncate">
                        {record.note || 'No note'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[record.status]}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          <span className="capitalize">{record.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleViewSlip(record)}
                          disabled={viewingId === record.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 text-gray-700 dark:text-gray-300 text-xs font-medium transition disabled:opacity-50"
                        >
                          {viewingId === record.id ? (
                            <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600"></span>
                          ) : (
                            <>
                              <Eye className="h-3.5 w-3.5" />
                              View Slip
                            </>
                          )}
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
  );
}
