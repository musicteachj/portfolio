<template>
  <div class="stage"><slot /></div>
</template>

<style scoped>
.stage { background: var(--soft); border-radius: var(--r-stage); padding: clamp(12px, 3vw, 36px); }
</style>
