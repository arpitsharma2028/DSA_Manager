export const analyzeCode = async (code, title = "") => {
  const text = (code || "").toLowerCase();
  const lowerTitle = (title || "").toLowerCase();

  let my_tc = "O(n)";
  let my_sc = "O(1)";
  let expected_tc = "O(n)";
  let expected_sc = "O(1)";

  const forCount = (text.match(/\bfor\b/g) || []).length;
  const whileCount = (text.match(/\bwhile\b/g) || []).length;

  const hasDpArray =
    text.includes("vector<int> dp") ||
    text.includes("vector<long long> dp") ||
    text.includes("vector<vector<int>> dp") ||
    text.includes("int dp[") ||
    text.includes("long long dp[");

  const hasExtraStorage =
    hasDpArray ||
    text.includes("unordered_map<") ||
    text.includes("map<") ||
    text.includes("set<") ||
    text.includes("unordered_set<") ||
    text.includes("stack<") ||
    text.includes("queue<") ||
    text.includes("priority_queue<") ||
    text.includes("vector<int>") ||
    text.includes("vector<long long>") ||
    text.includes("vector<vector<int>>");

  const hasRecursion =
    text.includes("return solve") ||
    text.includes("solvememoization(") ||
    text.includes("dfs(") ||
    text.includes("helper(");

  if (
    text.includes("mid") ||
    text.includes("binary search") ||
    lowerTitle.includes("binary search") ||
    lowerTitle.includes("search a 2d matrix")
  ) {
    my_tc = "O(log n)";
    expected_tc = "O(log n)";
    my_sc = "O(1)";
    expected_sc = "O(1)";
  }

  if (forCount + whileCount >= 2) {
    my_tc = "O(n^2)";
    expected_tc = "O(n^2)";
  }

  if (hasExtraStorage) {
    my_sc = "O(n)";
  }

  if (hasRecursion && !hasDpArray) {
    my_sc = "O(n)";
  }

  if (lowerTitle.includes("house robber")) {
    my_tc = "O(n)";
    expected_tc = "O(n)";
    my_sc = hasDpArray ? "O(n)" : "O(1)";
    expected_sc = "O(1)";
  }

  return {
    my_tc,
    my_sc,
    expected_tc,
    expected_sc
  };
};