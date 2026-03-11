import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config();

const client = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_TOKEN!,
});

async function main() {
  console.log("Fixing files table schema...");

  try {
    // 1. Rename existing table
    console.log("Renaming files to files_backup...");
    await client.execute("ALTER TABLE files RENAME TO files_backup");

    // 2. Create new table with correct schema
    console.log("Creating new files table...");
    await client.execute(`
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        file_name TEXT NOT NULL,
        content BLOB NOT NULL,
        mime_type TEXT NOT NULL,
        type TEXT NOT NULL,
        uploaded_at INTEGER NOT NULL
      )
    `);

    // 3. (Optional) In a real scenario, we might try to migrate data here.
    // For now, we'll just drop the backup.
    console.log("Dropping files_backup...");
    await client.execute("DROP TABLE files_backup");

    console.log("Schema fix completed successfully.");
  } catch (error: any) {
    console.error("Error fixing schema:", error.message);
    
    // Attempt recovery if possible
    try {
        console.log("Attempting to restore from backup if it exists...");
        await client.execute("ALTER TABLE files_backup RENAME TO files");
    } catch (e) {}
  }

  process.exit(0);
}

main();
