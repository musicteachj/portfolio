import type { Project } from '../types/project'

const github = 'https://github.com/musicteachj/'

export const projects: Project[] = [
  {
    slug: 'open-door',
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
      { group: 'Infra', items: 'Docker, AWS ECS Fargate, GitHub Actions' },
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
      code: { url: `${github}open-door`, enabled: false },
      demo: { enabled: false },
      video: { enabled: false, durationLabel: '3.5 min' },
    },
  },
  {
    slug: 'packwright',
    name: 'Packwright',
    typeLabel: 'Label compliance checker',
    oneLine: 'Packaging labels checked against regulation, with the rule cited for every finding.',
    overview:
      'A packaging label generator that checks labels against regulation (GS1 retail barcodes, GHS chemical hazard labels, and US FDA food labels) and cites the rule behind every finding. Claude reads photos of existing labels; a deterministic rule engine does the judging.',
    stack: [
      {
        group: 'AI',
        items: 'Claude Opus 5 (vision, structured output), Anthropic SDK, MCP TypeScript SDK',
      },
      { group: 'Frontend', items: 'Vue 3, TypeScript, Vite, Pinia, Tailwind CSS v4' },
      { group: 'Backend', items: 'Node.js, Express 5, Zod 4, PDFKit, bwip-js (barcodes)' },
      { group: 'Data', items: 'MongoDB, Mongoose' },
      { group: 'Infra', items: 'Docker, AWS ECS Fargate, GitHub Actions, Vitest, Playwright' },
    ],
    stats: [
      { value: '30', unit: '/30', label: 'Defects Sonnet caught with tools (27 without)' },
      { value: '20', label: 'Sonnet wrong citations with tools (33 without)' },
      { value: '$0.13', label: 'Per vision call, about' },
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
      code: { url: `${github}packwright`, enabled: false },
      demo: { enabled: false },
      video: { enabled: false },
    },
  },
  {
    slug: 'folio',
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
          'Claude Sonnet 4.6, Anthropic SDK, OpenAI text-embedding-3-small, LangChain text splitters',
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
  },
  {
    slug: 'resumeiq',
    name: 'ResumeIQ',
    typeLabel: 'AI resume builder',
    oneLine:
      'A resume editor with live preview, AI tailoring to job descriptions, ATS checks, and cover letters.',
    overview:
      'A resume builder with a split-screen editor and live preview. Claude sharpens bullet points, tailors a resume to a job description with a match score and missing keywords, runs an ATS check, writes a cover letter, and imports an existing PDF or Word resume.',
    stack: [
      { group: 'AI', items: 'Claude Haiku 4.5, Claude Sonnet 4.6, Anthropic SDK' },
      {
        group: 'Frontend',
        items:
          'React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Orval (typed API client)',
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
  },
]

export function projectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
