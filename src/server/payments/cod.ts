import type { PaymentGateway, PaymentIntentResult } from "@/server/payments/types";

/** Cash on Delivery: no external gateway call — payment is collected offline on delivery. */
export class CashOnDeliveryGateway implements PaymentGateway {
  async createPaymentIntent(): Promise<PaymentIntentResult> {
    return { status: "pending" };
  }

  async refund() {
    return { success: true };
  }
}

export class BankTransferGateway implements PaymentGateway {
  async createPaymentIntent(): Promise<PaymentIntentResult> {
    return { status: "pending" };
  }

  async refund() {
    return { success: false };
  }
}
