<script setup lang="ts">
import type { ProofItem } from '~/utils/proof'

withDefaults(
  defineProps<{ items: ProofItem[]; label: string; variant?: 'home' | 'page'; projectName?: string }>(),
  { variant: 'home', projectName: undefined },
)

const isExternal = (href: string) => /^https?:/.test(href)
</script>

<template>
  <ul class="proof" role="list" :class="{ 'proof--3': variant === 'page' }" :aria-label="label">
    <li v-for="item in items" :key="item.key">
      <template v-if="item.href">
        <a v-if="isExternal(item.href)" :href="item.href"><span v-if="item.key === 'case' && projectName" class="sr-only">{{ projectName }}</span> {{ item.label }} <span class="state">{{ item.sub }}</span></a>
        <NuxtLink v-else :to="item.href"><span v-if="item.key === 'case' && projectName" class="sr-only">{{ projectName }}</span> {{ item.label }} <span class="state">{{ item.sub }}</span></NuxtLink>
      </template>
      <span v-else class="proof-off" role="link" aria-disabled="true">{{ item.label }} <span class="state">{{ item.sub }}</span></span>
    </li>
  </ul>
</template>

<style scoped>
/* 2x2 by default, one row of 4 when the .p-text container (see ProjectBlock) is wide enough. */
.proof { list-style: none; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--s-2); margin-top: var(--s-5); }
@container (min-width: 540px) { .proof:not(.proof--3) { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.proof li { min-width: 0; }
/* Page variant: 3 columns, 1 column in a narrow container. The page supplies the container. */
.proof--3 { margin-top: 0; grid-template-columns: repeat(3, minmax(0, 1fr)); }
@container (max-width: 420px) { .proof--3 { grid-template-columns: 1fr; } }
.proof a {
  display: flex; flex-direction: column; justify-content: center; align-items: flex-start; gap: 5px;
  min-height: 58px; padding: 8px 14px; border-radius: var(--r-ctl); width: 100%;
  border: 1px solid var(--accent); background: var(--surface); color: var(--accent); cursor: pointer;
  font: 500 0.9375rem/1.2 var(--font-sans); text-align: left; text-decoration: none;
}
.proof a:hover { background: var(--tint); color: var(--accent); }
.proof .state { font: 400 0.75rem/1.3 var(--font-mono); color: var(--ink-2); overflow-wrap: anywhere; }
/* Video, Code, and Live demo stay disabled until the apps deploy: same shape, muted, not focusable. */
.proof .proof-off {
  display: flex; flex-direction: column; justify-content: center; align-items: flex-start; gap: 5px;
  min-height: 58px; padding: 8px 14px; border-radius: var(--r-ctl); width: 100%;
  font: 500 0.9375rem/1.2 var(--font-sans); text-align: left;
  border: 1px solid var(--line-strong); background: var(--sunken); color: var(--ink-3); cursor: not-allowed;
}
</style>
