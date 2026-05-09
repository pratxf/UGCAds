"use client";

import { useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

interface RazorpayButtonProps {
  /** Amount in paise (e.g. 500 = ₹5) */
  amountPaise: number;
  currency?: string;
  /** Shown in the Razorpay modal header */
  description?: string;
  /** Your business name shown in the modal */
  businessName?: string;
  children?: React.ReactNode;
  className?: string;
  onSuccess?: (data: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  onFailure?: (error: unknown) => void;
}

export function RazorpayButton({
  amountPaise,
  currency = "INR",
  description = "ugcads payment",
  businessName = "ugcads",
  children = "Pay Now",
  className,
  onSuccess,
  onFailure,
}: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountPaise, currency }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Failed to create order");
      }

      const { order_id, amount } = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: businessName,
        description,
        order_id,
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          if (!verifyRes.ok) {
            const { error } = await verifyRes.json();
            onFailure?.(new Error(error ?? "Signature verification failed"));
            return;
          }

          onSuccess?.(response);
        },
        modal: {
          ondismiss() {
            setLoading(false);
          },
        },
        theme: { color: "#2563EB" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      onFailure?.(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={className}
      >
        {loading ? "Processing..." : children}
      </button>
    </>
  );
}
