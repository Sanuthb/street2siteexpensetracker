import { NextResponse } from "next/server";
import { generateInvoiceHTML, generateReceiptHTML } from "@/lib/pdf-templates/invoice-template";

export const maxDuration = 60; // Allow enough time for serverless browser spin up

export async function POST(req: Request) {
  let browser: any;

  try {
    const body = await req.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: "Missing type or data" }, { status: 400 });
    }

    let html = "";
    if (type === "invoice" || type === "quotation") {
      html = generateInvoiceHTML(data, type);
    } else if (type === "receipt") {
      html = generateReceiptHTML(data);
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    console.log(`Generating ${type} PDF for ${data.number}...`);

    const isLocal = process.env.NODE_ENV === "development" || process.env.LOCAL_PDF === "true";

    if (isLocal) {
      console.log("Launching local Puppeteer...");
      const puppeteerLocalMod = await import("puppeteer");
      const puppeteerLocal = puppeteerLocalMod.default || puppeteerLocalMod;
      browser = await puppeteerLocal.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-web-security"],
        timeout: 60000
      });
    } else {
      console.log("Launching production Puppeteer-Core with @sparticuz/chromium...");
      const puppeteerCoreMod = await import("puppeteer-core");
      const chromiumMod = await import("@sparticuz/chromium");
      
      const puppeteerCore = puppeteerCoreMod.default || puppeteerCoreMod;
      const chromium = chromiumMod.default || chromiumMod;
      
      browser = await puppeteerCore.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
        timeout: 60000
      });
    }

    if (!browser) {
      throw new Error("Failed to initialize PDF generator browser");
    }

    const page = await browser.newPage();
    console.log("New page created.");

    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });

    console.log("Setting content...");
    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      const images = Array.from(document.images);
      await Promise.all(images.map((image) => {
        if (image.complete) return Promise.resolve();

        return new Promise<void>((resolve) => {
          const timeout = window.setTimeout(resolve, 10000);
          image.addEventListener("load", () => {
            window.clearTimeout(timeout);
            resolve();
          }, { once: true });
          image.addEventListener("error", () => {
            window.clearTimeout(timeout);
            resolve();
          }, { once: true });
        });
      }));
    });
    console.log("Content set.");

    console.log("Generating PDF buffer...");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0px",
        bottom: "0px",
        left: "0px",
        right: "0px"
      }
    });
    console.log("PDF buffer generated.");

    await browser.close();
    browser = undefined;
    console.log("Browser closed.");

    // Convert to Buffer to satisfy TypeScript BodyInit
    const buffer = Buffer.from(pdfBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${data.number}.pdf"`
      }
    });
  } catch (error) {
    console.error("PDF Generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  } finally {
    await browser?.close().catch(() => undefined);
  }
}
