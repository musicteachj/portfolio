<script setup lang="ts">
withDefaults(defineProps<{ title?: string; eyebrow?: string }>(), {
  title: 'James Littlefield',
  eyebrow: '',
})
</script>

<template>
  <div
    :style="{
      display: 'flex',
      width: '100%',
      height: '100%',
      background: '#F7F7F4',
      fontFamily: 'Onest',
    }"
  >
    <div :style="{ width: '16px', height: '100%', background: '#12354E' }" />
    <div
      :style="{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 80px',
        flex: 1,
      }"
    >
      <div v-if="eyebrow" :style="{ fontSize: '36px', color: '#5F655F', marginBottom: '24px' }">
        {{ eyebrow }}
      </div>
      <div :style="{ fontSize: '88px', fontWeight: 600, color: '#141614', lineHeight: 1.1 }">
        {{ title }}
      </div>
    </div>
  </div>
</template>
