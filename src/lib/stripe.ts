export interface CheckoutSessionParams {
  priceId: string;
  organizationId: string;
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  successUrl: string;
  cancelUrl: string;
}
