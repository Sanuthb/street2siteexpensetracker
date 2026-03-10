import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HelpCircle, Mail, MessageSquare, Phone } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Support</h2>
        <p className="text-muted-foreground">Get help and find answers to common questions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-69">
          <Card className="bg-card/50 shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
                Contact Us
              </CardTitle>
              <CardDescription>Send us a message and we'll get back to you shortly.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="How can we help?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Describe your issue in detail..." rows={5} />
              </div>
              <Button className="w-full">Submit Request</Button>
            </CardContent>
          </Card>

          <Card className="bg-card/50 shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Other Ways to Connect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-muted-foreground">info@street2site.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-muted-foreground">+91 9482211264</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/50 shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="h-5 w-5 text-indigo-500" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Quick answers to common issues.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">How do I export my reports?</h4>
                <p className="text-sm text-muted-foreground">You can export reports from the Reports dashboard by clicking the "Export" button in the top right corner. PDF and CSV formats are supported.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Can I add multiple users?</h4>
                <p className="text-sm text-muted-foreground">Currently, Expensio operates as a single-admin dashboard. Multi-user role management will be available in the upcoming v2.0 release.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">How do I update an incorrect invoice?</h4>
                <p className="text-sm text-muted-foreground">Navigate to the specific project dashboard and use the "Replace Invoice" button to upload a new document over the old one.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Is my data backed up?</h4>
                <p className="text-sm text-muted-foreground">Yes, all data is securely backed up continuously on our Turso database infrastructure.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
