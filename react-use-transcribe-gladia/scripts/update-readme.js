const fs = require("fs");
const path = require("path");

// Paths are relative to the project root
const README_PATH = path.join(__dirname, "..", "README.md");
const DEMO_PATH = path.join(__dirname, "..", "src", "Demo.tsx");

// Read both files
const readmeContent = fs.readFileSync(README_PATH, "utf8");
const demoContent = fs.readFileSync(DEMO_PATH, "utf8");

// Regular expression to match the example code block in README
const codeBlockRegex = /```tsx \.\/src\/Demo\.tsx[\s\S]*?```/;

// Create the new code block with the current Demo.tsx content
const newCodeBlock = "```tsx ./src/Demo.tsx\n" + demoContent + "\n```";

// Replace the old code block with the new one
const updatedReadme = readmeContent.replace(codeBlockRegex, newCodeBlock);

// Write the updated content back to README.md
fs.writeFileSync(README_PATH, updatedReadme, "utf8");

console.log("✅ Successfully updated README.md with current Demo.tsx content");
