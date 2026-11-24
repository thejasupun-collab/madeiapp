import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface StoredPaymentSettings {
  payhereMerchantId?: string;
  payhereMerchantSecret?: string;
  payhereEnabled?: boolean;
}

function md5(value: string): string {
  return createHash("md5").update(value).digest("hex").toUpperCase();
}

async function readStoredSettings(): Promise<StoredPaymentSettings> {
  try {
    const snapshot = await getDoc(doc(db, "settings", "payments"));
    return snapshot.exists() ? (snapshot.data() as StoredPaymentSettings) : {};
  } catch (error) {
    console.warn("Could not read settings/payments for PayHere hash:", error);
    return {};
  }
}

/**
 * Generates the PayHere checkout hash server-side so the merchant secret never
 * reaches the browser. Formula (PayHere docs):
 *   md5(merchant_id + order_id + amount + currency + md5(merchant_secret))
 */
export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const payload = (body ?? {}) as Record<string, unknown>;
    const orderId = String(payload.orderId ?? payload.order_id ?? "").trim();
    const currency = String(payload.currency ?? "LKR")
      .trim()
      .toUpperCase();
    const amountValue = Number(payload.amount);

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      return NextResponse.json({ error: "Invalid currency code" }, { status: 400 });
    }

    const stored = await readStoredSettings();
    const merchantId = process.env.PAYHERE_MERCHANT_ID || String(stored.payhereMerchantId || "");
    const merchantSecret =
      process.env.PAYHERE_MERCHANT_SECRET || String(stored.payhereMerchantSecret || "");

    if (!merchantId || !merchantSecret) {
      return NextResponse.json(
        {
          error:
            "PayHere is not configured yet. Add PAYHERE_MERCHANT_ID and PAYHERE_MERCHANT_SECRET, or save them in admin payment settings.",
        },
        { status: 503 }
      );
    }

    // PayHere expects the amount with two decimals and the same string must be
    // used in startPayment, so it is returned alongside the hash.
    const amount = amountValue.toFixed(2);
    const secretHash = md5(merchantSecret);
    const hash = md5(`${merchantId}${orderId}${amount}${currency}${secretHash}`);

    return NextResponse.json({
      success: true,
      hash,
      merchantId,
      amount,
      currency,
    });
  } catch (error: unknown) {
    console.error("PayHere hash API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate PayHere hash" },
      { status: 500 }
    );
  }
}
