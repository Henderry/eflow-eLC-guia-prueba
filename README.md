# eLC Operations Hub

Centro de conocimiento y operación local para **eLC** y su **Hand Held (HH)**. Reúne una guía paso a paso, fichas de clientes, dudas de soporte, fallos y mejoras, problemas frecuentes, glosario y minutas en una sola página.

> Uso interno ePRAC. El contenido parte de `eLC.docx`, `Flujo general de trabajo ePrac WEB.docx`, `Anotaciones.txt`, `Conexion HH.txt`, `Reporte de fallos eLC.docx`, `Mejoras eLC.docx` y el documento maestro del ePRAC Hub. Valida siempre contra la versión de eLC del cliente antes de cambiar algo en producción.

## Cómo abrirla

No necesita instalación, build ni servidor.

1. Abre `index.html` con doble clic (Chrome, Edge o Firefox).
2. Si el navegador bloquea alguna función, sirve la carpeta con un servidor local:

   ```powershell
   # Opción con Python
   python -m http.server 8080

   # Opción con Node (si tienes npx)
   npx http-server . -p 8080
   ```

   Luego abre `http://localhost:8080`.

Los datos se guardan en el `localStorage` del navegador con la clave `elc-hub-v1`. Son **por navegador y por equipo**: no se sincronizan solos.

## Qué incluye

| Sección | Para qué sirve |
| --- | --- |
| Panel | Resumen de avance, flujo eLC, pendientes y actividad reciente. |
| Guía eLC | 10 capítulos con propósito, pasos, resultado esperado, puntos críticos y errores. |
| Clientes | Fichas con ambientes, VPN, componentes, versiones, enlaces y bitácora. |
| Dudas | Preguntas abiertas con prioridad, responsable, cliente y respuestas. |
| Fallos y mejoras | Registro con código, versión, reproducción, impacto y estado. |
| Problemas | Base de diagnóstico: síntoma, causas, solución y verificación. |
| Glosario | Términos de eLC, eWMS y logística. |
| Minutas | Reuniones, decisiones y compromisos con checklist. |
| Ajustes y datos | Respaldo JSON, importación, reinicio y política de seguridad. |

Atajos: `Ctrl + K` o `/` abre la búsqueda global; `Esc` cierra modales.

## Estructura de archivos

```
index.html                  Estructura de la página y orden de scripts
assets/
  styles.css                Diseño, componentes y estilos de impresión
  data.js                   Metadatos, flujo y pendientes por confirmar
  guia-01.js … guia-04.js   Contenido de la guía por capítulos
  glosario.js               Términos del glosario
  problemas.js              Base de problemas frecuentes
  datos-iniciales.js        Plantilla de cliente y datos de ejemplo
  app.js                    Núcleo: rutas, panel, guía, búsqueda, ajustes
  app-clientes.js           Clientes y bitácora
  app-soporte.js            Dudas, fallos/mejoras y minutas
  app-problemas.js          Problemas y glosario
```

### Orden de carga

`data.js` → contenido (`guia-*.js`, `glosario.js`, `problemas.js`, `datos-iniciales.js`) → módulos de pantalla (`app-*.js`) → `app.js`.

Si agregas un archivo nuevo, inclúyelo en `index.html` antes de `app.js`.

## Cómo editar el contenido

- **Guía:** agrega un objeto al arreglo del capítulo en `assets/guia-0N.js`. Los bloques disponibles son `p`, `h`, `h3`, `note`, `tip`, `warn`, `danger`, `steps`, `list`, `ol`, `kv`, `table`, `flow`, `code` y `quote`.
- **Problemas:** agrega un objeto a `assets/problemas.js` con `id`, `process`, `title`, `symptom`, `cause`, `solution`, `verify`, `tags`, `status` y `source`.
- **Glosario:** agrega `{ term, cat, def }` en `assets/glosario.js`.
- **Datos iniciales:** edita `assets/datos-iniciales.js`. Solo se aplican a un navegador sin datos guardados; si ya existe información local, usa Ajustes → Importar o borra los datos locales.
- **Clientes, dudas, fallos, mejoras y minutas:** se crean desde la interfaz y quedan en `localStorage`.

Regla editorial: separa lo **confirmado** de lo **pendiente**. Si un comportamiento no está documentado, regístralo como duda y no lo presentes como regla general.

## Respaldo y restauración

1. Abre **Ajustes y datos**.
2. Pulsa **Exportar respaldo**. Se descarga un JSON con clientes, dudas, registros, minutas y avance de lectura.
3. Para restaurar, pulsa **Importar** y elige el archivo. La importación **reemplaza** los datos locales.

Haz un respaldo antes de limpiar el navegador, cambiar de equipo o borrar datos del sitio. El avance de lectura también se pierde si limpias el almacenamiento.

## Seguridad

Este hub es local y no tiene autenticación. Por eso:

- **No guardes** contraseñas, cadenas de conexión, llaves, tokens ni datos personales sensibles.
- **No publiques** la carpeta con datos reales en un repositorio, hosting público o sitio sin autenticación.
- Para secretos usa el gestor aprobado por TI.
- Si vas a compartir el hub, comparte solo la versión sin datos reales (o exporta/importa fichas anonimizadas).

Antes de publicarlo con datos de clientes se necesita, como mínimo:

1. Autenticación y permisos por grupo.
2. Base de datos con RLS (por ejemplo Supabase/PostgreSQL).
3. Almacenamiento privado para adjuntos con URLs firmadas.
4. Registro de auditoría de cambios.

Mientras eso no exista, el hub debe quedarse en local o en una carpeta controlada.

## Contenido confirmado y pendientes

La guía distingue dos niveles:

- **Confirmado:** coincide con las fuentes y con el flujo operativo conocido de eLC.
- **Por confirmar:** aparece marcado en el panel, en problemas o en las dudas. No debe usarse como procedimiento oficial hasta validarlo con el cliente o con el equipo de eLC.

Pendientes importantes ya registrados: ruta exacta del API y del encriptador del HH, semántica de códigos de ubicación, definición oficial de LPN, alcance del Kardex, validación de coordenadas/buscadores en la web, palets bloqueados de Pastas Roma, comportamiento de ePacking por cliente y campos exactos del punto de reorden.

## Limitaciones conocidas

- Los datos no se comparten entre navegadores ni usuarios.
- No hay adjuntos ni historial de versiones.
- La impresión genera una ventana con la guía; el PDF se guarda desde el diálogo del navegador.
- El buscador global indexa contenido local; no consulta eLC ni SAP.

## Próximos pasos sugeridos

1. Validar y cerrar las dudas marcadas como abiertas.
2. Reemplazar la plantilla de cliente por fichas reales (sin secretos).
3. Cargar los problemas confirmados en el flujo de soporte.
4. Definir autenticación y RLS antes de publicar.
5. Migrar el contenido a una base de datos cuando el modelo esté estable.
