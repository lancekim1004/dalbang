// 링크 공유 미리보기 이미지 (카카오톡·슬랙·X 등에 링크를 붙였을 때 보이는 그림)
import { ImageResponse } from "next/og";
import { createTranslator } from "next-intl";
import messages from "../../messages/en.json";

export const alt = createTranslator({ locale: "en", messages })("Meta.homeTitle");
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const t = createTranslator({ locale: "en", messages });
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#16213a", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: 999, background: "#f2c14e", display: "flex" }} />
          <div style={{ fontSize: 64, fontWeight: 700 }}>{t("Meta.siteName")}</div>
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, marginTop: 48, lineHeight: 1.15 }}>{t("Home.headline")}</div>
        <div style={{ display: "flex", fontSize: 30, marginTop: 28, color: "#cbd5e1" }}>{`${t("Meta.tagline")} · ${t("Demo.banner")}`}</div>
      </div>
    ),
    size,
  );
}
