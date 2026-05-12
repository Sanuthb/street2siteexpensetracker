"use client";

import { useMemo, useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, Trash2, ArrowUp, ArrowDown, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createQuotation, updateQuotation } from "@/lib/actions/quotations";
import { calculateProposalTotals } from "@/lib/quotation/calculations";
import { createDefaultProposal } from "@/lib/quotation/defaults";
import type { DeploymentBlock, PricingCycle, PricingGroup, ProposalData, ProposalTemplateId } from "@/lib/quotation/types";
import { ProposalPreview } from "./proposal-preview";

function uid(prefix: string) {
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${prefix}-${randomPart}`;
}

function updateAt<T extends { id: string }>(rows: T[], id: string, patch: Partial<T>) {
  return rows.map((row) => row.id === id ? { ...row, ...patch } : row);
}

function moveAt<T>(rows: T[], index: number, direction: -1 | 1) {
  const next = [...rows];
  const target = index + direction;
  if (target < 0 || target >= rows.length) return rows;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function RichTextToolbar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const append = (snippet: string) => onChange(`${value}${value ? "\n" : ""}${snippet}`);
  return (
    <div className="mb-2 flex flex-wrap gap-2">
      <Button type="button" size="sm" variant="outline" onClick={() => append("<p>New paragraph...</p>")}>Paragraph</Button>
      <Button type="button" size="sm" variant="outline" onClick={() => append("<strong>Bold text</strong>")}>Bold</Button>
      <Button type="button" size="sm" variant="outline" onClick={() => append("<ul><li>Bullet point</li><li>Bullet point</li></ul>")}>Bullets</Button>
    </div>
  );
}

type ProposalBuilderProps = {
  clients: Record<string, unknown>[];
  taxes?: { id: string; name: string; rate: number; isActive: boolean }[];
  settings?: Record<string, unknown> | null;
  initialData?: {
    id: string;
    clientId: string;
    projectId?: string | null;
    proposal: ProposalData;
  };
};

// Simple ID generator - keeps "XXXXXX" initially, replaces when actually saving
// This avoids hydration mismatch since we don't generate random values during render

export function ProposalBuilder({ clients, taxes = [], settings, initialData }: ProposalBuilderProps) {
  const router = useRouter();
  const [clientId, setClientId] = useState(initialData?.clientId || "");
  const [proposal, setProposal] = useState<ProposalData>(() => {
    if (initialData?.proposal) return initialData.proposal;

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("premium-proposal-draft");
      if (saved) {
        try {
          return JSON.parse(saved) as ProposalData;
        } catch {
          localStorage.removeItem("premium-proposal-draft");
        }
      }
    }

    return createDefaultProposal(settings || undefined);
  });
  const isEditing = Boolean(initialData?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      localStorage.setItem("premium-proposal-draft", JSON.stringify(proposal));
    }
  }, [proposal, isEditing]);

  const selectedClient = useMemo(() => clients.find((client) => String(client.id) === clientId), [clients, clientId]);

  const proposalWithSelectedClient = useMemo(() => {
    if (!selectedClient) return proposal;
    return {
      ...proposal,
      client: {
        name: String(selectedClient.name || ""),
        companyName: String(selectedClient.company || ""),
        billingAddress: String(selectedClient.billingAddress || ""),
        email: String(selectedClient.email || ""),
        phone: String(selectedClient.phone || ""),
        gstin: proposal.client.gstin || String(selectedClient.gstin || ""),
      },
    };
  }, [proposal, selectedClient]);

  const proposalWithTotals = useMemo(() => {
    const prefix = String(settings?.quotationPrefix || "QUO-");
    const number = proposalWithSelectedClient.details.number.includes("XXXXXX")
      ? `${prefix}${Date.now().toString(36).toUpperCase()}`
      : proposalWithSelectedClient.details.number;
    return {
      ...proposalWithSelectedClient,
      details: { ...proposalWithSelectedClient.details, number },
      totals: calculateProposalTotals(proposalWithSelectedClient.pricingGroups, proposalWithSelectedClient.deploymentBlocks, proposalWithSelectedClient.totals),
    };
  }, [proposalWithSelectedClient]);

  const setField = <K extends keyof ProposalData>(field: K, value: ProposalData[K]) => setProposal((current) => ({ ...current, [field]: value }));

  const handleLogo = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const logoUrl = await fileToDataUrl(file);
    setProposal((current) => ({ ...current, company: { ...current.company, logoUrl }, footer: { ...current.footer, logoUrl } }));
  };

  const saveDraft = async () => {
    if (!clientId) {
      toast.error("Please select a client before saving.");
      return;
    }
    setIsSubmitting(true);
    const result = isEditing
      ? await updateQuotation(initialData!.id, { ...proposalWithTotals, clientId, projectId: initialData?.projectId || undefined })
      : await createQuotation({ ...proposalWithTotals, clientId });
    setIsSubmitting(false);

    if (result.success) {
      localStorage.removeItem("premium-proposal-draft");
      toast.success(isEditing ? "Premium quotation updated." : "Premium quotation draft saved.");
      router.push(`/quotations/${result.id}`);
    } else {
      toast.error(result.error || "Failed to save quotation.");
    }
  };

  const addScope = () => setField("scopeRows", [...proposal.scopeRows, { id: uid("scope"), module: "New Module", scope: "Describe the scope here." }]);
  const addGroup = () => setField("pricingGroups", [...proposal.pricingGroups, { id: uid("group"), title: "New Service Group", description: "Describe this group.", items: [] }]);
  const addDeployment = () => setField("deploymentBlocks", [...proposal.deploymentBlocks, { id: uid("deploy"), title: "New Cost", description: "Describe this cost.", amount: 0, cycle: "monthly", visible: true }]);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_460px]">
      <div className="space-y-6">
        <Card className="border-orange-200 bg-gradient-to-br from-white to-orange-100 shadow-md">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl text-slate-950">{isEditing ? "Edit Premium Quotation" : "Premium Proposal Builder"}</CardTitle>
              <p className="text-sm text-slate-600 font-medium">Create Canva-style multi-page quotations with live preview and PDF export.</p>
            </div>
            <div className="flex gap-2">
              <Select value={proposal.template} onValueChange={(value) => setField("template", value as ProposalTemplateId)}>
                <SelectTrigger className="w-44 bg-white/80 border-orange-200 text-slate-900 shadow-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern-orange">Modern Orange</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={saveDraft} disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700"><Save className="mr-2 h-4 w-4" />{isEditing ? "Update" : "Save Draft"}</Button>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid h-auto grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scope">Scope</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="terms">Terms</TabsTrigger>
            <TabsTrigger value="signatures">Signs</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card><CardHeader><CardTitle>Company Information</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Company name</Label><Input value={proposal.company.name} onChange={(e) => setField("company", { ...proposal.company, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Logo upload</Label><Input type="file" accept="image/*" onChange={handleLogo} /></div>
              <div className="space-y-2 md:col-span-2"><Label>Address</Label><Textarea value={proposal.company.address} onChange={(e) => setField("company", { ...proposal.company, address: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={proposal.company.phone} onChange={(e) => setField("company", { ...proposal.company, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={proposal.company.email} onChange={(e) => setField("company", { ...proposal.company, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Website</Label><Input value={proposal.company.website} onChange={(e) => setField("company", { ...proposal.company, website: e.target.value })} /></div>
              <div className="space-y-2"><Label>GST Number</Label><Input value={proposal.company.gstNumber} onChange={(e) => setField("company", { ...proposal.company, gstNumber: e.target.value })} /></div>
            </CardContent></Card>

            <Card><CardHeader><CardTitle>Client & Quotation Details</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Select client</Label><Select value={clientId} onValueChange={setClientId}><SelectTrigger><SelectValue placeholder="Choose client" /></SelectTrigger><SelectContent>{clients.map((client) => <SelectItem key={String(client.id)} value={String(client.id)}>{String(client.name)} {client.company ? `- ${String(client.company)}` : ""}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Client GSTIN</Label><Input value={proposal.client.gstin} onChange={(e) => setField("client", { ...proposal.client, gstin: e.target.value })} /></div>
              <div className="space-y-2"><Label>Quotation number</Label><Input value={proposal.details.number} onChange={(e) => setField("details", { ...proposal.details, number: e.target.value })} /></div>
              <div className="space-y-2"><Label>Currency</Label><Input value={proposal.details.currency} onChange={(e) => setField("details", { ...proposal.details, currency: e.target.value })} /></div>
              <div className="space-y-2"><Label>Issue date</Label><Input type="date" value={proposal.details.issueDate} onChange={(e) => setField("details", { ...proposal.details, issueDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>Expiry date</Label><Input type="date" value={proposal.details.expiryDate} onChange={(e) => setField("details", { ...proposal.details, expiryDate: e.target.value })} /></div>
              <div className="space-y-2 md:col-span-2"><Label>Project title</Label><Input value={proposal.details.projectTitle} onChange={(e) => setField("details", { ...proposal.details, projectTitle: e.target.value })} /></div>
              <div className="space-y-2"><Label>Prepared by</Label><Input value={proposal.details.preparedBy} onChange={(e) => setField("details", { ...proposal.details, preparedBy: e.target.value })} /></div>
              <div className="space-y-2"><Label>Status</Label><Select value={proposal.details.status} onValueChange={(value) => setField("details", { ...proposal.details, status: value as typeof proposal.details.status })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Draft","Sent","Approved","Rejected","Expired"].map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="overview"><Card><CardHeader><CardTitle>Requirement / Project Overview</CardTitle></CardHeader><CardContent><RichTextToolbar value={proposal.requirementHtml} onChange={(value) => setField("requirementHtml", value)} /><Textarea className="min-h-80 font-mono" value={proposal.requirementHtml} onChange={(e) => setField("requirementHtml", e.target.value)} /></CardContent></Card></TabsContent>

          <TabsContent value="scope" className="space-y-4"><div className="flex justify-end"><Button onClick={addScope}><Plus className="mr-2 h-4 w-4" />Add scope row</Button></div>{proposal.scopeRows.map((row, index) => <Card key={`${row.id}-${index}`}><CardContent className="grid gap-3 pt-6 md:grid-cols-[180px_1fr_auto]"><Input value={row.module} onChange={(e) => setField("scopeRows", updateAt(proposal.scopeRows, row.id, { module: e.target.value }))} /><Textarea value={row.scope} onChange={(e) => setField("scopeRows", updateAt(proposal.scopeRows, row.id, { scope: e.target.value }))} /><div className="flex gap-2"><Button size="icon" variant="outline" onClick={() => setField("scopeRows", moveAt(proposal.scopeRows, index, -1))}><ArrowUp className="h-4 w-4" /></Button><Button size="icon" variant="outline" onClick={() => setField("scopeRows", moveAt(proposal.scopeRows, index, 1))}><ArrowDown className="h-4 w-4" /></Button><Button size="icon" variant="destructive" onClick={() => setField("scopeRows", proposal.scopeRows.filter((item) => item.id !== row.id))}><Trash2 className="h-4 w-4" /></Button></div></CardContent></Card>)}</TabsContent>

          <TabsContent value="pricing" className="space-y-5"><div className="flex justify-end"><Button onClick={addGroup}><Plus className="mr-2 h-4 w-4" />Add service group</Button></div>{proposal.pricingGroups.map((group, index) => <PricingGroupEditor key={`${group.id}-${index}`} group={group} setProposal={setProposal} taxes={taxes} />)}<DeploymentEditor proposal={proposal} setProposal={setProposal} addDeployment={addDeployment} /><TotalsEditor proposal={proposal} setProposal={setProposal} taxes={taxes} /></TabsContent>

          <TabsContent value="terms" className="space-y-6"><Card><CardHeader><CardTitle>Notes</CardTitle></CardHeader><CardContent><div className="mb-3 flex items-center gap-2"><Switch checked={proposal.notesVisible} onCheckedChange={(checked) => setField("notesVisible", checked)} /><Label>Show notes in proposal</Label></div><RichTextToolbar value={proposal.notesHtml} onChange={(value) => setField("notesHtml", value)} /><Textarea className="min-h-40 font-mono" value={proposal.notesHtml} onChange={(e) => setField("notesHtml", e.target.value)} /></CardContent></Card><Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Terms & Conditions</CardTitle><Button onClick={() => setField("termsList", [...proposal.termsList, "New condition"])}><Plus className="mr-2 h-4 w-4" />Add</Button></CardHeader><CardContent className="space-y-3">{proposal.termsList.map((term, index) => <div key={`${term}-${index}`} className="flex gap-2"><Input value={term} onChange={(e) => setField("termsList", proposal.termsList.map((item, itemIndex) => itemIndex === index ? e.target.value : item))} /><Button size="icon" variant="outline" onClick={() => setField("termsList", moveAt(proposal.termsList, index, -1))}><ArrowUp className="h-4 w-4" /></Button><Button size="icon" variant="outline" onClick={() => setField("termsList", moveAt(proposal.termsList, index, 1))}><ArrowDown className="h-4 w-4" /></Button><Button size="icon" variant="destructive" onClick={() => setField("termsList", proposal.termsList.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4" /></Button></div>)}</CardContent></Card></TabsContent>

          <TabsContent value="signatures">
            <Card>
              <CardHeader><CardTitle>Signature Section</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-2">
                  <Switch checked={proposal.signaturesVisible} onCheckedChange={(checked) => setField("signaturesVisible", checked)} />
                  <Label>Show signatures in proposal</Label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label>Authorized name</Label><Input value={proposal.signatures.authorizedName} onChange={(e) => setField("signatures", { ...proposal.signatures, authorizedName: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Authorized title</Label><Input value={proposal.signatures.authorizedTitle} onChange={(e) => setField("signatures", { ...proposal.signatures, authorizedTitle: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Client signature label</Label><Input value={proposal.signatures.clientSignatureLabel} onChange={(e) => setField("signatures", { ...proposal.signatures, clientSignatureLabel: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Watermark</Label><Input value={proposal.watermarkText} onChange={(e) => setField("watermarkText", e.target.value)} /></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <aside className="xl:sticky xl:top-6 xl:self-start">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground"><FileText className="h-4 w-4" /> Live A4 Preview</div>
        <ProposalPreview proposal={proposalWithTotals} />
      </aside>
    </div>
  );
}

function PricingGroupEditor({ group, setProposal, taxes }: { group: PricingGroup; setProposal: (fn: (current: ProposalData) => ProposalData) => void; taxes: { id: string; name: string; rate: number; isActive: boolean }[] }) {
  const updateGroup = (patch: Partial<PricingGroup>) => setProposal((current) => ({ ...current, pricingGroups: updateAt(current.pricingGroups, group.id, patch) }));
  const addItem = () => updateGroup({ items: [...group.items, { id: uid("item"), description: "New pricing item", bullets: [], quantity: 1, unitPrice: 0, taxRate: 0, optional: false, cycle: "one-time" }] });
  return <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><div className="flex-1"><Input value={group.title} onChange={(e) => updateGroup({ title: e.target.value })} className="font-bold text-lg" placeholder="Service Group Name" /></div><div className="flex gap-2"><Button onClick={addItem} size="sm"><Plus className="mr-1 h-4 w-4" />Add Item</Button><Button variant="destructive" size="sm" onClick={() => setProposal((current) => ({ ...current, pricingGroups: current.pricingGroups.filter((item) => item.id !== group.id) }))}><Trash2 className="mr-1 h-4 w-4" />Delete</Button></div></CardHeader><CardContent className="space-y-4"><Textarea value={group.description} onChange={(e) => updateGroup({ description: e.target.value })} placeholder="Describe what this service group includes..." className="min-h-[80px]" />{group.items.length === 0 ? <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">No items yet. Click "Add Item" to add services.</div> : <div className="space-y-4">{group.items.map((item, index) => <div key={`${item.id}-${index}`} className="rounded-2xl border p-5 bg-muted/30 space-y-4"><div className="flex items-center justify-between"><span className="text-sm font-semibold">Service Item</span><Button size="sm" variant="destructive" onClick={() => updateGroup({ items: group.items.filter((row) => row.id !== item.id) })}><Trash2 className="mr-1 h-3 w-3" />Remove</Button></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><div className="lg:col-span-2"><Label className="text-xs text-muted-foreground mb-1 block">Description</Label><Input value={item.description} onChange={(e) => updateGroup({ items: updateAt(group.items, item.id, { description: e.target.value }) })} placeholder="Service name" /></div><div><Label className="text-xs text-muted-foreground mb-1 block">Qty</Label><Input type="number" value={item.quantity} onChange={(e) => updateGroup({ items: updateAt(group.items, item.id, { quantity: Number(e.target.value) }) })} placeholder="1" /></div><div><Label className="text-xs text-muted-foreground mb-1 block">Price (₹)</Label><Input type="number" value={item.unitPrice} onChange={(e) => updateGroup({ items: updateAt(group.items, item.id, { unitPrice: Number(e.target.value) }) })} placeholder="0" /></div><div><Label className="text-xs text-muted-foreground mb-1 block">Tax</Label><Select value={item.taxRate === 0 ? "no-tax" : String(item.taxRate)} onValueChange={(value) => updateGroup({ items: updateAt(group.items, item.id, { taxRate: value === "no-tax" ? 0 : Number(value) }) })}><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger><SelectContent><SelectItem value="no-tax">No Tax</SelectItem>{taxes.filter((t) => t.isActive).map((tax) => <SelectItem key={tax.id} value={String(tax.rate)}>{tax.rate}%</SelectItem>)}</SelectContent></Select></div></div><div className="grid gap-3 sm:grid-cols-2"><div><Label className="text-xs text-muted-foreground mb-1 block">Billing Cycle</Label><Select value={item.cycle} onValueChange={(value) => updateGroup({ items: updateAt(group.items, item.id, { cycle: value as PricingCycle }) })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="one-time">One-time</SelectItem><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="yearly">Yearly</SelectItem></SelectContent></Select></div><div className="flex items-center gap-2 pt-5"><Switch checked={item.optional} onCheckedChange={(checked) => updateGroup({ items: updateAt(group.items, item.id, { optional: checked }) })} /><Label className="text-sm">Optional item</Label></div></div><div className="border-t pt-3"><div className="flex items-center gap-2 mb-2"><Button size="sm" variant="outline" onClick={() => updateGroup({ items: updateAt(group.items, item.id, { bullets: [...item.bullets, "New feature"] }) })}><Plus className="mr-1 h-3 w-3" />Add Feature</Button></div>{item.bullets.length > 0 && <div className="space-y-2">{item.bullets.map((bullet, bulletIndex) => <div key={`${item.id}-${bulletIndex}`} className="flex gap-2"><Input value={bullet} onChange={(e) => updateGroup({ items: updateAt(group.items, item.id, { bullets: item.bullets.map((value, bIdx) => bIdx === bulletIndex ? e.target.value : value) }) })} placeholder="Feature detail" /><Button size="icon" variant="ghost" onClick={() => updateGroup({ items: updateAt(group.items, item.id, { bullets: item.bullets.filter((_, i) => i !== bulletIndex) }) })}><Trash2 className="h-3 w-3" /></Button></div>)}</div>}</div></div>)}</div>}</CardContent></Card>;
}

function DeploymentEditor({ proposal, setProposal, addDeployment }: { proposal: ProposalData; setProposal: (fn: (current: ProposalData) => ProposalData) => void; addDeployment: () => void }) {
  const updateBlock = (id: string, patch: Partial<DeploymentBlock>) => setProposal((current) => ({ ...current, deploymentBlocks: updateAt(current.deploymentBlocks, id, patch) }));
  const deleteBlock = (id: string) => setProposal((current) => ({ ...current, deploymentBlocks: current.deploymentBlocks.filter((b) => b.id !== id) }));
  return <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Deployment & Maintenance Pricing</CardTitle><Button onClick={addDeployment} size="sm"><Plus className="mr-1 h-4 w-4" />Add Block</Button></CardHeader><CardContent className="space-y-4">{proposal.deploymentBlocks.length === 0 ? <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">No deployment blocks yet. Click "Add Block" to add ongoing costs.</div> : proposal.deploymentBlocks.map((block, index) => <div key={`${block.id}-${index}`} className="rounded-2xl border p-4 bg-muted/30"><div className="flex items-center justify-between mb-3 gap-2"><div className="flex-1"><Input value={block.title} onChange={(e) => updateBlock(block.id, { title: e.target.value })} placeholder="Cost title (e.g., Hosting)" /></div><div className="flex items-center gap-2"><Label className="text-xs text-muted-foreground">Show</Label><Switch checked={block.visible} onCheckedChange={(checked) => updateBlock(block.id, { visible: checked })} /></div><Button size="icon" variant="destructive" onClick={() => deleteBlock(block.id)}><Trash2 className="h-4 w-4" /></Button></div><Textarea value={block.description} onChange={(e) => updateBlock(block.id, { description: e.target.value })} placeholder="Description..." className="mb-3" /><div className="grid grid-cols-2 gap-3"><div><Label className="text-xs">Amount</Label><Input type="number" value={block.amount} onChange={(e) => updateBlock(block.id, { amount: Number(e.target.value) })} placeholder="0" /></div><div><Label className="text-xs">Billing Cycle</Label><Select value={block.cycle} onValueChange={(value) => updateBlock(block.id, { cycle: value as PricingCycle })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="one-time">One-time</SelectItem><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="yearly">Yearly</SelectItem></SelectContent></Select></div></div></div>)}</CardContent></Card>;
}

function TotalsEditor({ proposal, setProposal, taxes }: { proposal: ProposalData; setProposal: (fn: (current: ProposalData) => ProposalData) => void; taxes: { id: string; name: string; rate: number; isActive: boolean }[] }) {
  const totals = calculateProposalTotals(proposal.pricingGroups, proposal.deploymentBlocks, proposal.totals);
  const updateTotals = (patch: Partial<typeof proposal.totals>) => setProposal((current) => ({ ...current, totals: calculateProposalTotals(current.pricingGroups, current.deploymentBlocks, { ...current.totals, ...patch }) }));
  const activeTaxes = taxes.filter((t) => t.isActive);
  return <Card><CardHeader><CardTitle>Totals, GST, TDS & Advance</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><div><Label>Discount Amount (₹)</Label><Input type="number" value={proposal.totals.discountAmount} onChange={(e) => updateTotals({ discountAmount: Number(e.target.value) })} placeholder="0" /></div><div><Label>CGST Rate (%)</Label><Select value={String(proposal.totals.cgstRate)} onValueChange={(v) => updateTotals({ cgstRate: Number(v) })}><SelectTrigger><SelectValue placeholder="Select CGST" /></SelectTrigger><SelectContent><SelectItem value="0">None (0%)</SelectItem>{activeTaxes.map((tax) => <SelectItem key={tax.id} value={String(tax.rate / 2)}>{tax.name} ({tax.rate / 2}%)</SelectItem>)}</SelectContent></Select></div><div><Label>SGST Rate (%)</Label><Select value={String(proposal.totals.sgstRate)} onValueChange={(v) => updateTotals({ sgstRate: Number(v) })}><SelectTrigger><SelectValue placeholder="Select SGST" /></SelectTrigger><SelectContent><SelectItem value="0">None (0%)</SelectItem>{activeTaxes.map((tax) => <SelectItem key={tax.id} value={String(tax.rate / 2)}>{tax.name} ({tax.rate / 2}%)</SelectItem>)}</SelectContent></Select></div><div><Label>IGST Rate (%)</Label><Select value={String(proposal.totals.igstRate)} onValueChange={(v) => updateTotals({ igstRate: Number(v) })}><SelectTrigger><SelectValue placeholder="Select IGST" /></SelectTrigger><SelectContent><SelectItem value="0">None (0%)</SelectItem>{activeTaxes.map((tax) => <SelectItem key={tax.id} value={String(tax.rate)}>{tax.name} ({tax.rate}%)</SelectItem>)}</SelectContent></Select></div><div><Label>TDS Rate (%)</Label><Select value={String(proposal.totals.tdsRate)} onValueChange={(v) => updateTotals({ tdsRate: Number(v) })}><SelectTrigger><SelectValue placeholder="Select TDS" /></SelectTrigger><SelectContent><SelectItem value="0">None (0%)</SelectItem><SelectItem value="1">1%</SelectItem><SelectItem value="5">5%</SelectItem><SelectItem value="10">10%</SelectItem></SelectContent></Select></div><div><Label>Advance Payment (₹)</Label><Input type="number" value={proposal.totals.advanceAmount} onChange={(e) => updateTotals({ advanceAmount: Number(e.target.value) })} placeholder="0" /></div></div><div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl bg-orange-500/10 p-4 border border-orange-500/30"><p className="text-xs text-muted-foreground">Subtotal (Items + Deployment)</p><p className="text-lg font-bold">₹{totals.subtotal.toLocaleString("en-IN")}</p></div><div className="rounded-xl bg-green-500/10 p-4 border border-green-500/30"><p className="text-xs text-muted-foreground">Grand Total (After Tax & Discount)</p><p className="text-2xl font-black text-green-600">₹{totals.grandTotal.toLocaleString("en-IN")}</p></div><div className="rounded-xl bg-blue-500/10 p-4 border border-blue-500/30"><p className="text-xs text-muted-foreground">Remaining After Advance</p><p className="text-xl font-bold text-blue-600">₹{totals.remainingAmount.toLocaleString("en-IN")}</p></div></div></CardContent></Card>;
}
