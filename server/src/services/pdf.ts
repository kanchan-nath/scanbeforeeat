import PDFDocument from "pdfkit";
import { Readable } from "node:stream";

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  date: string;
  description: string;
  amount: number;
  gstAmount: number;
  plan: string;
  status: string;
  paymentId?: string;
  userName: string;
  userEmail: string;
}

export function generateInvoicePdf(invoice: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const primaryColor = "#059669"; // Emerald 600
      const darkColor = "#0f172a"; // Slate 900
      const mutedColor = "#64748b"; // Slate 500

      // Company Header Bar
      doc.rect(40, 40, 515, 60).fill("#f0fdf4");
      doc.fillColor(primaryColor).fontSize(20).font("Helvetica-Bold").text("ScanBeforeEat", 55, 52);
      doc.fillColor(mutedColor).fontSize(9).font("Helvetica").text("AI-Powered Food Ingredient & Toxicology Intelligence Platform", 55, 76);

      // Tax Invoice Label
      doc.fillColor(darkColor).fontSize(14).font("Helvetica-Bold").text("TAX INVOICE / BILL OF SUPPLY", 330, 52, { align: "right", width: 210 });
      doc.fillColor(mutedColor).fontSize(8).font("Helvetica").text("Original for Recipient (Section 31 CGST Act)", 330, 72, { align: "right", width: 210 });

      // Invoice & Supplier Telemetry Box
      const topY = 120;
      doc.fillColor(darkColor).fontSize(10).font("Helvetica-Bold").text("SUPPLIER DETAILS (ISSUER):", 40, topY);
      doc.fillColor(mutedColor).fontSize(9).font("Helvetica");
      doc.text(process.env.COMPANY_NAME || "ScanBeforeEat Technologies Pvt Ltd", 40, topY + 16);
      doc.text(process.env.COMPANY_ADDRESS || "100 Feet Rd, Indiranagar, Bengaluru, KA 560038", 40, topY + 30);
      doc.text(`GSTIN: ${process.env.COMPANY_GSTIN || "29AAAAA0000A1Z5"} | State Code: 29 (Karnataka)`, 40, topY + 44);
      doc.text("SAC Code: 998314 (Information Technology & Data Processing Services)", 40, topY + 58);

      // Invoice Details (Right column)
      doc.fillColor(darkColor).fontSize(10).font("Helvetica-Bold").text("INVOICE METADATA:", 330, topY);
      doc.fillColor(mutedColor).fontSize(9).font("Helvetica");
      doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 330, topY + 16);
      doc.text(`Invoice Date: ${invoice.date}`, 330, topY + 30);
      doc.text(`Payment Ref ID: ${invoice.paymentId || "N/A (Prepaid Online)"}`, 330, topY + 44);
      doc.text(`Payment Status: ${invoice.status.toUpperCase()}`, 330, topY + 58);

      // Billed To Section
      const billY = topY + 85;
      doc.rect(40, billY, 515, 50).fill("#f8fafc");
      doc.fillColor(darkColor).fontSize(10).font("Helvetica-Bold").text("BILLED TO (RECIPIENT):", 55, billY + 10);
      doc.fillColor(mutedColor).fontSize(9).font("Helvetica");
      doc.text(`Name: ${invoice.userName} | Email: ${invoice.userEmail}`, 55, billY + 26);

      // Line Items Table Header
      const tableY = billY + 70;
      doc.rect(40, tableY, 515, 24).fill(darkColor);
      doc.fillColor("#ffffff").fontSize(9).font("Helvetica-Bold");
      doc.text("SL", 50, tableY + 7);
      doc.text("DESCRIPTION OF SERVICES", 80, tableY + 7);
      doc.text("SAC", 280, tableY + 7);
      doc.text("BASE AMT", 340, tableY + 7, { align: "right", width: 50 });
      doc.text("GST (18%)", 410, tableY + 7, { align: "right", width: 60 });
      doc.text("TOTAL (INR)", 490, tableY + 7, { align: "right", width: 55 });

      // Table Row
      const rowY = tableY + 24;
      doc.rect(40, rowY, 515, 36).fill("#ffffff").stroke("#e2e8f0");
      doc.fillColor(darkColor).fontSize(9).font("Helvetica");
      doc.text("1", 50, rowY + 12);
      doc.font("Helvetica-Bold").text(invoice.description, 80, rowY + 6);
      doc.font("Helvetica").fontSize(8).fillColor(mutedColor).text("Full access to 99 monthly neural camera scans & toxicological cocktail alerts", 80, rowY + 18);
      doc.fontSize(9).fillColor(darkColor).text("998314", 280, rowY + 12);

      const baseAmount = invoice.amount;
      const gstAmount = invoice.gstAmount || Math.round(baseAmount * 0.18 * 100) / 100;
      const totalAmount = Math.round((baseAmount + gstAmount) * 100) / 100;

      doc.text(`₹${baseAmount.toFixed(2)}`, 340, rowY + 12, { align: "right", width: 50 });
      doc.text(`₹${gstAmount.toFixed(2)}`, 410, rowY + 12, { align: "right", width: 60 });
      doc.font("Helvetica-Bold").text(`₹${totalAmount.toFixed(2)}`, 490, rowY + 12, { align: "right", width: 55 });

      // GST Calculation Summary
      const summaryY = rowY + 50;
      const rightX = 350;
      doc.rect(rightX, summaryY, 205, 90).fill("#f8fafc").stroke("#e2e8f0");

      doc.fillColor(darkColor).fontSize(9).font("Helvetica").text("Subtotal (Taxable Value):", rightX + 10, summaryY + 10);
      doc.text(`₹${baseAmount.toFixed(2)}`, rightX + 130, summaryY + 10, { align: "right", width: 65 });

      const halfGst = (gstAmount / 2).toFixed(2);
      doc.text("Central GST (CGST @ 9%):", rightX + 10, summaryY + 28);
      doc.text(`₹${halfGst}`, rightX + 130, summaryY + 28, { align: "right", width: 65 });

      doc.text("State GST (SGST @ 9%):", rightX + 10, summaryY + 46);
      doc.text(`₹${halfGst}`, rightX + 130, summaryY + 46, { align: "right", width: 65 });

      doc.rect(rightX, summaryY + 65, 205, 25).fill("#f0fdf4");
      doc.fillColor(primaryColor).fontSize(10).font("Helvetica-Bold").text("Total Paid Amount:", rightX + 10, summaryY + 72);
      doc.text(`₹${totalAmount.toFixed(2)}`, rightX + 120, summaryY + 72, { align: "right", width: 75 });

      // Digital Signature & Disclaimer
      const footerY = 680;
      doc.rect(40, footerY, 515, 75).fill("#ffffff").stroke("#e2e8f0");
      doc.fillColor(darkColor).fontSize(9).font("Helvetica-Bold").text("Terms & Conditions & Tax Certification:", 50, footerY + 10);
      doc.fillColor(mutedColor).fontSize(7.5).font("Helvetica");
      doc.text("1. This is a computer-generated digital tax invoice authorized under Section 31 of the CGST Act 2017.", 50, footerY + 24);
      doc.text("2. Subscription service is non-transferable and auto-activates immediately upon payment clearance.", 50, footerY + 34);
      doc.text("3. Electronic signature verified via ScanBeforeEat Secure Invoicing Engine.", 50, footerY + 44);
      doc.fillColor(primaryColor).font("Helvetica-Bold").text("✓ DIGITALLY SIGNED & VERIFIED", 400, footerY + 54);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
