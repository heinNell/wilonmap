# Wialon TypeScript Client

A robust, type-safe TypeScript client for the Wialon API with built-in retry logic, error handling, and Zod validation.

## Features

- 🔒 **Safe Environment Handling** - No tokens hard-coded
- 🔄 **Retry Logic** - Exponential backoff with jitter for 5xx/429/network errors
- 🛡️ **Type Safety** - Strong runtime validation via Zod
- 🐛 **Better Errors** - Structured errors with status codes and response bodies
- 🚀 **Next.js Ready** - Works in Node.js 18+ and Next.js environments

## Installation

```bash
npm install zod
# Copy the wialon-client.ts file to your project

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build output
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log
Your updated project directory structure looks well-organized and ready for development with the Wialon TypeScript client. Here’s a breakdown of the key components and some suggestions for next steps:

### Project Directory Breakdown

```
wialon-dashboard/
├── README.md                # Project documentation
├── eslint.config.mjs       # ESLint configuration file
├── next-env.d.ts           # Type definitions for Next.js
├── next.config.ts          # Next.js configuration file
├── node_modules/           # Installed dependencies
│   ├── ...                  # Various packages including React, TypeScript, etc.
├── package.json             # Project metadata and dependencies
├── pnpm-lock.yaml           # Lockfile for pnpm package manager
├── public/                  # Static assets (images, SVGs, etc.)
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/                     # Source code
│   ├── app/                 # Next.js application files
│   │   ├── api/             # API routes
│   │   │   └── wialon/
│   │   │       └── route.ts # API route implementation
│   │   ├── favicon.ico       # Favicon for the application
│   │   ├── globals.css       # Global CSS styles
│   │   ├── layout.tsx        # Main layout component
│   │   ├── lib/              # Library files
│   │   │   └── wialon-client.ts # Wialon client implementation
│   │   ├── page.module.css    # CSS module for the main page
│   │   └── page.tsx           # Main page component
│   ├── examples/             # Example usage files
│   │   └── basic-usage.ts    # Example of using the Wialon client
│   └── lib/                  # Duplicate of the lib directory (consider removing)
│       └── wialon-client.ts   # Wialon client implementation (duplicate)
├── tsconfig.json            # TypeScript configuration
└── wialon.sh                # Shell script (if applicable)
```

### Suggestions for Next Steps

1. **Remove Duplicate Directory**:
   - It appears you have two `lib` directories under `src`. You should remove one to avoid confusion. The correct structure should have only one `lib` directory containing `wialon-client.ts`.

2. **Update `README.md`**:
   - Ensure your `README.md` contains instructions on how to set up, run, and use your project. Include any prerequisites, such as setting up environment variables.

3. **Environment Variables**:
   - If your project requires any API tokens or secrets, make sure to use a `.env` file and load it using a library like `dotenv`. Add instructions in your `README.md` on how to set this up.

4. **Run Your Project**:
   - If you haven't already, test running your project. You can use the following commands:
     ```bash
     npm run dev  # For development mode
     npm run build  # To build the project
     npm start  # To start the production server
     ```

5. **Testing**:
   - Consider adding tests for your Wialon client methods. You can use libraries like Jest or Mocha for unit testing.

6. **Linting and Formatting**:
   - Make sure to run ESLint to check for code quality and consistency:
     ```bash
     npm run lint
     ```

7. **Explore Further Functionality**:
   - Depending on your needs, you might want to implement additional features in your Wialon client or expand your example usage.

### Example `README.md` Template

Here’s a simple template you can use for your `README.md`:

```markdown
# Wialon Dashboard

## Overview

This project implements a TypeScript client for the Wialon API, allowing users to interact with Wialon services.

## Prerequisites

- Node.js (version x.x.x)
- npm or pnpm

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/wialon-dashboard.git
   cd wialon-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory and add your Wialon API token:
     ```
     WIALON_TOKEN=your_wialon_token_here
     ```

## Usage

To run the development server:
```bash
npm run dev
```

To build the project:
```bash
npm run build
```

To run the example usage:
```bash
npm run example
```

## License

This project is licensed under the MIT License.
```

### Conclusion

With your project structure in place and these next steps outlined, you should be well on your way to developing and expanding your Wialon client. If you have any specific questions or need further assistance, feel free to ask!