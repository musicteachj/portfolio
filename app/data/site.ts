export const site = {
  name: 'James Littlefield',
  role: 'AI Engineer',
  lede: 'I build LLM applications that do real work: agents that call tools, retrieval over private data, and structured generation, shipped as full-stack products.',
  support: 'Senior software engineer at Surface Design Solutions. 8+ years building full-stack software.',
  status: 'Open to AI engineering roles',
  githubUrl: 'https://github.com/musicteachj',
  linkedinUrl: 'https://www.linkedin.com/in/james-littlefield-93037713b/',
  resumePath: '/resume.pdf',
  // The address is stored in two parts so it never appears whole in the source or the output.
  emailUser: 'jameslittlefield3',
  emailDomain: 'gmail.com',
  capabilitiesHeading: 'I work on',
  capabilities: [
    'Agents and tool use',
    'Retrieval (RAG)',
    'Structured output',
    'Evals',
    'Streaming UX (SSE)',
    'Shipping to production',
  ],
} as const satisfies {
  name: string
  role: string
  lede: string
  support: string
  status: string
  githubUrl: string
  linkedinUrl: string
  resumePath: string
  emailUser: string
  emailDomain: string
  capabilitiesHeading: string
  capabilities: readonly string[]
}
