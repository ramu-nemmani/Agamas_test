// src/components/DocxSuttaSectionParser.tsx
import mammoth from "mammoth";
import React, { useEffect, useState, type ChangeEvent } from "react";

type ViewMode = "json" | "preview";

const DocxSuttaSectionParser: React.FC = () => {
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [loading, setLoading] = useState<boolean>(false);
  const [finished, setFinish] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setLoading(true);
    setPosts([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const { value: html } = (await mammoth.convertToHtml({
        arrayBuffer,
      })) as { value: string };
      const parsedSections = parseSuttaSectionsWithMarker(html);
      setPosts(remapSectionLanguages(parsedSections));
    } catch (err) {
      console.error("Error reading/parsing DOCX:", err);
      setError("Failed to parse DOCX. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const remapSectionLanguages = (Chapters = posts) => {
    if (!Chapters.length) {
      return [];
    }
    const { lang1, lang2 } = selectedLanguages;

    return Chapters.map((c) => {
      const newTitle = {
        [lang1]: c.title.lang1,
        [lang2]: c.title.lang2,
      };

      const newVerses = (c.verses || []).map((v) => ({
        id: v.id,
        position: v.position,
        [lang1]: v.lang1,
        [lang2]: v.lang2,
      }));

      return {
        ...c,
        title: newTitle,
        verses: newVerses,
      };
    });
  };

  useEffect(() => {
    setPosts(remapSectionLanguages());
  }, [selectedLanguages]);

  const onSubmitDocx = async () => {
    //
  };

  const noPali = (htmlContent: any) => {
    return /[\u0900-\u097F]/.test(
      htmlContent.replace(/<[^>]+>/g, ""), // remove HTML tags
    );
  };

  return (
    <div className="container p-10 min-h-screen">
      <h2 style={{ marginBottom: 8 }}>DOCX → Sutta Sections (with marker)</h2>
      <p style={{ marginBottom: 16, fontSize: 13, color: "#64748b" }}>
        In your DOCX, add a line <code>===SECTION===</code> before each
        Hindi/English title pair.{" "}
      </p>

      {/* File picker */}
      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.6rem 1rem",
          borderRadius: "999px",
          border: "1px solid #cbd5f5",
          background: "#eff6ff",
          color: "#1d4ed8",
          cursor: "pointer",
          fontSize: "0.9rem",
          marginBottom: "1rem",
        }}
      >
        <span>📄 Choose DOCX file</span>
        <input
          type="file"
          accept=".docx"
          onChange={onFileChange}
          style={{ display: "none" }}
        />
      </label>
      {finished.map((f) => (
        <div
          key={f}
          dangerouslySetInnerHTML={{
            __html: f,
          }}
          style={{
            fontWeight: 600,
            fontSize: 15,
            marginBottom: 2,
          }}
        />
      ))}
      {loading && (
        <p style={{ fontSize: 13, color: "#0f172a", marginTop: 8 }}>
          Processing…
        </p>
      )}
      {error && (
        <p style={{ fontSize: 13, color: "#b91c1c", marginTop: 8 }}>{error}</p>
      )}
      {posts.length > 0 && (
        <>
          {/* Toggle */}
          <div
            style={{
              display: "inline-flex",
              borderRadius: 999,
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              marginLeft: 12,
              verticalAlign: "middle",
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode("json")}
              style={{
                padding: "0.35rem 0.9rem",
                fontSize: "0.8rem",
                border: "none",
                cursor: "pointer",
                background: viewMode === "json" ? "#0f172a" : "transparent",
                color: viewMode === "json" ? "#e5e7eb" : "#475569",
              }}
            >
              JSON
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              style={{
                padding: "0.35rem 0.9rem",
                fontSize: "0.8rem",
                border: "none",
                cursor: "pointer",
                background: viewMode === "preview" ? "#0f172a" : "transparent",
                color: viewMode === "preview" ? "#e5e7eb" : "#475569",
              }}
            >
              Preview
            </button>
          </div>
          <div className="">
            <button type="button" onClick={onSubmitDocx}>
              Submit
            </button>
          </div>

          {viewMode === "json" ? (
            <>
              <h3 style={{ marginTop: 24 }}>Sections JSON</h3>
              <pre
                style={{
                  background: "#0f172a",
                  color: "#e2e8f0",
                  padding: 20,
                  borderRadius: 8,
                  maxHeight: 400,
                  overflow: "auto",
                  fontSize: 12,
                }}
              >
                {JSON.stringify(posts, null, 2)}
              </pre>
            </>
          ) : (
            <>
              <h3 style={{ marginTop: 24, marginBottom: 8 }}>Preview</h3>
              <div>
                {posts.map((section, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "12px 0",
                      borderBottom:
                        idx < posts.length - 1 ? "1px dashed #e2e8f0" : "none",
                    }}
                  >
                    {/* Title */}
                    <div style={{ marginBottom: 8 }}>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: section.title[selectedLanguages.lang1],
                        }}
                        style={{
                          fontWeight: 600,
                          fontSize: 15,
                          marginBottom: 2,
                          borderBottom: "1px dashed #e2e8f0",
                        }}
                      />
                      <div
                        dangerouslySetInnerHTML={{
                          __html: section.title[selectedLanguages.lang2],
                        }}
                        style={{
                          fontSize: 13,
                          color: "#4b5563",
                        }}
                      />
                    </div>

                    {/* Verses */}
                    {(section.verses || [])?.length > 0 && (
                      <div style={{ marginLeft: 8 }}>
                        {section.verses?.map((pair: VerseModel, i2: number) => (
                          <div
                            key={i2}
                            style={{
                              marginBottom: 8,
                              paddingLeft: 8,
                              borderLeft: "2px solid #e5e7eb",
                            }}
                          >
                            {pair[selectedLanguages.lang1] && (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: pair[selectedLanguages.lang1],
                                }}
                                style={{
                                  fontSize: 14,
                                  marginBottom: 2,
                                  borderBottom: "1px dashed #e2e8f0",
                                }}
                              />
                            )}
                            {pair[selectedLanguages.lang2] ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: pair[selectedLanguages.lang2],
                                }}
                                style={{
                                  fontSize: 13,
                                  color: "#4b5563",
                                  backgroundColor: noPali(
                                    pair[selectedLanguages.lang2],
                                  )
                                    ? "#FEE2E2"
                                    : "transparent", // light red
                                }}
                              />
                            ) : (
                              <div className="h-3 w-full bg-red-600"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
      <ChapterPopup
        open={open}
        onClose={() => setOpen(false)}
        languages={languages}
      />
    </div>
  );
};

export default DocxSuttaSectionParser;
