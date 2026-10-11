# Prueba técnica · Especialista Jr IT & Automatización (Entrelingo Group)

Captación de leads de **Entrelingo, SkillsPRO y AustraliaPRO**: formulario → Airtable → clasificación con IA en Make → aviso por correo al equipo de la marca correcta, sin trabajo manual.

```
Formulario Airtable ──▶ Tabla Leads ──▶ Make (cada lead nuevo)
                                         ├─ IA: Alta / Media / Baja + resumen de una línea
                                         ├─ Valida la respuesta y actualiza Airtable
                                         └─ Router por marca ──▶ correo HTML al equipo
                                              └─ si la IA falla: alerta al admin y el lead sigue con prioridad Media
```

## Estado frente al enunciado

| Parte | Estado |
|---|---|
| 1 · Airtable (base, tabla, 10 campos, formulario) | Hecho. Link en `deliverables/LINKS.md` |
| 1 · Vista filtrada "Nuevos por marca" | **Por confirmar**: se debe crear en la interfaz; la API de Airtable no crea vistas |
| 2 · Make (trigger, IA, update, router por marca, errores) | Hecho y probado con 5 leads. Blueprint en `deliverables/make/blueprint.json` |
| 3 · Landing en WordPress (hero con ruta animada, proceso en 3 pasos, carrusel de destinos, riesgos que se resuelven, preguntas frecuentes, formulario propio → webhook de Make) | Hecho y probado de punta a punta con la versión final: el envío de prueba llegó a Airtable con `Estado = Nuevo`. Revisada en escritorio; la vista móvil se comprobó solo por ausencia de desborde a 390 px (sin captura). Blueprint en `deliverables/wordpress/` y capturas en `screenshots/` |
| 4 · Documento de 1 página | Borrador en `deliverables/PARTE4_IA_Y_DOCUMENTACION.md` |
| Video 5-10 min | **Pendiente** |

## Setup / Run

Verificado en esta cuenta; la importación del blueprint se probó en la interfaz de Make.

1. **Airtable** (una sola vez; crea la tabla en la base indicada en `.env`): `node scripts/create-airtable-schema.mjs`. Volver a ejecutarlo crearía una segunda tabla "Leads". `node scripts/improve-airtable.mjs` añade descripciones a los campos.
2. **Make**: *Create scenario → ⋯ → Import blueprint* con `deliverables/make/blueprint.json`. Elegir tus conexiones de Airtable y Gmail, y pegar la key de DeepInfra en el header `Authorization` del módulo 2 (el blueprint lleva un marcador, nunca la key real).
3. **Probar**: en el módulo 1, *Choose where to start → All*, luego *Run once*. Los correos salen a la dirección configurada en los módulos Gmail.
4. **Regenerar el blueprint** tras cambios: `node scripts/build-make-blueprint.mjs` (parte de `deliverables/make/source/exported.sanitized.json`, un export real de Make sin credenciales).

`.env` (no versionado) necesita `AIRTABLE_TOKEN` y `AIRTABLE_BASE_ID`.

## Decisiones

- **Landing como Blueprint de WordPress Playground:** un solo enlace crea el sitio completo (página, portada y estilos) sin instalar nada. Playground es efímero: los cambios no persisten.
- **Formulario propio de la landing → webhook de Make → Airtable** (escenario `Landing → Airtable (webhook)`, blueprint en `deliverables/make/landing-webhook.blueprint.json`): el enunciado da puntos extra por el webhook y deja los datos con `Estado = Nuevo`, así los recoge el escenario principal igual que si vinieran del formulario de Airtable.
- **Landing con la identidad real de Entrelingo** (empresa de migración a Australia: traducciones NAATI, Skills Assessment y asesoría con agentes MARA), colores y logo tomados de su sitio. Los textos son una redacción propia, no copy oficial.
- **DeepInfra por módulo HTTP en vez de OpenAI/Claude/Gemini nativo:** ya tenía crédito y la API es compatible con OpenAI; evita depender de otra cuenta de pago. Sigue siendo "un módulo de IA" en espíritu, no literal en el enunciado.
- **Modelo Llama 3.3 70B, no el 8B:** con el 8B, un mensaje corto ("solo estaba mirando") recibió prioridad Media y un resumen inventado. Con el 70B salió Baja y fiel. Lo comprobé con 5 leads.
- **Respuesta de la IA en una línea `Prioridad|resumen` y validación en Make:** si la respuesta no empieza por Alta o Baja se asigna Media; un fallo nunca bloquea el lead.
- **El mensaje del lead se trata como dato dentro del prompt** para resistir instrucciones inyectadas ("ignora lo anterior").
- **Blueprint generado por script desde un export real:** el HTML de los correos y las variables no son fiables de editar a mano en el editor de Make; así queda reproducible y sin credenciales en el repo.
- **Disparo por consulta cada 15 minutos (plan gratuito)** con el campo "Fecha de creación" como vigilante.

## Trade-offs / qué haría con más tiempo

- **El prompt de clasificación todavía usa criterios genéricos** (inscribirse, precios, fechas). Lo adaptaría al negocio real: urgencia de plazos de visa, documentos por traducir, etc.
- **Fotos del carrusel enlazadas desde Wikimedia Commons** (CC BY / CC BY-SA, créditos en la página): Commons limita peticiones y podría fallar bajo tráfico; en producción las alojaría en la propia biblioteca de medios.
- **Enlace de Playground de ~107 KB** (creció con el rediseño): funciona pegándolo en el navegador, pero no es cómodo de compartir. Con el repositorio en GitHub bastaría `?blueprint-url=` con la URL raw (no lo he verificado).
- **Webhook público sin autenticación**: un bot podría enviar leads falsos. Mitigado solo con un campo trampa (honeypot); añadiría un token o reCAPTCHA.
- **Landing sin analítica ni política de privacidad enlazada**, necesarias en producción.
- **Comillas dobles en el mensaje:** no logré escribir un reemplazo válido en Make; ese lead cae en el manejo de errores (Media + alerta). Lo resolvería con un webhook y un módulo que serialice el JSON.
- **Manejo de errores solo en la llamada a la IA:** faltan handlers en la actualización de Airtable y en los Gmail, y una ruta de respaldo en el router para marcas inesperadas.
- **Trigger instantáneo (webhook)** en lugar de consulta cada 15 min; encajaría con la landing.
- **Key de DeepInfra:** vive dentro del módulo HTTP; la movería a una credencial de Make.
- **Colores de las opciones y `Estado = Nuevo` por defecto en Airtable:** solo por interfaz, no automatizado.
- **Sin tests automáticos:** la verificación fue manual, con leads de prueba por API (Alta, Media, Baja y un caso con comillas).
