# Chatbot Widget — Context

## ¿Qué es esto?

Un widget de atención al cliente embebible en cualquier página web, construido en React y distribuido como solución B2B. Los clientes (bancos, fintechs, ecommerce, telefonía) lo integran en sus propios sitios para dar soporte a sus usuarios finales.

El widget vive como un floating button en la esquina inferior de la pantalla y se expande en un panel de chat.

---

## Problema que resuelve

La solución actual responde texto plano con una IA sin dinamismo. Los usuarios finales se encuentran con:

- Respuestas que no pueden resolver su problema y no tienen camino de salida claro
- Sin posibilidad de escalar a un humano de forma fluida
- Sin contexto: el bot no sabe quién sos ni en qué página estás
- Sin opciones interactivas: todo es texto, sin botones ni formularios
- Fuera de horario, la experiencia simplemente falla sin alternativa

El nuevo widget apunta a resolver cada uno de estos puntos.

---

## Usuarios

### Usuario final (end user)
El cliente del cliente B2B. Puede ser un consumidor intentando resolver un problema (compra, pago, cuenta) o un usuario ya registrado en la plataforma. Llega al widget bajo presión — algo no funciona o necesita ayuda — y espera una respuesta rápida y clara.

### Cliente B2B (operador)
El banco, fintech, ecommerce o empresa de telefonía que compra nuestra solución. Configura el widget, define el tono, conecta sus datos y gestiona los agentes humanos. No interactúa con el widget en tiempo real, pero es quien lo personaliza y mide.

---

## Stack técnico

- **Frontend:** React (widget embebible, puede vivir en un iframe o como web component)
- **Backend:** Propio (REST API o WebSocket para mensajería en tiempo real)
- **IA:** Integración con LLM propio o externo para generación de respuestas
- **Estado del chat:** Manejado en el frontend con contexto persistido por sesión

---

## Principios de diseño

**1. El widget no puede bloquear al usuario.**
Si la IA no sabe, debe haber siempre un camino de salida: escalar, dejar un mensaje, abrir un ticket. Nunca un callejón sin salida.

**2. El contexto no se pierde.**
Cuando hay un handoff a agente humano, el historial completo de la conversación viaja con el traspaso. El agente no puede pedirle al usuario que repita lo que ya dijo.

**3. Whitelabelable por defecto.**
Colores, logo, nombre del bot y tono son configurables por el cliente B2B sin tocar código. El widget no debe verse como "nuestro" sino como del cliente.

**4. Mobile-first.**
La mayoría de los usuarios finales llegan desde celular. Cada interacción — botones, formularios, adjuntos — debe funcionar bien en pantallas chicas.

**5. Progressive disclosure.**
No mostrar todo de golpe. El bot guía al usuario paso a paso. Los formularios se abren cuando son necesarios, no antes.

---

## Flujo principal

```
Usuario abre widget
  → Mensaje de bienvenida (personalizado si está logueado)
  → Usuario escribe o selecciona opción rápida
    → IA responde con texto + elementos dinámicos (botones, cards, etc.)
      → [Resuelto] → Flujo de cierre + feedback
      → [No resuelto] → Opciones de escalada
        → Chat con agente humano (handoff con contexto)
        → Dejar mensaje / abrir ticket
        → Artículo del help center relacionado
    → [Fuera de horario] → Formulario de mensaje o ticket
```

---

## Scope de esta iteración

Este documento cubre exclusivamente el **Chatbot Widget**. El Help Center (artículos, tickets, seguimiento) es un producto separado que se integra con este widget pero tiene su propio CONTEXT.md y Roadmap.

### Dentro del scope
- Las 8 dimensiones del análisis competitivo (ver Roadmap)
- Configuración básica por el cliente B2B (colores, nombre, bienvenida)
- Integración con backend propio vía API

### Fuera del scope (próxima iteración)
- Panel de administración del cliente B2B
- Analytics y métricas de uso
- Integración nativa con CRMs externos (Salesforce, HubSpot)
- SDK para mobile apps nativas (iOS/Android)

---

## Decisiones técnicas pendientes

| Decisión | Opciones | Estado |
|---|---|---|
| Método de embed | iframe vs. web component vs. script tag | Por definir |
| Persistencia de sesión | localStorage vs. cookie vs. backend session | Por definir |
| Protocolo de mensajería | REST polling vs. WebSocket vs. SSE | Por definir |
| Handoff a agente | Cola propia vs. integración con herramienta externa | Por definir |
