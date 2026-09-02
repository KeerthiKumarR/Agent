import {
  PolicyCheckResult,
  PolicyStatus,
  Cart,
  Customer,
  MerchantPolicy,
} from "../types";
import { db } from "../db";

export interface PolicyEvaluationInput {
  actionType:
    "SEND_CAMPAIGN" | "APPLY_DISCOUNT" | "INITIATE_PAYMENT" | "MODIFY_CART";
  cart?: Cart;
  customer?: Customer;
  proposedDiscount?: number;
  paymentAmount?: number;
}

export const policyEngine = {
  /**
   * Evaluates if a proposed agent action conforms to merchant-configured trust policies
   */
  evaluate: async (
    input: PolicyEvaluationInput,
  ): Promise<PolicyCheckResult> => {
    const merchant = await db.getMerchant();
    const policies = merchant.policies || {
      maxWhatsAppPerWeek: 2,
      minCartValue: 500,
      minInactivityMinutes: 30,
      maxDiscountPercent: 10,
      maxCampaignBudget: 5000,
      requirePaymentApproval: true,
    };

    const customer = input.customer;
    const cart = input.cart;

    // Rule 1: Payment actions ALWAYS require explicit customer approval
    if (input.actionType === "INITIATE_PAYMENT") {
      if (policies.requirePaymentApproval) {
        return {
          status: "REQUIRES_APPROVAL",
          reason:
            "Trust Boundary: AI agent cannot directly charge payment without explicit customer interaction and approval.",
          limits: {
            messagesSentThisWeek: customer?.messagesSentThisWeek || 0,
            maxMessagesPerWeek: policies.maxWhatsAppPerWeek,
            cartValue: cart?.total || 0,
            minCartValue: policies.minCartValue,
            inactivityMinutes: cart?.inactivityDuration || 0,
            minInactivityMinutes: policies.minInactivityMinutes,
            paymentApprovalRequired: true,
          },
        };
      }
    }

    // Rule 2: Campaign Outreach Frequency
    if (input.actionType === "SEND_CAMPAIGN") {
      const messagesSent = customer?.messagesSentThisWeek || 0;
      if (messagesSent >= policies.maxWhatsAppPerWeek) {
        return {
          status: "BLOCKED",
          reason: `Customer communication frequency limit exceeded (${messagesSent}/${policies.maxWhatsAppPerWeek} messages this week) to prevent spamming.`,
          limits: {
            messagesSentThisWeek: messagesSent,
            maxMessagesPerWeek: policies.maxWhatsAppPerWeek,
            cartValue: cart?.total || 0,
            minCartValue: policies.minCartValue,
            inactivityMinutes: cart?.inactivityDuration || 0,
            minInactivityMinutes: policies.minInactivityMinutes,
          },
        };
      }

      // Rule 3: Minimum Cart Value
      if (cart && cart.total < policies.minCartValue) {
        return {
          status: "BLOCKED",
          reason: `Cart value of ₹${cart.total.toLocaleString("en-IN")} is below the minimum recovery threshold of ₹${policies.minCartValue.toLocaleString("en-IN")}.`,
          limits: {
            messagesSentThisWeek: messagesSent,
            maxMessagesPerWeek: policies.maxWhatsAppPerWeek,
            cartValue: cart.total,
            minCartValue: policies.minCartValue,
            inactivityMinutes: cart.inactivityDuration,
            minInactivityMinutes: policies.minInactivityMinutes,
          },
        };
      }

      // Rule 4: Minimum Inactivity Duration
      if (cart && cart.inactivityDuration < policies.minInactivityMinutes) {
        return {
          status: "BLOCKED",
          reason: `Cart has been inactive for only ${cart.inactivityDuration}m (Minimum required policy threshold is ${policies.minInactivityMinutes}m).`,
          limits: {
            messagesSentThisWeek: messagesSent,
            maxMessagesPerWeek: policies.maxWhatsAppPerWeek,
            cartValue: cart.total,
            minCartValue: policies.minCartValue,
            inactivityMinutes: cart.inactivityDuration,
            minInactivityMinutes: policies.minInactivityMinutes,
          },
        };
      }
    }

    // Rule 5: Discount Cap
    if (
      input.proposedDiscount &&
      input.proposedDiscount > policies.maxDiscountPercent
    ) {
      return {
        status: "BLOCKED",
        reason: `Proposed discount of ${input.proposedDiscount}% exceeds merchant maximum policy limit of ${policies.maxDiscountPercent}%.`,
        limits: {
          messagesSentThisWeek: customer?.messagesSentThisWeek || 0,
          maxMessagesPerWeek: policies.maxWhatsAppPerWeek,
          cartValue: cart?.total || 0,
          minCartValue: policies.minCartValue,
          inactivityMinutes: cart?.inactivityDuration || 0,
          minInactivityMinutes: policies.minInactivityMinutes,
          discountPercent: input.proposedDiscount,
          maxDiscountPercent: policies.maxDiscountPercent,
        },
      };
    }

    // Default: Passed all policy boundaries
    return {
      status: "ALLOWED",
      reason: "All merchant trust boundaries and safety constraints passed.",
      limits: {
        messagesSentThisWeek: customer?.messagesSentThisWeek || 0,
        maxMessagesPerWeek: policies.maxWhatsAppPerWeek,
        cartValue: cart?.total || 0,
        minCartValue: policies.minCartValue,
        inactivityMinutes: cart?.inactivityDuration || 0,
        minInactivityMinutes: policies.minInactivityMinutes,
      },
    };
  },
};
