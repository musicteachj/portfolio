<script setup lang="ts">
// Palette A tokens are literals here: the renderer has no access to the site CSS.
defineProps<{ title: string; eyebrow: string; image?: string }>()
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
        padding: image ? '0 32px 0 64px' : '0 80px',
        flex: 1,
      }"
    >
      <div :style="{ fontSize: image ? '32px' : '36px', color: '#5F655F', marginBottom: '24px' }">
        {{ eyebrow }}
      </div>
      <div :style="{ fontSize: image ? '72px' : '88px', fontWeight: 600, color: '#141614', lineHeight: 1.1 }">
        {{ title }}
      </div>
    </div>
    <div
      v-if="image"
      :style="{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        width: '600px',
        height: '470px',
        marginRight: '48px',
        padding: '24px',
        background: '#A5C8D1',
        borderRadius: '24px',
      }"
    >
      <img :src="image" :style="{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }" />
    </div>
  </div>
</template>
