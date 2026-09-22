import OpenAI from "openai";

export async function GenerateTranslations(
  jsonData,
  fromLanguage,
  toLanguage,
  contentType = "new"
) {
  const client = new OpenAI({
    apiKey: import.meta.env.VITE_FIREBASE_OPENAI_KEY,
    dangerouslyAllowBrowser: true,
  });

  const newContent = `You are a professional translator.  
Your task is to translate text from ${fromLanguage} into ${toLanguage} while following these specific guidelines.
When the user provides JSON input containing a single string of text, you must return JSON with exactly two Post_Title, Content.

a) Replace the following terms:
Buddha → Budha
Blessed One → Bhagavaan
Bhikkhu → Bhikshu
World Honored One → Budha
Tathagata → Tathaagata
Brahmin → Brahmana
Ascetic → Shramana
Wheel turning sage king → Chakravartin
Four Heavenly Kings → Catur-Maharaaja-Kayikas
Rajagaha → Raajagriha

b) Convert "ā" to "aa" in the translation.
ī - ii
ū - uu
ṅ - n
ññ - ny
ṭ - t
ḍ - d
ṇ - n
l̥ - l
ḥ - h
ṁ - n
ñ - n

c) The translation format should follow this structure:
- The numbered Chinese text appears first.
- Directly below each Chinese text, provide its English translation.
d) Ensure a proper and accurate translation of each verse.
e) Remove double vowels at the end of the name. (Shraavastii → Shraavasti)
f) Remove double consonants in names.

Translation Output Rules:\
2. Always include:
   - "Post Title": translated title only.
   - "Content":
 ${
   contentType == "combine"
     ? ` HTML string — each <p> of the original text immediately followed by a <p> containing its translation.
   Example: "<p>{original}</p>\\n<p>{translation}</p>".`
     : `HTML string — translated text formatted with <p> tags, preserving paragraph order`
 }
4. Preserve meaning, tone, and paragraph structure.
5. Give proper space between each lines, words and paragraph,  
6. Output must be valid JSON only — no extra text or explanation.
`;

  const combineContent = `
You are a professional bilingual translator and content aligner. I will provide two versions of the same text in two different languages (e.g., Chinese and English).  
Each version expresses the same meaning but may differ in sentence count.

Your task:
- Carefully read both versions.
- Identify corresponding  sentences with the same meaning.
- Combine them into a single bilingual text in ${toLanguage}, where each ${toLanguage} sentence is immediately followed by its matching sentence in the other language.

Alignment & Combination Rules:
1. Align sentences based on **semantic meaning**, not just order.
2. Keep all inline HTML tags (<strong>, <em>, <br>, etc.) intact.
3. Maintain readability — do not duplicate, split, or truncate sentences unnaturally.

Output Requirements:
- Return **only one** valid JSON object with exactly this structure:
  {
    "Post_Title": "<string>",
    "Content": "<string (HTML)>"
  }
- Do not include explanations, markdown, or extra keys.
- Each pair of matched sentences must be wrapped in <p>...</p>, if need include <strong> <br> tags.
- Paragraph order: ${toLanguage} first → the other language second.

Field Guidelines:
- "Post_Title": A short, meaningful title in ${toLanguage}.
- "Content": The aligned bilingual content formatted as valid HTML.

Replace the following terms:
Buddha → Budha
Blessed One → Bhagavaan
Bhikkhu → Bhikshu
World Honored One → Budha
Tathagata → Tathaagata
Brahmin → Brahmana
Ascetic → Shramana
Wheel turning sage king → Chakravartin
Four Heavenly Kings → Catur-Maharaaja-Kayikas
Rajagaha → Raajagriha

- Convert "ā" to "aa" in the translation.
ī - ii
ū - uu
ṅ - n
ññ - ny
ṭ - t
ḍ - d
ṇ - n
l̥ - l
ḥ - h
ṁ - n
ñ - n
- Remove double vowels at the end of the name. (Shraavastii → Shraavasti)
- Remove double consonants in names.
`;

  const separateContent = `
You are a professional translator/formatter. I will provide a single combined text with content in two languages.
Extract only the text in the target language (${toLanguage}), don't extract extra text.
formate should be same don't change it, 
Output Requirements:
- Return **only one** valid JSON object with exactly this structure:
  {
    "Post_Title": "<string>",
    "Content": "<string (HTML)>"
  }
- Do not include explanations, markdown, or extra keys.
- Each pair of matched paragraphs must be wrapped in <p>...</p>, if need include <strong> <br> tags.
- Replace the following terms:
Buddha → Budha
Blessed One → Bhagavaan
Bhikkhu → Bhikshu
World Honored One → Budha
Tathagata → Tathaagata
Brahmin → Brahmana
Ascetic → Shramana
Wheel turning sage king → Chakravartin
Four Heavenly Kings → Catur-Maharaaja-Kayikas
Rajagaha → Raajagriha

- Convert "ā" to "aa" in the translation.
ī - ii
ū - uu
ṅ - n
ññ - ny
ṭ - t
ḍ - d
ṇ - n
l̥ - l
ḥ - h
ṁ - n
ñ - n
- Remove double vowels at the end of the name. (Shraavastii → Shraavasti)
- Remove double consonants in names.
`;

  const messages = [
    {
      role: "system",
      content:
        contentType == "new"
          ? newContent
          : contentType == "combine"
          ? combineContent
          : separateContent,
    },
    {
      role: "user",
      content: JSON.stringify(jsonData, null, 2),
    },
  ];

  const completion = await client.chat.completions.create({
    model: "gpt-5-nano-2025-08-07",
    messages,
  });

  const raw = completion?.choices?.[0]?.message?.content;

  try {
    console.log("🚀 ~ GenerateTranslations ~ raw:", raw);
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse model output as JSON:", err);
    // Return the raw output so caller can debug
    return { rawOutput: raw, parseError: err.message, status: "failed" };
  }
}
