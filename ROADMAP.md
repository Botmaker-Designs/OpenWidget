# Chatbot Widget — Roadmap

## Criterio de priorización

Las 8 dimensiones del análisis competitivo se organizan en 3 fases según su impacto en el problema central (IA plana sin dinamismo) y su complejidad de implementación.

**Fase 1** resuelve los problemas más críticos del estado actual — lo que hace que la experiencia sea mala hoy.
**Fase 2** agrega dinamismo e inteligencia contextual — lo que diferencia una solución básica de una buena.
**Fase 3** completa la experiencia con personalización avanzada — lo que convierte el widget en un producto maduro.

---

## Fase 1 — Foundation `[Prioridad alta]`

> Objetivo: pasar de "IA que responde texto plano" a "widget funcional que nunca deja al usuario sin salida."

### 1.1 — Scaffold del proyecto
**Dimensión:** Base técnica del widget antes de cualquier UI.

- [ ] Inicializar proyecto con Vite + React
- [ ] Definir estructura de carpetas (`/components`, `/hooks`, `/config`, `/styles`)
- [ ] Configurar sistema de theming con CSS variables (`--primary-color`, `--font-family`, `--border-radius`, etc.)
- [ ] Crear componente raíz `<ChatWidget config={...} />` que acepta props de configuración
- [ ] Documentar el schema de la prop `config` (colores, textos, horarios, endpoints)

**Criterio de éxito:** El widget se monta con `<ChatWidget config={...} />` y las CSS variables del cliente se aplican sin tocar código interno.

---

### 1.2 — Floating button
**Dimensión:** El punto de entrada del widget en la página del cliente.

- [ ] Renderizar botón flotante fijo en esquina inferior derecha (posición configurable)
- [ ] Color e ícono del botón configurables vía prop
- [ ] Animación de entrada al montar (fade + scale, menos de 300ms)
- [ ] Estado abierto/cerrado: el botón cambia de ícono al expandir el panel
- [ ] Badge de notificación numérico sobre el botón (para mensajes no leídos)

**Criterio de éxito:** El botón aparece en la página, cambia de estado visualmente y el badge se actualiza cuando hay mensajes nuevos.

---

### 1.3 — Panel de chat — estructura base
**Dimensión:** El contenedor principal de la conversación.

- [ ] Panel se abre/cierra con animación desde el botón flotante (menos de 300ms)
- [ ] Header con nombre del bot y avatar configurables
- [ ] Área de mensajes scrollable con scroll automático al último mensaje
- [ ] Input de texto con botón de envío
- [ ] Envío de mensaje con Enter y con click
- [ ] Estado de carga del bot ("escribiendo...") mientras espera respuesta

**Criterio de éxito:** El usuario puede abrir el panel, escribir un mensaje, enviarlo y ver el indicador de escritura antes de recibir la respuesta.

---

### 1.4 — Mensaje de bienvenida y quick replies
**Dimensión:** El primer contenido que ve el usuario al abrir el widget.

- [ ] Mensaje de bienvenida configurable que aparece automáticamente al abrir
- [ ] Saludo personalizado si el cliente B2B inyecta nombre del usuario (`"Hola {{nombre}}"`)
- [ ] Renderizado de quick replies como chips clicables bajo el mensaje de bienvenida
- [ ] Al clickear un quick reply, se envía como mensaje del usuario y los chips desaparecen
- [ ] Quick replies configurables (texto + valor) por el cliente B2B

**Criterio de éxito:** Al abrir el widget, el usuario ve el mensaje de bienvenida con al menos 3 quick replies clicables que disparan una conversación.

---

### 1.5 — Manejo del no-sé ⚠️
**Dimensión:** Qué pasa cuando la IA no puede responder. Es la dimensión más crítica.

- [ ] Definir campo `type: "fallback"` en el contrato de respuesta del backend
- [ ] Componente `<FallbackMessage>` que renderiza texto de fallback configurable
- [ ] Botón de acción "Hablar con un agente" visible en toda respuesta fallback
- [ ] Botón de acción "Dejar un mensaje" visible en toda respuesta fallback
- [ ] Stub de "Ver artículos relacionados" (visible pero deshabilitado, marcado como próximamente)
- [ ] Evento de log emitido al detectar un fallback (hook para envío a backend)

**Criterio de éxito:** Ante cualquier respuesta `type: "fallback"`, el usuario ve el mensaje configurable y al menos 2 opciones de escalada clicables. Nunca hay callejón sin salida.

---

### 1.6 — Fuera de horario
**Dimensión:** Qué pasa cuando no hay agentes disponibles.

- [ ] Prop `businessHours` con días de la semana y rangos horarios configurables
- [ ] Lógica de detección: comparar hora actual del cliente contra `businessHours`
- [ ] Badge o banner "Fuera de horario" visible en el header del widget
- [ ] Input de texto bloqueado cuando está fuera de horario
- [ ] Formulario asincrónico con campos: nombre, email, mensaje
- [ ] Validación del formulario (campos requeridos, formato de email)
- [ ] Envío del formulario a endpoint configurable (`config.offHoursEndpoint`)
- [ ] Pantalla de confirmación tras envío exitoso ("Tu mensaje fue recibido")

**Criterio de éxito:** Un usuario que llega fuera de horario puede dejar un mensaje en menos de 60 segundos y ve confirmación de recepción.

---

## Fase 2 — Dynamism `[Prioridad media]`

> Objetivo: hacer el chat interactivo y contextualmente inteligente.

### 2.1 — Dinamismo del chat
**Dimensión:** Elementos interactivos dentro de la conversación.

- [ ] Renderizado de quick replies (botones de respuesta rápida)
- [ ] Cards con imagen, título y CTA
- [ ] Carrusel horizontal de cards
- [ ] Formularios inline dentro del chat (campos de texto, select, fecha)
- [ ] Confirmación de acciones ("¿Querés cancelar tu suscripción?  Sí / No")

**Criterio de éxito:** El backend puede enviar un payload estructurado y el frontend lo renderiza como componente interactivo, no como texto plano.

**Nota técnica:** Definir contrato de mensaje entre backend y frontend. Ejemplo:
```json
{
  "type": "quick_replies",
  "text": "¿Sobre qué necesitás ayuda?",
  "options": [
    { "label": "Mi pedido", "value": "order" },
    { "label": "Pagos", "value": "payments" }
  ]
}
```

---

### 2.2 — Handoff a agente humano
**Dimensión:** Transición de IA a persona real.

- [ ] Botón / acción de "hablar con un agente"
- [ ] Cola de espera con posición visible ("Sos el #3 en la fila")
- [ ] Traspaso del historial completo al agente (el contexto no se pierde)
- [ ] Indicador de "agente escribiendo..."
- [ ] Cierre de sesión limpio cuando el agente resuelve el caso

**Criterio de éxito:** El agente recibe la conversación completa sin que el usuario repita nada. La transición es invisible desde el punto de vista del usuario.

---

### 2.4 — Mejoras de experiencia del chat
**Dimensión:** Feedback visual y transiciones que hacen la conversación más clara y humana.

- [ ] **Indicador de escritura / pensando** — Mientras la IA genera una respuesta, mostrar un indicador animado dentro del chat (similar al efecto de streaming de Claude). Mostrar "Escribiendo..." o "Pensando..." según el contexto. El texto debe aparecer carácter por carácter cuando llega la respuesta.
- [ ] **Expandir y contraer el panel de chat** — El panel puede alternar entre tamaño compacto por defecto y una vista expandida más grande. Agregar botón de expandir/contraer en el header. *(La referencia visual se provee cuando se implemente este punto.)*
- [ ] **Logo en el header** — El header muestra el logo del cliente B2B. Por defecto usar el logo de Botmaker. *(El archivo del logo se provee cuando se implemente este punto.)*
- [ ] **Indicador de transferencia a agente** — Cuando el usuario solicita un agente humano, mostrar un mensaje de ancho completo dentro del chat: "Conectando con un agente..." con animación de carga.
- [ ] **Mensaje de ingreso del agente** — Una vez conectado el agente, renderizar un componente de mensaje de sistema en el hilo: "Camila se unió al chat." Visualmente distinto de las burbujas normales: centrado, texto muted, con timestamp.
- [ ] **Header cambia a la identidad del agente** — Cuando un agente toma el control, el header se actualiza: reemplazar avatar del bot por el avatar del agente, actualizar el nombre y agregar badge verde de "Online".

**Criterio de éxito:** Un usuario que solicita un agente humano vive una transición visualmente clara y sin ambigüedad — desde el indicador de escritura, al estado de transferencia, hasta el ingreso del agente — sabiendo en todo momento qué está pasando.

**Nota técnica:** El estado del header (bot vs. agente) debe estar manejado por una variable de estado de la sesión del chat. No hardcodear la identidad del agente — nombre, avatar y estado deben venir del payload del backend.

---

### 2.5 — Input enriquecido
**Dimensión:** Área de escritura con acciones rápidas y branding.

- [ ] Textarea en la parte superior del input
- [ ] Fila de íconos de acción: adjunto, emoji, GIF, micrófono
- [ ] Botón de envío circular con ícono de flecha
- [ ] "Powered by Botmaker" debajo del input

**Criterio de éxito:** El input se ve y funciona como en la referencia de Intercom/Fin.

---

### 2.3 — Personalización contextual
**Dimensión:** El widget sabe quién es el usuario y dónde está.

- [ ] Inyección de contexto del usuario logueado (nombre, ID, plan)
- [ ] Detección de la URL/página actual para personalizar respuestas
- [ ] Historial de conversaciones anteriores de ese usuario
- [ ] Saludo personalizado ("Hola María, ¿en qué te puedo ayudar?")

**Criterio de éxito:** Si el cliente B2B provee un token de usuario, el widget lo usa para personalizar el saludo y el historial sin que el usuario tenga que identificarse.

---

## Fase 3 — Polish `[Prioridad baja]`

> Objetivo: completar los casos de uso avanzados y la experiencia de configuración.

### 3.1 — Soporte multimedia
**Dimensión:** El usuario puede enviar archivos e imágenes.

- [ ] Upload de imágenes desde el chat
- [ ] Upload de archivos adjuntos (PDF, etc.)
- [ ] Preview de imagen antes de enviar
- [ ] Límite de tamaño configurable

---

### 3.2 — Tono y personalidad
**Dimensión:** El bot tiene identidad propia y configurable.

- [ ] Nombre del bot configurable ("Asistente de Banco X")
- [ ] Avatar del bot configurable (URL de imagen)
- [ ] Tono predefinido: formal / amigable / neutro
- [ ] Mensaje de cierre configurable

---

## Resumen visual

```
FASE 1 — Foundation
├── 1.1  Scaffold del proyecto     → Vite + React, theming, prop config schema
├── 1.2  Floating button           → Botón fijo, configurable, badge de notificaciones
├── 1.3  Panel de chat — base      → Apertura, header, scroll, input, typing indicator
├── 1.4  Bienvenida + quick replies → Saludo configurable, chips clicables
├── 1.5  Manejo del no-sé ⚠️       → Fallback + opciones de salida siempre visibles
└── 1.6  Fuera de horario          → Detección horaria, formulario asincrónico, confirmación

FASE 2 — Dynamism
├── 2.1  Dinamismo del chat         → Cards, carruseles, formularios inline
├── 2.2  Handoff a agente humano    → Cola, contexto completo, typing indicator
├── 2.3  Personalización contextual → Usuario logueado, página actual, historial
└── 2.4  Mejoras de experiencia     → Typing/pensando, expand/collapse, logo, transferencia a agente

FASE 3 — Polish
├── 3.1  Soporte multimedia        → Imágenes y adjuntos en el chat
└── 3.2  Tono y personalidad       → Nombre, avatar, tono del bot
```

---

## Deuda técnica a tener en cuenta desde Fase 1

- **Contrato de mensajes:** Definir y documentar el schema de payloads entre backend y widget antes de arrancar Fase 2. Si esto no está claro, Dinamismo del chat se vuelve costoso de mantener.
- **Accesibilidad:** El widget debe ser navegable con teclado y compatible con screen readers desde el inicio. Agregarlo después es más caro.
- **Performance de embed:** El widget no puede bloquear el load de la página del cliente. Carga asincrónica obligatoria desde el primer día.
