"use server";

import nodemailer from 'nodemailer';
import { db } from "@/lib/db";
import { projects, clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function notifyClient(projectId: string) {
  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      return { 
        success: false, 
        error: "SMTP is not fully configured. Please add SMTP_HOST, SMTP_USER, and SMTP_PASS to your .env file." 
      };
    }

    // Create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Fetch project and client details
    const projectResults = await db.select({
      name: projects.name,
      invoiceUrl: projects.invoiceUrl,
      shareToken: projects.shareToken,
      isPublic: projects.isPublic,
      clientId: projects.clientId
    })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

    const project = projectResults[0];
    if (!project) {
      return { success: false, error: "Project not found." };
    }

    const clientResults = await db.select().from(clients).where(eq(clients.id, project.clientId)).limit(1);
    const client = clientResults[0];

    if (!client || !client.email) {
      return { success: false, error: "Client email not found." };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const portalUrl = project.isPublic && project.shareToken 
      ? `${baseUrl}/shared/project/${project.shareToken}`
      : null;

    // Send mail with defined transport object
    await transporter.sendMail({
      from: `"Expensiq" <${smtpUser}>`, // sender address
      to: client.email, // list of receivers
      subject: `Update on your project: ${project.name}`, // Subject line
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #fed230;">Project Update: ${project.name}</h2>
          <p>Hello ${client.name},</p>
          <p>We've updated your Expense dashboard with the latest expenses and payments.</p>
          ${portalUrl ? `
            <div style="margin: 30px 0;">
              <a href="${portalUrl}" style="background-color: #fed230; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Project Portal</a>
            </div>
          ` : ''}
          <p>If you have any questions, please don't hesitate to reach out.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">This is an automated notification from your Expensiq Dashboard.</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Notify client error:", error);
    return { success: false, error: "An unexpected error occurred while sending email." };
  }
}
