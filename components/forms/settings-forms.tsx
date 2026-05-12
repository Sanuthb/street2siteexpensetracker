"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Bell, Shield, Moon, Building2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { updateUserProfile, updateUserPassword, updateCompanyProfile } from "@/app/actions/user-settings";
import { toast } from "sonner";

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full md:w-auto" disabled={pending}>
      {pending ? "Saving..." : text}
    </Button>
  );
}

export function SettingsForms({ initialData, companyData }: { initialData: { name: string, email: string }, companyData?: any }) {
  const [profileState, profileAction] = useActionState(updateUserProfile, null);
  const [passwordState, passwordAction] = useActionState(updateUserPassword, null);
  const [companyState, companyAction] = useActionState(updateCompanyProfile, null);

  useEffect(() => {
    if (profileState?.success) {
      toast.success(profileState.success);
    }
    if (profileState?.error) {
      toast.error(profileState.error);
    }
  }, [profileState]);

  useEffect(() => {
    if (passwordState?.success) {
      toast.success(passwordState.success);
    }
    if (passwordState?.error) {
       toast.error(passwordState.error);
    }
  }, [passwordState]);

  useEffect(() => {
    if (companyState?.success) toast.success(companyState.success);
    if (companyState?.error) toast.error(companyState.error);
  }, [companyState]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="bg-card/50 shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            Profile Settings
          </CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={profileAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" defaultValue={initialData.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" defaultValue={initialData.email} required />
            </div>
            
            <div className="pt-2">
                <SubmitButton text="Save Changes" />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card/50 shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-orange-500" />
            Company Profile
          </CardTitle>
          <CardDescription>Details used in invoices and quotations.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={companyAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" name="companyName" defaultValue={companyData?.companyName || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyEmail">Company Email</Label>
              <Input id="companyEmail" name="companyEmail" type="email" defaultValue={companyData?.companyEmail || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyPhone">Phone Number</Label>
              <Input id="companyPhone" name="companyPhone" defaultValue={companyData?.companyPhone || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyGstin">GSTIN / Tax ID</Label>
              <Input id="companyGstin" name="companyGstin" defaultValue={companyData?.companyGstin || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyAddress">Business Address</Label>
              <Textarea id="companyAddress" name="companyAddress" defaultValue={companyData?.companyAddress || ''} />
            </div>

            <div className="border-t border-border/50 pt-4">
               <h4 className="text-sm font-semibold mb-4">Bank Details (For Invoices)</h4>
               <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Account Holder Name</Label>
                    <Input id="accountName" name="accountName" defaultValue={companyData?.accountName || ''} placeholder="e.g. Street2Site LLP" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input id="accountNumber" name="accountNumber" defaultValue={companyData?.accountNumber || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ifscCode">IFSC Code</Label>
                    <Input id="ifscCode" name="ifscCode" defaultValue={companyData?.ifscCode || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input id="upiId" name="upiId" defaultValue={companyData?.upiId || ''} placeholder="e.g. street2site@ybl" />
                  </div>
               </div>
            </div>

            <div className="pt-2">
                <SubmitButton text="Save Company Profile" />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-card/50 shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Moon className="h-5 w-5 text-indigo-500" />
            Preferences
          </CardTitle>
          <CardDescription>Customize your application experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select defaultValue="dark">
              <SelectTrigger>
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark (Default)</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select defaultValue="inr">
              <SelectTrigger>
                <SelectValue placeholder="Select a currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inr">INR (₹)</SelectItem>
                <SelectItem value="usd">USD ($)</SelectItem>
                <SelectItem value="eur">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-emerald-500" />
            Notifications
          </CardTitle>
          <CardDescription>Configure how you receive alerts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive daily summaries and alerts.</p>
            </div>
            <Button variant="outline" size="sm">Enabled</Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Invoice Alerts</Label>
              <p className="text-sm text-muted-foreground">Notify when a new invoice is uploaded.</p>
            </div>
            <Button variant="outline" size="sm">Enabled</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 shadow-sm border-border/50 border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your password and security settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={passwordAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" name="currentPassword" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" name="newPassword" type="password" required minLength={8} />
            </div>
            <div className="pt-2">
                <SubmitButton text="Update Password" />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
