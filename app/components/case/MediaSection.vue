<script setup lang="ts">
import type { Project } from '~/types/project'

const props = defineProps<{ project: Project }>()
const video = computed(() => props.project.links.video)
// Set only when the project shows its video (see hasVideo).
const videoSrc = computed(() => (hasVideo(props.project) ? props.project.links.video.src : undefined))
</script>

<template>
  <div>
    <template v-if="videoSrc">
      <MediaStage id="video" class="stage--video">
        <BrowserFrame label="Walkthrough">
          <CaseVideoPlayer
            :src="videoSrc"
            :poster="video.poster"
            :captions="video.captions"
            :label="`${project.name} walkthrough video`"
          />
        </BrowserFrame>
      </MediaStage>
      <!-- Below the stage, as in v11: the text alternative for a video with no sound. -->
      <p v-if="video.description" class="video-note">{{ video.description }}</p>
    </template>
    <CaseScreenshotGallery :items="project.caseStudy.gallery" :frame-label="project.frameLabel" />
  </div>
</template>

<style scoped>
.stage.stage--video { margin-top: var(--s-5); padding: clamp(10px, 2.4vw, 28px); }
.video-note { margin-top: var(--s-3); font-size: var(--t-small); color: var(--ink-3); }
</style>
