import "dotenv/config";
import { createClient } from "@libsql/client";

async function main() {
  const turso = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_TOKEN,
  });

  try {
    await turso.execute("ALTER TABLE projects ADD COLUMN invoice_url TEXT;");
    console.log("Migration successful: Added invoice_url to projects table");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

main();
