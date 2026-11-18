import { defineComponent, h } from 'vue'
import { expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import InlineText from '../../app/components/case/InlineText.vue'
import ResultsTable from '../../app/components/case/ResultsTable.vue'
import MediaSection from '../../app/components/case/MediaSection.vue'
import VideoPlayer from '../../app/components/case/VideoPlayer.vue'
import ArchitectureSteps from '../../app/components/case/ArchitectureSteps.vue'
import RequestFlow from '../../app/components/case/RequestFlow.vue'
import { projectBySlug } from '../../app/data/projects'

it('InlineText renders backticks as code without v-html', async () => {
  const text = 'Uses `search_handbook` and `check_time_off`.'
  const w = await mountSuspended(InlineText, { props: { text } })
  expect(w.findAll('code').map((c) => c.text())).toEqual(['search_handbook', 'check_time_off'])
  // VTU text() trims each root node of a fragment, so mount inside a parent to read its textContent.
  const host = await mountSuspended(defineComponent({ render: () => h('p', [h(InlineText, { text })]) }))
  expect(host.element.textContent).toBe('Uses search_handbook and check_time_off.')
})

it('ResultsTable marks misses and scopes headers', async () => {
  const table = projectBySlug('open-door')!.caseStudy.results
  const w = await mountSuspended(ResultsTable, { props: { table } })
  expect(w.findAll('tr.is-miss')).toHaveLength(2)
  expect(w.findAll('thead th[scope="col"]')).toHaveLength(3)
  const rows = w.findAll('tbody tr')
  expect(rows).toHaveLength(table.rows.length)
  for (const r of rows) expect(r.find('th[scope="row"]').exists()).toBe(true)
  const region = w.find('.table-wrap')
  expect(region.attributes('role')).toBe('region')
  expect(region.attributes('tabindex')).toBe('0')
  expect(region.attributes('aria-label')).toBe(table.ariaLabel)
  expect(w.find('table').classes()).toContain('score--3')
})

it('ArchitectureSteps renders groups and skips empty step text', async () => {
  const w = await mountSuspended(ArchitectureSteps, {
    props: { groups: [{ title: 'G', steps: [{ title: 'A', text: 'one' }, { title: 'B', text: '' }] }] },
  })
  expect(w.find('.steps-title').text()).toBe('G')
  expect(w.findAll('ol.steps li')).toHaveLength(2)
  expect(w.findAll('ol.steps li')[1]!.text()).toBe('B')
})

it('RequestFlow is a labeled image with a hidden grid', async () => {
  const w = await mountSuspended(RequestFlow, { props: { ariaLabel: 'Flow label' } })
  const flow = w.find('.flow')
  expect(flow.attributes('role')).toBe('img')
  expect(flow.attributes('aria-label')).toBe('Flow label')
  expect(w.find('.flow-cols').attributes('aria-hidden')).toBe('true')
})

it('MediaSection renders a player only when video is enabled', async () => {
  const p = projectBySlug('open-door')!
  const off = await mountSuspended(MediaSection, { props: { project: p } })
  expect(off.find('video').exists()).toBe(false)
  expect(off.find('#video').exists()).toBe(false)
  expect(off.find('.video-note').exists()).toBe(false)
  expect(off.findAll('figure.g-item')).toHaveLength(p.caseStudy.gallery.length)

  const withVideo = (video: typeof p.links.video) => ({ ...p, links: { ...p.links, video } })
  const on = await mountSuspended(MediaSection, {
    props: {
      project: withVideo({ enabled: true, src: '/videos/x.mp4', poster: '/images/x.jpg', description: 'No sound.' }),
    },
  })
  expect(on.find('#video video[preload="none"]').exists()).toBe(true)
  expect(on.find('#video video').attributes('poster')).toBe('/images/x.jpg')
  // The note sits below the stage, as in v11, not inside the frame.
  expect(on.find('#video .video-note').exists()).toBe(false)
  const note = on.find('.video-note')
  expect(note.text()).toBe('No sound.')
  expect(note.element.previousElementSibling?.id).toBe('video')

  const bare = await mountSuspended(MediaSection, {
    props: { project: withVideo({ enabled: true, src: '/videos/x.mp4', captions: '/videos/x.vtt' }) },
  })
  expect(bare.find('#video video').attributes('poster')).toBeUndefined()
  expect(bare.find('#video track[kind="captions"]').attributes('src')).toBe('/videos/x.vtt')
  expect(bare.find('.video-note').exists()).toBe(false)
})

it('VideoPlayer sets the poster and captions track only when given', async () => {
  const base = { src: '/v.mp4', label: 'Walkthrough video' }
  const w = await mountSuspended(VideoPlayer, { props: { ...base, poster: '/p.jpg', captions: '/c.vtt' } })
  expect(w.find('video').attributes('poster')).toBe('/p.jpg')
  expect(w.find('video').attributes('aria-label')).toBe('Walkthrough video')
  const t = w.find('track[kind="captions"]')
  expect(t.attributes('srclang')).toBe('en')
  expect(t.attributes('src')).toBe('/c.vtt')
  const none = await mountSuspended(VideoPlayer, { props: base })
  expect(none.find('video').attributes('poster')).toBeUndefined()
  expect(none.find('track').exists()).toBe(false)
})
