/* =========================================================
   eLC Operations Hub · datos base
   Los módulos de contenido se cargan después:
   guia-01.js, guia-02.js, guia-03.js, guia-04.js,
   glosario.js, problemas.js y datos-iniciales.js
   ========================================================= */

window.ELC_DATA = {
  meta: {
    title: "eLC Operations Hub",
    subtitle: "Guía, clientes y soporte de eLC y su Hand Held",
    version: "1.0",
    updated: "2026-11-20",
    company: "ePRAC",
    disclaimer:
      "Contenido de uso interno basado en eLC.docx, Flujo general de trabajo ePrac WEB, Anotaciones, Conexion HH y el documento maestro del ePRAC Hub (20/11/2026). Valida siempre contra la versión de eLC del cliente antes de ejecutar un cambio en producción.",
    sources: [
      "eLC.docx — aprendizaje y flujo de eLC",
      "Flujo general de trabajo ePrac WEB.docx",
      "Anotaciones.txt y Conexion HH.txt",
      "Reporte de fallos eLC.docx y Mejoras eLC.docx (19-20/11/2026)",
      "ePRAC Hub — documento maestro de contexto (20/11/2026)",
    ],
  },

  flow: [
    {
      n: 1,
      title: "Llega el documento",
      text: "SAP envía la información. eLC la convierte y genera la recepción o expedición.",
      route: "guia/recepcion/flujo-recepcion",
    },
    {
      n: 2,
      title: "Se asigna",
      text: "Bolsa de tareas, asignación manual o automática al recurso activo en el HH.",
      route: "guia/torre-control/estados-documentos",
    },
    {
      n: 3,
      title: "Se ejecuta",
      text: "Recepción, almacenaje, alisto, reabastecimiento y carga desde el Hand Held.",
      route: "guia/picking/alisto-hh",
    },
    {
      n: 4,
      title: "Se confirma",
      text: "El documento se cierra y se revisa en la torre de control.",
      route: "guia/torre-control/vista-general",
    },
    {
      n: 5,
      title: "Se integra",
      text: "Finalizadas sin integrar → Integradas SAP. El alisto se integra al cerrar la carga.",
      route: "guia/recepcion/integracion-sap",
    },
    {
      n: 6,
      title: "Se audita",
      text: "Saldos de inventario, trazabilidad de movimientos y conteos.",
      route: "guia/inventario/trazabilidad",
    },
  ],

  pending: [
    {
      title: "Ubicación exacta de la carpeta del API y del encriptador",
      area: "Conexión HH",
      detail:
        "El procedimiento está claro, pero falta confirmar la ruta corporativa exacta y el nombre del encriptador interno en cada equipo.",
    },
    {
      title: "Semántica de los códigos de ubicación",
      area: "Layouts",
      detail:
        "Códigos como 2-3-15-1 se interpretaron como pasillo, nivel, columna y posición. Confirmar con el mapa real de cada cliente.",
    },
    {
      title: "Definición exacta de LPN en eLC",
      area: "Inventario",
      detail:
        "Se usa como palet, tarima o contenedor. La pantalla LPNs muestra estado y acciones; falta documentación oficial que lo cierre.",
    },
    {
      title: "Libro Diario de Kardex Contable",
      area: "Inventario",
      detail:
        "La pantalla existe, pero no hay procedimiento documentado en las fuentes. No inventar su uso contable.",
    },
    {
      title: "Validación de coordenadas y buscadores en la web",
      area: "Catálogo de layouts",
      detail:
        "Hay dudas abiertas de por qué no se validan coordenadas y por qué los buscadores no responden como se espera.",
    },
    {
      title: "Regla de almacenaje para palets bloqueados",
      area: "Almacenaje",
      detail:
        "Se registró una solicitud relacionada con palets bloqueados. Falta confirmar la regla de negocio específica para el cliente y la versión de eLC.",
    },
    {
      title: "Comportamiento de ePacking por cliente",
      area: "ePacking",
      detail:
        "El palet debe estar en packing para cargar solo en clientes que empacan. Confirmar el flujo exacto en cada operación.",
    },
    {
      title: "Campos exactos del punto de reorden",
      area: "Restablecimiento",
      detail:
        "La lógica se conoce; falta confirmar nombres de campos, mínimos, máximos y zonas de origen en la versión del cliente.",
    },
  ],

  guide: [],
  glossary: [],
  problems: [],

  seed: {
    clients: [],
    doubts: [],
    records: [],
    meetings: [],
  },
};
