<script lang="ts" setup>
import { ref, onBeforeUnmount } from 'vue';

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const snapshots = ref<string[]>([]);
const isWebcamActive = ref<boolean>(false);

const startWebcam = async (): Promise<void> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      isWebcamActive.value = true;
      console.log('Webcam started:', isWebcamActive.value); // Check if the webcam starts
    }
  } catch (error) {
    console.error('Error accessing webcam:', error);
    isWebcamActive.value = false;
  }
};

const stopWebcam = (): void => {
  const stream = videoRef.value?.srcObject as MediaStream;
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
  }
  isWebcamActive.value = false;
  clearSnapshots()
};

const clearSnapshots = (): void => {
  snapshots.value = [];
}

const takeSnapshot = (): void => {
  if (!videoRef.value || !canvasRef.value) return;

  const context = canvasRef.value.getContext('2d');
  if (context) {
    context.drawImage(videoRef.value, 0, 0, canvasRef.value.width, canvasRef.value.height);
    snapshots.value.push(canvasRef.value.toDataURL('image/png'));
  }
};

onBeforeUnmount(stopWebcam);
</script>

<template>
  <div class="flex flex-col items-center p-4 space-y-4">

    <video v-show="isWebcamActive" ref="videoRef" autoplay class="border rounded-lg shadow-lg w-full max-w-[640px] h-auto object-cover"/>
    <div v-if="!isWebcamActive" class="grid gap-2">
      <USkeleton class="w-[640px] h-[480px]" />
    </div>

    <canvas ref="canvasRef" width="640" height="480" class="hidden"></canvas>

    <div class="flex gap-4">
      <UButton v-if="isWebcamActive" @click="takeSnapshot">Take Snapshot</UButton>
      <UButton v-if="!isWebcamActive" color="secondary" @click="startWebcam">Start Webcam</UButton>
      <UButton v-if="isWebcamActive" color="error" @click="stopWebcam">Stop Webcam</UButton>
    </div>

    <div class="w-full h-80 overflow-y-auto mt-4">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <img
            v-for="(img, index) in snapshots" :key="index" :src="img"
            class="w-full h-32 object-cover border rounded-lg shadow-md" alt="snapshot">
      </div>
    </div>
  </div>
</template>