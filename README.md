# CSE Smart Knowledge Base

AI-powered knowledge base for Customer Success Engineers (CSE) that converts GitHub Issues into searchable solutions with semantic search.

## Features

- **AI-Powered Analysis**: Automatically analyzes GitHub issues using OpenAI to extract summary, root cause, and solution
- **Semantic Search**: Vector-based search to find relevant solutions based on context, not just keyword matching
- **Auto Sync**: Automated daily cron job to synchronize latest closed issues
- **Modern UI**: React 19 with Tailwind CSS for responsive and intuitive UX

## Tech Stack

- **Frontend**: React 19, Rsbuild, Tailwind CSS, Motion (animations), Wouter (routing)
- **Backend**: Convex (BaaS), OpenAI API
- **Language**: TypeScript (strict mode)
- **Tooling**: Bun, Biome (linting/formatting)

## Setup

### Prerequisites

- Bun installed
- Convex account
- OpenAI API key
- GitHub Personal Access Token

### Installation

1. **Install dependencies**:

   ```bash
   bun install
   ```

2. **Setup Convex**:

   ```bash
   bun convex dev
   ```

   Follow the prompts to create/link your Convex project.

3. **Configure Environment Variables**:

   In **Convex Dashboard** → Settings → Environment Variables, add:

   ```
   GITHUB_TOKEN=your_github_pat_token
   LLM_API_KEY=your_openai_api_key
   LLM_API_URL=https://api.openai.com/v1
   LLM_MODEL_TEXT=gpt-4o-mini
   ```

4. **Initial Sync** (Manual):

   In Convex Dashboard, run the `actions/manualSync` action:

   ```json
   {
     "perPage": 10
   }
   ```

5. **Start Development Server**:

   ```bash
   bun run dev
   ```

   App will be available at `http://localhost:3000`

## Project Structure

```
cse-smart-knowledge-base/
├── convex/
│   ├── actions/
│   │   ├── githubFetcher.ts    # Fetch issues from GitHub
│   │   ├── aiAnalyzer.ts       # AI analysis with OpenAI
│   │   ├── syncIssues.ts       # Orchestrate sync process
│   │   └── manualSync.ts       # Manual trigger for testing
│   ├── queries/
│   │   ├── searchIssues.ts     # Semantic search action
│   │   ├── vectorSearch.ts     # Cosine similarity search
│   │   └── getIssues.ts        # Get all issues & stats
│   ├── mutations/
│   │   └── saveIssue.ts        # Save analyzed issue
│   ├── lib/
│   │   └── openai.ts           # OpenAI client utilities
│   ├── schema.ts               # Database schema
│   └── crons.ts                # Scheduled jobs
├── src/
│   ├── app/
│   ├── features/
│   │   └── search/
│   │       ├── components/     # SearchBar, IssueCard, Modal
│   │       └── hooks/          # useIssueSearch
│   ├── pages/
│   │   ├── landing/            # Landing page
│   │   └── search/             # Search page
│   └── shared/
└── docs/
    └── MASTERPLAN.md           # BRD & PRD
```

## Available Scripts

```bash
bun run dev              # Start dev server
bun run build            # Build for production
bun run preview          # Preview production build
bun run convex:dev       # Start Convex dev mode
bun run convex:deploy    # Deploy Convex functions
bun run typecheck        # Run TypeScript check
bun run lint             # Run Biome linter
bun run lint:typecheck   # Run both lint & typecheck
```

## How It Works

### Data Flow

1. **GitHub Issues** → Fetched via GitHub API (closed issues only)
2. **AI Analysis** → OpenAI extracts structured data (category, summary, root cause, solution)
3. **Embedding** → Text converted to vector (1536 dimensions) for semantic search
4. **Database** → Saved to Convex with vector index
5. **Search** → User query → converted to vector → cosine similarity matching → top results

### Cron Job

Runs daily at 02:00 UTC:

- Fetches 50 latest closed issues from `serpapi/public-roadmap`
- Skips already processed issues (deduplication)
- Analyzes new issues with AI
- Saves to database

## Search Usage

1. Navigate to `/search` page
2. Enter natural language query (e.g., "timeout error when scraping")
3. System converts query to vector embedding
4. Finds most similar issues using cosine similarity
5. Displays results sorted by relevance
6. Click card to see full analysis

## Database Schema

```typescript
issues: {
  githubIssueId: number;
  number: number;           // Issue #123
  title: string;
  url: string;             // GitHub URL
  state: "closed";

  // AI Analysis
  category: "Bug" | "Feature Request" | "Question" | "Other";
  summary: string;
  rootCause?: string;
  solution: string;
  confidenceScore: "High" | "Medium" | "Low";

  // Vector Search
  embedding: number[];     // 1536 dimensions
}
```

## Troubleshooting

### Typecheck Issues

```bash
bun run typecheck
```

### Convex API Not Generated

```bash
rm -rf convex/_generated
bun convex dev --once
```

### Search Returns No Results

- Ensure issues are synced (check Convex Dashboard → Data)
- Verify OpenAI API key is set
- Check browser console for errors

## License

MIT

## Author

Roki Miftah Kamaludin - Customer Success Engineer
