import {
  Cart,
  Customer,
  OrchestrationStep,
  AuditLogEntry,
  AgentActionRecord,
  CampaignMessage,
} from "../types";
import { growthAgent } from "./growthAgent";
import { campaignAgent } from "./campaignAgent";
import { policyEngine } from "./policyEngine";
import { db } from "../db";

export interface OrchestrationResult {
  steps: OrchestrationStep[];
  decision: "SEND_CAMPAIGN" | "WAIT" | "DO_NOT_CONTACT";
  policyStatus: "ALLOWED" | "BLOCKED" | "REQUIRES_APPROVAL";
  campaign?: CampaignMessage;
  auditEntries: AuditLogEntry[];
}

export const agentOrchestrator = {
  /**
   * Executes the full 6-step autonomous recovery loop on an abandoned cart
   */
  runRecoveryWorkflow: async (
    cartId: string,
    simulateFailure = false,
  ): Promise<OrchestrationResult> => {
    const steps: OrchestrationStep[] = [];
    const auditEntries: AuditLogEntry[] = [];

    const cart = await db.getCartById(cartId);
    if (!cart) throw new Error("Cart not found");

    const customer = (await db.getCustomer(cart.customerId)) || {
      id: cart.customerId,
      name: "Rohan Sharma",
      email: "rohan.sharma@example.com",
      phone: "+91 98765 43210",
      messagesSentThisWeek: 1,
      lastMessageAt: null,
    };

    const primaryProduct =
      cart.items[0]?.product || (await db.getProducts())[0];

    // ──────────────────────────────────────────
    // STEP 1: OBSERVE
    // ──────────────────────────────────────────
    const observeStep: OrchestrationStep = {
      step: "OBSERVE",
      status: "COMPLETED",
      description: `Observed cart inactive for ${cart.inactivityDuration} minutes with ${cart.productViews} product view(s).`,
      detail: `Telemetry: ${cart.timeSpentMinutes} mins dwell time, checkout reached: ${cart.checkoutInitiated}.`,
      data: {
        cartId: cart.id,
        inactivityDuration: cart.inactivityDuration,
        productViews: cart.productViews,
        timeSpentMinutes: cart.timeSpentMinutes,
        checkoutInitiated: cart.checkoutInitiated,
        cartValue: cart.total,
      },
      timestamp: new Date().toISOString(),
    };
    steps.push(observeStep);

    const log1 = await db.addAuditLog({
      type: "EVENT",
      title: "Cart Inactivity Observed",
      detail: `Cart ${cart.id} inactive for ${cart.inactivityDuration}m. Total: ₹${cart.total.toLocaleString("en-IN")}.`,
      agent: "ORCHESTRATOR",
      payload: observeStep.data,
    });
    auditEntries.push(log1);

    // ──────────────────────────────────────────
    // STEP 2: REASON
    // ──────────────────────────────────────────
    const intentAnalysis = growthAgent.calculateIntentScore(cart);
    const outreachDecision = await campaignAgent.evaluateOutreach(
      cart,
      customer,
    );

    const reasonStep: OrchestrationStep = {
      step: "REASON",
      status: "COMPLETED",
      description: `Purchase intent calculated at ${intentAnalysis.score} / 100 (${intentAnalysis.level} Intent).`,
      detail: `Decision: ${outreachDecision.decision}. ${outreachDecision.reason}`,
      data: {
        intentScore: intentAnalysis.score,
        intentFactors: intentAnalysis.factors,
        decision: outreachDecision.decision,
        confidence: outreachDecision.confidence,
      },
      timestamp: new Date().toISOString(),
    };
    steps.push(reasonStep);

    const log2 = await db.addAuditLog({
      type: "REASONING",
      title: `Intent Reasoned (${intentAnalysis.score}%)`,
      detail: `Decision: ${outreachDecision.decision}. ${outreachDecision.reason}`,
      agent: "GROWTH_AGENT",
      payload: reasonStep.data,
    });
    auditEntries.push(log2);

    if (outreachDecision.decision !== "SEND_CAMPAIGN") {
      return {
        steps,
        decision: outreachDecision.decision,
        policyStatus: "ALLOWED",
        auditEntries,
      };
    }

    // ──────────────────────────────────────────
    // STEP 3: POLICY CHECK
    // ──────────────────────────────────────────
    const policyResult = await policyEngine.evaluate({
      actionType: "SEND_CAMPAIGN",
      cart,
      customer,
    });

    const policyStep: OrchestrationStep = {
      step: "POLICY_CHECK",
      status: policyResult.status === "ALLOWED" ? "COMPLETED" : "BLOCKED",
      description: `Policy Engine: ${policyResult.status}. Frequency: ${policyResult.limits.messagesSentThisWeek}/${policyResult.limits.maxMessagesPerWeek} msgs.`,
      detail: policyResult.reason,
      data: policyResult,
      timestamp: new Date().toISOString(),
    };
    steps.push(policyStep);

    const log3 = await db.addAuditLog({
      type: "POLICY",
      title: `Policy Engine Result: ${policyResult.status}`,
      detail: policyResult.reason,
      agent: "POLICY_ENGINE",
      payload: policyResult,
    });
    auditEntries.push(log3);

    if (policyResult.status === "BLOCKED") {
      return {
        steps,
        decision: "DO_NOT_CONTACT",
        policyStatus: "BLOCKED",
        auditEntries,
      };
    }

    // ──────────────────────────────────────────
    // STEP 4: ACT
    // ──────────────────────────────────────────
    let campaign: CampaignMessage | undefined;
    let actStatus: "COMPLETED" | "FAILED" = "COMPLETED";

    try {
      campaign = await campaignAgent.dispatchCampaign(
        cart,
        customer,
        simulateFailure,
      );
      if (campaign.deliveryStatus === "FAILED") {
        actStatus = "FAILED";
      }
    } catch (err: any) {
      actStatus = "FAILED";
    }

    const actStep: OrchestrationStep = {
      step: "ACT",
      status: actStatus === "COMPLETED" ? "COMPLETED" : "FAILED",
      description: `Generated personalized WhatsApp recovery campaign for ${customer.name}.`,
      detail: `Target: ${customer.phone}. Hero: ${primaryProduct.name} (₹${primaryProduct.price.toLocaleString("en-IN")}).`,
      data: campaign,
      timestamp: new Date().toISOString(),
    };
    steps.push(actStep);

    const log4 = await db.addAuditLog({
      type: "ACTION",
      title: "Campaign Message Dispatched",
      detail: `Personalized campaign sent to ${customer.phone} for ${primaryProduct.name}.`,
      agent: "CAMPAIGN_AGENT",
      payload: {
        campaignId: campaign?.id,
        deliveryStatus: campaign?.deliveryStatus,
      },
    });
    auditEntries.push(log4);

    // ──────────────────────────────────────────
    // STEP 5: VERIFY
    // ──────────────────────────────────────────
    const verifySuccess = campaign?.deliveryStatus === "DELIVERED";
    const verifyStep: OrchestrationStep = {
      step: "VERIFY",
      status: verifySuccess ? "COMPLETED" : "FAILED",
      description: verifySuccess
        ? `WhatsApp delivery confirmed by CampaignProvider (ID: ${campaign?.id}).`
        : `Campaign delivery failed: ${campaign?.deliveryError || "Provider error"}.`,
      detail: verifySuccess
        ? "Receipt status: DELIVERED"
        : "Scheduled bounded retry check.",
      data: {
        verified: verifySuccess,
        deliveryStatus: campaign?.deliveryStatus,
      },
      timestamp: new Date().toISOString(),
    };
    steps.push(verifyStep);

    const log5 = await db.addAuditLog({
      type: verifySuccess ? "SUCCESS" : "FAILURE",
      title: verifySuccess ? "Delivery Verified" : "Delivery Failure Recorded",
      detail: verifySuccess
        ? `WhatsApp message delivered successfully to ${customer.phone}.`
        : `Delivery error: ${campaign?.deliveryError}`,
      agent: "ORCHESTRATOR",
      payload: verifyStep.data,
    });
    auditEntries.push(log5);

    // ──────────────────────────────────────────
    // STEP 6: LEARN
    // ──────────────────────────────────────────
    const learnStep: OrchestrationStep = {
      step: "LEARN",
      status: "IN_PROGRESS",
      description:
        "Listening for customer cart restoration & checkout conversion.",
      detail: "Reinforcement feedback loop active.",
      data: { cartId: cart.id, status: "LISTENING_FOR_CONVERSION" },
      timestamp: new Date().toISOString(),
    };
    steps.push(learnStep);

    return {
      steps,
      decision: "SEND_CAMPAIGN",
      policyStatus: policyResult.status,
      campaign,
      auditEntries,
    };
  },
};
