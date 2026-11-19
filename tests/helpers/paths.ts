import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Two levels up from tests/helpers. Passing the string (not a URL object) keeps this
// working under the Nuxt test environment, which swaps the global URL class.
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** Absolute path inside the repo, independent of the process cwd. */
export function repoPath(...parts: string[]): string {
  return join(root, ...parts)
}
