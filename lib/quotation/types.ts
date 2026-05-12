export type ProposalTemplateId = "modern-orange" | "corporate" | "minimal" | "dark";

export type ProposalStatus = "Draft" | "Sent" | "Approved" | "Rejected" | "Expired" | "Converted";

export type ProposalCompanyInfo = {
  name: string;
  logoUrl: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  gstNumber: string;
};

export type ProposalClientInfo = {
  name: string;
  companyName: string;
  billingAddress: string;
  email: string;
  phone: string;
  gstin: string;
};

export type ProposalDetails = {
  number: string;
  issueDate: string;
  expiryDate: string;
  currency: string;
  projectTitle: string;
  preparedBy: string;
  status: ProposalStatus;
};

export type ScopeRow = {
  id: string;
  module: string;
  scope: string;
};

export type PricingCycle = "one-time" | "monthly" | "yearly";

export type PricingItem = {
  id: string;
  description: string;
  bullets: string[];
  quantity: number;
  unitPrice: number;
  taxRate: number;
  optional: boolean;
  cycle: PricingCycle;
};

export type PricingGroup = {
  id: string;
  title: string;
  description: string;
  items: PricingItem[];
};

export type DeploymentBlock = {
  id: string;
  title: string;
  description: string;
  amount: number;
  cycle: PricingCycle;
  visible: boolean;
};

export type ProposalTotalsInput = {
  discountAmount: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  tdsRate: number;
  advanceAmount: number;
};

export type ProposalTotals = ProposalTotalsInput & {
  subtotal: number;
  optionalSubtotal: number;
  monthlyTotal: number;
  yearlyTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  gstTotal: number;
  tdsAmount: number;
  grandTotal: number;
  remainingAmount: number;
};

export type ProposalSignatureData = {
  authorizedName: string;
  authorizedTitle: string;
  authorizedSignatureUrl: string;
  clientSignatureLabel: string;
  companySealUrl: string;
};

export type ProposalSectionKey =
  | "company"
  | "client"
  | "details"
  | "overview"
  | "scope"
  | "pricing"
  | "deployment"
  | "totals"
  | "notes"
  | "terms"
  | "signatures";

export type ProposalSection = {
  id: ProposalSectionKey;
  label: string;
  visible: boolean;
};

export type ProposalData = {
  template: ProposalTemplateId;
  company: ProposalCompanyInfo;
  client: ProposalClientInfo;
  details: ProposalDetails;
  requirementHtml: string;
  scopeRows: ScopeRow[];
  pricingGroups: PricingGroup[];
  deploymentBlocks: DeploymentBlock[];
  totals: ProposalTotals;
  notesHtml: string;
  notesVisible: boolean;
  termsList: string[];
  signatures: ProposalSignatureData;
  signaturesVisible: boolean;
  footer: ProposalCompanyInfo;
  watermarkText: string;
  sections: ProposalSection[];
};
