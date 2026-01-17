import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Problem } from './src/models/Problem.js'; // Path check kar lena

dotenv.config();

// --- 50 Popular DSA Problems List ---
const problemList = [
  // Arrays & Hashing
  { title: "Two Sum", difficulty: "Easy", topics: ["Array", "HashMap"] },
  { title: "Contains Duplicate", difficulty: "Easy", topics: ["Array", "HashMap"] },
  { title: "Valid Anagram", difficulty: "Easy", topics: ["String", "HashMap"] },
  { title: "Group Anagrams", difficulty: "Medium", topics: ["Array", "HashMap", "String"] },
  { title: "Top K Frequent Elements", difficulty: "Medium", topics: ["Array", "HashMap", "Heap"] },
  { title: "Product of Array Except Self", difficulty: "Medium", topics: ["Array"] },
  { title: "Longest Consecutive Sequence", difficulty: "Medium", topics: ["Array", "HashMap"] },
  
  // Two Pointers
  { title: "Valid Palindrome", difficulty: "Easy", topics: ["Two Pointers", "String"] },
  { title: "3Sum", difficulty: "Medium", topics: ["Two Pointers", "Array"] },
  { title: "Container With Most Water", difficulty: "Medium", topics: ["Two Pointers", "Array"] },
  
  // Sliding Window
  { title: "Best Time to Buy and Sell Stock", difficulty: "Easy", topics: ["Array", "Sliding Window"] },
  { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", topics: ["Sliding Window", "HashMap"] },
  { title: "Longest Repeating Character Replacement", difficulty: "Medium", topics: ["Sliding Window", "String"] },
  
  // Stack
  { title: "Valid Parentheses", difficulty: "Easy", topics: ["Stack"] },
  { title: "Min Stack", difficulty: "Medium", topics: ["Stack", "Design"] },
  { title: "Evaluate Reverse Polish Notation", difficulty: "Medium", topics: ["Stack"] },
  { title: "Daily Temperatures", difficulty: "Medium", topics: ["Stack"] },
  
  // Binary Search
  { title: "Binary Search", difficulty: "Easy", topics: ["Binary Search"] },
  { title: "Search a 2D Matrix", difficulty: "Medium", topics: ["Binary Search", "Matrix"] },
  { title: "Koko Eating Bananas", difficulty: "Medium", topics: ["Binary Search"] },
  { title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", topics: ["Binary Search"] },
  
  // Linked List
  { title: "Reverse Linked List", difficulty: "Easy", topics: ["Linked List"] },
  { title: "Merge Two Sorted Lists", difficulty: "Easy", topics: ["Linked List"] },
  { title: "Reorder List", difficulty: "Medium", topics: ["Linked List"] },
  { title: "Remove Nth Node From End of List", difficulty: "Medium", topics: ["Linked List"] },
  { title: "Linked List Cycle", difficulty: "Easy", topics: ["Linked List", "Two Pointers"] },
  
  // Trees
  { title: "Invert Binary Tree", difficulty: "Easy", topics: ["Tree", "DFS"] },
  { title: "Maximum Depth of Binary Tree", difficulty: "Easy", topics: ["Tree", "DFS"] },
  { title: "Same Tree", difficulty: "Easy", topics: ["Tree", "DFS"] },
  { title: "Subtree of Another Tree", difficulty: "Easy", topics: ["Tree", "DFS"] },
  { title: "Lowest Common Ancestor of a BST", difficulty: "Medium", topics: ["Tree", "BST"] },
  { title: "Binary Tree Level Order Traversal", difficulty: "Medium", topics: ["Tree", "BFS"] },
  
  // Dynamic Programming
  { title: "Climbing Stairs", difficulty: "Easy", topics: ["DP"] },
  { title: "House Robber", difficulty: "Medium", topics: ["DP"] },
  { title: "Longest Palindromic Substring", difficulty: "Medium", topics: ["DP", "String"] },
  { title: "Coin Change", difficulty: "Medium", topics: ["DP"] },
  
  // Graphs
  { title: "Number of Islands", difficulty: "Medium", topics: ["Graph", "BFS", "DFS"] },
  { title: "Clone Graph", difficulty: "Medium", topics: ["Graph", "DFS"] },
  { title: "Max Area of Island", difficulty: "Medium", topics: ["Graph", "DFS"] },
  
  // Backtracking
  { title: "Permutations", difficulty: "Medium", topics: ["Backtracking"] },
  { title: "Subsets", difficulty: "Medium", topics: ["Backtracking"] },
  { title: "Combination Sum", difficulty: "Medium", topics: ["Backtracking"] },
  
  // Advanced
  { title: "Median of Two Sorted Arrays", difficulty: "Hard", topics: ["Binary Search", "Array"] },
  { title: "Trapping Rain Water", difficulty: "Hard", topics: ["Two Pointers", "Stack"] },
  { title: "Merge k Sorted Lists", difficulty: "Hard", topics: ["Linked List", "Heap"] },
  { title: "Largest Rectangle in Histogram", difficulty: "Hard", topics: ["Stack"] },
  { title: "Word Search II", difficulty: "Hard", topics: ["Trie", "Backtracking"] }
];

// --- Helper to Generate Data ---
const generateFullProblem = (info: any) => {
  // Function name generator (e.g., "Two Sum" -> "twoSum")
  const funcName = info.title
    .toLowerCase()
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word: string, index: number) => 
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '');

  return {
    title: info.title,
    description: `### Problem Description \n\nThis is a placeholder description for **${info.title}**.\n\nGiven an input, your task is to implement the function efficiently.\n\n**Constraints:**\n* \`1 <= n <= 10^5\`\n* \`-10^9 <= val <= 10^9\``,
    difficulty: info.difficulty,
    topics: info.topics,
    
    // New Fields
    inputFormat: "The first line contains an integer N. The second line contains N space-separated integers.",
    outputFormat: "Print the answer in a single line.",
    sampleInput: "5\n1 2 3 4 5",
    sampleOutput: "15",
    
    // Language Specific Boilerplate
    starterCode: {
      python: `def ${funcName}(nums):\n    # Write your solution here\n    pass`,
      javascript: `/**\n * @param {number[]} nums\n * @return {number}\n */\nvar ${funcName} = function(nums) {\n    // Write your code here\n};`,
      cpp: `class Solution {\npublic:\n    int ${funcName}(vector<int>& nums) {\n        // Write your code here\n        return 0;\n    }\n};`,
      java: `class Solution {\n    public int ${funcName}(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n}`
    },
    
    testCases: [
      { input: "1 2 3", output: "6" },
      { input: "10 20", output: "30" }
    ],
    timeLimit: 2.0,
    memoryLimit: 256
  };
};

const seedDB = async () => {
  try {
  
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is missing in .env");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔌 MongoDB Connected...");

    await Problem.deleteMany({});
    console.log("🧹 Old problems cleared.");

    // Generate New Data
    const fullProblems = problemList.map(p => generateFullProblem(p));

 
    await Problem.insertMany(fullProblems);
    console.log(`✅ Successfully seeded ${fullProblems.length} Problems!`);

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();