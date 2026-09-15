import type { PaymentGateway } from "@/server/payments/types";
import { StripeGateway } from "@/server/payments/stripe";
import { CashOnDeliveryGateway, BankTransferGateway } from "@/server/payments/cod";
import type { PaymentMethod } from "@/generated/prisma/client";

const gateways: Record<PaymentMethod, PaymentGateway> = {
  CARD: new StripeGateway(),
  COD: new CashOnDeliveryGateway(),
  BANK_TRANSFER: new BankTransferGateway(),
  OTHER: new CashOnDeliveryGateway(),
};

export function getPaymentGateway(method: PaymentMethod): PaymentGateway {
  return gateways[method];
}

export { getStripeClient } from "@/server/payments/stripe";
