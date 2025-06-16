import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs';

/**
 * Utilidad para acceso a la cámara y captura de imágenes con cambio de fondo
 */
export class CameraCapture {
    private videoElement: HTMLVideoElement | null = null;
    private canvasElement: HTMLCanvasElement | null = null;
    private outputCanvas: HTMLCanvasElement | null = null;
    private stream: MediaStream | null = null;
    private bodyPixModel: bodyPix.BodyPix | null = null;
    private backgroundImage: HTMLImageElement | null = null;
    private animationFrame: number | null = null;
    private isProcessingActive: boolean = false;

    /**
     * Inicializa el acceso a la cámara
     * @param videoElementId ID del elemento video para mostrar la transmisión
     * @param canvasElementId ID del elemento canvas para capturar la imagen
     * @param outputCanvasId ID del elemento canvas donde se mostrará el resultado procesado
     */
    public async initialize(
        videoElementId: string,
        canvasElementId: string,
        outputCanvasId: string
    ): Promise<boolean> {
        this.videoElement = document.getElementById(videoElementId) as HTMLVideoElement;
        this.canvasElement = document.getElementById(canvasElementId) as HTMLCanvasElement;
        this.outputCanvas = document.getElementById(outputCanvasId) as HTMLCanvasElement;

        if (!this.videoElement || !this.canvasElement || !this.outputCanvas) {
            console.error('No se encontraron los elementos necesarios');
            return false;
        }

        try {
            // Cargar el modelo de BodyPix
            console.log('Cargando modelo BodyPix...');
            this.bodyPixModel = await bodyPix.load({
                architecture: 'MobileNetV1',
                outputStride: 16,
                multiplier: 0.75,
                quantBytes: 2
            });
            console.log('Modelo BodyPix cargado');

            // Solicitar acceso a la cámara del usuario
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },
                audio: false
            });

            // Conectar el stream de la cámara al elemento video
            this.videoElement.srcObject = this.stream;
            await this.videoElement.play();

            // Configurar tamaño del canvas de salida
            this.outputCanvas.width = this.videoElement.videoWidth;
            this.outputCanvas.height = this.videoElement.videoHeight;

            return true;
        } catch (error) {
            console.error('Error al inicializar la cámara o modelo:', error);
            return false;
        }
    }

    /**
     * Establece la imagen de fondo para reemplazar el fondo real
     * @param imageUrl URL de la imagen a usar como fondo
     */
    public async setBackground(imageUrl: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.backgroundImage = img;
                resolve();
            };
            img.onerror = () => {
                reject(new Error(`Error al cargar la imagen de fondo: ${imageUrl}`));
            };
            img.src = imageUrl;
        });
    }

    /**
     * Inicia el procesamiento en tiempo real para el cambio de fondo
     */
    public startRealTimeProcessing(): void {
        if (!this.bodyPixModel || !this.videoElement || !this.outputCanvas) {
            console.error('No se ha inicializado correctamente');
            return;
        }

        this.isProcessingActive = true;
        this.processFrame();
    }

    /**
     * Detiene el procesamiento en tiempo real
     */
    public stopRealTimeProcessing(): void {
        this.isProcessingActive = false;
        if (this.animationFrame !== null) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    /**
   * Procesa un frame del video aplicando la segmentación y el cambio de fondo
   */
    private async processFrame(): Promise<void> {
        if (!this.isProcessingActive || !this.videoElement || !this.bodyPixModel || !this.outputCanvas) {
            return;
        }

        try {
            // Realizar segmentación de la persona
            const segmentation = await this.bodyPixModel.segmentPerson(this.videoElement, {
                flipHorizontal: false,
                internalResolution: 'medium',
                segmentationThreshold: 0.7
            });

            const context = this.outputCanvas.getContext('2d');
            if (!context) return;

            // Dibujar el fondo
            if (this.backgroundImage) {
                context.drawImage(
                    this.backgroundImage,
                    0, 0,
                    this.outputCanvas.width,
                    this.outputCanvas.height
                );
            } else {
                // Si no hay fondo, usar un color sólido
                context.fillStyle = '#C0C0C0';
                context.fillRect(0, 0, this.outputCanvas.width, this.outputCanvas.height);
            }

            // Crear una máscara de segmentación
            const mask = bodyPix.toMask(
                segmentation,
                { r: 0, g: 0, b: 0, a: 0 },  // Color para persona (transparente)
                { r: 0, g: 0, b: 0, a: 255 } // Color para fondo (opaco negro)
            );

            // Crear un canvas temporal para la máscara
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.outputCanvas.width;
            tempCanvas.height = this.outputCanvas.height;
            const tempContext = tempCanvas.getContext('2d');

            if (!tempContext) return;

            // Colocar los datos de la máscara en el canvas temporal
            tempContext.putImageData(mask, 0, 0);

            // Usar el canvas temporal como máscara
            context.globalCompositeOperation = 'destination-in';
            context.drawImage(tempCanvas, 0, 0);

            // Dibujar la persona desde el video
            context.globalCompositeOperation = 'source-over';
            context.drawImage(this.videoElement, 0, 0);

            // Continuar el bucle de animación
            this.animationFrame = requestAnimationFrame(() => this.processFrame());
        } catch (error) {
            console.error('Error al procesar frame:', error);
        }
    }

    /**
     * Captura una imagen con el fondo cambiado
     * @returns Datos de la imagen con fondo cambiado codificados en base64 o null si falla
     */
    public captureImage(): string | null {
        if (!this.outputCanvas) {
            console.error('Canvas no inicializado');
            return null;
        }

        try {
            return this.outputCanvas.toDataURL('image/jpeg');
        } catch (error) {
            console.error('Error al convertir canvas a URL de datos:', error);
            return null;
        }
    }

    /**
     * Detiene el acceso a la cámara y limpia recursos
     */
    public stopCamera(): void {
        // Detener procesamiento en tiempo real
        this.stopRealTimeProcessing();

        // Detener la cámara
        if (this.stream) {
            const tracks = this.stream.getTracks();
            tracks.forEach(track => track.stop());
            this.stream = null;
        }

        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
    }
}