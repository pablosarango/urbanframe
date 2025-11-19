# Sistema de Redirección por Inactividad - Urban Frame

## Descripción

El sistema detecta automáticamente cuando el usuario está inactivo y, después de un tiempo determinado, redirige a la página principal del turismo de Astorga con parámetros específicos y crea una cookie de verificación.

## Configuración

### Tiempos de inactividad

```typescript
const INACTIVITY_TIMEOUT_MS = 60000; // 1 minuto total (60 segundos)
const INACTIVITY_WARNING_MS = 30 * 1000; // Advertencia 30 segundos antes
```

- **Tiempo de advertencia**: 30 segundos (aparece un aviso)
- **Tiempo total**: 60 segundos (redirección automática)

### URL de redirección

```typescript
const REDIRECT_URL = 'https://turismoastorga.es/?activar_totem=1';
```

### Cookie creada

```
totem_activo=verificado; path=/; max-age=31536000
```

- **Nombre**: `totem_activo`
- **Valor**: `verificado`
- **Ruta**: `/` (toda la aplicación)
- **Duración**: `31536000` segundos (1 año)

## Flujo de funcionamiento

1. **Detección de actividad**: El sistema monitorea varios eventos:
   - `mousedown`, `keypress`, `scroll`, `touchstart`
   - `click`, `dblclick`, `keydown`, `keyup`
   - `touchmove`, `touchend`, `mousemove`

2. **Tiempo de inactividad**: Si no se detecta actividad durante 30 segundos:
   - Se muestra una **advertencia visual** al usuario
   - El usuario tiene 30 segundos adicionales para interactuar

3. **Redirección**: Si la inactividad continúa por 30 segundos más:
   - Se **crea la cookie** `totem_activo=verificado`
   - Se **redirige** a `https://turismoastorga.es/?activar_totem=1`

## Eventos monitoreados

### Eventos regulares
- Clicks y doble clicks
- Teclas presionadas
- Scroll de página
- Eventos de touch (móvil)

### Eventos optimizados
- **MouseMove**: Limitado a una detección cada 2 segundos para evitar exceso de llamadas

## Funciones principales

### `resetInactivityTimer()`
- Reinicia el temporizador de inactividad
- Se llama en cada evento de interacción del usuario
- Oculta la advertencia si estaba visible

### `showInactivityWarning()`
- Muestra un modal de advertencia al usuario
- Aparece 30 segundos antes de la redirección
- Permite al usuario continuar con un botón

### `createTotemCookie()`
- Crea la cookie requerida antes de la redirección
- Se ejecuta justo antes del redirect

### `setupInactivityDetection()`
- Configura todos los event listeners
- Inicia el sistema al cargar la página

## Personalización

### Cambiar tiempos
```typescript
const INACTIVITY_TIMEOUT_MS = 120000; // 2 minutos
const INACTIVITY_WARNING_MS = 30 * 1000; // 30 segundos de advertencia
```

### Cambiar URL de redirección
```typescript
const REDIRECT_URL = 'https://nueva-url.com/?parametro=valor';
```

### Cambiar cookie
```typescript
function createTotemCookie() {
  const cookieValue = "nuevo_nombre=nuevo_valor; path=/; max-age=3600"; // 1 hora
  document.cookie = cookieValue;
}
```

## Pruebas en desarrollo

Para probar la funcionalidad sin esperar el timeout completo:

1. Abre la consola del navegador
2. Ejecuta: `testInactivityRedirect()`
3. Verifica que:
   - Se muestra el alert con la URL de redirección
   - Se crea la cookie correctamente
   - En producción, se redirige a la URL especificada

## Características técnicas

- ✅ **Detección robusta** de actividad del usuario
- ✅ **Optimización** para eventos frecuentes (mousemove)
- ✅ **Advertencia visual** antes de la redirección
- ✅ **Cookie automática** con duración de 1 año
- ✅ **URL parametrizada** para identificar origen
- ✅ **Sistema de pruebas** para desarrollo
- ✅ **Logs en consola** para debugging

## Notas importantes

1. **Producción vs Desarrollo**: La función `testInactivityRedirect()` está disponible solo para pruebas
2. **Cookie Path**: La cookie se crea con `path=/` para estar disponible en todo el dominio
3. **Duración**: La cookie dura 1 año (31536000 segundos)
4. **Parámetro URL**: `?activar_totem=1` identifica que la redirección viene del totem
5. **Reinicio automático**: Cualquier interacción del usuario reinicia el temporizador
