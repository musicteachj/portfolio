import { expect, it } from 'vitest'
import { projectBySlug } from '../../app/data/projects'
import { projectSeo } from '../../app/utils/seo'

it('builds the case study title and description', () => {
  const folio = projectBySlug('folio')!
  expect(projectSeo(folio)).toEqual({
    title: 'Folio: RAG brand content studio',
    description: folio.oneLine,
  })
})
