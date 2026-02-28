import React from "react";
import { CURRENCY_SYMBOLS } from "../utils/currency";
import { Plane } from "lucide-react";

interface InvoiceTemplateProps {
  paymentData: any;
  pkg: any;
  userDetails: any;
  numTravelers: number;
  selectedVehicle: string | null;
  pricing: any;
  bookingId: string | null;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
  paymentData,
  pkg,
  userDetails,
  selectedVehicle,
  pricing,
  bookingId
}) => {
  if (!paymentData || !pkg) return null;

  // Currency Symbol
  const currencySymbol =
    CURRENCY_SYMBOLS[paymentData.currency] || "₹";

  // Package Image
  const imageUrl =
    pkg.image ||
    "https://images.unsplash.com/photo-1514282401047-d79a71a590e8";

  // ✅ Dynamic Travel Mode Logic
  const travelMode =
    selectedVehicle === "car"
      ? "Private Car Transfer"
      : selectedVehicle === "bike"
      ? "Bike Rental"
      : selectedVehicle === "bus"
      ? "Luxury Bus"
      : selectedVehicle === "flight"
      ? `Flight from ${userDetails?.departureCity || "N/A"}`
      : "Standard Transfer";

  return (
    <div
      id="invoice-content"
      style={{
        width: "794px",
        minHeight: "1123px",
        margin: "0 auto",
        backgroundColor: "#030712",
        color: "#f8fafc",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto"
      }}
    >
      {/* ================= HEADER ================= */}
      <header
        style={{
          background:
            "linear-gradient(135deg,#4f46e5 0%,#3730a3 100%)",
          padding: "50px 60px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        {/* Logo Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              background: "rgba(255,255,255,0.15)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Plane size={26} strokeWidth={1.8} />
          </div>

          <div>
            <h1 style={{ margin: 0, fontSize: "30px" }}>
              Destinix Travel
            </h1>
            <p style={{ margin: 0, fontSize: "14px", opacity: 0.8 }}>
              Curated journeys, unforgettable memories.
            </p>
          </div>
        </div>

        {/* Invoice Title */}
        <div style={{ textAlign: "right" }}>
          <h2 style={{ margin: 0, fontSize: "40px" }}>
            INVOICE
          </h2>
          <p
            style={{
              marginTop: "8px",
              fontSize: "12px",
              color: "#34d399",
              fontWeight: 600
            }}
          >
            Payment Confirmed
          </p>
        </div>
      </header>

      {/* ================= META SECTION ================= */}
      <section
        style={{
          padding: "28px 60px",
          background: "#0f172a",
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "1px solid #1e293b"
        }}
      >
        {[
          { label: "Booking ID", value: `#${bookingId}` },
          {
            label: "Invoice Date",
            value: new Date(paymentData.date).toLocaleDateString(
              "en-US",
              { day: "numeric", month: "short", year: "numeric" }
            )
          },
          { label: "Package Type", value: pkg.type },
          { label: "Status", value: "Active" }
        ].map((item, i) => (
          <div key={i} style={{ width: "23%" }}>
            <p
              style={{
                fontSize: "11px",
                color: "#64748b",
                marginBottom: "6px",
                textTransform: "uppercase"
              }}
            >
              {item.label}
            </p>
            <p
              style={{
                fontSize: "15px",
                fontWeight: 600,
                margin: 0
              }}
            >
              {item.value}
            </p>
          </div>
        ))}
      </section>

      {/* ================= CONTENT ================= */}
      <div style={{ padding: "60px" }}>
        {/* HERO SECTION */}
        <div style={{ display: "flex", gap: "45px", marginBottom: "60px" }}>
          {/* Image */}
          <div style={{ width: "42%" }}>
            <img
              src={imageUrl}
              alt=""
              style={{
                width: "100%",
                height: "280px",
                objectFit: "cover",
                borderRadius: "18px"
              }}
              crossOrigin="anonymous"
            />
          </div>

          {/* Trip Details */}
          <div style={{ width: "58%" }}>
            <h3 style={{ fontSize: "20px", fontWeight: 700 }}>
              Trip Details
            </h3>

            <div
              style={{
                marginTop: "30px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "28px"
              }}
            >
              <Detail label="Destination" value={pkg.destination} />
              <Detail
                label="Travel Dates"
                value={`${new Date(paymentData.date).toLocaleDateString(
                  "en-US",
                  { day: "numeric", month: "short" }
                )} - ${new Date(
                  new Date(paymentData.date).getTime() +
                    7 * 24 * 60 * 60 * 1000
                ).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })}`}
              />
              <Detail
                label="Duration"
                value={pkg.duration || "8 Days"}
              />
              <Detail
                label="Travel Mode"
                value={travelMode}
              />
              <Detail
                label="Accommodation"
                value={
                  pkg.accommodation ||
                  "Ocean View Water Villa"
                }
                full
              />
            </div>
          </div>
        </div>

        {/* ================= PAYMENT SUMMARY ================= */}
        <h3 style={{ fontSize: "20px", fontWeight: 700 }}>
          Payment Summary
        </h3>

        <div
          style={{
            marginTop: "25px",
            background: "#0f172a",
            borderRadius: "18px",
            padding: "30px"
          }}
        >
          <PriceRow
            label="Base Package"
            value={`${currencySymbol}${pricing.base.toLocaleString(
              "en-IN"
            )}`}
          />
          <PriceRow
            label="Taxes & Fees"
            value={`${currencySymbol}${(
              pricing.taxes + pricing.service
            ).toLocaleString("en-IN")}`}
          />
          {pricing.vehicleCharge > 0 && (
            <PriceRow
              label="Vehicle Charge"
              value={`${currencySymbol}${pricing.vehicleCharge.toLocaleString(
                "en-IN"
              )}`}
            />
          )}

          <div
            style={{
              marginTop: "25px",
              paddingTop: "20px",
              borderTop: "1px solid #1e293b",
              display: "flex",
              justifyContent: "space-between"
            }}
          >
            <span style={{ fontSize: "18px", fontWeight: 700 }}>
              Total Paid
            </span>
            <span
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#818cf8"
              }}
            >
              {currencySymbol}
              {pricing.total.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <footer
        style={{
          textAlign: "center",
          padding: "30px",
          borderTop: "1px solid #1e293b",
          color: "#64748b"
        }}
      >
        © 2026 Destinix Travel
      </footer>
    </div>
  );
};

/* ===== Detail Row Component ===== */
const Detail = ({ label, value, full }: any) => (
  <div style={{ gridColumn: full ? "span 2" : "auto" }}>
    <p style={{ fontSize: "11px", color: "#64748b" }}>
      {label}
    </p>
    <p style={{ margin: 0, fontWeight: 600 }}>
      {value}
    </p>
  </div>
);

/* ===== Price Row Component ===== */
const PriceRow = ({ label, value }: any) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "14px"
    }}
  >
    <span style={{ color: "#94a3b8" }}>{label}</span>
    <span style={{ fontWeight: 600 }}>{value}</span>
  </div>
);

export default InvoiceTemplate;