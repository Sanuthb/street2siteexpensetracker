import type { ProposalData, ProposalSection } from "./types";
import { calculateProposalTotals, defaultTotalsInput } from "./calculations";

export const proposalSections: ProposalSection[] = [
  { id: "company", label: "Company", visible: true },
  { id: "client", label: "Client", visible: true },
  { id: "details", label: "Details", visible: true },
  { id: "overview", label: "Overview", visible: true },
  { id: "scope", label: "Scope", visible: true },
  { id: "pricing", label: "Pricing", visible: true },
  { id: "deployment", label: "Deployment", visible: true },
  { id: "totals", label: "Totals", visible: true },
  { id: "notes", label: "Notes", visible: true },
  { id: "terms", label: "Terms", visible: true },
  { id: "signatures", label: "Signatures", visible: true },
];

function generateId(prefix: string) {
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${prefix}-${randomPart}`;
}

export function createDefaultProposal(settings?: Record<string, unknown>, client?: Record<string, unknown>): ProposalData {
  const company = {
    name: String(settings?.companyName || "Street2Site LLP"),
    logoUrl: String(settings?.companyLogoUrl || ""),
    address: String(settings?.companyAddress || "#492 Dodda Thoguru, Electronic City, Karnataka, 560-100"),
    phone: String(settings?.companyPhone || "+91 94822 11264"),
    email: String(settings?.companyEmail || "info@street2site.com"),
    website: "street2site.com",
    gstNumber: String(settings?.companyGstin || ""),
  };

  const pricingGroups = [
    {
      id: generateId("group"),
      title: "Website / Application Development",
      description: "Core project design, development, testing, and launch work.",
      items: [
        {
          id: generateId("item"),
          description: "Custom website design and development",
          bullets: ["Responsive UI", "Admin-ready structure", "Basic SEO setup"],
          quantity: 1,
          unitPrice: 9999,
          taxRate: 0,
          optional: false,
          cycle: "one-time" as const,
        },
      ],
    },
  ];

  const deploymentBlocks = [
    { id: generateId("deploy"), title: "Hosting", description: "Hosting/server setup and deployment support.", amount: 0, cycle: "yearly" as const, visible: true },
    { id: generateId("deploy"), title: "API / Third-party Services", description: "External APIs, integrations, and provider charges if applicable.", amount: 0, cycle: "monthly" as const, visible: true },
    { id: generateId("deploy"), title: "Database", description: "Database hosting and storage charges if applicable.", amount: 0, cycle: "monthly" as const, visible: true },
    { id: generateId("deploy"), title: "Maintenance Plan", description: "Monthly maintenance, updates, and technical support.", amount: 0, cycle: "monthly" as const, visible: true },
  ];

  const totals = calculateProposalTotals(pricingGroups, deploymentBlocks, defaultTotalsInput);

  return {
    template: "modern-orange",
    company,
    client: {
      name: String(client?.name || ""),
      companyName: String(client?.company || ""),
      billingAddress: String(client?.billingAddress || ""),
      email: String(client?.email || ""),
      phone: String(client?.phone || ""),
      gstin: String(client?.gstin || ""),
    },
    details: {
      number: `${String(settings?.quotationPrefix || "QUO-")}XXXXXX`,
      issueDate: new Date().toISOString().split("T")[0],
      expiryDate: "",
      currency: "INR",
      projectTitle: "Website Design & Development Proposal",
      preparedBy: "Street2Site Team",
      status: "Draft",
    },
    requirementHtml: "<p>Client requires a modern, responsive, and business-focused digital solution that presents services clearly and supports growth.</p><ul><li>Premium visual design</li><li>Mobile-first user experience</li><li>Reliable deployment and handover</li></ul>",
    scopeRows: [
      { id: generateId("scope"), module: "Discovery & Planning", scope: "Requirement collection, sitemap planning, content structure, and project roadmap." },
      { id: generateId("scope"), module: "UI/UX Design", scope: "Modern responsive design system with premium typography, spacing, and brand-focused layout." },
      { id: generateId("scope"), module: "Development", scope: "Frontend/backend implementation, integrations, testing, and production deployment support." },
    ],
    pricingGroups,
    deploymentBlocks,
    totals,
    notesHtml: "<p>Platform subscriptions, domain, hosting, paid plugins, and third-party services are billed separately unless mentioned in pricing.</p>",
    notesVisible: true,
    termsList: [
      "Advance payment is required to initiate the project.",
      "Timeline depends on content availability and client feedback cycles.",
      "Final handover will be completed after full payment clearance.",
      "Additional features outside the approved scope will be quoted separately.",
    ],
    signatures: {
      authorizedName: "Mahesh G",
      authorizedTitle: "Authorized Signatory",
      authorizedSignatureUrl: "",
      clientSignatureLabel: "Client Signature",
      companySealUrl: "",
    },
    signaturesVisible: true,
    taxesVisible: true,
    footer: company,
    watermarkText: "Street2Site",
    sections: proposalSections,
  };
}

export function serializeProposal(proposal: ProposalData) {
  return JSON.stringify(proposal);
}

/**
 * Ensures all items in a proposal have unique IDs. 
 * This fixes issues where duplicate keys might have been saved in the past.
 */
export function normalizeProposalIds(proposal: ProposalData): ProposalData {
  const seen = new Set<string>();
  
  const ensureUnique = <T extends { id: string }>(item: T, prefix: string): T => {
    if (!item.id || seen.has(item.id)) {
      const newId = generateId(prefix);
      seen.add(newId);
      return { ...item, id: newId };
    }
    seen.add(item.id);
    return item;
  };

  return {
    ...proposal,
    scopeRows: proposal.scopeRows.map((row) => ensureUnique(row, "scope")),
    pricingGroups: proposal.pricingGroups.map((group) => {
      const normalizedGroup = ensureUnique(group, "group");
      return {
        ...normalizedGroup,
        items: normalizedGroup.items.map((item) => ensureUnique(item, "item")),
      };
    }),
    deploymentBlocks: proposal.deploymentBlocks.map((block) => ensureUnique(block, "deploy")),
  };
}

export function parseProposal(value: string | null | undefined, fallback: ProposalData) {
  if (!value) return fallback;
  try {
    const parsed = { ...fallback, ...JSON.parse(value) } as ProposalData;
    return normalizeProposalIds(parsed);
  } catch {
    return fallback;
  }
}

