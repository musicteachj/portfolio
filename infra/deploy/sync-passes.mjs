// The ordered `aws s3 sync` passes that publish .output/public. Each pass
// starts from `--exclude '*'` so the passes never overlap, and nothing is
// deleted until the last command.

const IMMUTABLE = 'max-age=31536000, immutable'
const NO_CACHE = 'no-cache'
const DAY = 'max-age=86400'

// Never uploaded. --exclude also protects these from the final --delete pass,
// so a copy already in the bucket is left alone (not removed).
export const EXCLUDED = ['200.html', '_og-static-fonts/*']

// Left in place by the final --delete. A reader whose tab still runs the previous
// build loads its content-hashed chunks from here on the next click; deleting them
// would turn that click into a failed load and a full page reload. They are small,
// and nothing links to them once no open tab runs that build.
export const KEPT_ON_DELETE = ['_nuxt/*']

const only = (...includes) => [['exclude', '*'], ...includes.map((p) => ['include', p])]

export const SYNC_PASSES = [
  {
    // Content-hashed, so safe to cache forever.
    name: 'nuxt-assets',
    filters: [...only('_nuxt/*'), ['exclude', '_nuxt/builds/*']],
    cacheControl: IMMUTABLE,
  },
  { name: 'nuxt-builds', filters: only('_nuxt/builds/*'), cacheControl: NO_CACHE },
  // The files keep the source extension (.png, .jpg) but hold the format named
  // in the directory, so each format needs an explicit content type.
  { name: 'ipx-avif', filters: only('_ipx/f_avif*'), cacheControl: DAY, contentType: 'image/avif' },
  { name: 'ipx-webp', filters: only('_ipx/f_webp*'), cacheControl: DAY, contentType: 'image/webp' },
  { name: 'ipx-png', filters: only('_ipx/f_png*'), cacheControl: DAY, contentType: 'image/png' },
  { name: 'ipx-jpeg', filters: only('_ipx/f_jpeg*'), cacheControl: DAY, contentType: 'image/jpeg' },
  {
    name: 'assets',
    filters: [
      ...only('images/*', 'videos/*', '_og/*', 'resume.pdf', 'favicon.svg', '__sitemap__/*'),
      ['exclude', 'videos/*.vtt'],
    ],
    cacheControl: DAY,
  },
  { name: 'captions', filters: only('videos/*.vtt'), cacheControl: DAY, contentType: 'text/vtt' },
  {
    name: 'markdown',
    filters: only('*.md'),
    cacheControl: NO_CACHE,
    contentType: 'text/markdown; charset=utf-8',
  },
  {
    name: 'pages-and-data',
    filters: [
      ...only(
        '*.html',
        '*_payload.json',
        '__ai-ready/*',
        'sitemap.xml',
        'robots.txt',
        'llms.txt',
        'llms-full.txt',
      ),
      ...EXCLUDED.map((p) => ['exclude', p]),
    ],
    cacheControl: NO_CACHE,
  },
]

function toRegExp(pattern) {
  const source = [...pattern]
    .map((c) => (c === '*' ? '.*' : c === '?' ? '.' : c.replace(/[.+^${}()|[\]\\]/g, '\\$&')))
    .join('')
  return new RegExp(`^${source}$`)
}

// The AWS CLI rule: every file starts included, filters apply in order, and
// the last one that matches decides.
export function matches(rel, filters) {
  let included = true
  for (const [kind, pattern] of filters) {
    if (toRegExp(pattern).test(rel)) included = kind === 'include'
  }
  return included
}

export function syncCommands(src, bucket) {
  const passes = SYNC_PASSES.map((pass) => [
    's3',
    'sync',
    src,
    bucket,
    ...pass.filters.flatMap(([kind, pattern]) => [`--${kind}`, pattern]),
    '--cache-control',
    pass.cacheControl,
    ...(pass.contentType ? ['--content-type', pass.contentType] : []),
  ])
  const cleanup = [
    's3',
    'sync',
    src,
    bucket,
    '--delete',
    ...[...EXCLUDED, ...KEPT_ON_DELETE].flatMap((p) => ['--exclude', p]),
  ]
  return [...passes, cleanup]
}
