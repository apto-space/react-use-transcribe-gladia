const fs = require("fs");
const path = require("path");

// Paths are relative to the project root
const README_PATH = path.join(__dirname, "../..", "README.md");
const DEMO_PATH = path.join(__dirname, "..", "src", "MicTest.tsx");
const PACKAGE_JSON_PATH = path.join(__dirname, "..", "package.json");

// Read files
const readmeContent = fs.readFileSync(README_PATH, "utf8");
const demoContent = fs.readFileSync(DEMO_PATH, "utf8");
const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf8"));

// Transform the demo content to use package imports
const packageName = packageJson.name;
const transformedDemoContent = demoContent
  .replace(/from "\."/g, `from "${packageName}"`)
  .replace(/from "\.\/(.*?)"/g, (match, p1) => `from "${packageName}/${p1}"`);

// Regular expression to match the example code block in README
const codeBlockRegex = /```tsx \.\/src\/MicTest\.tsx[\s\S]*?```/;

// Check if the code block exists
if (!codeBlockRegex.test(readmeContent)) {
  console.error("❌ Error: Could not find the code block in README.md");
  console.error(
    "Expected to find a code block starting with: ```tsx ./src/MicTest.tsx"
  );
  process.exit(1);
}

// Create the new code block with the transformed Demo.tsx content
const newCodeBlock =
  "```tsx ./src/MicTest.tsx\n" + transformedDemoContent + "\n```";

// Replace the old code block with the new one
const updatedReadme = readmeContent.replace(codeBlockRegex, newCodeBlock);

// Write the updated content back to README.md
fs.writeFileSync(README_PATH, updatedReadme, "utf8");

console.log(
  "✅ Successfully updated README.md with current Demo.tsx content using package imports"
);
