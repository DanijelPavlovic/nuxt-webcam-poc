<script lang="ts" setup>
import {useWebcam} from "~/composables/useWebcam";

const {
  videoRef,
  canvasRef,
  startWebcam,
  stopWebcam,
  toggleCamera,
  takeSnapshot,
  removeSnapshot,
  downloadAllSnapshots,
  isWebcamActive,
  isMobile,
  snapshots,
} = useWebcam();
</script>

<template>
  <div class="flex flex-col items-center p-4 space-y-4 w-full">

    <video
        v-show="isWebcamActive" ref="videoRef" autoplay
        class="border rounded-lg shadow-lg w-full max-w-[640px] h-auto object-cover"/>

    <div v-if="!isWebcamActive" class="w-full h-[244px] sm:w-[640px] sm:h-[360px]">
      <USkeleton class="w-full h-full"/>
    </div>

    <canvas ref="canvasRef" width="640" height="480" class="hidden"/>

    <div class="flex gap-4 flex-wrap justify-center">
      <UButton v-if="isWebcamActive" icon="i-lucide-camera" class="justify-center sm:w-auto" @click="takeSnapshot">Take
        Snapshot
      </UButton>
      <UButton
          v-if="!isWebcamActive"
          icon="i-lucide-camera"
          color="secondary"
          class="justify-center sm:w-auto"
          @click="() => startWebcam()"/>
      <UButton
          v-if="isWebcamActive"
          icon="i-lucide-camera-off"
          color="error"
          class="justify-center sm:w-auto"
          @click="() => stopWebcam()"/>
      <UButton
          v-if="isWebcamActive && isMobile"
          icon="i-lucide-switch-camera"
          color="primary"
          class="justify-center sm:w-auto"
          @click="toggleCamera"/>
    </div>

    <div class="w-full h-80 overflow-y-auto mt-4">
      <div class="flex justify-center pb-4">
        <UButton
            v-if="snapshots.length"
            icon="i-lucide-download"
            color="warning"
            class="justify-center"
            @click="downloadAllSnapshots">Download
          All
        </UButton>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 px-1 sm:px-24">
        <div v-for="(img, index) in snapshots" :key="index" class="relative">
          <img
              :src="img"
              class="w-full h-32 object-cover border rounded-lg shadow-md"
              alt="snapshot"
          >
          <div class="absolute bottom-2 right-2 flex gap-2">
            <a :href="img" download="snapshot.png">
              <UButton
                  icon="i-lucide-download"
                  size="xs"
                  variant="subtle"
                  color="primary"
                  class="p-2"/>
            </a>
            <UButton
                icon="i-lucide-trash"
                size="xs"
                variant="subtle"
                color="error"
                class="p-2"
                @click="removeSnapshot(index)"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>