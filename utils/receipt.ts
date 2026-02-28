import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export const generateReceiptPDF = async (
  paymentData?: any,
  pkg?: any,
  userDetails?: any,
  numTravelers?: number,
  selectedVehicle?: string | null,
  pricing?: any
) => {
  const invoice = document.getElementById("invoice-content");
  if (!invoice) throw new Error("Invoice element not found");

  // Ensure all images in the invoice are fully loaded before capturing
  const images = invoice.getElementsByTagName('img');
  const imagePromises = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    if (!img.crossOrigin) {
      img.crossOrigin = "anonymous";
    }
    
    if (!img.complete) {
      imagePromises.push(new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // Continue even if one image fails
      }));
    }
  }

  // Wait for all images to load
  if (imagePromises.length > 0) {
    await Promise.all(imagePromises);
  }

  const canvas = await html2canvas(invoice, {
    scale: 2,               // 🔥 sharp text
    useCORS: true,
    backgroundColor: "#030712",  // 🔥 match dark theme
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [794, 1123],
  });

  pdf.addImage(imgData, "PNG", 0, 0, 794, 1123);

  return pdf;
};