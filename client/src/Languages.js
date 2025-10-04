// client/src/languages.js - ОБНОВЛЕННАЯ ВЕРСИЯ
export const SUPPORTED_LANGUAGES = {
  javascript: {
    name: "JavaScript",
    extension: ".js",
    monacoLanguage: "javascript",
    starterCode: "// Welcome to JavaScript\nconsole.log('Hello World!');\n\nfunction example() {\n  return 'This is JavaScript';\n}",
    icon: "🟨",
    category: "web"
  },
  typescript: {
    name: "TypeScript", 
    extension: ".ts",
    monacoLanguage: "typescript",
    starterCode: "// Welcome to TypeScript\nconst message: string = 'Hello World!';\nconsole.log(message);\n\ninterface Example {\n  name: string;\n  value: number;\n}",
    icon: "🔷",
    category: "web"
  },
  python: {
    name: "Python",
    extension: ".py", 
    monacoLanguage: "python",
    starterCode: "# Welcome to Python\nprint('Hello World!')\n\ndef example_function():\n    return \"This is Python\"",
    icon: "🐍",
    category: "backend"
  },
  java: {
    name: "Java",
    extension: ".java",
    monacoLanguage: "java",
    starterCode: "// Welcome to Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello World!\");\n    }\n    \n    public static String example() {\n        return \"This is Java\";\n    }\n}",
    icon: "☕",
    category: "backend"
  },
  cpp: {
    name: "C++",
    extension: ".cpp",
    monacoLanguage: "cpp", 
    starterCode: "// Welcome to C++\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello World!\" << endl;\n    return 0;\n}\n\nstring example() {\n    return \"This is C++\";\n}",
    icon: "⚡",
    category: "backend"
  },
  csharp: {
    name: "C#",
    extension: ".cs",
    monacoLanguage: "csharp",
    starterCode: "// Welcome to C#\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine(\"Hello World!\");\n    }\n    \n    static string Example() {\n        return \"This is C#\";\n    }\n}",
    icon: "🔶",
    category: "backend"
  },
  php: {
    name: "PHP",
    extension: ".php",
    monacoLanguage: "php",
    starterCode: "<?php\n// Welcome to PHP\necho 'Hello World!';\n\nfunction example() {\n    return \"This is PHP\";\n}\n?>",
    icon: "🐘",
    category: "backend"
  },
  ruby: {
    name: "Ruby", 
    extension: ".rb",
    monacoLanguage: "ruby",
    starterCode: "# Welcome to Ruby\nputs 'Hello World!'\n\ndef example\n  \"This is Ruby\"\nend",
    icon: "💎",
    category: "backend"
  },
  go: {
    name: "Go",
    extension: ".go",
    monacoLanguage: "go",
    starterCode: "// Welcome to Go\npackage main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello World!\")\n}\n\nfunc example() string {\n    return \"This is Go\"\n}",
    icon: "🔵",
    category: "backend"
  },
  rust: {
    name: "Rust",
    extension: ".rs", 
    monacoLanguage: "rust",
    starterCode: "// Welcome to Rust\nfn main() {\n    println!(\"Hello World!\");\n}\n\nfn example() -> &'static str {\n    \"This is Rust\"\n}",
    icon: "🦀",
    category: "backend"
  },
  swift: {
    name: "Swift",
    extension: ".swift",
    monacoLanguage: "swift", 
    starterCode: "// Welcome to Swift\nimport Foundation\nprint(\"Hello World!\")\n\nfunc example() -> String {\n    return \"This is Swift\"\n}",
    icon: "🐦",
    category: "mobile"
  },
  kotlin: {
    name: "Kotlin",
    extension: ".kt",
    monacoLanguage: "kotlin",
    starterCode: "// Welcome to Kotlin\nfun main() {\n    println(\"Hello World!\")\n}\n\nfun example(): String {\n    return \"This is Kotlin\"\n}",
    icon: "🔸",
    category: "mobile"
  },
  html: {
    name: "HTML",
    extension: ".html",
    monacoLanguage: "html",
    starterCode: "<!DOCTYPE html>\n<html>\n<head>\n    <title>Welcome to HTML</title>\n    <style>\n        body {\n            font-family: Arial, sans-serif;\n            margin: 40px;\n        }\n    </style>\n</head>\n<body>\n    <h1>Hello World!</h1>\n    <p>This is HTML</p>\n</body>\n</html>",
    icon: "🌐",
    category: "web"
  },
  css: {
    name: "CSS",
    extension: ".css", 
    monacoLanguage: "css",
    starterCode: "/* Welcome to CSS */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background-color: #f0f0f0;\n}\n\n.header {\n    color: #333;\n    font-size: 24px;\n}\n\n.container {\n    max-width: 1200px;\n    margin: 0 auto;\n}",
    icon: "🎨",
    category: "web"
  },
  sql: {
    name: "SQL",
    extension: ".sql",
    monacoLanguage: "sql",
    starterCode: "-- Welcome to SQL\n-- Create a simple table\nCREATE TABLE users (\n    id INT PRIMARY KEY,\n    name VARCHAR(50),\n    email VARCHAR(100)\n);\n\n-- Insert sample data\nINSERT INTO users (id, name, email) VALUES \n(1, 'John Doe', 'john@example.com'),\n(2, 'Jane Smith', 'jane@example.com');\n\n-- Query data\nSELECT * FROM users;",
    icon: "🗃️",
    category: "data"
  },
  json: {
    name: "JSON",
    extension: ".json",
    monacoLanguage: "json",
    starterCode: "{\n  \"welcome\": \"Hello World!\",\n  \"language\": \"JSON\",\n  \"features\": [\n    \"Easy to read\",\n    \"Lightweight\",\n    \"Language independent\"\n  ],\n  \"example\": {\n    \"name\": \"CodeMentor\",\n    \"version\": \"1.0\"\n  }\n}",
    icon: "📄",
    category: "data"
  },
  markdown: {
    name: "Markdown", 
    extension: ".md",
    monacoLanguage: "markdown",
    starterCode: "# Welcome to Markdown\n\nHello World!\n\n## Features\n\n- **Easy** to write\n- **Readable** format\n- Supports *emphasis*\n\n## Code Example\n\n```javascript\nconsole.log('Hello World!');\n```\n\n## Lists\n\n1. First item\n2. Second item\n3. Third item",
    icon: "📝",
    category: "markup"
  }
};

export const LANGUAGE_CATEGORIES = {
  all: "All Languages",
  web: ["javascript", "typescript", "html", "css"],
  backend: ["python", "java", "cpp", "csharp", "php", "ruby", "go", "rust"],
  mobile: ["swift", "kotlin"],
  data: ["sql", "json"],
  markup: ["markdown"]
};

export const LANGUAGE_SNIPPETS = {
  javascript: {
    "For Loop": "for (let i = 0; i < array.length; i++) {\n  // Your code here\n}",
    "Function": "function functionName(parameters) {\n  // Your code here\n  return result;\n}",
    "Arrow Function": "const functionName = (parameters) => {\n  // Your code here\n  return result;\n};",
    "Class": "class ClassName {\n  constructor(parameters) {\n    // Initialize\n  }\n  \n  methodName() {\n    // Method logic\n  }\n}"
  },
  python: {
    "For Loop": "for item in collection:\n    # Your code here",
    "Function": "def function_name(parameters):\n    # Your code here\n    return result",
    "Class": "class ClassName:\n    def __init__(self, parameters):\n        # Initialize\n        \n    def method_name(self):\n        # Method logic"
  },
  java: {
    "Main Method": "public static void main(String[] args) {\n    // Your code here\n}",
    "Class": "public class ClassName {\n    // Class variables\n    \n    public ClassName() {\n        // Constructor\n    }\n    \n    public void methodName() {\n        // Method logic\n    }\n}",
    "For Loop": "for (int i = 0; i < array.length; i++) {\n    // Your code here\n}"
  }
};

// Утилиты для работы с языками
export const getLanguageByExtension = (extension) => {
  return Object.entries(SUPPORTED_LANGUAGES).find(([key, lang]) => 
    lang.extension === extension
  )?.[0] || 'javascript';
};

export const getStarterCode = (language) => {
  return SUPPORTED_LANGUAGES[language]?.starterCode || SUPPORTED_LANGUAGES.javascript.starterCode;
};

export const getLanguageIcon = (language) => {
  return SUPPORTED_LANGUAGES[language]?.icon || '🟨';
};