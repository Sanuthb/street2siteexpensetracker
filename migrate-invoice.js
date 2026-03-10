const { createClient } = require("@libsql/client");
require("dotenv").config();

async function main() {
  const turso = createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_TOKEN,
  });

  try {
    const res = await turso.execute("ALTER TABLE projects ADD COLUMN invoice_url TEXT;");
    console.log("Migration successful: Added invoice_url to projects table", res);
  } catch (error) {
    if (error.message && error.message.includes("duplicate column name")) {
       console.log("Migration already applied: invoice_url already exists");
    } else {
       console.error("Migration failed with error:", error.toString());
       console.error("Full error:", JSON.stringify(error, null, 2));
    }
  }
}

main();
