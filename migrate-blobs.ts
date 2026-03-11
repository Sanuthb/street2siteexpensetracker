import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config();

const client = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_TOKEN!,
});

async function main() {
  console.log("Adding blob columns to files table...");
  
  try {
    // 1. Rename file_url to file_name (if exists) or just add new columns
    // SQLite ALTER TABLE is limited, so we add new columns first.
    
    await client.execute("ALTER TABLE files ADD COLUMN file_name TEXT");
    console.log("Added file_name column.");
  } catch (e: any) {
    console.log("file_name column may already exist or error:", e.message);
  }

  try {
    await client.execute("ALTER TABLE files ADD COLUMN content BLOB");
    console.log("Added content column.");
  } catch (e: any) {
    console.log("content column error:", e.message);
  }

  try {
    await client.execute("ALTER TABLE files ADD COLUMN mime_type TEXT");
    console.log("Added mime_type column.");
  } catch (e: any) {
    console.log("mime_type column error:", e.message);
  }

  console.log("Migration finished.");
  process.exit(0);
}

main();
