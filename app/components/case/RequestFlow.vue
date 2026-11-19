<script setup lang="ts">
defineProps<{ ariaLabel: string }>()
</script>

<template>
  <div class="flow" role="img" :aria-label="ariaLabel">
    <div class="flow-cols" aria-hidden="true">
      <div class="span-all"><div class="node"><b>Browser</b>Streams the answer over SSE</div></div>
      <div class="span-all"><div class="wire" /></div>
      <div class="span-all"><div class="node"><b>Spend ledger</b>Reserves worst-case cost first</div></div>
      <div class="span-all"><div class="wire" /></div>
      <div class="span-all"><div class="node"><b>Haiku guard</b>Screens every message, fails closed</div></div>
      <div class="span-all"><div class="wire wire--plain" /></div>
      <div class="branch branch-1"><div class="wire"><span class="wire-label">crisis</span></div></div>
      <div class="branch branch-2"><div class="wire"><span class="wire-label">sensitive</span></div></div>
      <div class="branch branch-3"><div class="wire"><span class="wire-label">ordinary</span></div></div>
      <div><span class="node-label">if crisis</span><div class="node"><b>Crisis text</b>Fixed, human-written</div></div>
      <div><span class="node-label">if sensitive</span><div class="node"><b>HR</b>Goes to a person</div></div>
      <div class="col3"><span class="node-label">if ordinary</span><div class="node node--main"><b>Opus agent loop</b>11 strict tools and hybrid retrieval (full-text plus pgvector), filtered to the asker's state</div></div>
      <div class="col3"><div class="sub2"><div class="wire wire--acc" /><div class="wire wire--acc" /></div></div>
      <div class="col3">
        <div class="sub2">
          <div class="node"><b>Cited answer</b>Numbered sources</div>
          <div><span class="node-label">or</span><div class="node"><b>Proposal card</b>Expires in 15 minutes</div></div>
        </div>
      </div>
      <div class="col3"><div class="sub2"><div class="spacer" /><div class="wire" /></div></div>
      <div class="col3"><div class="sub2"><div class="spacer" /><div class="node node--human"><b>Person confirms</b>Runs once, writes the audit event</div></div></div>
    </div>
  </div>
</template>

<style scoped>
.flow { margin-top: var(--s-6); }
.flow-cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.6fr); column-gap: var(--s-4); }
.span-all { grid-column: 1 / -1; display: flex; justify-content: center; }
.col3 { grid-column: 3; }
.node { background: var(--surface); border: 1px solid var(--line-strong); border-radius: 8px; padding: 10px 14px; font-size: 0.8125rem; color: var(--ink-2); line-height: 1.45; width: 100%; }
.span-all .node { max-width: 340px; }
.node b { display: block; color: var(--ink); font-weight: 600; font-size: 0.9375rem; }
.node--main { border: 1.5px solid var(--accent); background: var(--tint); }
.node--human { border-color: var(--ink); border-width: 1.5px; }
.wire { position: relative; height: 26px; width: 100%; }
.wire::before { content: ""; position: absolute; left: 50%; top: 0; bottom: 0; width: 1.5px; background: var(--ink-3); transform: translateX(-50%); }
.wire::after { content: ""; position: absolute; left: 50%; bottom: 0; width: 7px; height: 7px; border-right: 1.5px solid var(--ink-3); border-bottom: 1.5px solid var(--ink-3); transform: translate(-50%, -1px) rotate(45deg); }
.wire--plain { height: 12px; }
.wire--plain::after { display: none; }
.wire--acc::before { background: var(--accent); }
.wire--acc::after { border-color: var(--accent); }
.wire-label { position: absolute; left: calc(50% + 10px); top: 50%; transform: translateY(-50%); font: 400 0.6875rem/1 var(--font-mono); color: var(--ink-3); white-space: nowrap; }
.branch { position: relative; height: 36px; }
.branch::before { content: ""; position: absolute; top: 0; height: 1.5px; background: var(--ink-3); }
.branch-1::before { left: 50%; right: calc(var(--s-4) / -2); }
.branch-2::before { left: calc(var(--s-4) / -2); right: calc(var(--s-4) / -2); }
.branch-3::before { left: calc(var(--s-4) / -2); right: 50%; }
.branch .wire { position: absolute; inset: 0; height: auto; }
.branch-3 .wire::before { background: var(--accent); }
.branch-3 .wire::after { border-color: var(--accent); }
.sub2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-4); }
.node-label { display: none; font: 400 0.6875rem/1 var(--font-mono); color: var(--ink-3); margin: var(--s-3) 0 6px; }
@media (max-width: 759px) {
  .flow-cols { grid-template-columns: 1fr; }
  .col3 { grid-column: 1; }
  .branch, .wire--plain { display: none; }
  .node-label { display: block; }
  .sub2 { grid-template-columns: 1fr; gap: 0; }
  .sub2 > .wire + .wire, .sub2 > .spacer { display: none; }
}
</style>
