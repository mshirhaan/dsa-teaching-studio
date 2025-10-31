import { RoadmapQuestion } from '@/stores/appStore';

// LeetCode problem number mapping (common problems)
const leetcodeNumbers: Record<string, number> = {
  'Two Sum': 1,
  'Two Sum II - Input Array Is Sorted': 167,
  'Remove Duplicates from Sorted Array': 26,
  'Product of Array Except Self': 238,
  'Container With Most Water': 11,
  'Trapping Rain Water': 42,
  'Rotate Array': 189,
  'Move Zeroes': 283,
  'Group Anagrams': 49,
  'Missing Number': 268,
  'Top K Frequent Elements': 347,
  'Sort Colors': 75,
  'Spiral Matrix': 54,
  'Majority Element': 169,
  'Majority Element II': 229,
  'Longest Consecutive Sequence': 128,
  'Longest Common Prefix': 14,
  'Longest Substring Without Repeating Characters': 3,
  'Maximum Subarray': 53,
  'Reverse Words in a String': 151,
  'String Compression': 443,
  'Is Subsequence': 392,
  'Max Number of K-Sum Pairs': 1679,
  '3Sum': 15,
  'Permutation in String': 567,
  'Min Stack': 155,
  'Sliding Window Maximum': 239,
  'Minimum Window Substring': 76,
  'Daily Temperatures': 739,
  'Car Fleet': 853,
  'Largest Rectangle in Histogram': 84,
  'Expression Add Operators': 282,
  'Reverse Linked List': 206,
  'Merge Two Sorted Lists': 21,
  'Reorder List': 143,
  'Linked List Cycle': 141,
  'Linked List Cycle II': 142,
  'Find the Duplicate Number': 287,
  'LRU Cache': 146,
  'Remove Duplicates from Sorted List': 83,
  'Intersection of Two Linked Lists': 160,
  'LFU Cache': 460,
  'Design Browser History': 1472,
  'Subsets': 78,
  'Subsets II': 90,
  'Combination Sum': 39,
  'N-Queens': 51,
  'N-Queens II': 52,
  'Sudoku Solver': 37,
  'Climbing Stairs': 70,
  'Unique Paths': 62,
  'Generate Parentheses': 22,
  'Binary Tree Level Order Traversal': 102,
  'Binary Tree Preorder Traversal': 144,
  'Delete Node in a BST': 450,
  'Invert Binary Tree': 226,
  'Maximum Depth of Binary Tree': 104,
  'Diameter of Binary Tree': 543,
  'Same Tree': 100,
  'Subtree of Another Tree': 572,
  'Lowest Common Ancestor of a Binary Search Tree': 235,
  'Lowest Common Ancestor of a Binary Tree': 236,
  'Binary Tree Zigzag Level Order Traversal': 103,
  'Vertical Order Traversal of a Binary Tree': 987,
  'Serialize and Deserialize Binary Tree': 297,
  'Clone Graph': 133,
  'Rotting Oranges': 994,
  'Number of Islands': 200,
  'Flood Fill': 733,
  'Course Schedule': 207,
  'Course Schedule II': 210,
  'Longest Increasing Path in a Matrix': 329,
  'Cat and Mouse': 913,
  'Network Delay Time': 743,
  'Cheapest Flights Within K Stops': 787,
  'Course Schedule IV': 1462,
  'Find the City With the Smallest Number of Neighbors at a Threshold Distance': 1334,
  'Shortest Path in Binary Matrix': 1091,
  'Implement Trie (Prefix Tree)': 208,
  'Word Search': 79,
  'Word Search II': 212,
  'Unique Paths II': 63,
  'House Robber': 198,
  'House Robber II': 213,
  'Minimum Path Sum': 64,
  'Coin Change': 322,
  'Best Time to Buy and Sell Stock': 121,
  'Best Time to Buy and Sell Stock II': 122,
  'Best Time to Buy and Sell Stock III': 123,
  'Best Time to Buy and Sell Stock IV': 188,
  'Decode Ways': 91,
  'Jump Game': 55,
  'Longest Common Subsequence': 1143,
  'Longest Palindromic Subsequence': 516,
  'Longest Palindromic Substring': 5,
  'Subarray Sum Equals K': 560,
  'Lemonade Change': 860,
  'Search in Rotated Sorted Array': 33,
  'Koko Eating Bananas': 875,
  'Sqrt(x)': 69,
  'Capacity To Ship Packages Within D Days': 1011,
  'Search a 2D Matrix': 74,
  'Search a 2D Matrix II': 240,
  'Min Cost to Connect All Points': 1584,
  'Target Sum': 494,
  'Permutation Sequence': 60,
};

const getDifficulty = (title: string, topic: string): 'Easy' | 'Medium' | 'Hard' => {
  // Easy problems
  const easyProblems = [
    'Two Sum', 'Remove Duplicates from Sorted Array', 'Move Zeroes', 'Missing Number',
    'Sort Colors', 'Majority Element', 'Reverse Linked List', 'Merge Two Sorted Lists',
    'Linked List Cycle', 'Remove Duplicates from Sorted List', 'Climbing Stairs',
    'Invert Binary Tree', 'Maximum Depth of Binary Tree', 'Same Tree', 'Flood Fill',
    'Best Time to Buy and Sell Stock', 'Search a 2D Matrix', 'Sqrt(x)', 'Lemonade Change'
  ];
  
  // Hard problems
  const hardProblems = [
    'Trapping Rain Water', 'Sliding Window Maximum', 'Minimum Window Substring',
    'Largest Rectangle in Histogram', 'Expression Add Operators', 'LFU Cache',
    'Sudoku Solver', 'N-Queens', 'N-Queens II', 'Serialize and Deserialize Binary Tree',
    'Word Search II', 'Best Time to Buy and Sell Stock III', 'Best Time to Buy and Sell Stock IV',
    'Longest Increasing Path in a Matrix', 'Cat and Mouse', 'Min Cost to Connect All Points'
  ];
  
  if (easyProblems.some(p => title.includes(p))) return 'Easy';
  if (hardProblems.some(p => title.includes(p))) return 'Hard';
  return 'Medium';
};

const getTopics = (csvTopic: string, title: string, notes: string): string[] => {
  const topics: string[] = [];
  
  // Add main topic
  if (csvTopic && csvTopic.trim() && csvTopic !== ',') {
    topics.push(csvTopic.trim());
  }
  
  // Add sub-topics from notes
  if (notes) {
    if (notes.toLowerCase().includes('two pointer') || notes.toLowerCase().includes('2 pointer')) {
      topics.push('Two Pointers');
    }
    if (notes.toLowerCase().includes('sliding window')) {
      topics.push('Sliding Window');
    }
    if (notes.toLowerCase().includes('map') || notes.toLowerCase().includes('hash')) {
      topics.push('Hash Map');
    }
    if (notes.toLowerCase().includes('dp') || notes.toLowerCase().includes('dynamic')) {
      topics.push('Dynamic Programming');
    }
    if (notes.toLowerCase().includes('dfs')) {
      topics.push('DFS');
    }
    if (notes.toLowerCase().includes('bfs')) {
      topics.push('BFS');
    }
    if (notes.toLowerCase().includes('stack')) {
      topics.push('Stack');
    }
    if (notes.toLowerCase().includes('queue')) {
      topics.push('Queue');
    }
    if (notes.toLowerCase().includes('heap')) {
      topics.push('Heap');
    }
    if (notes.toLowerCase().includes('greedy')) {
      topics.push('Greedy');
    }
    if (notes.toLowerCase().includes('binary search')) {
      topics.push('Binary Search');
    }
  }
  
  return topics.length > 0 ? [...new Set(topics)] : [csvTopic || 'General'];
};

export const initialRoadmapQuestions: RoadmapQuestion[] = [
  { id: '1', number: 1, title: 'Two Sum', difficulty: 'Easy', topics: ['Array', 'Hash Map'], leetcodeUrl: 'https://leetcode.com/problems/two-sum/', solved: false },
  { id: '2', number: 167, title: 'Two Sum II - Input Array Is Sorted', difficulty: 'Medium', topics: ['Array', 'Two Pointers'], leetcodeUrl: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', solved: false },
  { id: '3', number: 26, title: 'Remove Duplicates from Sorted Array', difficulty: 'Easy', topics: ['Array', 'Two Pointers'], leetcodeUrl: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/', solved: false },
  { id: '4', number: 238, title: 'Product of Array Except Self', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/', solved: false },
  { id: '5', number: 11, title: 'Container With Most Water', difficulty: 'Medium', topics: ['Array', 'Two Pointers'], leetcodeUrl: 'https://leetcode.com/problems/container-with-most-water/', solved: false },
  { id: '6', number: 42, title: 'Trapping Rain Water', difficulty: 'Hard', topics: ['Array', 'Two Pointers'], leetcodeUrl: 'https://leetcode.com/problems/trapping-rain-water/', solved: false },
  { id: '7', number: 189, title: 'Rotate Array', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/rotate-array/', solved: false },
  { id: '8', number: 283, title: 'Move Zeroes', difficulty: 'Easy', topics: ['Array', 'Two Pointers'], leetcodeUrl: 'https://leetcode.com/problems/move-zeroes/', solved: false },
  { id: '9', number: 49, title: 'Group Anagrams', difficulty: 'Medium', topics: ['Array', 'Hash Map'], leetcodeUrl: 'https://leetcode.com/problems/group-anagrams/', solved: false },
  { id: '10', number: 268, title: 'Missing Number', difficulty: 'Easy', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/missing-number/', solved: false },
  { id: '11', number: 347, title: 'Top K Frequent Elements', difficulty: 'Medium', topics: ['Array', 'Hash Map', 'Heap'], leetcodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/', solved: false },
  { id: '12', number: 75, title: 'Sort Colors', difficulty: 'Medium', topics: ['Array', 'Two Pointers'], leetcodeUrl: 'https://leetcode.com/problems/sort-colors/', solved: false },
  { id: '13', number: 54, title: 'Spiral Matrix', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/spiral-matrix/', solved: false },
  { id: '14', number: 169, title: 'Majority Element', difficulty: 'Easy', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/majority-element/', solved: false },
  { id: '15', number: 229, title: 'Majority Element II', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/majority-element-ii/', solved: false },
  { id: '16', number: 128, title: 'Longest Consecutive Sequence', difficulty: 'Medium', topics: ['Array', 'Hash Map'], leetcodeUrl: 'https://leetcode.com/problems/longest-consecutive-sequence/', solved: false },
  { id: '17', number: 14, title: 'Longest Common Prefix', difficulty: 'Easy', topics: ['Array', 'String'], leetcodeUrl: 'https://leetcode.com/problems/longest-common-prefix/', solved: false },
  { id: '18', number: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topics: ['Array', 'Hash Map', 'Sliding Window'], leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', solved: false },
  { id: '19', number: 53, title: 'Maximum Subarray', difficulty: 'Medium', topics: ['Array', 'Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/maximum-subarray/', solved: false },
  { id: '20', number: 151, title: 'Reverse Words in a String', difficulty: 'Medium', topics: ['String'], leetcodeUrl: 'https://leetcode.com/problems/reverse-words-in-a-string/', solved: false },
  { id: '21', number: 443, title: 'String Compression', difficulty: 'Medium', topics: ['String'], leetcodeUrl: 'https://leetcode.com/problems/string-compression/', solved: false },
  { id: '22', number: 392, title: 'Is Subsequence', difficulty: 'Easy', topics: ['String', 'Two Pointers'], leetcodeUrl: 'https://leetcode.com/problems/is-subsequence/', solved: false },
  { id: '23', number: 1679, title: 'Max Number of K-Sum Pairs', difficulty: 'Medium', topics: ['Array', 'Hash Map'], leetcodeUrl: 'https://leetcode.com/problems/max-number-of-k-sum-pairs/', solved: false },
  { id: '24', number: 15, title: '3Sum', difficulty: 'Medium', topics: ['Array', 'Two Pointers'], leetcodeUrl: 'https://leetcode.com/problems/3sum/', solved: false },
  { id: '25', number: 567, title: 'Permutation in String', difficulty: 'Medium', topics: ['String', 'Sliding Window'], leetcodeUrl: 'https://leetcode.com/problems/permutation-in-string/', solved: false },
  { id: '26', number: 155, title: 'Min Stack', difficulty: 'Medium', topics: ['Stack'], leetcodeUrl: 'https://leetcode.com/problems/min-stack/', solved: false },
  { id: '27', number: 239, title: 'Sliding Window Maximum', difficulty: 'Hard', topics: ['Array', 'Sliding Window', 'Queue'], leetcodeUrl: 'https://leetcode.com/problems/sliding-window-maximum/', solved: false },
  { id: '28', number: 76, title: 'Minimum Window Substring', difficulty: 'Hard', topics: ['String', 'Sliding Window'], leetcodeUrl: 'https://leetcode.com/problems/minimum-window-substring/', solved: false },
  { id: '29', number: 739, title: 'Daily Temperatures', difficulty: 'Medium', topics: ['Stack'], leetcodeUrl: 'https://leetcode.com/problems/daily-temperatures/', solved: false },
  { id: '30', number: 853, title: 'Car Fleet', difficulty: 'Medium', topics: ['Stack'], leetcodeUrl: 'https://leetcode.com/problems/car-fleet/', solved: false },
  { id: '31', number: 84, title: 'Largest Rectangle in Histogram', difficulty: 'Hard', topics: ['Stack'], leetcodeUrl: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', solved: false },
  { id: '32', number: 282, title: 'Expression Add Operators', difficulty: 'Hard', topics: ['Recursion'], leetcodeUrl: 'https://leetcode.com/problems/expression-add-operators/', solved: false },
  { id: '33', number: 206, title: 'Reverse Linked List', difficulty: 'Easy', topics: ['Linked List'], leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/', solved: false },
  { id: '34', number: 21, title: 'Merge Two Sorted Lists', difficulty: 'Easy', topics: ['Linked List'], leetcodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/', solved: false },
  { id: '35', number: 143, title: 'Reorder List', difficulty: 'Medium', topics: ['Linked List'], leetcodeUrl: 'https://leetcode.com/problems/reorder-list/', solved: false },
  { id: '36', number: 141, title: 'Linked List Cycle', difficulty: 'Easy', topics: ['Linked List', 'Two Pointers'], leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle/', solved: false },
  { id: '37', number: 142, title: 'Linked List Cycle II', difficulty: 'Medium', topics: ['Linked List', 'Two Pointers'], leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle-ii/', solved: false },
  { id: '38', number: 287, title: 'Find the Duplicate Number', difficulty: 'Medium', topics: ['Array', 'Two Pointers'], leetcodeUrl: 'https://leetcode.com/problems/find-the-duplicate-number/', solved: false },
  { id: '39', number: 146, title: 'LRU Cache', difficulty: 'Medium', topics: ['Linked List', 'Hash Map'], leetcodeUrl: 'https://leetcode.com/problems/lru-cache/', solved: false },
  { id: '40', number: 83, title: 'Remove Duplicates from Sorted List', difficulty: 'Easy', topics: ['Linked List'], leetcodeUrl: 'https://leetcode.com/problems/remove-duplicates-from-sorted-list/', solved: false },
  { id: '41', number: 160, title: 'Intersection of Two Linked Lists', difficulty: 'Easy', topics: ['Linked List'], leetcodeUrl: 'https://leetcode.com/problems/intersection-of-two-linked-lists/', solved: false },
  { id: '42', number: 460, title: 'LFU Cache', difficulty: 'Hard', topics: ['Linked List', 'Hash Map'], leetcodeUrl: 'https://leetcode.com/problems/lfu-cache/', solved: false },
  { id: '43', number: 1472, title: 'Design Browser History', difficulty: 'Medium', topics: ['Linked List'], leetcodeUrl: 'https://leetcode.com/problems/design-browser-history/', solved: false },
  { id: '44', number: 78, title: 'Subsets', difficulty: 'Medium', topics: ['Recursion', 'Backtracking'], leetcodeUrl: 'https://leetcode.com/problems/subsets/', solved: false },
  { id: '45', number: 90, title: 'Subsets II', difficulty: 'Medium', topics: ['Recursion', 'Backtracking'], leetcodeUrl: 'https://leetcode.com/problems/subsets-ii/', solved: false },
  { id: '46', number: 494, title: 'Target Sum', difficulty: 'Medium', topics: ['Recursion', 'Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/target-sum/', solved: false },
  { id: '47', number: 39, title: 'Combination Sum', difficulty: 'Medium', topics: ['Recursion', 'Backtracking'], leetcodeUrl: 'https://leetcode.com/problems/combination-sum/', solved: false },
  { id: '48', number: 51, title: 'N-Queens', difficulty: 'Hard', topics: ['Recursion', 'Backtracking'], leetcodeUrl: 'https://leetcode.com/problems/n-queens/', solved: false },
  { id: '49', number: 52, title: 'N-Queens II', difficulty: 'Hard', topics: ['Recursion', 'Backtracking'], leetcodeUrl: 'https://leetcode.com/problems/n-queens-ii/', solved: false },
  { id: '50', number: 37, title: 'Sudoku Solver', difficulty: 'Hard', topics: ['Recursion', 'Backtracking'], leetcodeUrl: 'https://leetcode.com/problems/sudoku-solver/', solved: false },
  { id: '51', number: 70, title: 'Climbing Stairs', difficulty: 'Easy', topics: ['Recursion', 'Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/', solved: false },
  { id: '52', number: 62, title: 'Unique Paths', difficulty: 'Medium', topics: ['Recursion', 'Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/unique-paths/', solved: false },
  { id: '53', number: 22, title: 'Generate Parentheses', difficulty: 'Medium', topics: ['Recursion', 'Backtracking'], leetcodeUrl: 'https://leetcode.com/problems/generate-parentheses/', solved: false },
  { id: '54', number: 60, title: 'Permutation Sequence', difficulty: 'Hard', topics: ['Recursion'], leetcodeUrl: 'https://leetcode.com/problems/permutation-sequence/', solved: false },
  { id: '55', number: 102, title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', topics: ['Trees', 'BFS'], leetcodeUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', solved: false },
  { id: '56', number: 144, title: 'Binary Tree Preorder Traversal', difficulty: 'Easy', topics: ['Trees', 'DFS'], leetcodeUrl: 'https://leetcode.com/problems/binary-tree-preorder-traversal/', solved: false },
  { id: '57', number: 450, title: 'Delete Node in a BST', difficulty: 'Medium', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/delete-node-in-a-bst/', solved: false },
  { id: '58', number: 226, title: 'Invert Binary Tree', difficulty: 'Easy', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/invert-binary-tree/', solved: false },
  { id: '59', number: 104, title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', solved: false },
  { id: '60', number: 543, title: 'Diameter of Binary Tree', difficulty: 'Easy', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/diameter-of-binary-tree/', solved: false },
  { id: '61', number: 100, title: 'Same Tree', difficulty: 'Easy', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/same-tree/', solved: false },
  { id: '62', number: 572, title: 'Subtree of Another Tree', difficulty: 'Easy', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/subtree-of-another-tree/', solved: false },
  { id: '63', number: 235, title: 'Lowest Common Ancestor of a Binary Search Tree', difficulty: 'Medium', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', solved: false },
  { id: '64', number: 236, title: 'Lowest Common Ancestor of a Binary Tree', difficulty: 'Medium', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', solved: false },
  { id: '65', number: 103, title: 'Binary Tree Zigzag Level Order Traversal', difficulty: 'Medium', topics: ['Trees', 'BFS'], leetcodeUrl: 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/', solved: false },
  { id: '66', number: 987, title: 'Vertical Order Traversal of a Binary Tree', difficulty: 'Hard', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/', solved: false },
  { id: '67', number: 297, title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', solved: false },
  { id: '68', number: 133, title: 'Clone Graph', difficulty: 'Medium', topics: ['Graphs', 'DFS', 'BFS'], leetcodeUrl: 'https://leetcode.com/problems/clone-graph/', solved: false },
  { id: '69', number: 994, title: 'Rotting Oranges', difficulty: 'Medium', topics: ['Graphs', 'BFS'], leetcodeUrl: 'https://leetcode.com/problems/rotting-oranges/', solved: false },
  { id: '70', number: 200, title: 'Number of Islands', difficulty: 'Medium', topics: ['Graphs', 'DFS', 'BFS'], leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/', solved: false },
  { id: '71', number: 733, title: 'Flood Fill', difficulty: 'Easy', topics: ['Graphs', 'DFS'], leetcodeUrl: 'https://leetcode.com/problems/flood-fill/', solved: false },
  { id: '72', number: 207, title: 'Course Schedule', difficulty: 'Medium', topics: ['Graphs', 'DFS', 'BFS'], leetcodeUrl: 'https://leetcode.com/problems/course-schedule/', solved: false },
  { id: '73', number: 210, title: 'Course Schedule II', difficulty: 'Medium', topics: ['Graphs', 'DFS', 'BFS'], leetcodeUrl: 'https://leetcode.com/problems/course-schedule-ii/', solved: false },
  { id: '74', number: 329, title: 'Longest Increasing Path in a Matrix', difficulty: 'Hard', topics: ['Graphs', 'DFS'], leetcodeUrl: 'https://leetcode.com/problems/longest-increasing-path-in-a-matrix/', solved: false },
  { id: '75', number: 913, title: 'Cat and Mouse', difficulty: 'Hard', topics: ['Graphs'], leetcodeUrl: 'https://leetcode.com/problems/cat-and-mouse/', solved: false },
  { id: '76', number: 743, title: 'Network Delay Time', difficulty: 'Medium', topics: ['Graphs', 'Dijkstra'], leetcodeUrl: 'https://leetcode.com/problems/network-delay-time/', solved: false },
  { id: '77', number: 787, title: 'Cheapest Flights Within K Stops', difficulty: 'Medium', topics: ['Graphs', 'Dijkstra'], leetcodeUrl: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/', solved: false },
  { id: '78', number: 1462, title: 'Course Schedule IV', difficulty: 'Medium', topics: ['Graphs'], leetcodeUrl: 'https://leetcode.com/problems/course-schedule-iv/', solved: false },
  { id: '79', number: 1334, title: 'Find the City With the Smallest Number of Neighbors at a Threshold Distance', difficulty: 'Medium', topics: ['Graphs', 'Floyd-Warshall'], leetcodeUrl: 'https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/', solved: false },
  { id: '80', number: 1091, title: 'Shortest Path in Binary Matrix', difficulty: 'Medium', topics: ['Graphs', 'BFS'], leetcodeUrl: 'https://leetcode.com/problems/shortest-path-in-binary-matrix/', solved: false },
  { id: '81', number: 1584, title: 'Min Cost to Connect All Points', difficulty: 'Medium', topics: ['Graphs', 'MST'], leetcodeUrl: 'https://leetcode.com/problems/min-cost-to-connect-all-points/', solved: false },
  { id: '82', number: 208, title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium', topics: ['Tries'], leetcodeUrl: 'https://leetcode.com/problems/implement-trie-prefix-tree/', solved: false },
  { id: '83', number: 79, title: 'Word Search', difficulty: 'Medium', topics: ['Tries', 'Backtracking'], leetcodeUrl: 'https://leetcode.com/problems/word-search/', solved: false },
  { id: '84', number: 212, title: 'Word Search II', difficulty: 'Hard', topics: ['Tries', 'Backtracking'], leetcodeUrl: 'https://leetcode.com/problems/word-search-ii/', solved: false },
  { id: '85', number: 63, title: 'Unique Paths II', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/unique-paths-ii/', solved: false },
  { id: '86', number: 198, title: 'House Robber', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/house-robber/', solved: false },
  { id: '87', number: 213, title: 'House Robber II', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/house-robber-ii/', solved: false },
  { id: '88', number: 64, title: 'Minimum Path Sum', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/minimum-path-sum/', solved: false },
  { id: '89', number: 322, title: 'Coin Change', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/coin-change/', solved: false },
  { id: '90', number: 121, title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', solved: false },
  { id: '91', number: 122, title: 'Best Time to Buy and Sell Stock II', difficulty: 'Medium', topics: ['Dynamic Programming', 'Greedy'], leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/', solved: false },
  { id: '92', number: 123, title: 'Best Time to Buy and Sell Stock III', difficulty: 'Hard', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/', solved: false },
  { id: '93', number: 188, title: 'Best Time to Buy and Sell Stock IV', difficulty: 'Hard', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/', solved: false },
  { id: '94', number: 91, title: 'Decode Ways', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/decode-ways/', solved: false },
  { id: '95', number: 55, title: 'Jump Game', difficulty: 'Medium', topics: ['Dynamic Programming', 'Greedy'], leetcodeUrl: 'https://leetcode.com/problems/jump-game/', solved: false },
  { id: '96', number: 1143, title: 'Longest Common Subsequence', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/longest-common-subsequence/', solved: false },
  { id: '97', number: 516, title: 'Longest Palindromic Subsequence', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/longest-palindromic-subsequence/', solved: false },
  { id: '98', number: 5, title: 'Longest Palindromic Substring', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/longest-palindromic-substring/', solved: false },
  { id: '99', number: 560, title: 'Subarray Sum Equals K', difficulty: 'Medium', topics: ['Array', 'Hash Map'], leetcodeUrl: 'https://leetcode.com/problems/subarray-sum-equals-k/', solved: false },
  { id: '100', number: 860, title: 'Lemonade Change', difficulty: 'Easy', topics: ['Greedy'], leetcodeUrl: 'https://leetcode.com/problems/lemonade-change/', solved: false },
  { id: '101', number: 33, title: 'Search in Rotated Sorted Array', difficulty: 'Medium', topics: ['Binary Search'], leetcodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', solved: false },
  { id: '102', number: 875, title: 'Koko Eating Bananas', difficulty: 'Medium', topics: ['Binary Search'], leetcodeUrl: 'https://leetcode.com/problems/koko-eating-bananas/', solved: false },
  { id: '103', number: 69, title: 'Sqrt(x)', difficulty: 'Easy', topics: ['Binary Search'], leetcodeUrl: 'https://leetcode.com/problems/sqrtx/', solved: false },
  { id: '104', number: 1011, title: 'Capacity To Ship Packages Within D Days', difficulty: 'Medium', topics: ['Binary Search'], leetcodeUrl: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/', solved: false },
  { id: '105', number: 74, title: 'Search a 2D Matrix', difficulty: 'Medium', topics: ['Binary Search'], leetcodeUrl: 'https://leetcode.com/problems/search-a-2d-matrix/', solved: false },
  { id: '106', number: 240, title: 'Search a 2D Matrix II', difficulty: 'Medium', topics: ['Binary Search'], leetcodeUrl: 'https://leetcode.com/problems/search-a-2d-matrix-ii/', solved: false },
];

