# Screenflow

Screenflow is a powerful web application that captures, analyzes, and optimizes your digital activity built entirely on top of Screenpipe. It provides valuable insights into your productivity patterns, context switching, focus periods, and can automatically identify job postings during your browsing sessions. 

<img width="1440" alt="image" src="https://github.com/user-attachments/assets/dae4dbc8-43ee-4afb-bace-1c226c1a0d6e" />
<img width="1440" alt="image" src="https://github.com/user-attachments/assets/03180ebb-a82f-4bcd-a0f9-d360cd78c6fe" />
<img width="1440" alt="image" src="https://github.com/user-attachments/assets/2017c81a-835e-4a99-82bd-2af839785528" />



## Features

### 📊 Session Analysis
- **Daily Pulse Dashboard**: Visualize your productivity metrics, focus periods, and context switching patterns.
- **Context Flow**: Understand how you move between different applications and tasks throughout your day.
- **Time Distribution**: See where your digital time is being spent across applications and websites.

### 🔍 Job Intelligence
- **Automatic Job Post Detection**: Identifies job postings as you browse LinkedIn, X, YC, Wellfound, and other job sites.
- **Structured Job Data**: Extracts and organizes key details like company, location, requirements, and salary information.
- **Session Overview**: Summarizes job browsing activity with actionable insights.

### 💻 Productivity Insights
- **Focus Tracking**: Measures your sustained attention periods and identifies your most productive times.
- **Context Group Analysis**: Groups related activities to understand your workflow patterns.
- **Productivity Score**: Quantifies your productive time with detailed breakdowns.

## How It Works

Screenflow operates through a three-step process:

1. **Capture**: Records your screen activity during browsing sessions using Screenpipe.
2. **Analyze**: Processes the captured Screenpipe data using AI to extract insights, detect patterns, and identify job postings.
3. **Present**: Displays the analyzed data through intuitive visualizations and dashboards.

## Architecture

Screenflow is built on a modern & highly popular tech stack:

- **Frontend**: Next.js with React, TanStack Query for data fetching, and shadcn/ui components.
- **Styling**: Tailwind CSS with a midnight theme for elegant dark mode support.
- **Database**: SQLite with Drizzle ORM for efficient data storage and retrieval.
- **AI Processing**: Integrates with Claude API and DeepSeek API for advanced content analysis.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- API keys for Claude and DeepSeek (for AI processing capabilities)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Lokendra-sinh/screenflow.git
cd screenpipe
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
ANTHROPIC_API_KEY=your_claude_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```


4. Start the development server:
```bash
bun dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

### Starting a Session

1. Navigate to the "Record" tab
2. Click the "Start Screenpipe" button to begin capturing your activity
3. Browse normally - Screenpipe works in the background to record your session
4. When finished, click "Stop Screenpipe" to end the session

### Analyzing Sessions

1. Go to the "Sessions" tab to see all your recorded sessions
2. Click on a session to view detailed analytics including:
   - Daily Pulse dashboard with productivity metrics
   - Context Flow visualization
   - Time Distribution charts
   - Job Intelligence (if job postings were detected)

### AI Search (Coming Soon)

Natural language querying of your session data will be available in a future update.
So you'll be able to search "Give me list of all the yc startups having cracked founder" or "Find me all the jobs in SF"

## Project Structure

```
screenpipe/
├── app/               # Next.js app directory
│   ├── api/           # API routes
│   ├── sessions/      # Session pages
│   └── ...
├── components/        # React components
│   ├── ui/            # Shadcn UI components
│   ├── context-flow/  # Context visualization
│   └── ...
├── db/                # Database configuration and models
│   ├── schema.ts      # Drizzle schema definitions
│   └── index.ts       # Database connection setup
├── lib/               # Utility functions
├── providers/         # React context providers
├── public/            # Static assets
├── styles/            # Global styles
└── types/             # TypeScript type definitions
```


### Code Style

This project uses ESLint and Prettier for code formatting. Run the linter before committing:

```bash
bun lint
```


## Acknowledgements

- [Screenpipe](https://screenpi.pe/)
- [screenpipe docs](https://docs.screenpi.pe/)
- [Nosu hackathons](https://www.sprint.dev/hackathons)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Anthropic Claude API](https://www.anthropic.com/)
- [DeepSeek API](https://deepseek.com/)
