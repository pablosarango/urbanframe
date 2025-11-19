# Sistema de Internacionalización (i18n) - Urban Frame

## Descripción

El sistema de internacionalización permite que la aplicación Urban Frame soporte múltiples idiomas. Actualmente soporta:

- **Español (es)** - Idioma por defecto
- **Inglés (en)**
- **Alemán (de)**
- **Árabe (ar)** - Con soporte RTL (derecha a izquierda)
- **Coreano (ko)**

## Cómo usar

### Cambio de idioma mediante URL

Puedes especificar el idioma agregando el parámetro `lang` a la URL:

```
https://tu-sitio.com/?lang=en  # Inglés
https://tu-sitio.com/?lang=de  # Alemán
https://tu-sitio.com/?lang=ar  # Árabe
https://tu-sitio.com/?lang=ko  # Coreano
https://tu-sitio.com/?lang=es  # Español (por defecto)
```

### Selector de idioma en la interfaz

En la esquina superior derecha de la aplicación hay un selector desplegable que permite cambiar el idioma dinámicamente sin necesidad de recargar la página.

## Estructura del sistema

### Archivos principales

1. **`src/i18n/translations.ts`** - Contiene todas las traducciones
2. **`src/i18n/i18n-manager.ts`** - Gestor del sistema de internacionalización

### Cómo agregar un nuevo idioma

1. **Edita `src/i18n/translations.ts`**:
   ```typescript
   export const translations: Record<string, Translations> = {
     es: { /* traducciones en español */ },
     en: { /* traducciones en inglés */ },
     de: { /* traducciones en alemán */ },
     fr: { /* NUEVO: traducciones en francés */ }
   };
   ```

2. **Actualiza el selector en `index.html`**:
   ```html
   <select id="language-select">
     <option value="es">🇪🇸 Español</option>
     <option value="en">🇺🇸 English</option>
     <option value="de">🇩🇪 Deutsch</option>
     <option value="ar">🇸🇦 العربية</option>
     <option value="ko">🇰🇷 한국어</option>
     <option value="fr">🇫🇷 Français</option> <!-- NUEVO -->
   </select>
   ```

### Cómo agregar nuevos textos traducibles

1. **Agrega la clave a la interfaz** en `src/i18n/translations.ts`:
   ```typescript
   export interface Translations {
     // ... claves existentes
     newText: string; // NUEVA CLAVE
   }
   ```

2. **Agrega las traducciones** para todos los idiomas:
   ```typescript
   es: {
     // ... traducciones existentes
     newText: "Nuevo texto en español"
   },
   en: {
     // ... traducciones existentes
     newText: "New text in English"
   },
   de: {
     // ... traducciones existentes
     newText: "Neuer Text auf Deutsch"
   }
   ```

3. **Usa la traducción en el código**:
   ```typescript
   import { i18n } from "./i18n/i18n-manager.js";
   
   // Para texto estático
   element.textContent = i18n.t('newText');
   
   // Para actualizar el HTML al cargar
   i18n.updateTexts(); // en el DOMContentLoaded
   ```

### Funciones disponibles

- **`i18n.t(key)`** - Obtiene una traducción específica
- **`i18n.updateTexts()`** - Actualiza todos los textos de la interfaz
- **`i18n.changeLanguage(language)`** - Cambia el idioma dinámicamente
- **`i18n.getCurrentLanguage()`** - Obtiene el idioma actual

## Características

- ✅ Detección automática del idioma por parámetro URL
- ✅ Selector visual en la interfaz
- ✅ Cambio dinámico sin recarga de página
- ✅ Actualización automática de URL
- ✅ Fallback al español si el idioma no existe
- ✅ Soporte para texto dinámico (botones, mensajes de estado)
- ✅ Persistencia del idioma en la URL
- ✅ **Soporte RTL** para árabe (texto de derecha a izquierda)
- ✅ **Fuentes optimizadas** para árabe y coreano

## Idiomas soportados

| Código | Idioma | Bandera | Notas |
|--------|--------|---------|-------|
| `es` | Español (por defecto) | 🇪🇸 | |
| `en` | English | 🇺🇸 | |
| `de` | Deutsch | 🇩🇪 | |
| `ar` | العربية | 🇸🇦 | Soporte RTL |
| `ko` | 한국어 | 🇰🇷 | Fuentes optimizadas |

## Elementos traducidos

- Botones principales (Abrir Cámara, Tomar Foto, Compartir Foto)
- Modal de validación completo
- Formularios y campos de entrada
- Mensajes de estado y progreso
- Textos de éxito y celebración
- Estados dinámicos de botones (Enviando, Validando, etc.)

## Notas técnicas

- El sistema usa TypeScript para garantizar que todas las traducciones estén completas
- Se inicializa automáticamente al cargar la página
- Compatible con el sistema de módulos ES6
- Mantiene el estado del idioma en la URL para facilitar compartir enlaces
