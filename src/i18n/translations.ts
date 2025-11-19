export interface Translations {
  // UI Elements
  openCamera: string;
  takePhoto: string;
  sharePhoto: string;
  
  // Modal
  completeDataToShare: string;
  confirmDataInfo: string;
  confirmAdult: string;
  confirmPrivacy: string;
  privacyPolicyText: string;
  email: string;
  emailPlaceholder: string;
  sendOtpCode: string;
  enterOtpCode: string;
  otpPlaceholder: string;
  validateOtp: string;
  enterEmailForPhoto: string;
  additionalEmailPlaceholder: string;
  photoWillBeSent: string;
  send: string;
  
  // Dynamic button states
  sending: string;
  resendOtpCode: string;
  validating: string;
  verified: string;
  
  // Upload status
  preparingSend: string;
  uploadingPhoto: string;
  imageSentCorrectly: string;
  
  // Success
  photoSent: string;
  thanksForParticipating: string;
  sentTo: string;
  
  // Background selector
  selectBackground: string;
  
  // Timer
  seconds: string;
}

export const translations: Record<string, Translations> = {
  es: {
    // UI Elements
    openCamera: "Abrir Cámara",
    takePhoto: "Tomar Foto",
    sharePhoto: "Compartir Foto",
    
    // Modal
    completeDataToShare: "Completa tus datos para compartir",
    confirmDataInfo: "Para compartir la foto es necesario que confirmes las 2 pestañas siguientes y pongas tu email para mandarte un codigo de seguridad.",
    confirmAdult: "Confirmo que soy mayor de edad",
    confirmPrivacy: "He leído y comprendo la",
    privacyPolicyText: "política de protección de datos",
    email: "Correo electrónico:",
    emailPlaceholder: "correo@ejemplo.com",
    sendOtpCode: "Enviar código OTP",
    enterOtpCode: "Ingresa el código OTP enviado a tu correo:",
    otpPlaceholder: "Código de verificación",
    validateOtp: "Validar OTP",
    enterEmailForPhoto: "Ingresa tu mail para enviarte la foto.",
    additionalEmailPlaceholder: "correo.adicional@ejemplo.com",
    photoWillBeSent: "La foto se enviará a este correo",
    send: "Enviar",
    
    // Dynamic button states
    sending: "Enviando",
    resendOtpCode: "Reenviar código OTP",
    validating: "Validando",
    verified: "✓ Verificado",
    
    // Upload status
    preparingSend: "Preparando envío...",
    uploadingPhoto: "Subiendo foto...",
    imageSentCorrectly: "Imagen enviada correctamente",
    
    // Success
    photoSent: "¡Foto enviada!",
    thanksForParticipating: "Gracias por participar",
    sentTo: "Se ha enviado a",
    
    // Background selector
    selectBackground: "Selecciona un fondo",
    
    // Timer
    seconds: "segundos"
  },
  
  en: {
    // UI Elements
    openCamera: "Open Camera",
    takePhoto: "Take Photo",
    sharePhoto: "Share Photo",
    
    // Modal
    completeDataToShare: "Complete your details to share",
    confirmDataInfo: "To share the photo, you need to confirm the following 2 tabs and provide your email to send you a security code.",
    confirmAdult: "I confirm that I am of legal age",
    confirmPrivacy: "I have read and understand the",
    privacyPolicyText: "privacy policy",
    email: "Email:",
    emailPlaceholder: "email@example.com",
    sendOtpCode: "Send OTP Code",
    enterOtpCode: "Enter the OTP code sent to your email:",
    otpPlaceholder: "Verification code",
    validateOtp: "Validate OTP",
    enterEmailForPhoto: "Enter your email to send you the photo.",
    additionalEmailPlaceholder: "additional.email@example.com",
    photoWillBeSent: "The photo will be sent to this email",
    send: "Send",
    
    // Dynamic button states
    sending: "Sending",
    resendOtpCode: "Resend OTP Code",
    validating: "Validating",
    verified: "✓ Verified",
    
    // Upload status
    preparingSend: "Preparing to send...",
    uploadingPhoto: "Uploading photo...",
    imageSentCorrectly: "Image sent successfully",
    
    // Success
    photoSent: "Photo sent!",
    thanksForParticipating: "Thanks for participating",
    sentTo: "Sent to",
    
    // Background selector
    selectBackground: "Select a background",
    
    // Timer
    seconds: "seconds"
  },
  
  de: {
    // UI Elements
    openCamera: "Kamera öffnen",
    takePhoto: "Foto aufnehmen",
    sharePhoto: "Foto teilen",
    
    // Modal
    completeDataToShare: "Vervollständigen Sie Ihre Daten zum Teilen",
    confirmDataInfo: "Um das Foto zu teilen, müssen Sie die folgenden 2 Registerkarten bestätigen und Ihre E-Mail angeben, um Ihnen einen Sicherheitscode zu senden.",
    confirmAdult: "Ich bestätige, dass ich volljährig bin",
    confirmPrivacy: "Ich habe die",
    privacyPolicyText: "Datenschutzrichtlinie gelesen und verstanden",
    email: "E-Mail:",
    emailPlaceholder: "email@beispiel.com",
    sendOtpCode: "OTP-Code senden",
    enterOtpCode: "Geben Sie den an Ihre E-Mail gesendeten OTP-Code ein:",
    otpPlaceholder: "Bestätigungscode",
    validateOtp: "OTP validieren",
    enterEmailForPhoto: "Geben Sie Ihre E-Mail ein, um Ihnen das Foto zu senden.",
    additionalEmailPlaceholder: "zusaetzliche.email@beispiel.com",
    photoWillBeSent: "Das Foto wird an diese E-Mail gesendet",
    send: "Senden",
    
    // Dynamic button states
    sending: "Wird gesendet",
    resendOtpCode: "OTP-Code erneut senden",
    validating: "Wird validiert",
    verified: "✓ Verifiziert",
    
    // Upload status
    preparingSend: "Vorbereitung des Versands...",
    uploadingPhoto: "Foto wird hochgeladen...",
    imageSentCorrectly: "Bild erfolgreich gesendet",
    
    // Success
    photoSent: "Foto gesendet!",
    thanksForParticipating: "Danke für Ihre Teilnahme",
    sentTo: "Gesendet an",
    
    // Background selector
    selectBackground: "Hintergrund auswählen",
    
    // Timer
    seconds: "Sekunden"
  },

  ar: {
    // UI Elements
    openCamera: "فتح الكاميرا",
    takePhoto: "التقاط صورة",
    sharePhoto: "مشاركة الصورة",
    
    // Modal
    completeDataToShare: "أكمل بياناتك للمشاركة",
    confirmDataInfo: "لمشاركة الصورة، تحتاج إلى تأكيد التبويبين التاليين وتقديم بريدك الإلكتروني لإرسال رمز الأمان إليك.",
    confirmAdult: "أؤكد أنني بالغ",
    confirmPrivacy: "لقد قرأت وفهمت",
    privacyPolicyText: "سياسة الخصوصية",
    email: "البريد الإلكتروني:",
    emailPlaceholder: "email@example.com",
    sendOtpCode: "إرسال رمز OTP",
    enterOtpCode: "أدخل رمز OTP المرسل إلى بريدك الإلكتروني:",
    otpPlaceholder: "رمز التحقق",
    validateOtp: "تحقق من OTP",
    enterEmailForPhoto: "أدخل بريدك الإلكتروني لإرسال الصورة إليك.",
    additionalEmailPlaceholder: "email.additional@example.com",
    photoWillBeSent: "سيتم إرسال الصورة إلى هذا البريد الإلكتروني",
    send: "إرسال",
    
    // Dynamic button states
    sending: "جاري الإرسال",
    resendOtpCode: "إعادة إرسال رمز OTP",
    validating: "جاري التحقق",
    verified: "✓ تم التحقق",
    
    // Upload status
    preparingSend: "جاري تحضير الإرسال...",
    uploadingPhoto: "جاري رفع الصورة...",
    imageSentCorrectly: "تم إرسال الصورة بنجاح",
    
    // Success
    photoSent: "تم إرسال الصورة!",
    thanksForParticipating: "شكراً لمشاركتك",
    sentTo: "تم الإرسال إلى",
    
    // Background selector
    selectBackground: "اختر خلفية",
    
    // Timer
    seconds: "ثواني"
  },

  ko: {
    // UI Elements
    openCamera: "카메라 열기",
    takePhoto: "사진 촬영",
    sharePhoto: "사진 공유",
    
    // Modal
    completeDataToShare: "공유를 위해 정보를 완성하세요",
    confirmDataInfo: "사진을 공유하려면 다음 2개 탭을 확인하고 보안 코드를 받을 이메일을 제공해야 합니다.",
    confirmAdult: "성인임을 확인합니다",
    confirmPrivacy: "개인정보처리방침을",
    privacyPolicyText: "읽고 이해했습니다",
    email: "이메일:",
    emailPlaceholder: "email@example.com",
    sendOtpCode: "OTP 코드 전송",
    enterOtpCode: "이메일로 전송된 OTP 코드를 입력하세요:",
    otpPlaceholder: "인증 코드",
    validateOtp: "OTP 확인",
    enterEmailForPhoto: "사진을 받을 이메일을 입력하세요.",
    additionalEmailPlaceholder: "additional.email@example.com",
    photoWillBeSent: "이 이메일로 사진이 전송됩니다",
    send: "전송",
    
    // Dynamic button states
    sending: "전송 중",
    resendOtpCode: "OTP 코드 재전송",
    validating: "확인 중",
    verified: "✓ 확인됨",
    
    // Upload status
    preparingSend: "전송 준비 중...",
    uploadingPhoto: "사진 업로드 중...",
    imageSentCorrectly: "이미지가 성공적으로 전송되었습니다",
    
    // Success
    photoSent: "사진 전송 완료!",
    thanksForParticipating: "참여해 주셔서 감사합니다",
    sentTo: "전송 완료:",
    
    // Background selector
    selectBackground: "배경 선택",
    
    // Timer
    seconds: "초"
  }
};
