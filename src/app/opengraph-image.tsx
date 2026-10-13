import { ImageResponse } from "next/og";

export const alt = "Jurek · Distributed Systems & Engineering";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#000000",
          padding: "64px 80px",
          fontFamily: "monospace",
          border: "8px solid #e5e5e5",
          color: "#e5e5e5",
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "32px", color: "#38bdf8", fontWeight: "bold" }}>
              [
            </span>
            <span style={{ fontSize: "32px", color: "#e5e5e5", fontWeight: "bold" }}>
              jurek@qzz.io
            </span>
            <span style={{ fontSize: "32px", color: "#38bdf8", fontWeight: "bold" }}>
              ]
            </span>
          </div>

          <div
            style={{
              padding: "6px 16px",
              border: "2px solid #38bdf8",
              color: "#38bdf8",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            [*] STATUS: AVAILABLE
          </div>
        </div>

        {/* Center Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: "56px", fontWeight: "bold", color: "#e5e5e5", lineHeight: 1.15 }}>
            DISTRIBUTED_SYSTEMS &amp; LOW_LATENCY_ENGINES
          </div>
          <div style={{ fontSize: "24px", color: "#38bdf8" }}>
            // Raft Consensus · Zero-Allocation Go · Linux Kernel io_uring · Next.js
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #e5e5e5",
            paddingTop: "24px",
            fontSize: "20px",
          }}
        >
          <div>SYS_ID: github.com/jurek-zsl</div>
          <div style={{ color: "#38bdf8" }}>HOST: jurekdev.qzz.io</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
