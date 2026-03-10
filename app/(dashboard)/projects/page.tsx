import { getProjects } from "@/lib/actions/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FolderKanban } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProjectDialog } from "@/components/forms/project-dialog";
import { getClients } from "@/lib/actions/clients";
import { ProjectActions } from "@/components/actions/project-actions";

export default async function ProjectsPage() {
  const response = await getProjects();
  const projects = response.success ? response.data : [];

  const clientsResp = await getClients();
  const clients = (clientsResp.success ? clientsResp.data : []) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Manage your client projects and budgets.</p>
        </div>
        <ProjectDialog clients={clients} />
      </div>

      <Card className="bg-card/50 shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects?.length ? (
                projects.map((project) => (
                  <TableRow key={project.id} className="border-border/50 hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                           <FolderKanban className="h-4 w-4 text-muted-foreground" />
                           <Link href={`/projects/${project.id}`} className="hover:underline text-primary">
                               {project.name}
                           </Link>
                        </div>
                    </TableCell>
                    <TableCell>{project.clientName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                          project.status === 'active' ? 'bg-primary/10 text-primary border-primary/20' : 
                          project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                          'bg-muted text-muted-foreground border-border'
                      }>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">₹{project.budget.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                    <TableCell className="text-right font-medium text-primary">₹{project.remaining.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                    <TableCell className="text-right">
                        <ProjectActions project={project} clients={clients} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No projects found. Create one to get started.
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
