import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <div style={{ fontSize: 80, color: "white", fontWeight: 700 }}>
          ⚽ Football Teams
        </div>
        <div style={{ fontSize: 32, color: "#94a3b8", textAlign: "center", maxWidth: 800 }}>
          Browse all competing teams, track performance and win rates
        </div>
      </div>
    ),
    size,
  );
}