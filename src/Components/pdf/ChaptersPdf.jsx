// src/pdf/ChaptersPdf.jsx
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { useMemo } from "react";
import Html from "react-pdf-html";

// ✅ Allow wrapping for CJK
Font.registerHyphenationCallback((word) => {
  const isCJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/.test(
    word
  );
  return isCJK ? Array.from(word) : [word];
});

// ✅ Fonts
Font.register({ family: "NotoSans", src: "/fonts/NotoSans-Regular.ttf" });
Font.register({
  family: "NotoSansArabic",
  src: "/fonts/NotoSansArabic-Regular.ttf",
});
Font.register({
  family: "NotoSansTamil",
  src: "/fonts/NotoSansTamil-Regular.ttf",
});
Font.register({
  family: "NotoSansTelugu",
  src: "/fonts/NotoSansTelugu-Regular.ttf",
});
Font.register({
  family: "NotoSansDevanagari",
  src: "/fonts/NotoSansDevanagari-Regular.ttf",
});
Font.register({ family: "NotoSansSC", src: "/fonts/NotoSansSC-Regular.ttf" });
Font.register({ family: "Inter", src: "/fonts/Inter-Regular.ttf" });

// ---------- layout constants ----------
const FRAME_PAD = 22; // page margin (outside border)
const CONTENT_PAD = 18; // inside border padding
const HEADER_H = 28;
const FOOTER_H = 28;
const GAP = 28;

// -------------------- styles --------------------
const styles = StyleSheet.create({
  page: {
    padding: FRAME_PAD, // ✅ margin for every page
    fontFamily: "Inter",
    color: "#0f172a",
    backgroundColor: "#fff",
    paddingTop: CONTENT_PAD + HEADER_H + GAP,
    paddingBottom: CONTENT_PAD + FOOTER_H + 20,
  },

  // ✅ full border inside the page margin (always all sides)
  frame: {
    position: "absolute",
    top: FRAME_PAD,
    left: FRAME_PAD,
    right: FRAME_PAD,
    bottom: FRAME_PAD,
    borderWidth: 1,
    borderColor: "#0f172a",
    borderRadius: 6,
  },

  content: {
    padding: CONTENT_PAD,
  },

  header: {
    position: "absolute",
    top: FRAME_PAD + CONTENT_PAD,
    left: FRAME_PAD + CONTENT_PAD,
    right: FRAME_PAD + CONTENT_PAD,
    height: HEADER_H,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    fontSize: 9.5,
    color: "#475569",
    textAlign: "center",
  },
  headerRight: {
    fontSize: 9.5,
    color: "#475569",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: FRAME_PAD + CONTENT_PAD,
    left: FRAME_PAD + CONTENT_PAD,
    right: FRAME_PAD + CONTENT_PAD,
    height: FOOTER_H,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    justifyContent: "center",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLeft: {
    fontSize: 9.5,
    color: "#64748b",
    width: "75%",
    wordBreak: "break-all",
  },
  footerRight: {
    fontSize: 9.5,
    width: "25%",
    color: "#64748b",
    textAlign: "right",
  },

  chapterTitle: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.2,
    textAlign: "center",
  },
  chapterMeta: {
    marginTop: 6,
    fontSize: 10,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 1.35,
  },

  entryTitle: {
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1.25,
    marginBottom: 6,
  },

  divider: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  coverContent: {
    paddingLeft: CONTENT_PAD,
    paddingRight: CONTENT_PAD,
    paddingTop: CONTENT_PAD,
    paddingBottom: CONTENT_PAD,
    height: "100%",
  },

  coverCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },

  chapterCoverTitle: {
    fontSize: 34,
    fontWeight: 700,
    lineHeight: 1.2,
    textAlign: "center",
  },
});

function clampToAllowedFontSize(size) {
  return Number(size);
}

function langBase(language, baseFontSize) {
  const size = clampToAllowedFontSize(baseFontSize);
  switch (language) {
    case "chinese":
    case "chineseToEnglish":
      return { fontFamily: "NotoSansSC", fontSize: size, lineHeight: 1.75 };
    case "hindi":
    case "EnglishToHindi":
      return {
        fontFamily: "NotoSansDevanagari",
        fontSize: size,
        lineHeight: 1.7,
      };
    case "tamil":
      return { fontFamily: "NotoSansTamil", fontSize: size, lineHeight: 1.7 };
    case "telugu":
      return { fontFamily: "NotoSansTelugu", fontSize: size, lineHeight: 1.7 };
    case "arabic":
      return { fontFamily: "NotoSansArabic", fontSize: size, lineHeight: 1.8 };
    default:
      return { fontFamily: "NotoSans", fontSize: size, lineHeight: 1.6 };
  }
}

function sanitizeHtml(html = "") {
  return (
    String(html || "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<\/?w:[^>]+>/gi, "")
      .replace(/<\/?o:[^>]+>/gi, "")
      .replace(/class="Mso[^"]*"/gi, "")
      .replace(/<br\s*\/?>/gi, "<br/>")

      // remove font styles
      .replace(/font-family\s*:\s*[^;"]+;?/gi, "")
      .replace(/font-family\s*:\s*&quot;[^&]+&quot;[^;]*;?/gi, "")
      .replace(/font-family\s*:\s*"[^"]+"[^;]*;?/gi, "")
      .replace(/font-family\s*:\s*'[^']+'[^;]*;?/gi, "")
      .replace(/font-size\s*:\s*[^;"]+;?/gi, "")

      // remove other unsupported styles
      .replace(/font-style\s*:\s*italic;?/gi, "")
      .replace(/line-height\s*:\s*[^;"]+;?/gi, "")
      .trim()
  );
}

function buildHtmlStyles(baseFontSize, lineHeight = 1.6) {
  const base = clampToAllowedFontSize(baseFontSize);
  const h1 = Math.min(26, Math.max(18, base + 10));
  const h2 = Math.min(22, Math.max(18, base + 6));
  const h3 = Math.min(18, Math.max(16, base + 2));

  return {
    body: { fontStyle: "normal" },
    p: {
      margin: 0,
      marginBottom: 8,
      lineHeight,
      fontStyle: "normal",
      fontSize: base,
      wordBreak: "break-all",
    },
    h1: {
      fontSize: h1,
      marginTop: 10,
      marginBottom: 8,
      fontWeight: 700,
      lineHeight: 1.25,
      wordBreak: "break-all",
    },
    h2: {
      fontSize: h2,
      marginTop: 10,
      marginBottom: 8,
      fontWeight: 700,
      lineHeight: 1.25,
      wordBreak: "break-all",
    },
    h3: {
      fontSize: h3,
      marginTop: 8,
      marginBottom: 6,
      fontWeight: 700,
      lineHeight: 1.25,
      wordBreak: "break-all",
    },
    strong: { fontWeight: 700, wordBreak: "break-all" },
    em: { fontStyle: "normal", wordBreak: "break-all" },
    i: { fontStyle: "normal", wordBreak: "break-all" },
    span: { fontStyle: "normal", wordBreak: "break-all" },
    ul: {
      marginTop: 4,
      marginBottom: 8,
      paddingLeft: 0,
      wordBreak: "break-all",
    },
    ol: {
      marginTop: 4,
      marginBottom: 8,
      paddingLeft: 0,
      wordBreak: "break-all",
    },
    li: { lineHeight, wordBreak: "break-all" },
  };
}

// -------------------- component --------------------
export default function ChaptersPdf({
  topHeaderText = "The Ekotara Aagama",
  chapters = [],
  baseFontSize = 18,
}) {
  const preparedChapters = useMemo(() => {
    return (chapters || []).map((ch) => ({
      ...ch,
      items: (ch.items || []).map((it) => ({
        ...it,
        _safeHtml: sanitizeHtml(it.post_content || ""),
        hookupText: it.post_content || "", // optional debug
      })),
    }));
  }, [chapters]);
  const urlLink = "https://theagamas.com";
  const safeFontSize = clampToAllowedFontSize(baseFontSize);

  return (
    <Document>
      {preparedChapters.map((chapter, idx) => {
        return (
          <>
            {/* ✅ Chapter Title Full Page */}
            <Page
              key={`${chapter.chapterId}-cover`}
              size="A4"
              style={styles.page}
            >
              <View style={styles.frame} fixed />
              <View style={styles.header} fixed>
                <Text style={styles.headerText}>{topHeaderText}</Text>
                <Text style={styles.headerText}>{urlLink}</Text>
              </View>
              <View style={styles.footer} fixed>
                <View style={styles.footerRow}>
                  <Text style={styles.footerLeft}>{""}</Text>
                  <Text
                    style={styles.footerRight}
                    render={({ pageNumber, totalPages }) =>
                      `Page ${pageNumber} of ${totalPages}`
                    }
                  />
                </View>
              </View>

              {/* ✅ Full page center title */}
              <View style={styles.coverContent}>
                <View style={styles.coverCenter}>
                  <Text
                    style={[
                      styles.chapterCoverTitle,
                      { fontFamily: "NotoSansSC" },
                    ]}
                  >
                    {chapter.chapterName || "Chapter"}
                  </Text>
                </View>
              </View>
            </Page>

            <Page
              key={`${chapter.chapterId}-content`}
              size="A4"
              style={styles.page}
            >
              <View style={styles.frame} fixed />
              <View style={styles.header} fixed>
                <Text style={styles.headerLeft}>{topHeaderText}</Text>
                <Text style={styles.headerRight}>{urlLink}</Text>
              </View>
              <View style={styles.footer} fixed>
                <View style={styles.footerRow}>
                  <Text
                    style={[styles.footerLeft, { fontFamily: "NotoSansSC" }]}
                  >
                    {chapter.chapterName}
                  </Text>
                  <Text
                    style={styles.footerRight}
                    render={({ pageNumber, totalPages }) =>
                      `Page ${pageNumber} of ${totalPages}`
                    }
                  />
                </View>
              </View>
              <View style={styles.content}>
                {chapter.items.map((item, index) => {
                  const base = langBase(item.language, safeFontSize);
                  const html = item._safeHtml || "";
                  const htmlStyles = buildHtmlStyles(
                    base.fontSize,
                    base.lineHeight
                  );

                  return (
                    <View key={item.id} wrap>
                      <View>
                        <Text
                          style={[
                            styles.entryTitle,
                            base,
                            { fontSize: Math.min(18, base.fontSize + 2) },
                          ]}
                        >
                          {item.post_title || item.post_name || item.id}
                        </Text>

                        <View style={[base]}>
                          <Html stylesheet={htmlStyles}>{html}</Html>
                        </View>

                        {chapter.items.length != index + 1 && (
                          <View style={styles.divider} />
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </Page>
          </>
        );
      })}
    </Document>
  );
}
