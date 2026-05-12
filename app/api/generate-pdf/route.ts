import { NextResponse } from "next/server";
import puppeteer, { type Browser } from "puppeteer";
import { generateInvoiceHTML, generateReceiptHTML } from "@/lib/pdf-templates/invoice-template";

export async function POST(req: Request) {
  let browser: Browser | undefined;

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

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-web-security"],
      timeout: 60000
    });

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
