<script setup lang="ts">
const props = defineProps<{ to: '/' | '/projects' | '/contact'; ariaCurrent?: 'page' | 'location' }>()

const route = useRoute()
const router = useRouter()

// Plain primary-button clicks only; modified clicks keep the browser's default (new tab, etc.).
const isPlainClick = (e: MouseEvent) =>
  !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey

// The section paths and / are aliases of one record, so the router treats a move between
// them as a duplicate navigation unless forced. Returns false if the push did not land.
async function pushForced(path: string) {
  try {
    return !(await router.push({ path, force: true }))
  } catch {
    return false
  }
}

async function onClick(e: MouseEvent) {
  if (!isPlainClick(e)) return
  e.preventDefault()
  const id = sectionIdForPath(props.to)
  if (!id) {
    // The wordmark: scroll to the top when already on Home, otherwise go Home.
    if (route.path === '/') window.scrollTo({ top: 0, behavior: scrollBehaviorPref() })
    else await pushForced('/')
    return
  }
  if (route.path === props.to) {
    // Already here: the router does nothing, so scroll and focus directly.
    scrollToSection(id, { focus: true })
    return
  }
  // From Home or any other page (case study, 404): the router's scrollBehavior does the
  // scroll; this only moves focus once the push has landed.
  if (await pushForced(props.to)) focusSectionHeading(id)
}
</script>

<template>
  <a :href="to" :aria-current="ariaCurrent" @click="onClick"><slot /></a>
</template>
