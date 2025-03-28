import {ref, onBeforeUnmount} from "vue";
import JSZip from "jszip";
import * as FileSaver from "file-saver";

enum CameraFacingMode {
    USER = "user",
    ENVIRONMENT = "environment",
}

export const useWebcam = () => {
    const videoRef = ref<HTMLVideoElement | null>(null);
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const snapshots = ref<string[]>([]);
    const isWebcamActive = ref<boolean>(false);
    const currentCamera = ref<CameraFacingMode>(CameraFacingMode.USER);

    const isMobile = ref<boolean>(false);
    const videoWidth = 1920;
    const videoHeight = 1080;

    const detectMobile = (): boolean => {
        return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    };

    onMounted(() => {
        isMobile.value = detectMobile();
    });

    const startWebcam = async (facingMode: CameraFacingMode = CameraFacingMode.USER): Promise<void> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: videoWidth,
                    height: videoHeight,
                    facingMode,
                },
            });

            if (videoRef.value) {
                videoRef.value.srcObject = stream;
                videoRef.value.play();
                isWebcamActive.value = true;
            }
        } catch (error) {
            console.error("Error accessing webcam:", error);
            isWebcamActive.value = false;
        }
    };

    const stopWebcam = (): void => {
        const stream = videoRef.value?.srcObject as MediaStream;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach((track) => track.stop());
        }
        isWebcamActive.value = false;
        clearSnapshots();
    };


    const toggleCamera = async (): Promise<void> => {
        stopWebcam();
        currentCamera.value = currentCamera.value === CameraFacingMode.USER ? CameraFacingMode.ENVIRONMENT : CameraFacingMode.USER;
        await startWebcam(currentCamera.value);
    };

    const clearSnapshots = (): void => {
        snapshots.value = [];
    };

    const takeSnapshot = (): void => {
        if (!videoRef.value || !canvasRef.value) return;

        const context = canvasRef.value.getContext("2d");
        if (context) {
            context.drawImage(
                videoRef.value,
                0,
                0,
                canvasRef.value.width,
                canvasRef.value.height
            );
            snapshots.value.push(canvasRef.value.toDataURL("image/png"));
        }
    };

    const downloadAllSnapshots = async (): Promise<void> => {
        const zip = new JSZip();

        snapshots.value.forEach((img, index) => {
            const imgData = img.split(",")[1];
            zip.file(`snapshot${index + 1}.png`, imgData, {base64: true});
        });

        zip.generateAsync({type: "blob"}).then((content) => {
            FileSaver.saveAs(content, "snapshots.zip");
        });
    };

    const removeSnapshot = (index: number): void => {
        snapshots.value.splice(index, 1);
    };

    onBeforeUnmount(stopWebcam);

    return {
        videoRef,
        canvasRef,
        snapshots,
        isWebcamActive,
        isMobile,
        startWebcam,
        stopWebcam,
        toggleCamera,
        takeSnapshot,
        removeSnapshot,
        downloadAllSnapshots,
    };
};