import { Cart, Customer, Product, CampaignMessage } from '../types';
import { growthAgent } from './growthAgent';
import { policyEngine } from './policyEngine';
import { defaultCampaignProvider } from '../campaign/provider';
import { db } from '../db';
import { generateAICompletion } from '../ai/llm';

export interface CampaignDecision {
  decision: 'SEND_CAMPAIGN' | 'WAIT' | 'DO_NOT_CONTACT';
  reason: string;
  confidence: number;
  intentScore: number;
}

export const campaignAgent = {
  /**
   * Evaluates if a cart warrants proactive campaign intervention
   */
  evaluateOutreach: async (cart: Cart, customer: Customer): Promise<CampaignDecision> => {
    const intent = growthAgent.calculateIntentScore(cart);

    if (intent.score < 40) {
      return {
        decision: 'DO_NOT_CONTACT',
        reason: 'Customer purchase intent is low. Proactive messaging would be intrusive.',
        confidence: 0.89,
        intentScore: intent.score
      };
    }

    if (cart.inactivityDuration < 30) {
      return {
        decision: 'WAIT',
        reason: `Cart inactive for only ${cart.inactivityDuration}m. Customer may still be comparing options actively.`,
        confidence: 0.85,
        intentScore: intent.score
      };
    }

    return {
      decision: 'SEND_CAMPAIGN',
      reason: `Customer demonstrates high purchase intent (${intent.score}%) and has not received outreach recently.`,
      confidence: 0.94,
      intentScore: intent.score
    };
  },

  /**
   * Generates helpful, intelligent, non-aggressive WhatsApp copy with LLM and semantic fallback
   */
  generateCampaign: async (
    cart: Cart, 
    customer: Customer, 
    primaryProduct: Product
  ): Promise<{ message: string; ctaText: string; ctaUrl: string }> => {
    const firstName = customer.name.split(' ')[0] || 'there';
    const ctaText = "View My Cart";
    const ctaUrl = `/checkout?cartId=${cart.id}&restored=true`;

    const systemPrompt = `You are the Campaign Orchestrator Agent for Velocity Sports. Generate a friendly, non-aggressive, personalized WhatsApp recovery message for an abandoned shopping cart. 
Rules:
- Address the customer by their first name (${firstName}).
- Do NOT use cheesy marketing hype, countdown urgency, or spam words.
- Gently remind them of the item (${primaryProduct.name}) and reference its technical suitability (e.g. waterproofing, trail comfort).
- Mention that their cart is saved whenever they are ready.
- Keep the message under 60 words.`;

    const userPrompt = `Customer: ${customer.name}. Product: ${primaryProduct.name} (₹${primaryProduct.price}). Dwell time: ${cart.timeSpentMinutes} mins. Views: ${cart.productViews}x. Attributes: ${JSON.stringify(primaryProduct.attributes)}.`;

    const llmRes = await generateAICompletion({ systemPrompt, userPrompt, temperature: 0.7 });

    if (llmRes.text) {
      return {
        message: llmRes.text,
        ctaText,
        ctaUrl
      };
    }

    // High quality semantic fallback
    let copy = `Hey ${firstName}! 👋\n\n`;
    copy += `Still thinking about the *${primaryProduct.name}*?\n\n`;

    if (primaryProduct.attributes?.waterproof) {
      copy += `You spent some time comparing them, and based on your interest in outdoor running, their waterproof design makes them a strong fit for your training.\n\n`;
    } else {
      copy += `You spent some time reviewing gear, and based on your recent activity, this remains one of our top-rated picks.\n\n`;
    }

    copy += `They're still saved in your cart whenever you're ready 😊`;

    return {
      message: copy,
      ctaText,
      ctaUrl
    };
  },

  /**
   * Orchestrates sending campaign with policy verification
   */
  dispatchCampaign: async (cart: Cart, customer: Customer, simulateFailure = false): Promise<CampaignMessage> => {
    const primaryItem = cart.items[0];
    const product = primaryItem ? primaryItem.product : (await db.getProducts())[0];

    // 1. Gated Policy Check (Deterministic Rule Engine)
    const policyResult = await policyEngine.evaluate({
      actionType: 'SEND_CAMPAIGN',
      cart,
      customer
    });

    if (policyResult.status === 'BLOCKED') {
      throw new Error(`Policy Blocked Campaign: ${policyResult.reason}`);
    }

    // 2. Generate Copy (LLM / Semantic)
    const generated = await campaignAgent.generateCampaign(cart, customer, product);

    // 3. Send via Provider
    const providerResult = await defaultCampaignProvider.sendMessage({
      to: customer.phone,
      recipientName: customer.name,
      message: generated.message,
      mediaUrl: product.image,
      ctaText: generated.ctaText,
      ctaUrl: generated.ctaUrl
    }, simulateFailure);

    const campaignRecord: CampaignMessage = {
      id: `camp_${Date.now()}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      cartId: cart.id,
      product,
      message: generated.message,
      ctaText: generated.ctaText,
      ctaUrl: generated.ctaUrl,
      discountPercent: 0,
      deliveryStatus: providerResult.status,
      deliveryError: providerResult.error,
      clicked: false,
      createdAt: new Date().toISOString()
    };

    await db.saveCampaign(campaignRecord);
    return campaignRecord;
  }
};
