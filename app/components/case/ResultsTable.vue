<script setup lang="ts">
import type { ResultsData } from '~/types/project'

defineProps<{ table: ResultsData }>()
</script>

<template>
  <div>
    <div class="table-wrap" role="region" tabindex="0" :aria-label="table.ariaLabel">
      <table class="score" :class="{ 'score--3': table.columns.length === 3 }">
        <thead>
          <tr><th v-for="c in table.columns" :key="c" scope="col">{{ c }}</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in table.rows" :key="r.label" :class="{ 'is-miss': r.miss }">
            <th scope="row">{{ r.label }}</th>
            <td v-for="(v, i) in r.values" :key="i" class="v">{{ v }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="table.note" class="table-note">{{ table.note }}</p>
  </div>
</template>

<style scoped>
.table-wrap { margin-top: var(--s-5); max-width: 760px; overflow-x: auto; border-radius: 2px; }
.table-wrap:focus-visible { outline-offset: 4px; }
table { border-collapse: collapse; width: 100%; }
.score--3 { min-width: 500px; }
.score th, .score td { text-align: left; padding: 12px 12px 12px 0; border-bottom: 1px solid var(--line); font-size: var(--t-small); vertical-align: baseline; }
.score thead th { font-weight: 500; color: var(--ink-3); border-bottom: 2px solid var(--mark); padding-top: 0; white-space: nowrap; }
.score tbody th { font-weight: 500; color: var(--ink); }
.score .v { font-weight: 600; font-variant-numeric: tabular-nums; }
.score--3 .v { white-space: nowrap; }
.score tr.is-miss .v { color: var(--miss); }
.score tr.is-miss th { box-shadow: inset 2px 0 0 var(--miss); padding-left: 10px; }
.table-note { margin-top: var(--s-3); font-size: 0.8125rem; color: var(--ink-3); max-width: 760px; }
</style>
