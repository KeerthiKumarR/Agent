export interface SendMessagePayload {
  to: string;
  recipientName: string;
  message: string;
  mediaUrl?: string;
  ctaText: string;
  ctaUrl: string;
}

export interface SendMessageResponse {
  success: boolean;
  messageId: string;
  status: "SENT" | "DELIVERED" | "FAILED";
  error?: string;
  timestamp: string;
}

export interface CampaignProvider {
  sendMessage(
    payload: SendMessagePayload,
    simulateFailure?: boolean,
  ): Promise<SendMessageResponse>;
  getDeliveryStatus(
    messageId: string,
  ): Promise<"SENT" | "DELIVERED" | "READ" | "FAILED">;
}

/**
 * Demo Campaign Provider (Simulates WhatsApp Business Cloud API)
 */
export class DemoWhatsAppProvider implements CampaignProvider {
  async sendMessage(
    payload: SendMessagePayload,
    simulateFailure = false,
  ): Promise<SendMessageResponse> {
    // Artificial latency for realism
    await new Promise((r) => setTimeout(r, 400));

    if (simulateFailure) {
      return {
        success: false,
        messageId: `msg_err_${Date.now()}`,
        status: "FAILED",
        error:
          "WhatsApp Delivery Error: Recipient phone number unreachable or opted out.",
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      messageId: `wamid_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      status: "DELIVERED",
      timestamp: new Date().toISOString(),
    };
  }

  async getDeliveryStatus(
    messageId: string,
  ): Promise<"SENT" | "DELIVERED" | "READ" | "FAILED"> {
    if (messageId.includes("err")) return "FAILED";
    return "READ";
  }
}

export const defaultCampaignProvider = new DemoWhatsAppProvider();
