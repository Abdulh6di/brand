export type PaymentIntentResult = {
  status: "requires_payment" | "succeeded" | "pending";
  clientSecret?: string;
  transactionId?: string;
};

export interface PaymentGateway {
  /** Creates (or reuses) a payment intent for the given order/amount. */
  createPaymentIntent(params: { orderId: string; amount: number; currency: string }): Promise<PaymentIntentResult>;
  /** Issues a full or partial refund against a captured payment. */
  refund(params: { transactionId: string; amount?: number }): Promise<{ success: boolean }>;
}
