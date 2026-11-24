import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, message, html } = body;

    const recipients = Array.isArray(to)
      ? to.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : typeof to === "string" && to.trim().length > 0
      ? [to.trim()]
      : [];

    if (recipients.length === 0 || !subject || (!message && !html)) {
      return NextResponse.json(
        { error: "Missing required fields (to, subject, and message/html)" },
        { status: 400 }
      );
    }

    let apiKey = process.env.RESEND_API_KEY || "";
    let fromEmail = process.env.RESEND_FROM_EMAIL || "MadeiApp <onboarding@resend.dev>";

    if (!apiKey) {
      try {
        const emailSnap = await getDoc(doc(db, "settings", "email"));
        if (emailSnap.exists()) {
          const cfg = emailSnap.data() as { resendApiKey?: string; apiKey?: string; fromEmail?: string };
          apiKey = cfg.resendApiKey || cfg.apiKey || "";
          if (cfg.fromEmail) fromEmail = cfg.fromEmail;
        }
      } catch (err) {
        console.warn("Could not read settings/email from Firestore:", err);
      }
    }

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        configured: false,
        message: "Email service not configured yet",
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: recipients,
        subject,
        html: html || `<p>${String(message).replace(/\n/g, "<br/>")}</p>`,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to send email via Resend");
    }

    return NextResponse.json({
      success: true,
      configured: true,
      message: `Email sent successfully to ${recipients.length} recipient(s).`,
      data,
    });
  } catch (error: unknown) {
    console.error("Email send API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    );
  }
}