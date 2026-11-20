# eLC Operations Hub

Centro de conocimiento y apoyo a la operación de **eLC**, un complemento de SAP con capacidades acotadas de mini-WMS. Su función es apoyar y conectar determinados procesos de almacén con SAP, según los módulos habilitados y la configuración de cada cliente.

> **Alcance:** este hub documenta únicamente pantallas, procesos, términos e integraciones propios de eLC que aparecen en la documentación disponible. No representa a eLC como un WMS general ni le atribuye funciones que no estén documentadas. No sustituye a SAP.

## Cómo abrirlo

No necesita instalación, build ni servidor.

1. Abre `index.html` con doble clic en Chrome, Edge o Firefox.
2. Si el navegador restringe alguna función, sirve la carpeta con un servidor local:

   ```powershell
   python -m http.server 8080
   ```

   Luego abre `http://localhost:8080`.

Los datos de clientes, dudas, fallos, mejoras, minutas y avance se guardan en el `localStorage` del navegador mediante la clave `elc-hub-v1`. Son datos locales por navegador y equipo; no se sincronizan entre usuarios.

## Qué incluye

| Sección | Para qué sirve |
| --- | --- |
| Panel | Resumen de avance, flujos documentados, pendientes y actividad reciente. |
| Guía eLC | Capítulos con propósito, pasos, resultado esperado, puntos críticos y límites conocidos. |
| Clientes | Fichas de configuración por cliente, ambientes, componentes, versiones y bitácora. |
| Dudas | Preguntas abiertas con prioridad, responsable y respuesta documentada. |
| Fallos y mejoras | Registro de incidencias, reproducción, impacto, versión y seguimiento. |
| Problemas | Diagnósticos de referencia, diferenciando lo confirmado de lo pendiente de validar. |
| Glosario | Términos y siglas que aparecen en eLC, en su operación o en su integración con SAP. |
| Minutas | Reuniones, decisiones y compromisos. |
| Ajustes y datos | Respaldo JSON, importación, reinicio y avisos de seguridad. |

Atajos: `Ctrl + K` o `/` abre la búsqueda global; `Esc` cierra modales.

## Estructura de archivos

```
index.html
assets/
  styles.css
  data.js
  guia-01.js … guia-04.js
  glosario.js
  problemas.js
  datos-iniciales.js
  app.js
  app-clientes.js
  app-soporte.js
  app-problemas.js
```

Orden de carga: `data.js` → contenido de la guía y datos de referencia → módulos de pantalla → `app.js`.

## Cómo editar el contenido

- **Guía eLC:** agrega o modifica artículos en `assets/guia-0N.js`.
- **Problemas:** usa `assets/problemas.js`. Distingue siempre los diagnósticos confirmados de las causas posibles.
- **Glosario:** agrega términos que aparezcan en pantallas o procedimientos de eLC, o que sean necesarios para entender su integración con SAP.
- **Datos iniciales:** edita `assets/datos-iniciales.js`. Se cargan como ejemplos cuando el navegador todavía no tiene información guardada.
- **Clientes, dudas, fallos, mejoras y minutas:** se crean desde la interfaz y quedan en el navegador local.

### Regla editorial

Cada afirmación operativa debe poder vincularse con una pantalla, una guía, una captura o un prueba registrada de eLC. Si algo no está comprobado, identifícalo como **pendiente de validar**. No se deben importar equivalencias, procesos, códigos, consultas SQL ni procedimientos de otras aplicaciones.

## Respaldo y restauración

1. Abre **Ajustes y datos**.
2. Pulsa **Exportar respaldo** para descargar un JSON.
3. Para restaurar, pulsa **Importar** y selecciona el archivo. La importación reemplaza los datos locales actuales.

Haz un respaldo antes de limpiar el navegador o cambiar de equipo.

## Seguridad y publicación

Este hub es una aplicación estática local y no tiene autenticación ni permisos multiusuario. El repositorio no debe contener datos reales de clientes, contraseñas, tokens, cadenas de conexión, IP privadas, URLs internas ni capturas con información confidencial.

Antes de compartir datos operativos reales, se necesita una solución aprobada por la organización que contemple autenticación, permisos por usuario/grupo, almacenamiento seguro, auditoría y tratamiento de adjuntos. Mientras eso no exista, utiliza datos anonimizados y mantén la información sensible fuera del repositorio.

## Pendientes documentales

Se mantienen como pendientes, hasta contar con evidencia de eLC y validación del responsable:

- Ruta y configuración autorizada del servicio/API del Hand Held por cliente y ambiente.
- Significado exacto de los códigos de ubicación utilizados en cada instalación.
- Definición y reglas exactas del LPN en eLC.
- Alcance y procedimiento de la pantalla Libro Diario de Kardex Contable.
- Validación de coordenadas y comportamiento de los buscadores.
- Reglas de almacenamiento para palets bloqueados, según la configuración del cliente.
- Condiciones de uso de ePacking en cada operación.
- Campos y criterios exactos del punto de reorden.

## Limitaciones conocidas

- Los datos no se comparten entre navegadores ni usuarios.
- No hay autenticación, permisos multiusuario, adjuntos ni historial de versiones.
- El buscador indexa el contenido local; no consulta eLC ni SAP.
- La impresión abre el diálogo del navegador; el usuario decide si guarda el documento como PDF.

Este hub es documentación de apoyo. La operación real debe seguir los procedimientos aprobados y la configuración vigente de eLC para cada cliente y versión.
