import { collection, query, where, getDocs } from "firebase/firestore";

// Helper to chunk arrays
function chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// Fetch all posts for the given chapters
export async function fetchSearchData(db, chapters) {
  const chapterIds = chapters.map(c => c.id);
  if (chapterIds.length === 0) return [];

  const chunks = chunkArray(chapterIds, 10);
  const allPosts = [];

  for (const chunk of chunks) {
    const q = query(
      collection(db, "posts"),
      where("chapterId", "in", chunk)
    );
    const snapshot = await getDocs(q);
    snapshot.forEach(doc => {
      allPosts.push({ id: doc.id, ...doc.data() });
    });
  }

  return allPosts;
}

// Helper to strip HTML safely
export function stripHtml(html) {
  if (!html) return "";
  const temporalDivElement = document.createElement("div");
  temporalDivElement.innerHTML = html;
  return temporalDivElement.textContent || temporalDivElement.innerText || "";
}

// Perform the search locally
export function performSearch(posts, queryStr, isRegex) {
  if (!queryStr || queryStr.trim() === "") return [];

  let regex;
  if (isRegex) {
    try {
      regex = new RegExp(queryStr, "gi");
    } catch (e) {
      return { error: true, message: "Invalid regular expression" };
    }
  } else {
    const escapedQuery = queryStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    regex = new RegExp(escapedQuery, "gi");
  }

  const results = [];

  posts.forEach(post => {
    const cleanContent = stripHtml(post.post_content);
    const titleMatch = post.post_title && regex.test(post.post_title);
    regex.lastIndex = 0; // reset
    const contentMatch = regex.test(cleanContent);
    regex.lastIndex = 0; // reset

    if (titleMatch || contentMatch) {
      let snippet = "";
      if (contentMatch) {
        const match = regex.exec(cleanContent);
        if (match) {
          const startIndex = Math.max(0, match.index - 50);
          const endIndex = Math.min(cleanContent.length, match.index + match[0].length + 50);
          snippet = cleanContent.substring(startIndex, endIndex);
          if (startIndex > 0) snippet = "..." + snippet;
          if (endIndex < cleanContent.length) snippet = snippet + "...";
        }
      } else if (titleMatch) {
        snippet = post.post_title;
      }
      
      const matchCount = (cleanContent.match(regex) || []).length + (post.post_title?.match(regex) || []).length;
      results.push({
        post,
        snippet,
        matchCount,
        chapterId: post.chapterId
      });
      regex.lastIndex = 0;
    }
  });

  return results;
}
