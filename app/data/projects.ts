import type { Project } from '../types/project'

const github = 'https://github.com/musicteachj/'

export const projects: Project[] = [
  {
    slug: 'open-door',
    anchorId: 'opendoor',
    name: 'Open Door',
    typeLabel: 'HR help desk agent',
    oneLine:
      'HR answers cited to the handbook, with a person confirming before anything is written.',
    overview:
      'An HR help desk where employees ask questions in plain language and get answers cited to the company handbook. The assistant can look up balances and propose actions like a time-off request, but a person confirms before anything is written. Sensitive or crisis messages go to people, not the model.',
    stack: [
      {
        group: 'AI',
        items:
          'Claude Opus 5.5, Claude Haiku 5.5, Claude Sonnet 5.5 (eval judge), Anthropic SDK, Voyage voyage-4 embeddings',
      },
      { group: 'Frontend', items: 'React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui' },
      { group: 'Backend', items: 'Python, FastAPI, SQLAlchemy 2, server-sent events' },
      {
        group: 'Data',
        items: 'PostgreSQL with pgvector, row-level security, envelope encryption',
      },
      { group: 'Infra', items: 'Docker, AWS ECS on EC2, GitHub Actions' },
    ],
    stats: [
      { value: '100', unit: '%', label: 'Red team pass rate' },
      { value: '99', unit: '%', label: 'Q&A program checks' },
      { value: '$0.019', label: 'Mean cost per question' },
    ],
    hero: {
      src: '/images/projects/opendoor-cited-answer.png',
      width: 1800,
      height: 1125,
      alt: 'Open Door chat. An employee asks how many sick days they get; the answer explains the California addendum and cites two handbook sections.',
    },
    frameLabel: 'Open Door',
    links: {
      code: { url: `${github}open-door`, enabled: true },
      demo: { url: 'https://opendoor.jameslittlefield.net', enabled: true },
      video: { enabled: false, durationLabel: '3.5 min' },
    },
    caseStudy: {
      overview:
        "An HR help desk where employees ask questions in plain language and get answers cited to the company handbook. Answers depend on the asker: a California employee's sick leave comes from an addendum, not the company default, so retrieval is filtered to each person's state and employment type. The assistant can look up balances and propose actions like a time-off request, but a person confirms before anything is written. Sensitive or crisis messages go to people, not the model.",
      features: [
        "Answers cited to the exact handbook passage, filtered to the asker's state and employment type",
        'Time-off balances, requests, approvals, and cancellations through tool calls',
        'Confirm-before-write: proposals expire after 15 minutes and run exactly once',
        'A screening model routes crisis and sensitive messages to fixed text or an HR case',
        'Role-based views for employees, managers, and HR, with a demo persona switcher',
        'Streaming answers with a "show your work" view of tool calls and sources',
      ],
      howAiWorks: {
        intro:
          'A hand-written agent loop on the Anthropic SDK, with no framework. Three models each have one job.',
        points: [
          'Claude Opus 5.5 answers using 11 strict tools, such as `search_handbook` and `check_time_off`.',
          'Claude Haiku 5.5 screens every message first and fails closed. Claude Sonnet 5.5 grades eval runs.',
          'Handbook search is hybrid: Postgres full-text plus pgvector, merged with reciprocal-rank fusion, top 5.',
          "Citations use the API's native search result blocks, not formatting instructions.",
          'Prompt caching covers about 90% of input tokens, and a spend ledger reserves cost before each call.',
        ],
      },
      architecture: {
        kind: 'flow',
        ariaLabel:
          'Request flow: the browser sends a message; a spend ledger reserves the worst-case cost; a Claude Haiku guard screens it and fails closed. Crisis messages get fixed human-written text, sensitive topics go to HR, and ordinary questions go to the Claude Opus agent loop with 11 tools and hybrid retrieval. The loop streams a cited answer or creates a proposal card, which a person confirms; the confirm endpoint runs once and writes an audit event.',
      },
      results: {
        ariaLabel: 'Open Door results table',
        columns: ['Eval', 'Result', 'Target'],
        rows: [
          {
            label: 'Red team (62 items, 6 groups)',
            values: ['100%', ''],
          },
          {
            label: 'Q&A program checks',
            values: ['99%', ''],
          },
          {
            label: 'Unanswerable questions handled',
            values: ['97%', ''],
          },
          {
            label: 'Retrieval hit rate at 5 (88 questions, MRR 0.852)',
            values: ['100%', ''],
          },
          {
            label: 'Escalation recall (100 messages)',
            values: ['100%', ''],
          },
          {
            label: 'Fairness groups consistent',
            values: ['12 of 12', ''],
          },
          {
            label: 'Judge pass rate (earlier runs 74, 72, 68, 73)',
            values: ['80%', '85%'],
            miss: true,
          },
          {
            label: 'Judge agreement with an independent grader',
            values: ['91.2%', ''],
          },
          {
            label: 'Cost per question, mean (p95 $0.036)',
            values: ['$0.019', ''],
          },
          {
            label: 'Guard latency, p95 (p50 1,060 ms)',
            values: ['1,817 ms', '800 ms'],
            miss: true,
          },
        ],
        note: '207-item eval set, 3 trials each. Rows without a target had none listed. Two results miss their targets.',
      },
      decisions: [
        {
          title: 'Opus over Sonnet',
          text: 'Tested with a rule written before the runs. Sonnet was half the cost but wrote tool calls as plain text and missed a safety report, so Opus stayed.',
        },
        {
          title: 'Guard timeout',
          text: 'At 4 s, a real crisis message failed closed. Raised to 10 s.',
        },
        {
          title: 'Fairness evals',
          text: 'Caught a missing religious-accommodation route and an age remark. Both fixed in the prompt.',
        },
        {
          title: 'Written down',
          text: '22 architecture decision records cover choices like these.',
        },
      ],
      gallery: [
        {
          src: '/images/projects/opendoor-confirm-card.png',
          width: 1800,
          height: 1476,
          alt: 'A Book PTO proposal card with Confirm and Dismiss buttons.',
          caption: 'Proposal card. Nothing happens until a person confirms.',
        },
        {
          src: '/images/projects/opendoor-show-your-work.png',
          width: 1800,
          height: 1125,
          alt: 'The show your work panel listing tools called and handbook sections retrieved, cited or not.',
          caption: 'Show your work: tools called and sections retrieved.',
        },
        {
          src: '/images/projects/opendoor-ops-console.png',
          width: 1800,
          height: 1775,
          alt: 'AI ops console with time to first token, safety check time, cost per question, and a per-turn log.',
          caption: 'Ops console: latency, cost, and safety checks per turn.',
        },
      ],
    },
  },
  {
    slug: 'packwright',
    anchorId: 'packwright',
    name: 'Packwright',
    typeLabel: 'Label compliance checker',
    oneLine: 'Packaging labels checked against regulation, with the rule cited for every finding.',
    overview:
      'A packaging label generator that checks labels against regulation (GS1 retail barcodes, GHS chemical hazard labels, and US FDA food labels) and cites the rule behind every finding. Claude reads photos of existing labels; a deterministic rule engine does the judging.',
    stack: [
      {
        group: 'AI',
        items: 'Claude Opus 5.5 (vision, structured output), Anthropic SDK, MCP TypeScript SDK',
      },
      { group: 'Frontend', items: 'Vue 3, TypeScript, Vite, Pinia, Tailwind CSS v4' },
      { group: 'Backend', items: 'Node.js, Express 5, Zod 4, PDFKit, bwip-js (barcodes)' },
      { group: 'Data', items: 'MongoDB Atlas, Mongoose' },
      { group: 'Infra', items: 'Docker, AWS ECS on EC2, GitHub Actions, Vitest, Playwright' },
    ],
    stats: [
      { value: '30', unit: '/30', label: 'Defects Sonnet caught with tools (27 without)' },
      { value: '20', label: 'Sonnet wrong citations with tools (33 without)' },
      { value: '$0.11', label: 'Most a photo read can cost' },
    ],
    hero: {
      src: '/images/projects/packwright-ghs-editor.png',
      width: 1800,
      height: 1125,
      alt: 'Packwright GHS chemical label editor. The compliance panel lists two warnings citing EU Regulation 1272/2008.',
      dark: true,
    },
    frameLabel: 'Packwright',
    links: {
      code: { url: `${github}packwright`, enabled: true },
      demo: { url: 'https://packwright.jameslittlefield.net', enabled: true },
      video: { enabled: false },
    },
    caseStudy: {
      overview:
        'A packaging label generator that checks labels against regulation (GS1 retail barcodes, GHS chemical hazard labels, and US FDA food labels) and cites the rule behind every finding. Claude reads photos of existing labels; a deterministic rule engine does the judging. It also runs an MCP server so AI assistants can check labels directly, using the same rules.',
      features: [
        'Label editor with a live preview that matches the exported PDF exactly',
        '36 rules across GS1, GHS, and US food labeling, each finding linked to its regulation',
        'Click a finding to highlight the part of the label it refers to',
        'Photo audit: Claude vision reads an existing chemical label into typed fields; a person confirms each one',
        'Public MCP server at `/mcp` with 4 read-only tools (`check_label`, `list_rules`, `ghs_statement_text`, `check_gtin`)',
      ],
      howAiWorks: {
        intro:
          '"The LLM reads. The rule engine judges." No verdict or citation comes from a model.',
        points: [
          'Claude Opus 5.5 reads a label photo into a Zod-validated schema with a confidence score per field.',
          'Hazard codes are checked against verified tables, and a person confirms each field.',
          'Only then do the deterministic rules run.',
          'The MCP tools let assistants like Claude check labels with the same rules.',
        ],
      },
      architecture: {
        kind: 'steps',
        groups: [
          {
            title: 'Label editor',
            steps: [
              {
                title: 'Label form',
                text: '',
              },
              {
                title: 'Layout engine',
                text: 'Shared core package',
              },
              {
                title: 'SVG preview and PDF export',
                text: 'Both from the same layout',
              },
              {
                title: '36 rules',
                text: 'Run on the resolved geometry',
              },
              {
                title: 'Findings',
                text: 'Each with its citation',
              },
            ],
          },
          {
            title: 'Photo audit',
            steps: [
              {
                title: 'Upload',
                text: '',
              },
              {
                title: 'Rate limits',
                text: '',
              },
              {
                title: 'Claude vision',
                text: 'Typed fields with confidence',
              },
              {
                title: 'Schema validation',
                text: 'Zod',
              },
              {
                title: 'Person confirms',
                text: 'Then the same rules run',
              },
            ],
          },
        ],
      },
      results: {
        ariaLabel: 'Packwright results table',
        columns: ['Measure', 'Without tools', 'With tools'],
        rows: [
          {
            label: 'Sonnet: defects caught, of 30',
            values: ['27', '30'],
          },
          {
            label: 'Sonnet: false clearances',
            values: ['2', '0'],
          },
          {
            label: 'Sonnet: answers with a wrong citation, of 36',
            values: ['33', '20'],
          },
          {
            label: 'Haiku: defects caught, of 30',
            values: ['5', '21'],
          },
          {
            label: 'Haiku: answers with a wrong citation, of 36',
            values: ['36', '7'],
          },
        ],
        note: '12 labels with planted defects, 144 conversations, $5.28. Later fixes brought Haiku with tools to 35 of 36. A photo read takes about 5 s and costs at most $0.11. 3,054 unit and 95 browser tests.',
      },
      decisions: [
        {
          title: 'Guardrail in the schema',
          text: "Moving a guardrail from the prompt into the tool schema removed false clearances the prompt fix couldn't.",
        },
        {
          title: 'Judging its own drawing',
          text: 'The engine once assumed a default label size. It now declines checks on values nobody stated.',
        },
        {
          title: 'Withhold the pass',
          text: "A pass is withheld when a figure can't be verified.",
        },
        {
          title: 'Security fix',
          text: 'A worst-case check went from 308 s to under 1 s.',
        },
      ],
      gallery: [
        {
          src: '/images/projects/packwright-gs1-editor.png',
          width: 1800,
          height: 1125,
          alt: 'Packwright GS1 retail label editor with a barcode preview and every compliance check passed.',
          caption: 'GS1 editor: barcode preview with dimensions; all 6 checks pass.',
          dark: true,
        },
      ],
    },
  },
  {
    slug: 'folio',
    anchorId: 'folio',
    name: 'Folio',
    typeLabel: 'RAG brand content studio',
    oneLine:
      "On-brand LinkedIn posts, image cards, and documents, written from each brand's own material.",
    overview:
      "Folio writes LinkedIn posts, designed image cards, and branded documents that sound like a specific company. It indexes each brand's voice guides, past posts, and personas, then retrieves the right pieces at generation time so Claude writes on-brand instead of generic copy.",
    stack: [
      {
        group: 'AI',
        items:
          'Claude Sonnet 5.5, Anthropic SDK, OpenAI text-embedding-3-small, LangChain text splitters',
      },
      {
        group: 'Frontend',
        items:
          'React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Satori and resvg (PNG rendering)',
      },
      {
        group: 'Backend',
        items: 'Python, FastAPI, Pydantic v2, server-sent events, ReportLab',
      },
      {
        group: 'Data',
        items: 'MongoDB (Motor), Chroma vector store (one collection per workspace)',
      },
      { group: 'Infra', items: 'Docker, GitHub Actions, AWS' },
    ],
    stats: [
      { value: '456', label: 'Automated tests, about' },
      { value: '8', label: 'Audit findings fixed (1 critical, 7 high)' },
      { value: '6', label: 'Semantic matches per generation, plus pinned voice passages' },
    ],
    hero: {
      src: '/images/projects/folio-linkedin-post.jpg',
      width: 1600,
      height: 1000,
      alt: 'Folio generate screen for a demo brand: a brief, a generated image card, the post caption, and the retrieved brand context.',
    },
    frameLabel: 'Folio',
    links: {
      code: { url: `${github}brand-content-studio`, enabled: false },
      demo: { enabled: false },
      video: { enabled: false },
    },
    caseStudy: {
      overview:
        "Folio writes LinkedIn posts, designed image cards, and branded documents that sound like a specific company. It indexes each brand's voice guides, past posts, and personas, then retrieves the right pieces at generation time so Claude writes on-brand instead of generic copy. Each brand lives in its own workspace, and every generation records which passages it used.",
      features: [
        'One workspace per brand, with its own documents, palette, fonts, and voice',
        'LinkedIn posts and 1080x1350 image cards, with the preview identical to the exported PNG',
        'Branded documents exported to Word, PDF, and PowerPoint',
        '"Learn from an image": upload a logo or brand guide and Claude proposes colors, fonts, and voice for review',
        'Every generation shows which brand passages it used and their scores',
      ],
      howAiWorks: {
        intro: 'Retrieval decides what Claude sees; two passes decide how it writes.',
        points: [
          'Voice and content-pillar passages are always included, plus the top 6 semantic matches, fetched together and deduplicated.',
          'The copy streams over SSE into the live preview.',
          'A strict forced tool call then returns the structured fields: headline, body, CTA, hashtag.',
          'Retrieved brand material is escaped inside a fenced block to resist prompt injection.',
        ],
      },
      architecture: {
        kind: 'steps',
        groups: [
          {
            title: 'Index brand material',
            steps: [
              {
                title: 'Upload',
                text: '',
              },
              {
                title: 'Parse',
                text: '',
              },
              {
                title: 'Chunk',
                text: '800 characters, 120 overlap',
              },
              {
                title: 'Embed',
                text: '',
              },
              {
                title: 'Store',
                text: 'One vector collection per workspace',
              },
            ],
          },
          {
            title: 'Generate',
            steps: [
              {
                title: 'Request',
                text: '',
              },
              {
                title: 'Retrieve',
                text: 'Pinned plus top 6',
              },
              {
                title: 'Prompt',
                text: 'Brand context fenced',
              },
              {
                title: 'Claude streams copy',
                text: '',
              },
              {
                title: 'Forced tool call',
                text: 'Structured fields',
              },
              {
                title: 'Render and save',
                text: 'With a retrieval snapshot',
              },
            ],
          },
        ],
      },
      results: {
        ariaLabel: 'Folio results table',
        columns: ['Measure', 'Result'],
        rows: [
          {
            label: 'Retrieval hit rate at 6 (8 briefs)',
            values: ['Threshold 0.75, scored on a lexical test store'],
          },
          {
            label: 'Automated tests',
            values: ['About 456 (296 server, 160 client)'],
          },
          {
            label: 'July security audit',
            values: ['1 critical, 7 high, all fixed'],
          },
          {
            label: 'October QA pass',
            values: ['17 issues, all fixed'],
          },
        ],
        note: 'Every generation also saves a snapshot of the passages it used and their scores.',
      },
      decisions: [
        {
          title: 'No framework',
          text: "The pipeline is four steps, so it's written directly on the SDKs instead of LangChain.",
        },
        {
          title: 'Vector store',
          text: 'Chroma and Qdrant over Pinecone, on cost.',
        },
        {
          title: 'Hosting',
          text: 'ECS over Lambda, because cold starts hurt streaming.',
        },
        {
          title: 'Pinned pillars',
          text: 'Content pillars were being crowded out of retrieval, so they are now always included.',
        },
      ],
      gallery: [
        {
          src: '/images/projects/folio-retrieved-context.jpg',
          width: 1600,
          height: 1000,
          alt: 'Folio retrieved context panel listing pinned content-pillar passages.',
          caption: 'Retrieved context: which passages were used, pinned or not.',
        },
        {
          src: '/images/projects/folio-image-card.jpg',
          width: 1600,
          height: 1000,
          alt: 'Folio image card generation screen.',
          caption: 'Image card generation.',
        },
      ],
    },
  },
  {
    slug: 'resumeiq',
    anchorId: 'resumeiq',
    name: 'ResumeIQ',
    typeLabel: 'AI resume builder',
    oneLine:
      'A resume editor with live preview, AI tailoring to job descriptions, ATS checks, and cover letters.',
    overview:
      'A resume builder with a split-screen editor and live preview. Claude sharpens bullet points, tailors a resume to a job description with a match score and missing keywords, runs an ATS check, writes a cover letter, and imports an existing PDF or Word resume.',
    stack: [
      { group: 'AI', items: 'Claude Haiku 5.5, Claude Sonnet 5.5, Anthropic SDK' },
      {
        group: 'Frontend',
        items: 'React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Orval (typed API client)',
      },
      {
        group: 'Backend',
        items: 'Python, Django 5.2, Django REST Framework, drf-spectacular (OpenAPI)',
      },
      { group: 'Data', items: 'PostgreSQL 15' },
      {
        group: 'Infra',
        items: 'Docker, AWS ECS Fargate, RDS, Secrets Manager, GitHub Actions, CodeQL',
      },
    ],
    stats: [
      { value: '248', label: 'Automated tests' },
      { value: '10', label: 'AI calls per user per day, capped' },
      { value: '50', label: 'AI calls per user per month, capped' },
    ],
    hero: {
      src: '/images/projects/resumeiq-tailor.png',
      width: 1800,
      height: 1124,
      alt: 'ResumeIQ tailor dialog with a pasted job description and an Analyze match button.',
    },
    frameLabel: 'ResumeIQ',
    links: {
      code: { url: `${github}smart-resume-builder`, enabled: false },
      demo: { enabled: false },
      video: { enabled: false },
    },
    caseStudy: {
      overview:
        'A resume builder with a split-screen editor and live preview. Claude sharpens bullet points, tailors a resume to a job description with a match score and missing keywords, runs an ATS check, writes a cover letter, and imports an existing PDF or Word resume. Exports to PDF, Word, or plain text, with per-user limits that keep AI costs capped.',
      features: [
        'Split-screen editor with a live, print-accurate preview',
        'Tailor to a job description: match score, missing keywords, and suggested bullet rewrites',
        'ATS check with issues and recommendations',
        'Cover letter generation',
        'Import an existing PDF or Word resume, parsed in the browser and reviewed before saving',
        'Version checkpoint before any AI edit is applied',
      ],
      howAiWorks: {
        intro:
          'Each task goes to the smallest model that does it well, and every structured answer goes through a schema.',
        points: [
          'Claude Haiku 5.5 handles quick edits (bullets, summaries); Claude Sonnet 5.5 handles tailoring, ATS checks, cover letters, and import parsing.',
          'Tailoring, ATS, and parsing each force a single tool call with a JSON schema. The server clamps scores and trims lists.',
          'Bullets are sent with IDs, so the model can only point at bullets that exist. Prompts forbid inventing employers, metrics, or skills.',
          'Contact details are never sent to the model.',
        ],
      },
      architecture: {
        kind: 'steps',
        groups: [
          {
            title: 'Request flow',
            steps: [
              {
                title: 'React',
                text: '',
              },
              {
                title: 'Typed client',
                text: 'Generated from OpenAPI',
              },
              {
                title: 'DRF view',
                text: '',
              },
              {
                title: 'Usage gate',
                text: 'Daily and monthly limits',
              },
              {
                title: 'Prompt',
                text: 'Built from the resume',
              },
              {
                title: 'Claude',
                text: 'Forced tool call',
              },
              {
                title: 'Normalize',
                text: 'Server-side',
              },
              {
                title: 'Review and apply',
                text: 'After a version checkpoint',
              },
            ],
          },
        ],
      },
      results: {
        ariaLabel: 'ResumeIQ results table',
        columns: ['Measure', 'Value'],
        rows: [
          {
            label: 'Automated tests',
            values: ['248 (105 server, 143 client)'],
          },
          {
            label: 'AI calls per user',
            values: ['10 per day, 50 per month'],
          },
          {
            label: 'Burst limit',
            values: ['20 per hour'],
          },
          {
            label: 'Failed calls',
            values: ['Not counted against limits'],
          },
        ],
        note: 'Input size caps apply to every AI call.',
      },
      decisions: [
        {
          title: 'Route by task',
          text: 'Haiku for quick edits, Sonnet for the rest.',
        },
        {
          title: 'No retries on slow calls',
          text: 'A timeout fails cleanly instead of billing behind a gateway timeout.',
        },
        {
          title: 'Missing context',
          text: 'A bug left dates and locations out of the text sent to Claude, so the ATS check flagged them as missing. Fixed.',
        },
      ],
      gallery: [
        {
          src: '/images/projects/resumeiq-editor.png',
          width: 1800,
          height: 1125,
          alt: 'ResumeIQ split-screen editor with form fields and a live resume preview.',
          caption: 'Editor with live preview and the daily AI counter.',
        },
      ],
    },
  },
]

export function projectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
