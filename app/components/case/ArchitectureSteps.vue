<script setup lang="ts">
import type { StepGroup } from '~/types/project'

defineProps<{ groups: StepGroup[] }>()
</script>

<template>
  <div class="steps-wrap">
    <div v-for="g in groups" :key="g.title">
      <p class="steps-title">{{ g.title }}</p>
      <ol class="steps" role="list">
        <li v-for="s in g.steps" :key="s.title"><b>{{ s.title }}</b><template v-if="s.text">{{ s.text }}</template></li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.steps-wrap { margin-top: var(--s-5); display: grid; gap: var(--s-6); }
.steps-title { font-size: var(--t-small); font-weight: 600; color: var(--ink); margin-bottom: var(--s-3); }
.steps { list-style: none; padding: 0; counter-reset: st; display: flex; flex-wrap: wrap; gap: var(--s-2); }
.steps li { counter-increment: st; position: relative; padding: 10px 14px 10px 40px; border: 1px solid var(--line-strong); border-radius: 8px; background: var(--surface); font-size: 0.8125rem; color: var(--ink-3); line-height: 1.4; max-width: 100%; }
.steps li::before { content: counter(st); position: absolute; left: 12px; top: 10px; width: 18px; height: 18px; border-radius: 50%; background: var(--tint); color: var(--accent); font: 400 0.6875rem/18px var(--font-mono); text-align: center; }
.steps li b { display: block; color: var(--ink); font-weight: 600; font-size: 0.875rem; }
@media (max-width: 599px) { .steps { flex-direction: column; } }
</style>
