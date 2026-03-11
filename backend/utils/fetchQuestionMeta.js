import axios from "axios";
import * as cheerio from "cheerio";

const slugToTitle = (link) => {
  try {
    const parts = link.split("/").filter(Boolean);
    const slug = parts[parts.length - 1] || "question";
    return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return "Untitled Question";
  }
};

export const fetchQuestionMeta = async (link) => {
  try {
    const lower = link.toLowerCase();

    if (lower.includes("leetcode.com")) {
      const { data } = await axios.get(link, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      const $ = cheerio.load(data);
      const title =
        $('meta[property="og:title"]').attr("content")?.split(" - ")[0]?.trim() ||
        $("title").text().split(" - ")[0].trim() ||
        slugToTitle(link);

      const html = $.html();

      let difficulty = "Easy";
      if (/Hard/i.test(html)) difficulty = "Hard";
      else if (/Medium/i.test(html)) difficulty = "Medium";
      else if (/Easy/i.test(html)) difficulty = "Easy";

      return {
        title,
        difficulty,
        platform: "LeetCode"
      };
    }

    if (lower.includes("geeksforgeeks.org") || lower.includes("gfg")) {
      const { data } = await axios.get(link, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      const $ = cheerio.load(data);

      const title =
        $('meta[property="og:title"]').attr("content")?.split(" - ")[0]?.trim() ||
        $("title").text().split(" - ")[0].trim() ||
        slugToTitle(link);

      const pageText = $("body").text();

      let difficulty = "Easy";
      const difficultyMatch = pageText.match(/Difficulty\s*:\s*(Easy|Medium|Hard)/i);
      if (difficultyMatch?.[1]) {
        difficulty =
          difficultyMatch[1].charAt(0).toUpperCase() +
          difficultyMatch[1].slice(1).toLowerCase();
      }

      return {
        title,
        difficulty,
        platform: "GFG"
      };
    }

    return {
      title: slugToTitle(link),
      difficulty: "Easy",
      platform: "Other"
    };
  } catch (error) {
    return {
      title: slugToTitle(link),
      difficulty: "Easy",
      platform: "Other"
    };
  }
};