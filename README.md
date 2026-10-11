# Prueba técnica · Especialista Jr IT & Automatización · Entrelingo Group

Construí un sistema que capta a los interesados de **Entrelingo, SkillsPRO y AustraliaPRO**, los clasifica con IA y avisa por correo al equipo correcto, sin que nadie tenga que hacer nada a mano.

```
Landing (formulario) ─▶ webhook de Make ─┐
                                         ├─▶ Airtable (tabla Leads)
Formulario de Airtable ──────────────────┘          │
                                                    ▼
                  Make: la IA decide prioridad Alta / Media / Baja y resume el mensaje en una línea
                                                    │
                       guarda el resultado en Airtable ─▶ router por marca ─▶ correo al equipo
                                                    │
                  si la IA falla: aviso al administrador y el lead sigue con prioridad Media
```

## Dónde está cada entregable

| Entregable de la prueba | Dónde verlo | Estado |
|---|---|---|
| **Parte 1** · Base y formulario de Airtable | Enlace en [`deliverables/LINKS.md`](deliverables/LINKS.md) | Hecho |
| **Parte 1** · Vista filtrada "Nuevos por marca" | Creada en Airtable (Estado = Nuevo, agrupada por marca). Captura: [`02-vista-nuevos-por-marca.jpg`](deliverables/airtable/screenshots/02-vista-nuevos-por-marca.jpg) | Hecho |
| **Parte 1** · Capturas de la base | [`deliverables/airtable/screenshots/`](deliverables/airtable/screenshots/) | Hecho |
| **Parte 2** · Blueprint de Make (.json) | [`deliverables/make/blueprint.json`](deliverables/make/blueprint.json) | Hecho y probado |
| **Parte 2** · Escenario del formulario web (webhook) | [`deliverables/make/landing-webhook.blueprint.json`](deliverables/make/landing-webhook.blueprint.json) | Hecho y probado |
| **Parte 2** · Diseño de los correos | [`deliverables/make/email-preview.html`](deliverables/make/email-preview.html) (descárgalo y ábrelo en el navegador) | Hecho: importado en Make y enviado a un correo real |
| **Parte 2** · Captura del escenario | [`escenario-ejecucion-exitosa.jpg`](deliverables/make/screenshots/escenario-ejecucion-exitosa.jpg) | Hecho |
| **Parte 3** · Landing en WordPress | Vista previa: [`deliverables/wordpress/preview.html`](deliverables/wordpress/preview.html). Capturas: [`screenshots/`](deliverables/wordpress/screenshots/) | Hecho y probado de punta a punta, también dentro de WordPress |
| **Parte 4** · Documento de IA y documentación | [`deliverables/PARTE4_IA_Y_DOCUMENTACION.md`](deliverables/PARTE4_IA_Y_DOCUMENTACION.md) | Hecho |
| **Video** de 5 a 10 minutos | — | **Pendiente** |

## Cómo verlo, sin instalar nada

1. **La landing:** descarga [`preview.html`](deliverables/wordpress/preview.html) y ábrelo en el navegador. Incluye animaciones, carrusel y formulario.
2. **La landing dentro de WordPress:** abre [este enlace](https://playground.wordpress.net/?blueprint-url=https://gist.githubusercontent.com/Johan-Campo/b0caae44bf854acaaed11dd0d37d60b9/raw/blueprint.json). Se crea un WordPress temporal con la página ya publicada; los cambios que hagas no se guardan. Si ese enlace dejara de funcionar, el contenido de [`playground-url.txt`](deliverables/wordpress/playground-url.txt) pegado en la barra de direcciones hace lo mismo, aunque es mucho más largo.
3. **Los correos:** abre [`email-preview.html`](deliverables/make/email-preview.html). Muestra los tres avisos, uno por marca, con datos de ejemplo.

## Cómo ejecutarlo

Necesitas cuentas gratuitas de Airtable y Make, y [Node.js](https://nodejs.org) 18 o superior.

1. **Airtable.** Crea un archivo `.env` con `AIRTABLE_TOKEN` y `AIRTABLE_BASE_ID`, y ejecuta `node scripts/create-airtable-schema.mjs`. Crea la tabla Leads con sus 10 campos; ejecútalo una sola vez. `node scripts/improve-airtable.mjs` añade las descripciones de los campos.
2. **Make, escenario principal.** En *Create scenario → ⋯ → Import blueprint* elige `deliverables/make/blueprint.json`. Selecciona tus conexiones de Airtable y Gmail, y pega tu key de DeepInfra en el encabezado `Authorization` del módulo 2.
3. **Make, formulario web.** Importa igual `landing-webhook.blueprint.json` y actívalo. Copia su URL de webhook.
4. **Landing.** Pon esa URL en `WEBHOOK_URL` de `scripts/build-wordpress-blueprint.mjs` y ejecuta `node scripts/build-wordpress-blueprint.mjs`. Regenera la carpeta `deliverables/wordpress/`.
5. **Probar.** Envía el formulario de la landing y comprueba que el registro aparece en Airtable. En el módulo 1 del escenario principal elige *Choose where to start → All* y pulsa *Run once*: los correos salen a la dirección configurada en los módulos Gmail.

Si cambio el diseño de los correos o el prompt de la IA, regenero el blueprint con `node scripts/build-make-blueprint.mjs`. Parte de [`source/exported.sanitized.json`](deliverables/make/source/exported.sanitized.json), un export real de mi escenario de Make sin credenciales.

## Qué hay en el repositorio

```
deliverables/            lo que entrego
  airtable/              capturas de la base y de la vista filtrada
  make/                  blueprints de Make, capturas, vista previa de correos y su fuente
  wordpress/             landing (HTML), blueprint de Playground, capturas y logo
  LINKS.md               enlaces: formulario de Airtable, webhook, video
  PARTE4_IA_Y_DOCUMENTACION.md
scripts/                 el código que genera todo lo anterior
  landing/entrelingo.html         fuente de la landing
  build-make-blueprint.mjs        genera el blueprint y los correos
  build-wordpress-blueprint.mjs   genera la landing de WordPress
  create-airtable-schema.mjs, improve-airtable.mjs   crean la base en Airtable
```

## Decisiones que tomé

- **La landing va en un blueprint de WordPress Playground.** Con un solo enlace se crea el sitio completo, sin instalar nada ni depender de un hosting. A cambio, es un sitio temporal: nada de lo que se haga en él se guarda.
- **Usé un formulario propio que envía a Make por webhook, en vez de incrustar el de Airtable.** La prueba valora el webhook, y además me deja diseñar el formulario como quiero. El lead entra a Airtable con `Estado = Nuevo`, igual que si viniera del formulario de Airtable, así que el escenario principal lo procesa sin cambios.
- **Diseñé la landing con la identidad real de Entrelingo** (migración a Australia: traducciones NAATI, Skills Assessment y visas con agentes MARA), con sus colores y su logo. Los textos son redacción mía, no copy oficial.
- **Para la IA llamo a DeepInfra con un módulo HTTP, no con el módulo nativo de OpenAI, Claude o Gemini.** Ya tenía crédito y su API es compatible con OpenAI. Es una desviación respecto a lo que pide el enunciado y prefiero decirla.
- **Cambié del modelo Llama 8B al 70B.** Con el 8B, un mensaje corto ("solo estaba mirando") recibió prioridad Media y un resumen inventado. Con el 70B salió Baja y fiel al mensaje; lo comprobé con 5 leads.
- **Pido a la IA una sola línea, `Prioridad|resumen`, y la valido en Make.** Si la respuesta no empieza por Alta o Baja, asigno Media. Un fallo de la IA nunca bloquea un lead.
- **Trato el mensaje del lead como un dato dentro del prompt**, para que no pueda darle órdenes a la IA ("ignora lo anterior").
- **Genero el blueprint con un script a partir de un export real.** El HTML de los correos y las variables no son fiables de editar a mano en Make, y así queda reproducible y sin credenciales en el repo.
- **El script de la landing lo imprime un mini-plugin de WordPress, no el contenido de la página.** Descubrí que WordPress reescribe `&&` como `&#038;&#038;` dentro del contenido, lo que rompía todo el JavaScript. Dentro de WordPress, el plugin también oculta la barra de administrador.

## Qué haría con más tiempo

- **Adaptar el prompt de la IA al negocio.** Hoy usa criterios genéricos (inscribirse, precios, fechas). Le añadiría la urgencia de plazos de visa y los documentos por traducir.
- **Proteger el webhook.** Es público y solo lo defiende un campo trampa contra bots; añadiría un token o reCAPTCHA.
- **Completar el manejo de errores.** Hoy solo cubro la llamada a la IA; faltan manejadores en la actualización de Airtable y en los correos, y una ruta de respaldo en el router para marcas inesperadas.
- **Resolver los mensajes con comillas dobles.** Hoy caen en el manejo de errores (prioridad Media y aviso); lo arreglaría serializando el JSON en un módulo aparte.
- **Pasar a disparo instantáneo.** El escenario principal consulta Airtable cada 15 minutos por el plan gratuito.
- **Mover la key de DeepInfra a una credencial de Make**, en vez de dejarla dentro del módulo.
- **Alojar las fotos del carrusel en WordPress.** Hoy se cargan desde Wikimedia Commons (licencias CC BY y CC BY-SA, con crédito en la página).
- **Añadir analítica y política de privacidad a la landing**, imprescindibles en producción.
- **Escribir pruebas automáticas.** Hasta ahora verifiqué a mano, con leads de prueba de prioridad Alta, Media y Baja y uno con comillas.
