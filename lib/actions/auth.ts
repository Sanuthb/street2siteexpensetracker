"use server";

import { db } from "@/lib/db";
import { users, userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function loginUser(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  try {
    const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = userResult[0];

    if (!user) {
      if (email === "admin@example.com" && password === "password") {
        // Create default admin user on first login
        const id = crypto.randomUUID();
        const hashedPassword = await bcrypt.hash("password", 10);
        await db.insert(users).values({
          id,
          name: "Default Admin",
          email: "admin@example.com",
          password: hashedPassword,
          role: "admin",
        });

        await db.insert(userSettings).values({
          id: crypto.randomUUID(),
          userId: id,
          theme: "dark",
          currency: "inr"
        });

        await createSession(id, "admin");
        return redirect("/dashboard");
      }
      return { error: "Invalid email or password." };
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      return { error: "Invalid email or password." };
    }

    await createSession(user.id, user.role);
    
  } catch (error) {
    if ((error as Error).message === "NEXT_REDIRECT") {
       throw error;
    }
    console.error("Login Error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
  
  redirect("/dashboard");
}

export async function logoutUser() {
  await deleteSession();
  redirect("/login");
}
