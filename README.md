# Prueba técnica · Especialista Jr IT & Automatización · Entrelingo Group

Sistema que capta interesados de **Entrelingo, SkillsPRO y AustraliaPRO**, los clasifica con IA y avisa por correo al equipo correcto, sin trabajo manual.

```
Landing (formulario) ─▶ webhook de Make ─┐
                                         ├─▶ Airtable (tabla Leads)
Formulario de Airtable ──────────────────┘          │
                                                    ▼
                        Make: la IA decide prioridad Alta / Media / Baja + resumen de una línea
                                                    │
                          guarda el resultado en Airtable ─▶ router por marca ─▶ correo al equipo
                                                    │
                          si la IA falla: alerta al administrador y el lead sigue con prioridad Media
```

## Dónde está cada entregable

| Entregable de la prueba | Dónde verlo | Estado |
|---|---|---|
| **Parte 1** · Base y formulario de Airtable | Enlace en [`deliverables/LINKS.md`](deliverables/LINKS.md) | Hecho |
| **Parte 1** · Vista filtrada "Nuevos por marca" | Se crea en la interfaz de Airtable (la API no permite crear vistas) | **Pendiente** |
| **Parte 1** · Capturas de la base | — | **Pendiente** |
| **Parte 2** · Blueprint de Make (.json) | [`deliverables/make/blueprint.json`](deliverables/make/blueprint.json) | Hecho y probado |
| **Parte 2** · Escenario del formulario web (webhook) | [`deliverables/make/landing-webhook.blueprint.json`](deliverables/make/landing-webhook.blueprint.json) | Hecho y probado |
| **Parte 2** · Diseño de los correos | [`deliverables/make/email-preview.html`](deliverables/make/email-preview.html) (descargar y abrir en el navegador) | Diseño listo; falta probarlo en Make |
| **Parte 2** · Captura del escenario | — | **Pendiente** |
| **Parte 3** · Landing en WordPress | Vista previa: [`deliverables/wordpress/preview.html`](deliverables/wordpress/preview.html). Capturas: [`screenshots/`](deliverables/wordpress/screenshots/) | Hecho y probado de punta a punta |
| **Parte 4** · Documento de IA y documentación | [`deliverables/PARTE4_IA_Y_DOCUMENTACION.md`](deliverables/PARTE4_IA_Y_DOCUMENTACION.md) | Hecho |
| **Video** de 5 a 10 minutos | — | **Pendiente** |

## Cómo verlo (sin instalar nada)

1. **La landing:** descarga [`preview.html`](deliverables/wordpress/preview.html) y ábrelo en el navegador. Tiene todo: animaciones, carrusel y formulario.
2. **La landing dentro de WordPress:** copia el contenido de [`playground-url.txt`](deliverables/wordpress/playground-url.txt) y pégalo en la barra del navegador. Se crea un WordPress temporal con la página lista (los cambios no se guardan).
3. **Los correos:** abre [`email-preview.html`](deliverables/make/email-preview.html). Muestra los tres avisos (uno por marca) con datos de ejemplo.

## Cómo ejecutarlo

Necesitas cuentas gratuitas de Airtable y Make, y [Node.js](https://nodejs.org) 18 o superior.

1. **Airtable.** Crea un archivo `.env` con `AIRTABLE_TOKEN` y `AIRTABLE_BASE_ID`, y ejecuta `node scripts/create-airtable-schema.mjs`. Crea la tabla Leads con sus 10 campos. Ejecútalo una sola vez. `node scripts/improve-airtable.mjs` añade las descripciones de los campos.
2. **Make, escenario principal.** *Create scenario → ⋯ → Import blueprint* y elige `deliverables/make/blueprint.json`. Selecciona tus conexiones de Airtable y Gmail, y pega tu key de DeepInfra en el encabezado `Authorization` del módulo 2.
3. **Make, formulario web.** Importa igual `landing-webhook.blueprint.json` y actívalo. Copia su URL de webhook.
4. **Landing.** Pon esa URL en `WEBHOOK_URL` de `scripts/build-wordpress-blueprint.mjs` y ejecuta `node scripts/build-wordpress-blueprint.mjs`. Regenera la carpeta `deliverables/wordpress/`.
5. **Probar.** Envía el formulario de la landing. El registro aparece en Airtable. En el módulo 1 del escenario principal elige *Choose where to start → All* y pulsa *Run once*: los correos salen a la dirección configurada en los módulos Gmail.

Si cambias el diseño de los correos o el prompt, ejecuta `node scripts/build-make-blueprint.mjs` para regenerar el blueprint. Parte de [`source/exported.sanitized.json`](deliverables/make/source/exported.sanitized.json), un export real de Make sin credenciales.

## Qué hay en el repositorio

```
deliverables/            lo que se entrega
  make/                  blueprints de Make, vista previa de correos y su fuente
  wordpress/             landing (HTML), blueprint de Playground, capturas y logo
  LINKS.md               enlaces: formulario de Airtable, webhook, video
  PARTE4_IA_Y_DOCUMENTACION.md
scripts/                 código que genera todo lo anterior
  landing/entrelingo.html     fuente de la landing
  build-make-blueprint.mjs    genera el blueprint y los correos
  build-wordpress-blueprint.mjs   genera la landing de WordPress
  create-airtable-schema.mjs, improve-airtable.mjs   crean la base en Airtable
```

## Decisiones

- **Landing como blueprint de WordPress Playground:** un enlace crea el sitio completo sin instalar nada.
- **Formulario propio → webhook de Make → Airtable:** el enunciado da puntos por usar webhook, y el registro queda con `Estado = Nuevo`, igual que si viniera del formulario de Airtable.
- **Identidad real de Entrelingo** (migración a Australia: traducciones NAATI, Skills Assessment, visas con agentes MARA): colores y logo tomados de su sitio. Los textos son redacción propia.
- **IA con un módulo HTTP a DeepInfra (Llama 3.3 70B):** tenía crédito y la API es compatible con OpenAI. El modelo 8B inventó un resumen en un mensaje corto; el 70B no.
- **Respuesta de la IA en una línea `Prioridad|resumen`, validada en Make:** si no empieza por Alta o Baja, se asigna Media. Un fallo nunca bloquea el lead.
- **El mensaje del lead se trata como dato dentro del prompt**, para resistir instrucciones inyectadas.
- **Blueprint generado por script desde un export real:** el HTML de los correos no es fiable de editar a mano en Make, y así queda reproducible y sin credenciales.

## Qué haría con más tiempo

- **Prompt adaptado al negocio:** hoy los criterios son genéricos; añadiría urgencia de plazos de visa y documentos por traducir.
- **Webhook protegido:** es público y solo tiene un campo trampa anti-bots; añadiría un token o reCAPTCHA.
- **Errores más completos:** solo está cubierta la llamada a la IA; faltan manejadores en Airtable y Gmail, y una ruta de respaldo en el router.
- **Mensajes con comillas dobles:** caen en el manejo de errores (prioridad Media y alerta); lo resolvería serializando el JSON en un módulo aparte.
- **Disparo instantáneo:** hoy el escenario principal consulta cada 15 minutos (plan gratuito).
- **Key de DeepInfra** como credencial de Make, no dentro del módulo.
- **Fotos del carrusel alojadas en WordPress:** hoy se cargan desde Wikimedia Commons (licencias CC BY / CC BY-SA, con crédito en la página).
- **Landing con analítica y política de privacidad**, necesarias en producción.
- **Pruebas automáticas:** hoy la verificación fue manual, con leads de prueba (Alta, Media, Baja y uno con comillas).
