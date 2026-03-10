import { redirect } from "next/navigation";

export default function Home() {
  // Directly redirect to dashboard for the premium SaaS experience
  redirect("/dashboard");
}
