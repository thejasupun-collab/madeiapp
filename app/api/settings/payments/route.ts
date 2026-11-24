import { NextResponse, connection } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * Public payment-gateway configuration used by the student payments page.
 * Only values that are safe to expose in the browser are returned; merchant
 * secrets and API keys are never included.
 */
interface PublicPaymentSettings {
  payhereEnabled: boolean;
  payhereMerchantId: string;
  payhereCurrency: string;
  payhereAmount: string;
  payhereSandbox: boolean;
  paddleEnabled: boolean;
  paddleClientToken: string;
  paddlePriceId: string;
  paddleEnv: "sandbox" | "production";
}

interface StoredPaymentSettings {
  payhereEnabled?: boolean;
  payhereMerchantId?: string;
  payhereCurrency?: string;
  payhereAmount?: string;
  payhereSandbox?: boolean;
  paddleEnabled?: boolean;
  paddleClientToken?: string;
  paddlePriceId?: string;
  paddleEnv?: string;
  paddleEnvironment?: string;
}

function envDefaults(): PublicPaymentSettings {
  const merchantId = process.env.PAYHERE_MERCHANT_ID || "";
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "";
  const paddleToken = process.env.PADDLE_CLIENT_TOKEN || "";
  const paddlePriceId = process.env.PADDLE_PRICE_ID || "";

  return {
    payhereEnabled: Boolean(merchantId && merchantSecret),
    payhereMerchantId: merchantId,
    payhereCurrency: process.env.PAYHERE_CURRENCY || "LKR",
    payhereAmount: process.env.PAYHERE_AMOUNT || "5000",
    payhereSandbox: process.env.PAYHERE_SANDBOX !== "false",
    paddleEnabled: Boolean(paddleToken && paddlePriceId),
    paddleClientToken: paddleToken,
    paddlePriceId,
    paddleEnv: process.env.PADDLE_ENV === "production" ? "production" : "sandbox",
  };
}

export async function GET() {
  // Reads Firestore on every request, so opt out of prerendering.
  await connection();

  const defaults = envDefaults();

  try {
    const snapshot = await getDoc(doc(db, "settings", "payments"));
    const stored: StoredPaymentSettings = snapshot.exists()
      ? (snapshot.data() as StoredPaymentSettings)
      : {};

    const settings: PublicPaymentSettings = {
      payhereEnabled:
        stored.payhereEnabled !== undefined
          ? Boolean(stored.payhereEnabled)
          : defaults.payhereEnabled,
      payhereMerchantId: String(stored.payhereMerchantId || defaults.payhereMerchantId),
      payhereCurrency: String(stored.payhereCurrency || defaults.payhereCurrency),
      payhereAmount: String(stored.payhereAmount || defaults.payhereAmount),
      payhereSandbox:
        stored.payhereSandbox !== undefined
          ? Boolean(stored.payhereSandbox)
          : defaults.payhereSandbox,
      paddleEnabled:
        stored.paddleEnabled !== undefined ? Boolean(stored.paddleEnabled) : defaults.paddleEnabled,
      paddleClientToken: String(stored.paddleClientToken || defaults.paddleClientToken),
      paddlePriceId: String(stored.paddlePriceId || defaults.paddlePriceId),
      paddleEnv:
        stored.paddleEnv === "production" || stored.paddleEnvironment === "production"
          ? "production"
          : stored.paddleEnv === "sandbox" || stored.paddleEnvironment === "sandbox"
            ? "sandbox"
            : defaults.paddleEnv,
    };

    return NextResponse.json({ success: true, settings });
  } catch (error: unknown) {
    console.error("Payment settings API error:", error);
    // The page should still render with environment defaults if Firestore is unreachable.
    return NextResponse.json({ success: true, settings: defaults });
  }
}
