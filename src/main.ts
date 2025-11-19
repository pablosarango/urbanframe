import { CameraCapture } from "./capture/camera-capture";
import { i18n } from "./i18n/i18n-manager.js";

// interface BackgroundOption {
//   id: number;
//   name: string;
//   path: string;
//   thumbnailPath: string;
// }

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:3000/api';


let inactivityTimerId: number | null = null;
let inactivityWarningShown = false;
const INACTIVITY_TIMEOUT_MS = 60000; //3 * 60 * 1000; // 3 minutos en milisegundos
const INACTIVITY_WARNING_MS = 30 * 1000; // Mostrar advertencia 30 segundos antes
const REDIRECT_URL = 'https://turismoastorga.es/?activar_totem=1'; // URL a donde redirigir por inactividad

// Función para crear la cookie antes de la redirección
function createTotemCookie() {
  const cookieValue = "totem_activo=verificado; path=/; max-age=31536000"; // 1 año en segundos
  document.cookie = cookieValue;
  console.log('Cookie creada:', cookieValue);
}

// Función para probar la redirección (solo para desarrollo)
function testInactivityRedirect() {
  console.log('Probando redirección por inactividad...');
  createTotemCookie();
  
  // Verificar que la cookie se creó
  console.log('Cookies actuales:', document.cookie);
  
  // Simular redirección en desarrollo (comentar en producción)
  // window.location.href = REDIRECT_URL;
  alert(`Redirección a: ${REDIRECT_URL}\nCookie creada: totem_activo=verificado`);
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize internationalization
  i18n.updateTexts();

  // Hacer la función de prueba disponible globalmente (solo para desarrollo)
  (window as any).testInactivityRedirect = testInactivityRedirect;
  console.log('Función de prueba disponible: testInactivityRedirect()');

  // Instancias DOM
  const cameraCapture = new CameraCapture("camera-video", "output-canvas");
  const startBtn = document.getElementById("start-camera-button") as HTMLButtonElement;
  const captureBtn = document.getElementById("capture-button") as HTMLButtonElement;
  const img = document.getElementById("captured-image") as HTMLImageElement;
  const outputCanvas = document.getElementById("output-canvas") as HTMLCanvasElement;
  const backgroundSelector = document.getElementById("background-selector") as HTMLDivElement;
  // const thumbnailsContainer = document.querySelector(".thumbnails-container") as HTMLDivElement;
  const photoTimer = document.getElementById("photo-timer") as HTMLDivElement;
  const timerCount = document.querySelector(".timer-count") as HTMLSpanElement;
  const sharePhotoBtn = document.getElementById("share-photo-button") as HTMLButtonElement;
  const validationModal = document.getElementById("validation-modal") as HTMLDivElement;
  const closeModal = document.querySelector(".close-modal") as HTMLSpanElement;
  const validationForm = document.getElementById("validation-form") as HTMLFormElement;
  const emailInput = document.getElementById("email-input") as HTMLInputElement;
  const sendOtpButton = document.getElementById("send-otp-button") as HTMLButtonElement;
  const otpSection = document.getElementById("otp-section") as HTMLDivElement;
  const otpInput = document.getElementById("otp-input") as HTMLInputElement;
  const validateOtpButton = document.getElementById("validate-otp-button") as HTMLButtonElement;
  const submitFormButton = document.getElementById("submit-form-button") as HTMLButtonElement;
  const adultCheck = document.getElementById('adult-check') as HTMLInputElement;
  const privacyCheck = document.getElementById('privacy-check') as HTMLInputElement;
  const successAnimation = document.getElementById("success-animation") as HTMLDivElement;
  const uploadProgressContainer = document.getElementById('upload-progress-container') as HTMLDivElement;
  const uploadProgress = document.getElementById('upload-progress') as HTMLDivElement;
  const uploadStatus = document.getElementById('upload-status') as HTMLDivElement;
  const additionalEmailSection = document.getElementById('additional-email-section') as HTMLDivElement;
  const additionalEmailInput = document.getElementById('additional-email-input') as HTMLInputElement;
  const shareTimerContainer = document.getElementById('share-timer-container') as HTMLDivElement;
  const shareTimerBar = document.getElementById('share-timer-bar') as HTMLDivElement;
  const shareTimerText = document.getElementById('share-timer-text') as HTMLDivElement;



  let shareTimerId: number | null = null;
  const SHARE_TIMEOUT_SECONDS = 20;

  let otpExpirationTimer: number | null = null;

  // Variable para el temporizador
  let countdownTimer: number | null = null;
  const TIMER_SECONDS = 5; // Duración del temporizador en segundos

  // Variables para el estado de validación
  let emailValidated = false;
  let otpValidated = false;

  // Definir opciones de fondos disponibles
  // const backgroundOptions: BackgroundOption[] = [
  //   {
  //     id: 1,
  //     name: "Playa",
  //     path: "backgrounds/background1.jpg",
  //     thumbnailPath: "backgrounds/thumbnails/background1_thumb.jpg"
  //   },
  //   {
  //     id: 2,
  //     name: "Ciudad",
  //     path: "backgrounds/background2.jpg",
  //     thumbnailPath: "backgrounds/thumbnails/background2_thumb.jpg"
  //   },
  //   {
  //     id: 3,
  //     name: "Montañas",
  //     path: "backgrounds/background3.jpg",
  //     thumbnailPath: "backgrounds/thumbnails/background3_thumb.jpg"
  //   },
  // ];

  // Fondo seleccionado actualmente
  // let selectedBackgroundId = 1;

  // Generar miniaturas de fondos
  // function createBackgroundThumbnails() {
  //   if (!thumbnailsContainer) return;

  //   thumbnailsContainer.innerHTML = '';

  //   backgroundOptions.forEach(background => {
  //     const thumbnail = document.createElement('img');
  //     thumbnail.src = background.thumbnailPath;
  //     thumbnail.alt = background.name;
  //     thumbnail.title = background.name;
  //     thumbnail.className = 'background-thumbnail';
  //     thumbnail.dataset.id = background.id.toString();

  //     // Marcar el seleccionado inicialmente
  //     if (background.id === selectedBackgroundId) {
  //       thumbnail.classList.add('selected');
  //     }

  //     // Evento de clic para cambiar el fondo
  //     thumbnail.addEventListener('click', async () => {
  //       // Actualizar selección visual
  //       document.querySelectorAll('.background-thumbnail').forEach(thumb => {
  //         thumb.classList.remove('selected');
  //       });
  //       thumbnail.classList.add('selected');

  //       // Actualizar fondo
  //       selectedBackgroundId = background.id;
  //       await cameraCapture.setBackground(background.path);
  //     });

  //     thumbnailsContainer.appendChild(thumbnail);
  //   });
  // }

  // Iniciar la detección de inactividad
  setupInactivityDetection();

  // Función para iniciar el temporizador
  function startPhotoTimer(): Promise<void> {
    return new Promise((resolve) => {
      // Reiniciar y mostrar el temporizador
      let secondsLeft = TIMER_SECONDS;
      if (timerCount) timerCount.textContent = secondsLeft.toString();
      if (photoTimer) photoTimer.classList.add('active');

      // Función para actualizar la cuenta regresiva
      const updateTimer = () => {
        secondsLeft--;

        if (timerCount) {
          timerCount.textContent = secondsLeft.toString();

          // Pequeña animación de escala en cada segundo
          timerCount.style.transform = 'scale(1.2)';
          setTimeout(() => {
            if (timerCount) timerCount.style.transform = 'scale(1)';
          }, 200);
        }

        if (secondsLeft <= 0) {
          // Terminó la cuenta regresiva
          if (countdownTimer) clearInterval(countdownTimer);
          if (photoTimer) photoTimer.classList.remove('active');
          resolve();
        }
      };

      // Iniciar intervalo para la cuenta regresiva
      countdownTimer = window.setInterval(updateTimer, 1000);
    });
  }

  // Función para cancelar el temporizador
  function cancelPhotoTimer() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
      if (photoTimer) photoTimer.classList.remove('active');
    }
  }

  // Iniciar cámara
  startBtn?.addEventListener('click', async () => {
    console.log("Iniciando cámara...");
    const ok = await cameraCapture.initialize();

    if (ok) {
      console.log("Cámara iniciada correctamente");

      // Mostrar el canvas y selector de fondos
      if (outputCanvas) outputCanvas.style.display = 'block';
      if (backgroundSelector) backgroundSelector.style.display = 'block';

      // Generar miniaturas
      // createBackgroundThumbnails();

      // Cargar fondo inicial y comenzar procesamiento
      // const initialBackground = backgroundOptions.find(bg => bg.id === selectedBackgroundId);
      // if (initialBackground) {
      //   await cameraCapture.setBackground(initialBackground.path);
      // }
      cameraCapture.startRealTimeProcessing();

      // Actualizar UI
      if (startBtn) startBtn.style.display = 'none';
      if (captureBtn) captureBtn.disabled = false;
    } else {
      console.error("Error al iniciar la cámara");
      alert("No se pudo iniciar la cámara. ¿Concediste permisos?");
    }
  });

  // Capturar foto con temporizador
  captureBtn?.addEventListener('click', async () => {
    // Deshabilitar botón para evitar clics múltiples
    if (captureBtn) captureBtn.disabled = true;

    try {
      // Iniciar temporizador
      await startPhotoTimer();

      // Capturar imagen cuando termine el temporizador
      const imageData = cameraCapture.captureImage();

      if (imageData && img) {
        img.src = imageData;
        img.style.display = 'block';

        // Ocultar canvas y selector de fondos, detener cámara
        if (outputCanvas) outputCanvas.style.display = 'none';
        if (backgroundSelector) backgroundSelector.style.display = 'none';
        cameraCapture.stopCamera();

        // Restaurar UI
        if (startBtn) startBtn.style.display = 'inline-block';
      }
    } catch (error) {
      console.error("Error al tomar la foto:", error);
      // Rehabilitar el botón de captura en caso de error
      if (captureBtn) captureBtn.disabled = false;
    }


    const imageData = cameraCapture.captureImage();

    if (imageData && img) {
      img.src = imageData;
      img.style.display = 'block';

      // Ocultar canvas y selector de fondos, detener cámara
      if (outputCanvas) outputCanvas.style.display = 'none';
      if (backgroundSelector) backgroundSelector.style.display = 'none';
      cameraCapture.stopCamera();

      // Restaurar UI
      if (startBtn) startBtn.style.display = 'inline-block';
      if (captureBtn) captureBtn.disabled = true;

      // Mostrar botón de compartir
      if (sharePhotoBtn) {
        sharePhotoBtn.style.display = 'block';

        //Iniciar temporizador de 20 segundos
        startShareTimer();
      }
    }

    resetInactivityTimer();


  });

  // Permitir cancelar el temporizador con Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && countdownTimer !== null) {
      cancelPhotoTimer();
      if (captureBtn) captureBtn.disabled = false;
    }
  });

  // También permitir cancelar haciendo clic en el temporizador
  photoTimer?.addEventListener('click', () => {
    cancelPhotoTimer();
    if (captureBtn) captureBtn.disabled = false;
  });

  // Limpiar al cerrar
  window.addEventListener('beforeunload', () => {
    cameraCapture.stopCamera();
    cancelPhotoTimer();
  });

  // Abrir el modal al hacer clic en compartir
  sharePhotoBtn?.addEventListener('click', () => {
    if (validationModal) validationModal.style.display = 'block';
    resetInactivityTimer();
  });

  // Cerrar el modal
  closeModal?.addEventListener('click', () => {
    if (validationModal) validationModal.style.display = 'none';
  });

  // Cerrar el modal al hacer clic fuera del contenido
  window.addEventListener('click', (event) => {
    if (event.target === validationModal) {
      validationModal.style.display = 'none';
    }
  });

  // Función para crear y mostrar notificaciones
  function showNotification(message: string, type: 'success' | 'error', container: HTMLElement) {
    // Eliminar notificaciones previas
    const oldNotifications = container.querySelectorAll('.notification');
    oldNotifications.forEach(notification => notification.remove());

    // Crear nueva notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Insertar al inicio del container
    container.insertBefore(notification, container.firstChild);

    // Eliminar después de 5 segundos
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  // Enviar OTP
  sendOtpButton?.addEventListener('click', async () => {
    const email = emailInput?.value.trim();

    // Validación simple de email
    if (!email || !email.includes('@') || email.length < 5) {
      showNotification('Por favor, introduce un correo electrónico válido.', 'error', validationForm);
      return;
    }

    // Llamada real a la API para generar OTP
    try {
      // Cambiar estado visual del botón
      sendOtpButton.disabled = true;
      sendOtpButton.textContent = i18n.t('sending') + '...';

      // Llamada a la API para generar OTP
      const response = await fetch(`${API_BASE_URL}/otp/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al generar OTP');
      }

      // Calcular tiempo de expiración para mostrarlo al usuario
      const expiresAt = new Date(data.expiresAt);
      const now = new Date();
      const minutesRemaining = Math.floor((expiresAt.getTime() - now.getTime()) / 60000);

      // Actualizar UI
      sendOtpButton.disabled = false;
      sendOtpButton.textContent = i18n.t('resendOtpCode');

      // Mostrar sección OTP
      if (otpSection) otpSection.classList.remove('hidden');

      // Deshabilitar campo de email
      if (emailInput) {
        emailInput.disabled = true;
      }

      if (data.expiresAt) {
        const expiresAt = new Date(data.expiresAt);
        startOTPExpirationCounter(expiresAt);
      }

      showNotification(`Código OTP enviado a tu correo. Válido por ${minutesRemaining} minutos.`, 'success', validationForm);
    } catch (error) {
      console.error('Error en API:', error);
      showNotification('Error al enviar el OTP. Inténtalo nuevamente.', 'error', validationForm);
      sendOtpButton.disabled = false;
      sendOtpButton.textContent = i18n.t('sendOtpCode');
    }
  });

  // Validar OTP
  validateOtpButton?.addEventListener('click', async () => {
    const otp = otpInput?.value.trim();
    const email = emailInput?.value.trim();

    // Validación básica
    if (!otp || otp.length < 4) {
      showNotification('Por favor, introduce un código OTP válido.', 'error', validationForm);
      return;
    }

    // Llamada real a la API para validar OTP
    try {
      // Cambiar estado visual del botón
      validateOtpButton.disabled = true;
      validateOtpButton.textContent = i18n.t('validating') + '...';

      // Llamada a la API para verificar OTP
      const response = await fetch(`${API_BASE_URL}/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (!response.ok) {
        // Manejar diferentes tipos de errores
        if (response.status === 400) {
          throw new Error('Código OTP inválido. Verifica e intenta nuevamente.');
        } else if (response.status === 410) {
          throw new Error('El código OTP ha expirado. Solicita uno nuevo.');
        } else {
          throw new Error(data.message || 'Error al validar el OTP');
        }
      }

      // OTP validado correctamente
      emailValidated = true;
      otpValidated = true;

      // Aplicar estilo validado pero mantener email deshabilitado
      if (emailInput) {
        emailInput.classList.add('validated');
      }

      if (otpInput) {
        otpInput.classList.add('validated');
        otpInput.disabled = true;
      }

      validateOtpButton.textContent = i18n.t('verified');
      validateOtpButton.disabled = true;

      // Activar botón de enviar
      // if (submitFormButton) submitFormButton.disabled = false;

      if (additionalEmailSection) {
        additionalEmailSection.classList.remove('hidden');
        setTimeout(() => {
          additionalEmailSection.classList.add('show');
        }, 50);
      }

      showNotification('Correo verificado correctamente.', 'success', validationForm);
    } catch (error) {
      console.error('Error en API:', error);
      let errorMessage = 'Error al validar el OTP. Inténtalo nuevamente.';

      // Si el error tiene un mensaje específico
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      showNotification(errorMessage, 'error', validationForm);
      validateOtpButton.disabled = false;
      validateOtpButton.textContent = i18n.t('validateOtp');
    }

    resetInactivityTimer();
  });

  // En el evento submit del formulario, actualiza la sección de envío:
  validationForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Validar checkboxes
    const adultCheck = document.getElementById('adult-check') as HTMLInputElement;
    const privacyCheck = document.getElementById('privacy-check') as HTMLInputElement;

    if (!adultCheck.checked || !privacyCheck.checked) {
      showNotification('Debes aceptar todos los términos para continuar.', 'error', validationForm);
      return;
    }

    if (!emailValidated || !otpValidated) {
      showNotification('Debes validar tu correo con un código OTP para continuar.', 'error', validationForm);
      return;
    }

    try {
      if (uploadProgressContainer) {
        uploadProgressContainer.classList.remove('hidden');
      }
      if (uploadStatus) {
        uploadStatus.textContent = i18n.t('preparingSend');
      }


      // Cambiar estado del botón
      submitFormButton.disabled = true;
      submitFormButton.textContent = i18n.t('send') + '...';

      // Obtener datos
      const email = emailInput?.value.trim();
      const additionalEmail = additionalEmailInput?.value.trim();
      const imageData = img?.src; // Imagen en base64

      if (!email || !imageData) {
        throw new Error('Faltan datos necesarios para enviar la imagen');
      }

      if (additionalEmail && !validateEmail(additionalEmail)) {
        showNotification('Por favor, introduce un correo adicional válido.', 'error', validationForm);
        return;
      }

      // 1. Convertir base64 a Blob
      const fetchResponse = await fetch(imageData);
      const blob = await fetchResponse.blob();

      // 2. Crear FormData y añadir campos
      const formData = new FormData();
      formData.append('email', email);

      if (additionalEmail) {
        formData.append('additionalEmail', additionalEmail);
      }

      formData.append('image', blob, 'urban-frame-photo.jpg');

      if (uploadStatus) {
        uploadStatus.textContent = i18n.t('uploadingPhoto');
      }
      if (uploadProgress) {
        uploadProgress.style.width = '30%';  // Progreso inicial
      }

      // Simular progreso durante la carga
      const progressInterval = setInterval(() => {
        if (uploadProgress) {
          const currentWidth = parseInt(uploadProgress.style.width || '30');
          // Incrementar gradualmente hasta 90% (reservamos el 100% para cuando termine)
          if (currentWidth < 90) {
            uploadProgress.style.width = `${currentWidth + 5}%`;
          }
        }
      }, 300);

      // 3. Enviar a la API
      const response = await fetch(`${API_BASE_URL}/images/send-photo`, {
        method: 'POST',
        body: formData // No es necesario especificar Content-Type, se establece automáticamente
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al enviar la imagen');
      }

      console.log('Imagen enviada con éxito:', data);

      // Limpiar intervalo de progreso
      clearInterval(progressInterval);

      // Completar la barra de progreso
      if (uploadProgress) {
        uploadProgress.style.width = '100%';
      }
      if (uploadStatus) {
        uploadStatus.textContent = i18n.t('imageSentCorrectly');
      }

      // Cerrar el modal del formulario
      validationModal.style.display = 'none';

      // Mostrar animación de celebración
      if (successAnimation) {
        successAnimation.classList.add('show');

        const celebrationMessage = document.querySelector('.celebration-message h2');
        if (celebrationMessage) {
          celebrationMessage.textContent = '¡Foto enviada!';
        }

        const celebrationDetail = document.querySelector('.celebration-message p');
        if (celebrationDetail) {
          // if (additionalEmail) {
          //   celebrationDetail.textContent = `Se ha enviado a ${email} y ${additionalEmail}`;
          // } else {
          //   celebrationDetail.textContent = `Se ha enviado a ${email}`;
          // }
          if (additionalEmail) {
            celebrationDetail.textContent = `Se ha enviado a ${additionalEmail}`;
          }
        }

        // Reproducir sonido
        // try {
        //   const audio = new Audio('/sounds/celebration.mp3');
        //   audio.volume = 0.5;
        //   audio.play().catch(e => console.log('No se pudo reproducir el audio', e));
        // } catch (e) {
        //   console.log('Audio no soportado en este navegador');
        // }

        // Ocultar la animación después de 5 segundos
        setTimeout(() => {
          successAnimation.classList.remove('show');

          // Reiniciar completamente la aplicación
          resetApplicationToInitialState();
        }, 5000);
      }

      // Reiniciar el formulario para futuros usos
      validationForm.reset();
      emailValidated = false;
      otpValidated = false;
      otpSection.classList.add('hidden');
      emailInput.classList.remove('validated');
      emailInput.disabled = false;
      otpInput.classList.remove('validated');
      otpInput.disabled = false;
      validateOtpButton.disabled = false;
      validateOtpButton.textContent = i18n.t('validateOtp');
      submitFormButton.disabled = true;
      submitFormButton.textContent = i18n.t('send');
      sendOtpButton.textContent = i18n.t('sendOtpCode');
      sendOtpButton.disabled = true;

      // Limpiar temporizador OTP si existe
      if (otpExpirationTimer !== null) {
        clearInterval(otpExpirationTimer);
        otpExpirationTimer = null;
      }

      setTimeout(() => {
        if (uploadProgressContainer) {
          uploadProgressContainer.classList.add('hidden');
        }
      }, 1000);

      if (additionalEmailInput) {
        additionalEmailInput.value = '';
      }
      if (additionalEmailSection) {
        additionalEmailSection.classList.remove('show');
        setTimeout(() => {
          additionalEmailSection.classList.add('hidden');
        }, 300);
      }

    } catch (error) {
      console.error('Error al enviar la imagen:', error);
      showNotification('Error al enviar la imagen. Inténtalo nuevamente.', 'error', validationForm);
      submitFormButton.disabled = false;
      submitFormButton.textContent = i18n.t('send');
      if (uploadProgressContainer) {
        uploadProgressContainer.classList.add('hidden');
      }
    }
  });

  // Función para verificar si los checkboxes están marcados
  function updateOTPButtonState() {
    if (sendOtpButton) {
      sendOtpButton.disabled = !(adultCheck?.checked && privacyCheck?.checked);
    }
  }

  if (sendOtpButton) {
    sendOtpButton.disabled = true;
  }

  adultCheck?.addEventListener('change', updateOTPButtonState);
  privacyCheck?.addEventListener('change', updateOTPButtonState);

  // Agregar evento para cerrar la animación al hacer clic
  successAnimation?.addEventListener('click', () => {
    successAnimation.classList.remove('show');
    resetApplicationToInitialState();
  });

  // Reiniciar la aplicación al estado inicial
  function resetApplicationToInitialState() {
    // Limpiar el temporizador si existe
    if (shareTimerId !== null) {
      clearInterval(shareTimerId);
      shareTimerId = null;
    }

    // Ocultar elementos del temporizador
    if (shareTimerContainer) {
      shareTimerContainer.style.display = 'none';
    }

    // Eliminar clase de urgencia si existe
    if (sharePhotoBtn && sharePhotoBtn.parentElement) {
      sharePhotoBtn.parentElement.classList.remove('urgent');
    }

    // Ocultar la imagen capturada
    if (img) {
      img.style.display = 'none';
      img.src = '';
    }

    // Ocultar el botón de compartir
    if (sharePhotoBtn) {
      sharePhotoBtn.style.display = 'none';
    }

    // Mostrar el botón de inicio de cámara
    if (startBtn) {
      startBtn.style.display = 'inline-block';
      startBtn.disabled = false;
    }

    // Reiniciar el botón de captura
    if (captureBtn) {
      captureBtn.disabled = true;
    }

    // Ocultar el selector de fondos
    if (backgroundSelector) {
      backgroundSelector.style.display = 'none';
    }

    // Asegurarnos que el canvas esté oculto
    if (outputCanvas) {
      outputCanvas.style.display = 'none';
    }

    // Crear un breve mensaje de reinicio
    // const resetMessage = document.createElement('div');
    // resetMessage.className = 'reset-message';
    // resetMessage.textContent = 'Reiniciando...';
    // document.body.appendChild(resetMessage);

    resetInactivityTimer();

    console.log('Aplicación reiniciada al estado inicial');
  }

  // Función para mostrar cuenta regresiva de expiración
  function startOTPExpirationCounter(expiresAt: Date) {
    // Crear o actualizar el elemento de contador si no existe
    let timerElement = document.getElementById('otp-timer');
    if (!timerElement) {
      timerElement = document.createElement('div');
      timerElement.id = 'otp-timer';
      timerElement.className = 'otp-timer';
      otpSection.insertBefore(timerElement, otpInput.parentNode!.nextSibling);
    }

    // Limpiar cualquier temporizador existente
    if (otpExpirationTimer !== null) {
      clearInterval(otpExpirationTimer);
    }

    // Actualizar el contador cada segundo
    otpExpirationTimer = window.setInterval(() => {
      const now = new Date();
      const timeLeft = expiresAt.getTime() - now.getTime();

      if (timeLeft <= 0) {
        // OTP expirado
        clearInterval(otpExpirationTimer!);
        timerElement.innerHTML = 'El código ha expirado. <a href="#" id="request-new-otp">Solicitar nuevo código</a>';
        timerElement.className = 'otp-timer expired';

        // Agregar evento al enlace
        document.getElementById('request-new-otp')?.addEventListener('click', (e) => {
          e.preventDefault();
          // Habilitar el email para edición si es necesario
          if (emailInput) {
            emailInput.disabled = false;
          }
          // Restablecer el botón de OTP
          if (sendOtpButton) {
            sendOtpButton.disabled = false;
            sendOtpButton.textContent = 'Enviar código OTP';
            sendOtpButton.click(); // Enviar automáticamente si se usa el mismo email
          }
        });
        return;
      }

      // Calcular minutos y segundos restantes
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);

      timerElement.textContent = `Tiempo restante: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }, 1000);
  }

  function validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Validar el correo adicional cuando cambie
  additionalEmailInput?.addEventListener('input', function () {
    const email = this.value.trim();

    if (email === '') {
      // Campo vacío es válido (es opcional)
      this.classList.remove('error');
      this.classList.remove('validated');
      return;
    }

    if (validateEmail(email)) {
      this.classList.remove('error');
      this.classList.add('validated');
      if (submitFormButton) submitFormButton.disabled = false;
    } else {
      this.classList.add('error');
      this.classList.remove('validated');
      if (submitFormButton) submitFormButton.disabled = true;
    }
  });

  function reset() {

    resetApplicationToInitialState();

    // Reiniciar el formulario para futuros usos
    validationForm.reset();
    emailValidated = false;
    otpValidated = false;
    otpSection.classList.add('hidden');
    emailInput.classList.remove('validated');
    emailInput.disabled = false;
    otpInput.classList.remove('validated');
    otpInput.disabled = false;
    validateOtpButton.disabled = false;
    validateOtpButton.textContent = 'Validar OTP';
    submitFormButton.disabled = true;
    submitFormButton.textContent = 'Enviar';
    sendOtpButton.textContent = 'Enviar código OTP';
    sendOtpButton.disabled = true;

    // Limpiar temporizador OTP si existe
    if (otpExpirationTimer !== null) {
      clearInterval(otpExpirationTimer);
      otpExpirationTimer = null;
    }

    setTimeout(() => {
      if (uploadProgressContainer) {
        uploadProgressContainer.classList.add('hidden');
      }
    }, 1000);

    if (additionalEmailInput) {
      additionalEmailInput.value = '';
    }
    if (additionalEmailSection) {
      additionalEmailSection.classList.remove('show');
      setTimeout(() => {
        additionalEmailSection.classList.add('hidden');
      }, 300);
    }
  }

  // Función para iniciar el temporizador
  function startShareTimer() {
    // Mostrar y resetear el temporizador
    if (shareTimerContainer) {
      shareTimerContainer.style.display = 'block';
    }

    if (shareTimerBar) {
      // Reset animation
      shareTimerBar.style.transition = 'none';
      shareTimerBar.style.transform = 'scaleX(1)';
      setTimeout(() => {
        shareTimerBar.style.transition = 'transform ' + SHARE_TIMEOUT_SECONDS + 's linear';
        shareTimerBar.style.transform = 'scaleX(0)';
      }, 50);
    }

    let timeLeft = SHARE_TIMEOUT_SECONDS;

    // Actualizar el texto del temporizador
    if (shareTimerText) {
      shareTimerText.textContent = timeLeft.toString();
    }

    // Limpiar cualquier temporizador existente
    if (shareTimerId !== null) {
      clearInterval(shareTimerId);
    }

    // Iniciar nuevo temporizador
    shareTimerId = window.setInterval(() => {
      timeLeft--;

      // Actualizar el texto
      if (shareTimerText) {
        shareTimerText.textContent = timeLeft.toString();
      }

      // Añadir clase de urgencia cuando queden 5 segundos o menos
      if (timeLeft <= 5 && sharePhotoBtn) {
        sharePhotoBtn.parentElement?.classList.add('urgent');
      }

      // Tiempo agotado
      if (timeLeft <= 0) {
        clearInterval(shareTimerId!);
        shareTimerId = null;

        // Mostrar mensaje de tiempo agotado
        // showTimeoutMessage();

        // Reiniciar la aplicación después de mostrar el mensaje
        setTimeout(() => {
          reset();
        }, 2000);
      }
    }, 1000);
  }

  // Función para mostrar mensaje de tiempo agotado
  // function showTimeoutMessage() {
  //   const timeoutMsg = document.createElement('div');
  //   timeoutMsg.className = 'timeout-message';
  //   timeoutMsg.textContent = 'Tiempo agotado';

  //   document.body.appendChild(timeoutMsg);

  //   setTimeout(() => {
  //     timeoutMsg.classList.add('show');
  //   }, 50);

  //   setTimeout(() => {
  //     timeoutMsg.classList.remove('show');
  //     setTimeout(() => {
  //       document.body.removeChild(timeoutMsg);
  //     }, 300);
  //   }, 1500);
  // }

  // Detener el temporizador cuando el usuario hace clic en "Compartir foto"
  sharePhotoBtn?.addEventListener('click', () => {
    // Detener el temporizador si existe
    if (shareTimerId !== null) {
      clearInterval(shareTimerId);
      shareTimerId = null;

      // Ocultar elementos del temporizador
      if (shareTimerContainer) {
        shareTimerContainer.style.display = 'none';
      }

      // Eliminar clase de urgencia si existe
      sharePhotoBtn.parentElement?.classList.remove('urgent');
    }

    // Código existente para abrir el modal
    if (validationModal) validationModal.style.display = 'block';
  });


});


// Función para mostrar advertencia de inactividad
function showInactivityWarning() {
  inactivityWarningShown = true;

  // Crear el elemento de advertencia si no existe
  let warningElement = document.getElementById('inactivity-warning');
  if (!warningElement) {
    warningElement = document.createElement('div');
    warningElement.id = 'inactivity-warning';
    warningElement.className = 'inactivity-warning';

    // Crear contenido de la advertencia
    const warningContent = document.createElement('div');
    warningContent.className = 'warning-content';

    const warningTitle = document.createElement('h3');
    warningTitle.textContent = '¿Sigues ahí?';

    const warningText = document.createElement('p');
    warningText.textContent = 'La sesión finalizará en 30 segundos por inactividad';

    const warningTimer = document.createElement('div');
    warningTimer.id = 'warning-timer';
    warningTimer.className = 'warning-timer';
    warningTimer.textContent = '30';

    const stayButton = document.createElement('button');
    stayButton.className = 'btn-action';
    stayButton.textContent = 'Seguir aquí';
    stayButton.onclick = function () {
      resetInactivityTimer();
    };

    // Armar la estructura
    warningContent.appendChild(warningTitle);
    warningContent.appendChild(warningText);
    warningContent.appendChild(warningTimer);
    warningContent.appendChild(stayButton);
    warningElement.appendChild(warningContent);

    // Añadir al documento
    document.body.appendChild(warningElement);

    // Iniciar el temporizador visual de cuenta regresiva
    startWarningCountdown();
  } else {
    // Si ya existe, solo mostrar
    warningElement.style.display = 'flex';
    startWarningCountdown();
  }

  // Añadir la clase para mostrar con animación
  setTimeout(() => {
    warningElement.classList.add('show');
  }, 10);
}

// Función para iniciar cuenta regresiva visual
function startWarningCountdown() {
  const warningTimer = document.getElementById('warning-timer');
  if (!warningTimer) return;

  let timeLeft = 30; // 30 segundos
  warningTimer.textContent = timeLeft.toString();

  const countdownInterval = setInterval(() => {
    timeLeft--;
    warningTimer.textContent = timeLeft.toString();

    // Efecto visual cuando queda poco tiempo
    if (timeLeft <= 10) {
      warningTimer.classList.add('urgent');
    }

    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);
}

// Función para ocultar la advertencia
function hideInactivityWarning() {
  inactivityWarningShown = false;

  const warningElement = document.getElementById('inactivity-warning');
  if (warningElement) {
    warningElement.classList.remove('show');

    // Esperar a que termine la animación antes de ocultar completamente
    setTimeout(() => {
      warningElement.style.display = 'none';

      // Resetear cualquier elemento de estado
      const warningTimer = document.getElementById('warning-timer');
      if (warningTimer) {
        warningTimer.classList.remove('urgent');
      }
    }, 300);
  }
}

// Función para reiniciar el temporizador de inactividad
function resetInactivityTimer() {
  // Limpiar cualquier temporizador existente
  if (inactivityTimerId !== null) {
    clearTimeout(inactivityTimerId);
    inactivityTimerId = null;
  }

  // Ocultar la advertencia si estaba visible
  if (inactivityWarningShown) {
    hideInactivityWarning();
  }

  // Configurar nuevo temporizador
  inactivityTimerId = window.setTimeout(() => {
    // Mostrar advertencia cuando queden 30 segundos
    showInactivityWarning();

    // Configurar la redirección final después de la advertencia
    inactivityTimerId = window.setTimeout(() => {
      // Crear la cookie antes de redirigir
      createTotemCookie();
      
      // Redirigir después de crear la cookie
      window.location.href = REDIRECT_URL;
    }, INACTIVITY_WARNING_MS);
  }, INACTIVITY_TIMEOUT_MS - INACTIVITY_WARNING_MS);
}

// Escuchar eventos de interacción del usuario para reiniciar el temporizador
// Optimización para eventos frecuentes
function setupInactivityDetection() {
  // Lista de eventos a monitorear
  const events = [
    'mousedown', 'keypress', 'scroll', 'touchstart',
    'click', 'dblclick', 'keydown', 'keyup', 'touchmove', 'touchend'
  ];

  let lastMoveTime = Date.now();

  // Añadir los listeners para eventos comunes
  events.forEach(eventName => {
    document.addEventListener(eventName, resetInactivityTimer, true);
  });

  // Manejo especial para mousemove (muy frecuente)
  document.addEventListener('mousemove', () => {
    const now = Date.now();

    // Limitar a una vez cada 2 segundos para movimiento del mouse
    if (now - lastMoveTime > 2000) {
      lastMoveTime = now;
      resetInactivityTimer();
    }
  }, true);

  // Iniciar el temporizador al cargar
  resetInactivityTimer();

  console.log('Sistema de detección de inactividad iniciado');
}