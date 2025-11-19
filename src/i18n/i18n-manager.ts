import { translations } from './translations.js';
import type { Translations } from './translations.js';

export class I18nManager {
  private currentLanguage: string = 'es';
  private translations: Translations;

  constructor() {
    this.currentLanguage = this.getLanguageFromURL() || 'es';
    this.translations = translations[this.currentLanguage] || translations['es'];
    this.updatePageLanguage();
    this.initializeLanguageSelector();
  }

  private getLanguageFromURL(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang');
    
    if (lang && translations[lang]) {
      return lang;
    }
    
    return null;
  }

  private updatePageLanguage(): void {
    // Update document language attribute
    document.documentElement.lang = this.currentLanguage;
    
    // Handle RTL languages (Arabic)
    if (this.currentLanguage === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }

  private initializeLanguageSelector(): void {
    // Set the correct option in the language selector
    const languageSelect = document.getElementById('language-select') as HTMLSelectElement;
    if (languageSelect) {
      languageSelect.value = this.currentLanguage;
      
      // Add event listener for language change
      languageSelect.addEventListener('change', (event) => {
        const newLanguage = (event.target as HTMLSelectElement).value;
        this.changeLanguage(newLanguage);
      });
    }
  }

  public changeLanguage(newLanguage: string): void {
    if (translations[newLanguage]) {
      this.currentLanguage = newLanguage;
      this.translations = translations[newLanguage];
      this.updatePageLanguage();
      this.updateTexts();
      
      // Update URL parameter
      const url = new URL(window.location.href);
      url.searchParams.set('lang', newLanguage);
      window.history.replaceState({}, '', url.toString());
    }
  }

  public getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  public t(key: keyof Translations): string {
    return this.translations[key] || key;
  }

  public updateTexts(): void {
    // Update all translatable elements
    this.updateElement('start-camera-button', this.t('openCamera'));
    this.updateElement('capture-button', this.t('takePhoto'));
    this.updateElement('share-photo-button', this.t('sharePhoto'));
    
    // Modal elements
    this.updateElement('modal-title', this.t('completeDataToShare'));
    this.updateElement('modal-info', this.t('confirmDataInfo'));
    this.updateElement('adult-check-label', this.t('confirmAdult'));
    this.updateElement('privacy-check-label', this.t('confirmPrivacy'));
    this.updateElement('privacy-policy-link', this.t('privacyPolicyText'));
    this.updateElement('email-label', this.t('email'));
    this.updateElementAttribute('email-input', 'placeholder', this.t('emailPlaceholder'));
    this.updateElement('send-otp-button', this.t('sendOtpCode'));
    this.updateElement('otp-label', this.t('enterOtpCode'));
    this.updateElementAttribute('otp-input', 'placeholder', this.t('otpPlaceholder'));
    this.updateElement('validate-otp-button', this.t('validateOtp'));
    this.updateElement('additional-email-label', this.t('enterEmailForPhoto'));
    this.updateElementAttribute('additional-email-input', 'placeholder', this.t('additionalEmailPlaceholder'));
    this.updateElement('email-helper-text', this.t('photoWillBeSent'));
    this.updateElement('submit-form-button', this.t('send'));
    
    // Upload status
    this.updateElement('upload-status', this.t('preparingSend'));
    
    // Success animation
    this.updateElement('success-title', this.t('photoSent'));
    this.updateElement('success-message', this.t('thanksForParticipating'));
  }

  private updateElement(id: string, text: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  }

  private updateElementAttribute(id: string, attribute: string, value: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.setAttribute(attribute, value);
    }
  }

  public updateUploadStatus(key: keyof Translations): void {
    this.updateElement('upload-status', this.t(key));
  }
}

// Export singleton instance
export const i18n = new I18nManager();
