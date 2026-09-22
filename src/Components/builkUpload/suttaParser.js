// src/utils/suttaParser.ts

import { CHAPTER_MARKER } from "../models/chapter.model";


const isLang1 = (str: string): boolean => /[\u0900-\u097F]/.test(str);
const isLang2 = (str: string): boolean => /[A-Za-z]/.test(str);

const mergeLang2WithoutLang1 = (pairs: VerseModel[]): VerseModel[] => {
    const result: VerseModel[] = [];
    let index = 0
    for (const pair of pairs) {
        const hasDev = pair.lang1 && pair.lang1.trim() !== "";
        const hasEng = pair.lang2 && pair.lang2.trim() !== "";

        if (!hasDev && hasEng && result.length > 0) {
            const last = result[result.length - 1];
            last.lang2 = (last.lang2 || "") + pair.lang2;
        } else {
            index++;
            result.push({ ...pair, id: index, position: index, });
        }
    }

    return result;
};


export function parseSuttaSectionsWithMarker(html: string): PostModel[] {
    const container = document.createElement("div");
    container.innerHTML = html;

    const rawBlocks = Array.from(container.querySelectorAll("p"));

    const blocks: BlockModel[] = rawBlocks
        .map((el) => {
            const html = el.outerHTML;
            const text = (el.textContent || "").trim();
            if (!text) return null;

            if (text === CHAPTER_MARKER) {
                return { html, text, type: "MARKER" as BlockType };
            }

            const type: BlockType =
                isLang1(text) && !isLang2(text)
                    ? "L1"
                    : isLang2(text) && !isLang1(text)
                        ? "L2"
                        : "L2";

            return { html, text, type };
        })
        .filter((b): b is BlockModel => Boolean(b));

    const sections: ChapterModel[] = [];
    let currentSection: PostModel | null = null;
    let expectHiTitle = false;
    let expectEnTitle = false;

    let i = 0;

    while (i < blocks.length) {
        const block = blocks[i];

        // New section marker
        if (block.type === "MARKER") {
            if (currentSection) {
                currentSection.verses = mergeLang2WithoutLang1(
                    currentSection.verses || []
                );
                sections.push(currentSection as ChapterModel);
            }

            currentSection = {
                position: 0,
                title: { lang1: "", lang2: "" },
                verses: [],
            };
            expectHiTitle = true;
            expectEnTitle = false;
            i++;
            continue;
        }

        // Titles
        if (currentSection && expectHiTitle && block.type === "L1") {
            currentSection.title.lang1 = block.html;
            expectHiTitle = false;
            expectEnTitle = true;
            i++;
            continue;
        }

        if (currentSection && expectEnTitle && block.type === "L2") {
            currentSection.title.lang2 = block.html;
            expectEnTitle = false;
            i++;
            continue;
        }

        // Verses pairs
        if (currentSection && !expectHiTitle && !expectEnTitle) {
            if (block.type === "L1") {
                const hiHtml = block.html;
                let enHtml = "";

                const next = blocks[i + 1];
                if (next && next.type === "L2") {
                    enHtml = next.html;
                    i += 2;
                } else {
                    i += 1;
                }
                if (!currentSection.verses) {
                    currentSection.verses = []
                }
                currentSection.verses.push({
                    id: i,
                    position: i,
                    lang1: hiHtml,
                    lang2: enHtml,
                });
                continue;
            }

            // Stray EN: push as Lang2-only; merger will fix it
            if (block.type === "L2") {
                if (!currentSection.verses) {
                    currentSection.verses = []
                }
                currentSection.verses.push({
                    id: i,
                    position: i,
                    lang1: "",
                    lang2: block.html,
                });
                i++;
                continue;
            }
        }

        i++;
    }

    if (currentSection) {
        currentSection.verses = mergeLang2WithoutLang1(
            currentSection.verses || []
        );
        sections.push(currentSection as ChapterModel);
    }

    return sections;
}
