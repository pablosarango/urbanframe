import { CameraCapture } from "./capture/camera-capture";


const backgrounds = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80', // Playa
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80', // Montaña
  'https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80', // Bosque
  'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80', // Ciudad
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'  // Espacio
];


// Ejemplo de uso con fondo personalizado
document.addEventListener('DOMContentLoaded', () => {
  const cameraCapture = new CameraCapture();
  let modelLoading = false;

  // Referencias a elementos DOM
  const startCameraButton = document.getElementById('start-camera-button') as HTMLButtonElement;
  const captureButton = document.getElementById('capture-button') as HTMLButtonElement;
  const backgroundSelector = document.getElementById('background-selector') as HTMLSelectElement;
  const videoElement = document.getElementById('camera-video') as HTMLVideoElement;
  const outputCanvas = document.getElementById('output-canvas') as HTMLCanvasElement;
  const capturedImage = document.getElementById('captured-image') as HTMLImageElement;
  const loadingIndicator = document.getElementById('loading-indicator') as HTMLDivElement;

  // Inicialmente deshabilitamos botones
  if (captureButton) {
    captureButton.disabled = true;
  }

  if (backgroundSelector) {
    backgroundSelector.disabled = true;
  }

  // Manejador para iniciar la cámara
  if (startCameraButton) {
    startCameraButton.addEventListener('click', async () => {
      if (modelLoading) return;

      modelLoading = true;

      // Mostrar indicador de carga
      if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
      }

      // Inicializar cámara y modelo
      const success = await cameraCapture.initialize('camera-video', 'capture-canvas', 'output-canvas');

      modelLoading = false;

      if (success) {
        console.log('Cámara y modelo inicializados correctamente');

        // Ocultar indicador de carga
        if (loadingIndicator) {
          loadingIndicator.style.display = 'none';
        }

        // Establecer fondo predeterminado
        await cameraCapture.setBackground('backgrounds/background1.jpg');

        // Iniciar procesamiento en tiempo real
        cameraCapture.startRealTimeProcessing();

        // Habilitamos el botón de captura y selector de fondos
        if (captureButton) {
          captureButton.disabled = false;
        }

        if (backgroundSelector) {
          backgroundSelector.disabled = false;
        }

        // Ocultamos el botón de iniciar cámara
        startCameraButton.style.display = 'none';

        // Mostramos el canvas de salida
        if (outputCanvas) {
          outputCanvas.style.display = 'block';
        }

        // Ocultamos el video (ya no lo necesitamos mostrar directamente)
        if (videoElement) {
          videoElement.style.display = 'none';
        }
      } else {
        console.error('No se pudo inicializar la cámara o el modelo');

        // Ocultar indicador de carga
        if (loadingIndicator) {
          loadingIndicator.style.display = 'none';
        }
      }
    });
  }

  // Manejador para el selector de fondos
  if (backgroundSelector) {
    backgroundSelector.addEventListener('change', async () => {
      const selectedValue = backgroundSelector.value;
      if (selectedValue) {
        await cameraCapture.setBackground(`backgrounds/${selectedValue}`);
      }
    });
  }

  // Manejador para capturar una foto
  if (captureButton) {
    captureButton.addEventListener('click', () => {
      const imageData = cameraCapture.captureImage();

      if (imageData) {
        // Mostrar la imagen capturada
        if (capturedImage) {
          capturedImage.src = imageData;
          capturedImage.style.display = 'block';
        }

        // Detener la cámara y el procesamiento
        cameraCapture.stopCamera();

        // Ocultar el canvas de salida
        if (outputCanvas) {
          outputCanvas.style.display = 'none';
        }

        // Mostrar de nuevo el botón de iniciar
        if (startCameraButton) {
          startCameraButton.style.display = 'block';
        }

        // Deshabilitar botones
        captureButton.disabled = true;
        if (backgroundSelector) {
          backgroundSelector.disabled = true;
        }
      }
    });
  }

  // Limpiar al cerrar la página
  window.addEventListener('beforeunload', () => {
    cameraCapture.stopCamera();
  });
});