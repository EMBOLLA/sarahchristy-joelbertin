import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { WEDDING } from "@/config/wedding";
import { DICTIONARIES } from "@/i18n/dictionaries";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${WEDDING.couple.first} & ${WEDDING.couple.second}`;

const IVORY = "#FAF6F0";
const TERRACOTTA = "#A8532F";
const GOLD = "#BE9A45";
const INK = "#3E2C23";

/** The WhatsApp preview is the invitation's first impression. Prerendered per locale. */
export default async function OpengraphImage({ params }: Readonly<{ params: Promise<{ lang: string }> }>): Promise<ImageResponse> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = DICTIONARIES[locale];

  const [script, serif] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/PinyonScript-Regular.ttf")),
    readFile(join(process.cwd(), "assets/fonts/EBGaramond-400.ttf")),
  ]);

  const date = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: WEDDING.timeZone }).format(
    new Date(WEDDING.ceremonyAt),
  );

  const initialStyle = { color: GOLD };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: IVORY,
          padding: 28,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: `3px solid ${TERRACOTTA}`,
            outline: `1px solid ${GOLD}`,
            outlineOffset: -12,
            gap: 18,
          }}
        >
          <div style={{ display: "flex", fontFamily: "Script", fontSize: 104, color: TERRACOTTA }}>
            <span style={initialStyle}>{WEDDING.couple.first.charAt(0)}</span>
            <span>{WEDDING.couple.first.slice(1)}</span>
            <span style={{ ...initialStyle, margin: "0 28px" }}>&</span>
            <span style={initialStyle}>{WEDDING.couple.second.charAt(0)}</span>
            <span>{WEDDING.couple.second.slice(1)}</span>
          </div>
          <div style={{ display: "flex", width: 220, height: 1, background: GOLD }} />
          <div style={{ display: "flex", fontFamily: "Serif", fontSize: 34, color: INK }}>{dict.hero.invitation}</div>
          <div style={{ display: "flex", fontFamily: "Serif", fontSize: 30, letterSpacing: 6, color: TERRACOTTA }}>
            {date.toUpperCase()}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Script", data: script, style: "normal", weight: 400 },
        { name: "Serif", data: serif, style: "normal", weight: 400 },
      ],
    },
  );
}
