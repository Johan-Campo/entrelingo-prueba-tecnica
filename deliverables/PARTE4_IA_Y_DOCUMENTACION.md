# Parte 4 · IA y documentación

## 1. Herramientas de IA y cómo validé las respuestas

**Cómo usé la IA para construir.** Claude Code me ayudó a diseñar el esquema de Airtable, generar el blueprint de Make y redactar los correos. Para clasificar los leads uso un modelo de DeepInfra (Llama 3.3 70B) llamado desde Make.

**Prompt de clasificación (resumen).** Define las tres prioridades con criterios claros, pide una sola línea con el formato `Prioridad|resumen`, prohíbe inventar datos, incluye un ejemplo de cada nivel y trata el mensaje del lead como dato, nunca como instrucción.

**Cómo validé.**
- Probé con leads de los tres niveles. Con el modelo pequeño (8B), un mensaje corto ("solo estaba mirando") recibió prioridad Media y un resumen inventado; por eso cambié a un modelo mayor y endurecí el prompt. Después salió Baja con un resumen fiel.
- En Make, una fórmula solo acepta Alta, Media o Baja; cualquier otra respuesta se convierte en Media.
- Probé un mensaje con comillas y saltos de línea: el flujo no se rompe, avisa al administrador y el lead se guarda.

## 2. Cómo funciona (para quien no es técnico)

Entrelingo Group (Entrelingo, SkillsPRO y AustraliaPRO) ayuda a hispanohablantes a migrar a Australia: traducciones NAATI, Skills Assessment y visas con agentes MARA. El flujo asegura que cada consulta llegue rápido al equipo correcto y con su urgencia clara.

1. Una persona rellena el **formulario** de la landing (o el de Airtable) y aparece como una fila nueva en la tabla **Leads** de Airtable.
2. **Make** vigila la tabla. Cuando hay una fila nueva, envía el mensaje a la IA, que responde Alta, Media o Baja y un resumen.
3. Make **guarda** la prioridad y el resumen en esa fila.
4. Según la **marca** elegida, Make envía un correo al equipo correspondiente, con la prioridad, el resumen y un botón para abrir el lead.
5. Si la IA falla, el administrador recibe una alerta y el lead continúa con prioridad Media: nunca se pierde.

**Mantenimiento:** cambiar a quién llega cada correo se hace en los módulos "Aviso equipo..." (campo *To*). Cambiar los criterios de prioridad se hace en el prompt del módulo "2 · IA clasifica el lead". Cada módulo del escenario tiene una nota de color que explica su función.

## 3. Proceso que automatizaría con IA en una empresa como Entrelingo

**Seguimiento de leads que se enfrían.** Hoy alguien debe revisar a mano qué leads de prioridad Alta no han sido contactados. Propongo que Make compruebe cada día los leads Alta con estado "Nuevo" desde hace más de 24 horas, avise al equipo con un recordatorio y deje un **borrador de respuesta por WhatsApp redactado por la IA** (en el idioma del lead y con la información del servicio que pidió: traducción, Skills Assessment o visa). Un humano lo revisa y lo envía. Reduce el tiempo de primera respuesta sin quitar el trato humano.
