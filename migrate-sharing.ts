import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config();

const client = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_TOKEN!,
});

async function main() {
  console.log("Adding share_token and is_public to projects table...");
  
  try {
    await client.execute("ALTER TABLE projects ADD COLUMN share_token TEXT");
    console.log("Added share_token column.");
    await client.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_share_token ON projects(share_token)");
    console.log("Created unique index on share_token.");
  } catch (e: any) {
    if (e.message.includes("duplicate column name")) {
      console.log("share_token column already exists.");
      try {
        await client.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_share_token ON projects(share_token)");
        console.log("Ensured unique index exists.");
      } catch (inner: any) {
        console.error("Failed to create index:", inner.message);
      }
    } else {
      console.error("Failed to add share_token:", e.message);
    }
  }

  try {
    await client.execute("ALTER TABLE projects ADD COLUMN is_public INTEGER NOT NULL DEFAULT 0");
    console.log("Added is_public column.");
  } catch (e: any) {
    if (e.message.includes("duplicate column name")) {
      console.log("is_public column already exists.");
    } else {
      console.error("Failed to add is_public:", e.message);
    }
  }

  console.log("Migration finished.");
  process.exit(0);
}

main();
