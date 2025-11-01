import { RoadmapQuestion } from '@/stores/appStore';

const getDifficulty = (title: string): 'Easy' | 'Medium' | 'Hard' => {
  const easy = ['Two Sum', 'Remove Duplicates from Sorted Array', 'Move Zeroes', 'Missing Number', 'Sort Colors', 'Majority Element', 'Reverse Linked List', 'Merge Two Sorted Lists', 'Linked List Cycle', 'Remove Duplicates from Sorted List', 'Climbing Stairs', 'Invert Binary Tree', 'Maximum Depth of Binary Tree', 'Same Tree', 'Flood Fill', 'Best Time to Buy and Sell Stock', 'Search a 2D Matrix', 'Sqrt(x)', 'Lemonade Change', 'FIB DP intro'];
  const hard = ['Trapping Rain Water', 'Sliding Window Maximum', 'Minimum Window Substring', 'Largest Rectangle in Histogram', 'Expression Add Operators', 'LFU Cache', 'Sudoku Solver', 'N-Queens', 'N-Queens II', 'Serialize and Deserialize Binary Tree', 'Word Search II', 'Best Time to Buy and Sell Stock III', 'Best Time to Buy and Sell Stock IV', 'Longest Increasing Path in a Matrix', 'Cat and Mouse', 'Min Cost to Connect All Points', 'Rabin Karp', 'KMP search'];
  if (easy.some(p => title.includes(p))) return 'Easy';
  if (hard.some(p => title.includes(p))) return 'Hard';
  return 'Medium';
};

export const initialRoadmapQuestions: RoadmapQuestion[] = [
  // Array problems (lines 2-34)
  { id: '1', number: 1, title: 'Two Sum', difficulty: 'Easy', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/two-sum/', solved: false },
  { id: '2', number: 167, title: 'Two Sum II - Input Array Is Sorted', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', solved: false },
  { id: '3', number: 26, title: 'Remove Duplicates from Sorted Array', difficulty: 'Easy', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/', solved: false },
  { id: '4', number: 238, title: 'Product of Array Except Self', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/', solved: false },
  { id: '5', number: 11, title: 'Container With Most Water', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/container-with-most-water/', solved: false },
  { id: '6', number: 42, title: 'Trapping Rain Water', difficulty: 'Hard', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/trapping-rain-water/', solved: false },
  { id: '7', number: 189, title: 'Rotate Array', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/rotate-array/', solved: false },
  { id: '8', number: 283, title: 'Move Zeroes', difficulty: 'Easy', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/move-zeroes/', solved: false },
  { id: '9', number: 49, title: 'Group Anagrams', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/group-anagrams/', solved: false },
  { id: '10', number: 268, title: 'Missing Number', difficulty: 'Easy', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/missing-number/', solved: false },
  { id: '11', number: 347, title: 'Top K Frequent Elements', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/', solved: false },
  { id: '12', number: 75, title: 'Sort Colors', difficulty: 'Easy', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/sort-colors/', solved: false },
  { id: '13', number: 54, title: 'Spiral Matrix', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/spiral-matrix/', solved: false },
  { id: '14', number: 169, title: 'Majority Element', difficulty: 'Easy', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/majority-element/', solved: false },
  { id: '15', number: 229, title: 'Majority Element II', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/majority-element-ii/', solved: false },
  { id: '16', number: 128, title: 'Longest Consecutive Sequence', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/longest-consecutive-sequence/', solved: false },
  { id: '17', number: 14, title: 'Longest Common Prefix', difficulty: 'Easy', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/longest-common-prefix/', solved: false },
  { id: '18', number: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', solved: false },
  { id: '19', number: 53, title: 'Maximum Subarray', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/maximum-subarray/', solved: false },
  { id: '20', number: 151, title: 'Reverse Words in a String', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/reverse-words-in-a-string/', solved: false },
  { id: '21', number: 443, title: 'String Compression', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/string-compression/', solved: false },
  { id: '22', number: 392, title: 'Is Subsequence', difficulty: 'Easy', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/is-subsequence/', solved: false },
  { id: '23', number: 1679, title: 'Max Number of K-Sum Pairs', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/max-number-of-k-sum-pairs/', solved: false },
  { id: '24', number: 15, title: '3Sum', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/3sum/', solved: false },
  { id: '25', number: 567, title: 'Permutation in String', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/permutation-in-string/', solved: false },
  { id: '26', number: 155, title: 'Min Stack', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/min-stack/', solved: false },
  { id: '27', number: 239, title: 'Sliding Window Maximum', difficulty: 'Hard', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/sliding-window-maximum/', solved: false },
  { id: '28', number: 76, title: 'Minimum Window Substring', difficulty: 'Hard', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/minimum-window-substring/', solved: false },
  { id: '29', number: 739, title: 'Daily Temperatures', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/daily-temperatures/', solved: false },
  { id: '30', number: 853, title: 'Car Fleet', difficulty: 'Medium', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/car-fleet/', solved: false },
  { id: '31', number: 84, title: 'Largest Rectangle in Histogram', difficulty: 'Hard', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', solved: false },
  { id: '32', number: 282, title: 'Expression Add Operators', difficulty: 'Hard', topics: ['Array'], leetcodeUrl: 'https://leetcode.com/problems/expression-add-operators/', solved: false },
  
  // Linked List (lines 35-47)
  { id: '33', number: 0, title: 'Implementation', difficulty: 'Medium', topics: ['Linked List'], solved: false },
  { id: '34', number: 0, title: 'Doubly Linked List', difficulty: 'Medium', topics: ['Linked List'], solved: false },
  { id: '35', number: 206, title: 'Reverse Linked List', difficulty: 'Easy', topics: ['Linked List'], leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/', solved: false },
  { id: '36', number: 21, title: 'Merge Two Sorted Lists', difficulty: 'Easy', topics: ['Linked List'], leetcodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/', solved: false },
  { id: '37', number: 143, title: 'Reorder List', difficulty: 'Medium', topics: ['Linked List'], leetcodeUrl: 'https://leetcode.com/problems/reorder-list/', solved: false },
  { id: '38', number: 141, title: 'Linked List Cycle', difficulty: 'Easy', topics: ['Linked List'], leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle/', solved: false },
  { id: '39', number: 142, title: 'Linked List Cycle II', difficulty: 'Medium', topics: ['Linked List'], leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle-ii/', solved: false },
  { id: '40', number: 287, title: 'Find the Duplicate Number', difficulty: 'Medium', topics: ['Linked List'], leetcodeUrl: 'https://leetcode.com/problems/find-the-duplicate-number/', solved: false },
  { id: '41', number: 146, title: 'LRU Cache', difficulty: 'Medium', topics: ['Linked List'], leetcodeUrl: 'https://leetcode.com/problems/lru-cache/', solved: false },
  { id: '42', number: 83, title: 'Remove Duplicates from Sorted List', difficulty: 'Easy', topics: ['Linked List'], leetcodeUrl: 'https://leetcode.com/problems/remove-duplicates-from-sorted-list/', solved: false },
  { id: '43', number: 160, title: 'Intersection of Two Linked Lists', difficulty: 'Easy', topics: ['Linked List'], leetcodeUrl: 'https://leetcode.com/problems/intersection-of-two-linked-lists/', solved: false },
  { id: '44', number: 460, title: 'LFU Cache', difficulty: 'Hard', topics: ['Linked List'], leetcodeUrl: 'https://leetcode.com/problems/lfu-cache/', solved: false },
  { id: '45', number: 1472, title: 'Design Browser History', difficulty: 'Medium', topics: ['Linked List'], leetcodeUrl: 'https://leetcode.com/problems/design-browser-history/', solved: false },
  
  // Sorting (line 48)
  { id: '46', number: 0, title: 'All Sorting Algorithms', difficulty: 'Medium', topics: ['Sorting'], solved: false },
  
  // Recursion (lines 49-64)
  { id: '47', number: 78, title: 'Subsets', difficulty: 'Medium', topics: ['Recursion'], leetcodeUrl: 'https://leetcode.com/problems/subsets/', solved: false },
  { id: '48', number: 0, title: 'Subsets Sum No Duplicate Bags in Trolly', difficulty: 'Medium', topics: ['Recursion'], solved: false },
  { id: '49', number: 494, title: 'Target Sum', difficulty: 'Medium', topics: ['Recursion'], leetcodeUrl: 'https://leetcode.com/problems/target-sum/', solved: false },
  { id: '50', number: 0, title: 'Target Sum Only one answer Possible', difficulty: 'Medium', topics: ['Recursion'], solved: false },
  { id: '51', number: 39, title: 'Combination Sum - Infinite selection', difficulty: 'Medium', topics: ['Recursion'], leetcodeUrl: 'https://leetcode.com/problems/combination-sum/', solved: false },
  { id: '52', number: 0, title: 'Subset Sum with Infinite Selection and Only one answer', difficulty: 'Medium', topics: ['Recursion'], solved: false },
  { id: '53', number: 51, title: 'N-Queens', difficulty: 'Hard', topics: ['Recursion'], leetcodeUrl: 'https://leetcode.com/problems/n-queens/', solved: false },
  { id: '54', number: 52, title: 'N-Queens II', difficulty: 'Hard', topics: ['Recursion'], leetcodeUrl: 'https://leetcode.com/problems/n-queens-ii/', solved: false },
  { id: '55', number: 37, title: 'Sudoku Solver', difficulty: 'Hard', topics: ['Recursion'], leetcodeUrl: 'https://leetcode.com/problems/sudoku-solver/', solved: false },
  { id: '56', number: 70, title: 'Climbing Stairs', difficulty: 'Easy', topics: ['Recursion'], leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/', solved: false },
  { id: '57', number: 62, title: 'Unique Paths', difficulty: 'Medium', topics: ['Recursion'], leetcodeUrl: 'https://leetcode.com/problems/unique-paths/', solved: false },
  { id: '58', number: 22, title: 'Generate Parentheses', difficulty: 'Medium', topics: ['Recursion'], leetcodeUrl: 'https://leetcode.com/problems/generate-parentheses/', solved: false },
  { id: '59', number: 60, title: 'Permutation Sequence', difficulty: 'Hard', topics: ['Recursion'], leetcodeUrl: 'https://leetcode.com/problems/permutation-sequence/', solved: false },
  
  // Trees (lines 65-80)
  { id: '60', number: 0, title: 'BST IMP(DFS,BFS, Remove, Add)', difficulty: 'Medium', topics: ['Trees'], solved: false },
  { id: '61', number: 102, title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', solved: false },
  { id: '62', number: 144, title: 'Binary Tree Preorder Traversal', difficulty: 'Easy', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/binary-tree-preorder-traversal/', solved: false },
  { id: '63', number: 450, title: 'Delete Node in a BST', difficulty: 'Medium', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/delete-node-in-a-bst/', solved: false },
  { id: '64', number: 226, title: 'Invert Binary Tree', difficulty: 'Easy', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/invert-binary-tree/', solved: false },
  { id: '65', number: 104, title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', solved: false },
  { id: '66', number: 543, title: 'Diameter of Binary Tree', difficulty: 'Easy', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/diameter-of-binary-tree/', solved: false },
  { id: '67', number: 100, title: 'Same Tree', difficulty: 'Easy', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/same-tree/', solved: false },
  { id: '68', number: 572, title: 'Subtree of Another Tree', difficulty: 'Easy', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/subtree-of-another-tree/', solved: false },
  { id: '69', number: 235, title: 'Lowest Common Ancestor of a Binary Search Tree', difficulty: 'Medium', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', solved: false },
  { id: '70', number: 236, title: 'Lowest Common Ancestor of a Binary Tree', difficulty: 'Medium', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', solved: false },
  { id: '71', number: 103, title: 'Binary Tree Zigzag Level Order Traversal', difficulty: 'Medium', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/', solved: false },
  { id: '72', number: 0, title: 'Top View of BTREE', difficulty: 'Medium', topics: ['Trees'], solved: false },
  { id: '73', number: 987, title: 'Vertical Order Traversal of a Binary Tree', difficulty: 'Hard', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/', solved: false },
  { id: '74', number: 0, title: 'Full Binary Tree using Array', difficulty: 'Medium', topics: ['Trees'], solved: false },
  { id: '75', number: 297, title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', topics: ['Trees'], leetcodeUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', solved: false },
  
  // Heap (line 81)
  { id: '76', number: 0, title: 'Implementation of Heap', difficulty: 'Medium', topics: ['Heap'], solved: false },
  
  // Graphs (lines 82-106)
  { id: '77', number: 0, title: 'Graph Facebook Implementation', difficulty: 'Medium', topics: ['Graphs'], solved: false },
  { id: '78', number: 0, title: 'Graph Traversal', difficulty: 'Medium', topics: ['Graphs'], solved: false },
  { id: '79', number: 133, title: 'Clone Graph', difficulty: 'Medium', topics: ['Graphs'], leetcodeUrl: 'https://leetcode.com/problems/clone-graph/', solved: false },
  { id: '80', number: 994, title: 'Rotting Oranges', difficulty: 'Medium', topics: ['Graphs'], leetcodeUrl: 'https://leetcode.com/problems/rotting-oranges/', solved: false },
  { id: '81', number: 200, title: 'Number of Islands', difficulty: 'Medium', topics: ['Graphs'], leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/', solved: false },
  { id: '82', number: 733, title: 'Flood Fill', difficulty: 'Easy', topics: ['Graphs'], leetcodeUrl: 'https://leetcode.com/problems/flood-fill/', solved: false },
  { id: '83', number: 0, title: 'Number of Lakes', difficulty: 'Medium', topics: ['Graphs'], solved: false },
  { id: '84', number: 207, title: 'Course Schedule', difficulty: 'Medium', topics: ['Graphs'], leetcodeUrl: 'https://leetcode.com/problems/course-schedule/', solved: false },
  { id: '85', number: 210, title: 'Course Schedule II', difficulty: 'Medium', topics: ['Graphs'], leetcodeUrl: 'https://leetcode.com/problems/course-schedule-ii/', solved: false },
  { id: '86', number: 329, title: 'Longest Increasing Path in a Matrix', difficulty: 'Hard', topics: ['Graphs'], leetcodeUrl: 'https://leetcode.com/problems/longest-increasing-path-in-a-matrix/', solved: false },
  { id: '87', number: 913, title: 'Cat and Mouse', difficulty: 'Hard', topics: ['Graphs'], leetcodeUrl: 'https://leetcode.com/problems/cat-and-mouse/', solved: false },
  { id: '88', number: 0, title: 'Djikstras Imp', difficulty: 'Hard', topics: ['Graphs'], solved: false },
  { id: '89', number: 743, title: 'Network Delay Time', difficulty: 'Medium', topics: ['Graphs'], leetcodeUrl: 'https://leetcode.com/problems/network-delay-time/', solved: false },
  { id: '90', number: 0, title: 'Bellman Impl', difficulty: 'Hard', topics: ['Graphs'], solved: false },
  { id: '91', number: 787, title: 'Cheapest Flights Within K Stops', difficulty: 'Medium', topics: ['Graphs'], leetcodeUrl: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/', solved: false },
  { id: '92', number: 0, title: 'Topological Sort BFS ( Kahn\'s)', difficulty: 'Medium', topics: ['Graphs'], solved: false },
  { id: '93', number: 0, title: 'Detect Cycle Directed BFS', difficulty: 'Medium', topics: ['Graphs'], solved: false },
  { id: '94', number: 0, title: 'Topological Sort DFS', difficulty: 'Medium', topics: ['Graphs'], solved: false },
  { id: '95', number: 1462, title: 'Course Schedule IV', difficulty: 'Medium', topics: ['Graphs'], leetcodeUrl: 'https://leetcode.com/problems/course-schedule-iv/', solved: false },
  { id: '96', number: 0, title: 'Floyd Warshall', difficulty: 'Hard', topics: ['Graphs'], solved: false },
  { id: '97', number: 1334, title: 'Find the City With the Smallest Number of Neighbors at a Threshold Distance - Floyd Warshall Algorithm', difficulty: 'Medium', topics: ['Graphs'], leetcodeUrl: 'https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/', solved: false },
  { id: '98', number: 0, title: 'Prims ( Minimum Spanning Tree)', difficulty: 'Hard', topics: ['Graphs'], solved: false },
  { id: '99', number: 1584, title: 'Min Cost to Connect All Points', difficulty: 'Medium', topics: ['Graphs'], leetcodeUrl: 'https://leetcode.com/problems/min-cost-to-connect-all-points/', solved: false },
  { id: '100', number: 1091, title: 'Shortest Path in Binary Matrix', difficulty: 'Medium', topics: ['Graphs'], leetcodeUrl: 'https://leetcode.com/problems/shortest-path-in-binary-matrix/', solved: false },
  { id: '101', number: 0, title: 'Kruskals MST', difficulty: 'Hard', topics: ['Graphs'], solved: false },
  
  // Tries (lines 107-110)
  { id: '102', number: 208, title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium', topics: ['Tries'], leetcodeUrl: 'https://leetcode.com/problems/implement-trie-prefix-tree/', solved: false },
  { id: '103', number: 0, title: 'Search Suggestion', difficulty: 'Medium', topics: ['Tries'], solved: false },
  { id: '104', number: 79, title: 'Word Search', difficulty: 'Medium', topics: ['Tries'], leetcodeUrl: 'https://leetcode.com/problems/word-search/', solved: false },
  { id: '105', number: 212, title: 'Word Search II', difficulty: 'Hard', topics: ['Tries'], leetcodeUrl: 'https://leetcode.com/problems/word-search-ii/', solved: false },
  
  // Dynamic Programming (lines 111-138)
  { id: '106', number: 0, title: 'FIB', difficulty: 'Easy', topics: ['Dynamic Programming'], solved: false },
  { id: '107', number: 70, title: 'Climbing Stairs', difficulty: 'Easy', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/', solved: false },
  { id: '108', number: 62, title: 'Unique Paths', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/unique-paths/', solved: false },
  { id: '109', number: 63, title: 'Unique Paths II', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/unique-paths-ii/', solved: false },
  { id: '110', number: 0, title: 'Target Sum Count', difficulty: 'Medium', topics: ['Dynamic Programming'], solved: false },
  { id: '111', number: 494, title: 'Target Sum Trolly', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/target-sum/', solved: false },
  { id: '112', number: 0, title: 'Target Sum Possible Boolean based (unlimited supply)', difficulty: 'Medium', topics: ['Dynamic Programming'], solved: false },
  { id: '113', number: 0, title: 'Get one combination which adds to target (unlimited supply)', difficulty: 'Medium', topics: ['Dynamic Programming'], solved: false },
  { id: '114', number: 0, title: 'Get one combination which adds to target memo (unlimited supply)', difficulty: 'Medium', topics: ['Dynamic Programming'], solved: false },
  { id: '115', number: 0, title: 'Get one combination which adds to target memo (limited supply)', difficulty: 'Medium', topics: ['Dynamic Programming'], solved: false },
  { id: '116', number: 198, title: 'House Robber', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/house-robber/', solved: false },
  { id: '117', number: 213, title: 'House Robber II', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/house-robber-ii/', solved: false },
  { id: '118', number: 64, title: 'Minimum Path Sum', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/minimum-path-sum/', solved: false },
  { id: '119', number: 0, title: 'KnapSack01', difficulty: 'Medium', topics: ['Dynamic Programming'], solved: false },
  { id: '120', number: 322, title: 'Coin Change', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/coin-change/', solved: false },
  { id: '121', number: 121, title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', solved: false },
  { id: '122', number: 122, title: 'Best Time to Buy and Sell Stock II', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/', solved: false },
  { id: '123', number: 123, title: 'Best Time to Buy and Sell Stock III', difficulty: 'Hard', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/', solved: false },
  { id: '124', number: 188, title: 'Best Time to Buy and Sell Stock IV', difficulty: 'Hard', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/', solved: false },
  { id: '125', number: 91, title: 'Decode Ways', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/decode-ways/', solved: false },
  { id: '126', number: 55, title: 'Jump Game', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/jump-game/', solved: false },
  { id: '127', number: 1143, title: 'Longest Common Subsequence', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/longest-common-subsequence/', solved: false },
  { id: '128', number: 516, title: 'Longest Palindromic Subsequence', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/longest-palindromic-subsequence/', solved: false },
  { id: '129', number: 5, title: 'Longest Palindromic Substring', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/longest-palindromic-substring/', solved: false },
  { id: '130', number: 0, title: 'All subsequences Pattern(Sub problems approcah)', difficulty: 'Medium', topics: ['Dynamic Programming'], solved: false },
  { id: '131', number: 560, title: 'Subarray Sum Equals K', difficulty: 'Medium', topics: ['Dynamic Programming'], leetcodeUrl: 'https://leetcode.com/problems/subarray-sum-equals-k/', solved: false },
  { id: '132', number: 0, title: 'DP On strings', difficulty: 'Medium', topics: ['Dynamic Programming'], solved: false },
  
  // Greedy (lines 139-140)
  { id: '133', number: 0, title: 'KnapSack Fractional', difficulty: 'Medium', topics: ['Greedy'], solved: false },
  { id: '134', number: 860, title: 'Lemonade Change', difficulty: 'Easy', topics: ['Greedy'], leetcodeUrl: 'https://leetcode.com/problems/lemonade-change/', solved: false },
  { id: '135', number: 0, title: 'N Meeting room', difficulty: 'Medium', topics: ['Greedy'], leetcodeUrl: 'https://leetcode.com/problems/meeting-rooms-ii/', solved: false },
  
  // Binary Search (lines 141-147)
  { id: '136', number: 34, title: 'Search Range', difficulty: 'Medium', topics: ['Binary Search'], leetcodeUrl: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/', solved: false },
  { id: '137', number: 33, title: 'Search in Rotated Sorted Array', difficulty: 'Medium', topics: ['Binary Search'], leetcodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', solved: false },
  { id: '138', number: 875, title: 'Koko Eating Bananas', difficulty: 'Medium', topics: ['Binary Search'], leetcodeUrl: 'https://leetcode.com/problems/koko-eating-bananas/', solved: false },
  { id: '139', number: 69, title: 'Sqrt(x)', difficulty: 'Easy', topics: ['Binary Search'], leetcodeUrl: 'https://leetcode.com/problems/sqrtx/', solved: false },
  { id: '140', number: 1011, title: 'Capacity To Ship Packages Within D Days', difficulty: 'Medium', topics: ['Binary Search'], leetcodeUrl: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/', solved: false },
  { id: '141', number: 74, title: 'Search a 2D Matrix', difficulty: 'Medium', topics: ['Binary Search'], leetcodeUrl: 'https://leetcode.com/problems/search-a-2d-matrix/', solved: false },
  { id: '142', number: 240, title: 'Search a 2D Matrix II', difficulty: 'Medium', topics: ['Binary Search'], leetcodeUrl: 'https://leetcode.com/problems/search-a-2d-matrix-ii/', solved: false },
  
  // String (lines 150-151)
  { id: '143', number: 0, title: 'Rabin Karp', difficulty: 'Hard', topics: ['String'], solved: false },
  { id: '144', number: 0, title: 'KMP search', difficulty: 'Hard', topics: ['String'], solved: false },
  
  // Bit Manipulation (line 153)
  { id: '145', number: 0, title: 'Power Set', difficulty: 'Medium', topics: ['Bit Manipulation'], solved: false },
];

