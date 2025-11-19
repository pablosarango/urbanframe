import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs';

export class CameraCapture {
    private videoElement: HTMLVideoElement;
    private outputCanvas: HTMLCanvasElement;
    private stream: MediaStream | null = null;
    private bodyPixModel: bodyPix.BodyPix | null = null;
    private backgroundImage: HTMLImageElement | null = null;
    private animationFrame: number | null = null;
    private isProcessingActive: boolean = false;

    constructor(videoId: string, canvasId: string) {
        this.videoElement = document.getElementById(videoId) as HTMLVideoElement;
        this.outputCanvas = document.getElementById(canvasId) as HTMLCanvasElement;

        if (!this.videoElement || !this.outputCanvas) {
            console.error("No se encontraron los elementos de video o canvas");
        }
    }

    public async initialize(): Promise<boolean> {
        try {
            // console.log("Cargando modelo BodyPix...");
            // this.bodyPixModel = await bodyPix.load({
            //     architecture: 'MobileNetV1',
            //     outputStride: 16,
            //     multiplier: 0.75,
            //     quantBytes: 2
            // });
            // console.log("Modelo BodyPix cargado correctamente");

            console.log("Solicitando acceso a cámara...");
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });
            console.log("Acceso a cámara concedido");

            this.videoElement.srcObject = this.stream;
            await this.videoElement.play();

            // Configurar tamaño del canvas
            this.outputCanvas.width = this.videoElement.videoWidth;
            this.outputCanvas.height = this.videoElement.videoHeight;

            console.log("Video inicializado:",
                this.videoElement.videoWidth, "x",
                this.videoElement.videoHeight);

            return true;
        } catch (e) {
            console.error("Error al inicializar:", e);
            return false;
        }
    }

    public async setBackground(imageUrl: string): Promise<void> {
        console.log("Cargando fondo:", imageUrl);

        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                console.log("Fondo cargado correctamente");
                this.backgroundImage = img;
                resolve();
            };
            img.onerror = (err) => {
                console.warn("Error al cargar el fondo:", err);
                this.backgroundImage = null;
                resolve(); // Resolvemos igual para no romper el flujo
            };
            img.src = imageUrl;
        });
    }

    public startRealTimeProcessing(): void {
        console.log("Iniciando procesamiento en tiempo real");
        this.isProcessingActive = true;
        this.processFrame();
    }

    public stopRealTimeProcessing(): void {
        console.log("Deteniendo procesamiento");
        this.isProcessingActive = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    private async processFrame() {
        if (!this.isProcessingActive) return;
        if (!this.videoElement || !this.outputCanvas) return;

        try {
            // Dibuja el video primero en el canvas (como fallback)
            const ctx = this.outputCanvas.getContext('2d');
            if (!ctx) return;

            // Si el modelo no está listo o no hay fondo, muestra solo el video
            if (!this.bodyPixModel || !this.backgroundImage) {
                ctx.drawImage(this.videoElement, 0, 0);
                this.animationFrame = requestAnimationFrame(() => this.processFrame());
                return;
            }

            // Realizar segmentación de la persona
            const segmentation = await this.bodyPixModel.segmentPerson(this.videoElement, {
                flipHorizontal: false,
                internalResolution: 'medium',
                segmentationThreshold: 0.7
            });

            // Dibuja el fondo
            ctx.drawImage(
                this.backgroundImage,
                0, 0,
                this.outputCanvas.width,
                this.outputCanvas.height
            );

            // Crea un canvas temporal para obtener los píxeles del video
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.outputCanvas.width;
            tempCanvas.height = this.outputCanvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) return;

            // Dibuja el video en el canvas temporal
            tempCtx.drawImage(this.videoElement, 0, 0);
            const videoImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

            // Obtén la imagen del fondo para manipularla
            const backgroundImageData = ctx.getImageData(0, 0, this.outputCanvas.width, this.outputCanvas.height);

            // Combina la persona segmentada con el fondo
            for (let i = 0; i < segmentation.data.length; i++) {
                // Si el pixel pertenece a la persona (1), cópialo del video
                if (segmentation.data[i] === 1) {
                    const pixelIndex = i * 4;
                    backgroundImageData.data[pixelIndex + 0] = videoImageData.data[pixelIndex + 0]; // R
                    backgroundImageData.data[pixelIndex + 1] = videoImageData.data[pixelIndex + 1]; // G
                    backgroundImageData.data[pixelIndex + 2] = videoImageData.data[pixelIndex + 2]; // B
                    backgroundImageData.data[pixelIndex + 3] = videoImageData.data[pixelIndex + 3]; // A
                }
            }

            // Dibuja el resultado combinado
            ctx.putImageData(backgroundImageData, 0, 0);
        } catch (error) {
            console.error("Error al procesar frame:", error);

            // En caso de error, intentar mostrar al menos el video original
            try {
                const ctx = this.outputCanvas.getContext('2d');
                if (ctx && this.videoElement) {
                    ctx.drawImage(this.videoElement, 0, 0);
                }
            } catch (e) {
                console.error("Error incluso al intentar mostrar video original:", e);
            }
        }

        // Continúa el bucle de animación sin importar qué
        this.animationFrame = requestAnimationFrame(() => this.processFrame());
    }

    public captureImage(): string | null {
        try {
            return this.outputCanvas.toDataURL("image/jpeg");
        } catch (e) {
            console.error("Error al convertir canvas a imagen:", e);
            return null;
        }
    }

    public stopCamera(): void {
        this.stopRealTimeProcessing();
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.videoElement.srcObject = null;
    }
}