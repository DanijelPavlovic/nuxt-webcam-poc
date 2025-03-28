<script lang="ts" setup>
import {ref, onBeforeUnmount} from 'vue';
import JSZip from 'jszip';
import {saveAs} from 'file-saver';

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const snapshots = ref<string[]>([]);
const isWebcamActive = ref<boolean>(false);

const videoWidth = 1920;
const videoHeight = 1080;

const startWebcam = async (): Promise<void> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({video: {width: videoWidth, height: videoHeight}});
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      isWebcamActive.value = true;
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
  clearSnapshots();
};

const clearSnapshots = (): void => {
  snapshots.value = [];
};

const takeSnapshot = (): void => {
  if (!videoRef.value || !canvasRef.value) return;

  const context = canvasRef.value.getContext('2d');
  if (context) {
    context.drawImage(videoRef.value, 0, 0, canvasRef.value.width, canvasRef.value.height);
    snapshots.value.push(canvasRef.value.toDataURL('image/png'));
  }
};

const downloadAllSnapshots = async (): Promise<void> => {
  const zip = new JSZip();

  snapshots.value.forEach((img, index) => {
    const imgData = img.split(',')[1];
    zip.file(`snapshot${index + 1}.png`, imgData, {base64: true});
  });

  zip.generateAsync({type: 'blob'}).then(content => {
    saveAs(content, 'snapshots.zip');
  });
};

onBeforeUnmount(stopWebcam);
</script>

<template>
  <div class="flex flex-col items-center p-4 space-y-4">

    <video
        v-show="isWebcamActive" ref="videoRef" autoplay
        class="border rounded-lg shadow-lg w-full max-w-[640px] h-auto object-cover"/>

    <div v-if="!isWebcamActive" class="w-full sm:w-[640px] sm:h-[480px] h-[240px]">
      <USkeleton class="w-full h-full"/>
    </div>

    <canvas ref="canvasRef" width="640" height="480" class="hidden"/>

    <div class="flex gap-4 flex-wrap justify-center">
      <UButton v-if="isWebcamActive" @click="takeSnapshot" class="justify-center sm:w-auto">Take Snapshot</UButton>
      <UButton v-if="!isWebcamActive" color="secondary" @click="startWebcam" class="justify-center sm:w-auto">Start
        Webcam
      </UButton>
      <UButton v-if="isWebcamActive" color="error" @click="stopWebcam" class="justify-center sm:w-auto">Stop Webcam
      </UButton>
    </div>

    <div class="w-full h-80 overflow-y-auto mt-4">
      <div class="flex justify-center pb-4">
        <UButton v-if="snapshots.length" color="warning" class="justify-center" @click="downloadAllSnapshots">Download
          snapshots
        </UButton>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="(img, index) in snapshots" :key="index" class="relative">
          <img
              :src="img"
              class="w-full h-32 object-cover border rounded-lg shadow-md"
              alt="snapshot"
          >
          <a :href="img" download="snapshot.png" class="absolute bottom-2 right-2">
            <UButton icon="i-lucide-download" size="xs" variant="subtle" color="primary" class="p-2"/>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>