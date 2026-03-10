"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateUserProfile(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name || !email) {
    return { error: "Name and email are required." };
  }

  try {
    await db.update(users).set({
      name,
      email
    }).where(eq(users.id, session.userId));

    revalidatePath("/settings");
    return { success: "Profile updated successfully." };
  } catch (error) {
    console.error("Failed to update profile", error);
    return { error: "Failed to update profile. Email might already be taken." };
  }
}

export async function updateUserPassword(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    return { error: "Unauthorized" };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!currentPassword || !newPassword) {
    return { error: "Both current and new passwords are required." };
  }

  try {
    const userResult = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    const user = userResult[0];

    if (!user) {
      return { error: "User not found." };
    }

    const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordsMatch) {
      return { error: "Incorrect current password." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await db.update(users).set({
      password: hashedPassword
    }).where(eq(users.id, session.userId));

    return { success: "Password updated successfully." };
  } catch (error) {
    console.error("Failed to update password", error);
    return { error: "Failed to update password." };
  }
}
