import type { Project } from '~/types/project'

export function projectSeo(p: Project): { title: string; description: string } {
  return { title: `${p.name}: ${p.typeLabel}`, description: p.oneLine }
}
