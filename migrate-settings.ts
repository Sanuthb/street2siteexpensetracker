"use strict";
import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const client = createClient({
  url: process.env.TURSO_URL as string,
  authToken: process.env.TURSO_TOKEN as string,
});

async function migrate() {
  console.log("Starting manual migration for 'user_settings' table...");
  try {
    const existingTable = await client.execute(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='user_settings';
    `);

    if (existingTable.rows.length === 0) {
        await client.execute(`
          CREATE TABLE user_settings (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL UNIQUE,
            theme TEXT NOT NULL DEFAULT 'dark',
            currency TEXT NOT NULL DEFAULT 'inr',
            email_notifications INTEGER NOT NULL DEFAULT 1,
            invoice_alerts INTEGER NOT NULL DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users(id)
          );
        `);
        console.log("Success: Added 'user_settings' table to Turso.");
    } else {
        console.log("Migration skipped: 'user_settings' table already exists.");
    }
    
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    console.log("Closing connection...");
    client.close();
  }
}

migrate();
