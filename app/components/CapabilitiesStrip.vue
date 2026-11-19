<script setup lang="ts">
import { site } from '~/data/site'
</script>

<template>
  <section class="caps" aria-labelledby="caps-h">
    <div class="wrap">
      <h2 id="caps-h">{{ site.capabilitiesHeading }}</h2>
      <ul role="list">
        <li v-for="c in site.capabilities" :key="c">{{ c }}</li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.caps { border-top: 1px solid var(--line); padding: var(--s-6) 0; }
.caps .wrap { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--s-2) var(--s-5); }
.caps h2 { font-size: var(--t-small); font-weight: 500; color: var(--ink-3); letter-spacing: 0; }
.caps ul { list-style: none; display: flex; flex-wrap: wrap; gap: var(--s-2) var(--s-5); font-size: 0.9375rem; }
.caps li { position: relative; }
.caps li + li::before { content: ""; position: absolute; left: calc(var(--s-5) / -2); top: 0.3em; height: 0.9em; width: 1px; background: var(--line-strong); }
</style>
