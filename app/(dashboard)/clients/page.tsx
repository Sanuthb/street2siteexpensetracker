import { getClients } from "@/lib/actions/clients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Mail, Phone } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClientDialog } from "@/components/forms/client-dialog";
import { ClientActions } from "@/components/actions/client-actions";

export default async function ClientsPage() {
  const response = await getClients();
  const clients = response.success ? response.data : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">Manage your customer relationships and details.</p>
        </div>
        <ClientDialog />
      </div>

      <Card className="bg-card/50 shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Client Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Client Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead className="text-center">Active Projects</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients?.length ? (
                clients.map((client) => (
                  <TableRow key={client.id} className="border-border/50 hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-foreground">
                        {client.name}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                           <Building2 className="h-4 w-4" />
                           {client.company || '-'}
                        </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2"><Mail className="h-3 w-3" /> {client.email}</span>
                        {client.phone && <span className="flex items-center gap-2"><Phone className="h-3 w-3" /> {client.phone}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-secondary/50">
                        {client.activeProjects}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <ClientActions client={client} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No clients found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
