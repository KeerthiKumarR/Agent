export type AgentName =
  | "COMMERCE_AGENT"
  | "GROWTH_AGENT"
  | "CAMPAIGN_AGENT"
  | "POLICY_ENGINE"
  | "ORCHESTRATOR";

export type AgentActionType =
  | "RECOMMEND_PRODUCT"
  | "ADD_UPSELL"
  | "DETECT_ABANDONMENT"
  | "CALCULATE_INTENT"
  | "CREATE_CAMPAIGN"
  | "SEND_CAMPAIGN"
  | "CREATE_ORDER"
  | "INITIATE_PAYMENT"
  | "VERIFY_PAYMENT"
  | "POLICY_CHECK";

export type PolicyStatus = "ALLOWED" | "BLOCKED" | "REQUIRES_APPROVAL";

export type AuditLogType =
  "EVENT" | "REASONING" | "POLICY" | "ACTION" | "SUCCESS" | "FAILURE";

export interface ProductAttribute {
  waterproof?: boolean;
  waterRepellent?: boolean;
  usage?: string[];
  sizes?: (number | string)[];
  material?: string;
  weight?: string;
  batteryLife?: string;
  capacity?: string;
  [key: string]: any;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  category: string;
  description: string;
  features: string[];
  attributes: ProductAttribute;
  image: string;
  stock: number;
  tags: string[];
  aiMatchScore?: number;
  whyRecommended?: string;
}

export interface Merchant {
  id: string;
  name: string;
  slug: string;
  capabilities: string[];
  policies?: MerchantPolicy;
}

export interface MerchantPolicy {
  id?: string;
  merchantId?: string;
  maxWhatsAppPerWeek: number;
  minCartValue: number;
  minInactivityMinutes: number;
  maxDiscountPercent: number;
  maxCampaignBudget: number;
  requirePaymentApproval: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  messagesSentThisWeek: number;
  lastMessageAt?: string | null;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  isUpsell?: boolean;
}

export interface Cart {
  id: string;
  customerId: string;
  customer?: Customer;
  items: CartItem[];
  status: "ACTIVE" | "ABANDONED" | "RESTORED" | "CONVERTED";
  inactivityDuration: number; // in minutes
  productViews: number;
  timeSpentMinutes: number;
  checkoutInitiated: boolean;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface IntentScoreBreakdown {
  score: number; // 0 - 100
  factors: {
    productViews: { points: number; max: 30; reason: string };
    addedToCart: { points: number; max: 25; reason: string };
    checkoutInitiated: { points: number; max: 20; reason: string };
    highValueCart: { points: number; max: 10; reason: string };
    recentActivity: { points: number; max: 10; reason: string };
  };
  summary: string;
  level: "High" | "Medium" | "Low";
}

export interface PolicyCheckResult {
  status: PolicyStatus;
  reason: string;
  limits: {
    messagesSentThisWeek: number;
    maxMessagesPerWeek: number;
    cartValue: number;
    minCartValue: number;
    inactivityMinutes: number;
    minInactivityMinutes: number;
    discountPercent?: number;
    maxDiscountPercent?: number;
    paymentApprovalRequired?: boolean;
  };
}

export interface AgentActionRecord {
  id: string;
  actionId: string;
  timestamp: string;
  agent: AgentName;
  action: AgentActionType;
  reason: string;
  confidence: number;
  policyStatus: PolicyStatus;
  result: "SUCCESS" | "FAILED" | "PENDING" | "BLOCKED";
  payload?: any;
}

export interface AuditLogEntry {
  id: string;
  type: AuditLogType;
  title: string;
  detail: string;
  agent?: AgentName | string;
  payload?: any;
  timestamp: string;
}

export interface RevenueOpportunity {
  id: string;
  cartId: string;
  customerName: string;
  cartValue: number;
  customerIntent: "High" | "Medium" | "Low";
  intentScore: number;
  urgency: "High" | "Medium" | "Normal";
  recommendedAction: string;
  reasoning: string;
  status: "OPEN" | "EXECUTED" | "DISMISSED";
  createdAt: string;
}

export interface CampaignMessage {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  cartId: string;
  product: Product;
  message: string;
  ctaText: string;
  ctaUrl: string;
  discountPercent: number;
  deliveryStatus: "SENT" | "DELIVERED" | "FAILED";
  deliveryError?: string;
  clicked?: boolean;
  createdAt: string;
}

export interface OrchestrationStep {
  step: "OBSERVE" | "REASON" | "POLICY_CHECK" | "ACT" | "VERIFY" | "LEARN";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED" | "FAILED";
  description: string;
  detail?: string;
  data?: any;
  timestamp: string;
}
