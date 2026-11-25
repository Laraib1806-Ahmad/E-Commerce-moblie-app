import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import type { Order } from "./orders";

// Product names come from the database, so they are escaped before going into HTML.
function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildInvoiceHtml(order: Order) {
  const rows = order.items
    .map((item) => {
      const price = Number(item.unitPrice);
      return `<tr>
        <td>${escapeHtml(item.productName)}</td>
        <td class="right">${item.quantity}</td>
        <td class="right">$${price.toFixed(2)}</td>
        <td class="right">$${(price * item.quantity).toFixed(2)}</td>
      </tr>`;
    })
    .join("");

  const billedTo = [order.fullName, order.address, order.city, order.phone]
    .filter(Boolean)
    .map((line) => escapeHtml(String(line)))
    .join("<br/>");

  return `<html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body { font-family: Helvetica, Arial, sans-serif; padding: 24px; color: #222; }
        h1 { margin: 0 0 4px 0; }
        .muted { color: #666; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        th, td { padding: 10px 6px; border-bottom: 1px solid #ddd; text-align: left; }
        .right { text-align: right; }
        .total { font-size: 18px; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>ShopX Invoice</h1>
      <div class="muted">Invoice #${order.id} - ${new Date(order.createdAt).toLocaleDateString()}</div>
      <p><b>Billed to</b><br/>${billedTo}</p>
      <table>
        <tr><th>Item</th><th class="right">Qty</th><th class="right">Price</th><th class="right">Amount</th></tr>
        ${rows}
        <tr><td colspan="3" class="right total">Total</td><td class="right total">$${Number(order.total).toFixed(2)}</td></tr>
      </table>
      <p class="muted">Status: ${order.status}. Thank you for shopping with ShopX.</p>
    </body>
  </html>`;
}

// Opens the system preview, where the user can view or print the invoice.
export async function viewInvoice(order: Order) {
  await Print.printAsync({ html: buildInvoiceHtml(order) });
}

export async function shareInvoice(order: Order) {
  const { base64 } = await Print.printToFileAsync({
    html: buildInvoiceHtml(order),
    base64: true,
  });
  if (!base64) throw new Error("Could not create the PDF");

  const path = `${FileSystem.cacheDirectory}invoice-${order.id}.pdf`;
  await FileSystem.writeAsStringAsync(path, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing is not available on this device");
  }
  await Sharing.shareAsync(path, {
    mimeType: "application/pdf",
    dialogTitle: `Invoice #${order.id}`,
    UTI: "com.adobe.pdf",
  });
}
