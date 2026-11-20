/* Capítulos 9 y 10 de la guía eLC */

(window.ELC_DATA.guide ||= []).push(
  {
    id: "configuracion",
    title: "Configuración y catálogos",
    icon: "settings",
    summary: "SKU, layouts, etiquetas, impresoras, operadores y reglas de compañía.",
    articles: [
      {
        id: "especializacion-sku",
        title: "Especialización de SKU",
        summary: "Rotación, vencimientos, presentaciones y transformación de artículos.",
        tags: ["Configuración", "SKU", "Catálogos"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "En Especialización SKU se configura el comportamiento del artículo: días de vencimiento, estrategia de rotación, presentaciones y reglas de transformación. Es una de las pantallas que más impacta la operación diaria.",
          },
          {
            t: "kv",
            rows: [
              ["Rotación", "FEFO (primero en vencer, primero en salir) o FIFO (primero en entrar, primero en salir)."],
              ["Gestión de lote en picking", "Define si el picking trabaja con lote y con qué criterio de rotación."],
              ["Días de caducidad para recibo", "Mínimo de días de vida que debe tener un producto para ser recibido."],
              ["Días de caducidad para despacho", "Mínimo de días de vida que debe tener un producto para ser despachado."],
              ["Presentaciones", "Cómo entra y cómo sale el artículo: cajas, unidades u otra presentación."],
              ["Transformación", "Configuración de artículos que se ensamblan después para formar otro producto."],
              ["Dimensión de campos", "Dimensiones de los palets que se van a crear; se pueden modificar después."],
            ],
          },
          {
            t: "note",
            title: "Códigos heredados de eWMS",
            x: "En el levantamiento con Bryan se mencionaron códigos de eWMS: TPCRRO (rotación), TPPRMI (presentación mínima), TPPRMA (presentación máxima), TPPRRE (cómo ingresa), TPPREX (cómo sale) y TPPRAL (cómo se maneja). Confirma cómo se muestran en eLC antes de usarlos como referencia oficial.",
          },
          {
            t: "warn",
            title: "Las presentaciones deben coincidir",
            x: "Si la presentación de ingreso, salida y manejo no coincide, el sistema puede calcular mal las cantidades. Valida la plantilla completa antes de cargar artículos en producción.",
          },
          {
            t: "tip",
            title: "Usa la plantilla de artículos",
            x: "La forma recomendada de conocer la estructura es descargar la plantilla desde Artículos Gestión y revisar las columnas antes de cargar. No inventes columnas ni dejes campos críticos vacíos.",
          },
          {
            t: "warn",
            title: "Producto de más y producto de menos",
            x: "Las columnas que permiten producto de más o de menos se usan para admitir tolerancias en recepción, expedición o toma física. Configurarlas mal abre la puerta a diferencias no controladas.",
          },
        ],
      },
      {
        id: "layouts",
        title: "Catálogo de layouts",
        summary: "El equivalente a Almacenamientos Ubicaciones: buscar y configurar ubicaciones.",
        tags: ["Configuración", "Layouts", "Ubicaciones"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "El Catálogo de layouts es el equivalente a Almacenamientos Ubicaciones de eWMS. Permite buscar una ubicación de un almacén y realizar configuraciones específicas sobre ella.",
          },
          {
            t: "steps",
            items: [
              ["Selecciona el almacén", "Confirma que estás en el almacén correcto, sobre todo si el cliente tiene varias sucursales."],
              ["Busca la ubicación", "Usa el código o los filtros disponibles. Verifica pasillo, nivel y posición."],
              ["Revisa la configuración", "Estado, zona de almacenaje, zona de picking y restricciones de la ubicación."],
              ["Ajusta solo lo necesario", "Los cambios de layout afectan inventario y tareas. Documenta el antes y el después."],
              ["Valida en el HH", "Confirma que el operador puede escanear y operar la ubicación después del cambio."],
            ],
          },
          {
            t: "note",
            title: "Coordenadas y orientación",
            x: "En la creación de ubicaciones, el eje constante depende de la orientación de los racks: si miran hacia abajo o hacia un lado, el eje fijo puede ser X o Y. Se toma como referencia el mapa del cliente.",
          },
          {
            t: "warn",
            title: "Dudas abiertas",
            x: "No está resuelto por qué no se validan las coordenadas en la web ni por qué los buscadores no funcionan como se espera. Están registradas en Dudas. No cambies coordenadas de ubicaciones con inventario sin respaldo y validación.",
          },
          {
            t: "danger",
            title: "Un layout no es un dibujo",
            x: "Cambiar una ubicación puede dejar tareas huérfanas, inventario inaccesible o rutas de picking incorrectas. Hazlo con el mapa del almacén a la vista y en una ventana de mantenimiento.",
          },
        ],
      },
      {
        id: "catalogo-clientes",
        title: "Catálogo de clientes de eLC",
        summary: "La pantalla operativa de clientes, distinta de la ficha comercial del hub.",
        tags: ["Configuración", "Clientes"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "eLC tiene una pantalla de Catálogo de clientes que, como su nombre indica, maneja el catálogo de clientes de la operación. Su implementación depende de la empresa: no todas la usan.",
          },
          {
            t: "note",
            title: "No confundir con la ficha del hub",
            x: "La sección Clientes de este hub guarda contexto comercial y operativo: contactos, VPN, ambientes, versiones, proceso y bitácora. El Catálogo de clientes de eLC es la entidad que usa el WMS para operar. Pueden tener el mismo nombre y no ser lo mismo.",
          },
          {
            t: "kv",
            rows: [
              ["Cuándo se usa", "Cuando la operación maneja inventario o documentos separados por cliente."],
              ["Qué define", "La relación operativa del cliente con el almacén y sus documentos."],
              ["Qué no define", "La relación comercial, los contactos o el contexto del proyecto."],
            ],
          },
          {
            t: "warn",
            title: "Confirma si está implementado",
            x: "No asumas que el catálogo está activo solo porque la pantalla existe. Pregunta si la empresa lo implementó y cómo se relaciona con la operación real.",
          },
        ],
      },
      {
        id: "etiquetas-impresoras",
        title: "Editor de etiquetas e impresoras",
        summary: "Etiquetas predeterminadas, diseño y verificación de impresoras operativas.",
        tags: ["Configuración", "Etiquetas", "Impresoras"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "El editor de etiquetas sirve para definir etiquetas predeterminadas de ubicaciones, artículos y otros elementos. Incluye un editor con múltiples opciones de diseño para mantener una estructura clara y consistente.",
          },
          {
            t: "steps",
            items: [
              ["Define el tipo de etiqueta", "Ubicación, artículo, LPN u otro. Cada una tiene campos distintos."],
              ["Selecciona la plantilla", "Parte de una etiqueta existente o crea una nueva con la estructura aprobada."],
              ["Configura el diseño", "Tamaño, campos, código de barras, logo y textos. No agregues datos que no existan."],
              ["Prueba la impresión", "Imprime una muestra y valida que el código se lea con el escáner del HH."],
              ["Publica y documenta", "Registra la versión y el cambio para que otros puedan revertir."],
            ],
          },
          { t: "h", x: "Impresoras" },
          {
            t: "p",
            x: "La pantalla de Impresoras muestra la instalación del software que las administra, su flujo de instalación, su funcionamiento y cuáles están operativas.",
          },
          {
            t: "table",
            head: ["Síntoma", "Qué revisar"],
            rows: [
              ["La etiqueta sale en blanco", "Plantilla, campos vacíos o configuración del software."],
              ["El código no se lee", "Tamaño, contraste, velocidad de impresión o limpieza del cabezal."],
              ["La impresora no aparece", "Software de administración, red o controlador."],
              ["Imprime en otra impresora", "Cola de impresión o impresora predeterminada del equipo."],
            ],
          },
          {
            t: "warn",
            title: "Cambios de etiqueta afectan piso",
            x: "Una etiqueta mal diseñada puede impedir que el HH lea ubicaciones o artículos. Prueba con una muestra antes de reemplazar la plantilla de toda la operación.",
          },
        ],
      },
      {
        id: "operadores-roles",
        title: "Operadores y roles",
        summary: "Usuarios, perfiles y roles con la misma lógica de recursos de eWMS.",
        tags: ["Configuración", "Seguridad", "Usuarios"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "En Operadores & Roles se administran los usuarios, perfiles y roles. La lógica es muy parecida o casi igual a la de recursos de eWMS.",
          },
          {
            t: "p",
            x: "Si necesitas crear un operador desde cero, sigue la cadena completa de la página “Usuarios, perfiles, recursos y permisos”: usuario, perfil, recurso perfil, recurso, enlace, asignaciones de seguridad, permisos por pantalla y zona de trabajo.",
          },
          {
            t: "warn",
            title: "El permiso visual no basta",
            x: "Que un usuario vea una pantalla no significa que pueda ejecutar la acción. Revisa permisos por pantalla y módulo Android. El fallo FAL-001 de Alisto es un ejemplo real de esta diferencia.",
          },
          {
            t: "tip",
            title: "Altas y bajas ordenadas",
            x: "Cuando alguien sale de la operación, bloquea el usuario y retira sus asignaciones. Un usuario activo sin persona real es un riesgo de trazabilidad y seguridad.",
          },
        ],
      },
      {
        id: "reglas-compania",
        title: "Reglas de compañía y catálogo de artículos",
        summary: "Los valores 60, 80, 75 y 50, el artículo fijo y las reglas que mandan en la configuración.",
        tags: ["Configuración", "Reglas", "Catálogos"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "Las reglas de compañía son prioritarias para cada configuración. En el levantamiento con Bryan se registraron los siguientes valores de referencia de eWMS; confirma su equivalencia exacta en eLC antes de usarlos como regla oficial.",
          },
          {
            t: "table",
            head: ["Valor", "Uso registrado"],
            rows: [
              ["60", "Rack picking."],
              ["80", "Expedición."],
              ["75", "Driving."],
              ["50", "Block."],
            ],
          },
          {
            t: "kv",
            rows: [
              ["Artículo fijo", "Define que solo ese artículo estará en ese estante."],
              ["Reglas de compañía", "Afectan la configuración del almacén y tienen prioridad sobre otras reglas."],
              ["Catálogo de artículos", "Se estructura con la plantilla de Artículos Gestión y los códigos de presentación y rotación."],
            ],
          },
          {
            t: "warn",
            title: "Referencia de levantamiento",
            x: "Estos valores provienen de una reunión y de la lógica de eWMS. No los apliques a ciegas en eLC: valida con sistemas y con el cliente, y documenta la versión en la que aplican.",
          },
          {
            t: "danger",
            title: "No cambies reglas en producción",
            x: "Una regla de compañía mal modificada puede alterar el comportamiento de todo el almacén. Haz el cambio en QA, con respaldo y aprobación.",
          },
        ],
      },
    ],
  },

  {
    id: "diagnostico",
    title: "Problemas y diagnóstico",
    icon: "wrench",
    summary: "Un método corto para ubicar la causa antes de escalar y dos checklists que resuelven la mayoría de los casos.",
    articles: [
      {
        id: "metodo-diagnostico",
        title: "Método de diagnóstico en cinco pasos",
        summary: "Documento, recurso, inventario, integración y evidencia: el orden correcto para no adivinar.",
        tags: ["Soporte", "Diagnóstico"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "La mayoría de los reportes de eLC se resuelven mirando cinco cosas en orden. El error común es empezar por la última: “no integró a SAP”.",
          },
          {
            t: "steps",
            items: [
              ["Ubica el documento y su estado", "¿Existe? ¿Está generado, asignado, finalizado sin integrar o integrado? Sin esto, cualquier otra revisión es a ciegas."],
              ["Revisa el recurso y sus permisos", "Módulo Android, permiso de pantalla, enlace recurso-usuario, bloqueo y zona de trabajo."],
              ["Revisa inventario y ubicación", "¿Hay stock? ¿Está vencido? ¿La ubicación está bloqueada? ¿El artículo tiene picking y zonas configuradas?"],
              ["Revisa la integración", "¿El documento está completo? ¿SAP respondió? ¿Hay diferencias o errores de interfaz?"],
              ["Reúne evidencia y escala", "Documento, viaje, LPN, artículo, hora, mensaje y captura. Sin evidencia, el soporte vuelve a empezar."],
            ],
          },
          {
            t: "table",
            head: ["Lo que reporta el usuario", "Primer lugar donde mirar"],
            rows: [
              ["“No me aparece la tarea”", "Estado del documento y asignación; después permisos y zona de trabajo."],
              ["“No puedo confirmar”", "Ubicación bloqueada, zona incorrecta, artículo pendiente o diferencia."],
              ["“No se generó la acción”", "Inventario vencido, sin stock, artículo sin picking o ubicación bloqueada."],
              ["“No integró a SAP”", "Documento incompleto, integración pendiente o error de interfaz."],
              ["“El HH apunta a otro cliente”", "Cadena de conexión del API y ambiente."],
            ],
          },
          {
            t: "tip",
            title: "Una pregunta que ahorra tiempo",
            x: "Pregunta siempre: “¿esto funcionaba antes y dejó de funcionar, o nunca funcionó?”. La respuesta separa un cambio reciente de una configuración faltante.",
          },
        ],
      },
      {
        id: "checklist-acciones",
        title: "Checklist: no se generan acciones",
        summary: "Las cinco causas documentadas y cómo verificar cada una.",
        tags: ["Picking", "Expedición", "Checklist"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "Cuando se genera una expedición y no aparecen acciones, revisa estas cinco causas antes de escalar. Están documentadas en las notas de operación de eLC y aplican también a la lógica heredada de eWMS.",
          },
          {
            t: "steps",
            items: [
              ["Inventario vencido", "Verifica la fecha de vencimiento del lote. Si está vencido, el sistema no genera la acción. Revisa si corresponde un ajuste o una disposición del cliente."],
              ["Ubicación bloqueada", "Consulta el estado de la ubicación en el catálogo de layouts. Una ubicación bloqueada no participa."],
              ["No hay inventario", "Confirma el saldo por artículo y ubicación. Si el saldo es cero, no hay acción posible."],
              ["Artículo sin picking configurado", "Revisa la configuración del artículo: zona de picking, presentación y reglas. Sin picking, no se genera alisto."],
              ["Sin acciones relacionadas al inventario a despachar", "Puede que el inventario exista, pero no tenga una acción asociada al documento. Revisa la generación y el detalle de la expedición."],
            ],
          },
          {
            t: "note",
            title: "Cómo verificar sin adivinar",
            x: "Para cada causa, deja evidencia: captura del saldo, estado de la ubicación, fecha del lote o configuración del artículo. Así el siguiente nivel no repite el análisis.",
          },
          {
            t: "warn",
            title: "No fuerces la acción",
            x: "Crear una acción manual sin corregir la causa puede mover inventario equivocado. Primero entiende por qué no se generó.",
          },
          {
            t: "tip",
            title: "Caso especial: SQL",
            x: "En eWMS se usaba exec SPR_AUTO_GENERA_ACCIONES para generar acciones por SQL. No lo ejecutes en eLC sin confirmar que el procedimiento existe y que está autorizado para esa versión y ambiente.",
          },
        ],
      },
      {
        id: "checklist-recurso",
        title: "Checklist: el recurso no atiende acciones",
        summary: "La acción existe, pero el recurso no la ve o no puede tomarla. Tres causas documentadas.",
        tags: ["HH", "Recursos", "Checklist"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "Si la acción sí existe en la torre de control pero el recurso no la atiende, el problema está en la configuración del recurso o de su zona, no en la generación.",
          },
          {
            t: "steps",
            items: [
              ["El almacén del recurso no coincide con la zona", "Revisa la configuración de almacén recurso. Debe estar alineada con la zona donde está la tarea."],
              ["El recurso está bloqueado", "Consulta el estado del recurso. Un recurso bloqueado no recibe trabajo."],
              ["La zona de trabajo no está configurada", "Verifica que la zona de trabajo del recurso incluya el tipo de trabajo (PICK, EXES, EXCO, UBRE, UBCO, REPI)."],
            ],
          },
          {
            t: "table",
            head: ["Verificación", "Dónde se hace"],
            rows: [
              ["Módulo Android asignado", "Asignaciones de seguridad del usuario."],
              ["Permiso de la pantalla", "Permisos por pantalla."],
              ["Enlace recurso-usuario", "Configuración del recurso."],
              ["Almacén y zona del recurso", "Almacén recurso y zona de trabajo recurso."],
              ["Bloqueo del recurso", "Estado del recurso."],
            ],
          },
          {
            t: "warn",
            title: "Dos causas parecidas",
            x: "“No hay acciones” y “no las toma” se confunden todo el tiempo. Si la acción aparece en la torre, no sigas revisando inventario: revisa al recurso.",
          },
          {
            t: "tip",
            title: "Prueba controlada",
            x: "Asigna una tarea de prueba a un recurso que sí opera y compara su configuración con la del recurso que falla. La diferencia suele aparecer en minutos.",
          },
        ],
      },
    ],
  }
);
