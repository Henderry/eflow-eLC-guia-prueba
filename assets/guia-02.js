/* Capítulos 4 a 6 de la guía eLC */

(window.ELC_DATA.guide ||= []).push(
  {
    id: "almacenaje",
    title: "Almacenaje",
    icon: "database",
    summary: "Cómo ubicar el producto recibido y cómo comprobar que quedó en el lugar correcto.",
    articles: [
      {
        id: "almacenaje-hh",
        title: "Almacenaje en el Hand Held",
        summary: "LPN completo, traslado parcial o artículo específico: las tres formas de almacenar.",
        tags: ["Almacenaje", "HH", "Putaway"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "Después de recibir y confirmar, el producto sigue en una ubicación temporal. El almacenaje lo mueve a su ubicación definitiva. En eLC esta tarea puede llegar asignada desde la torre de control o tomarse desde la bolsa de tareas del HH.",
          },
          {
            t: "steps",
            items: [
              ["Abre Almacenaje en el HH", "Si la tarea está asignada, aparece en tu lista. Si está en bolsa, tómala desde Disponibles."],
              ["Escanea la ubicación o el LPN", "La pantalla te indica qué debes leer primero. Confirma que el LPN corresponde a la carga que vas a mover."],
              ["Elige el tipo de traslado", "Traslado parcial de artículos de un LPN, traslado específico de un LPN o traslado de toda la carga."],
              ["Escanea el destino", "Lee la ubicación sugerida o la ubicación física donde dejarás el producto. Verifica pasillo, nivel y posición."],
              ["Confirma el almacenaje", "Cierra la tarea. Si el sistema solicita confirmación adicional, léela antes de aceptar."],
              ["Repite si quedan LPN", "Continúa con el siguiente hasta terminar la carga."],
            ],
          },
          {
            t: "kv",
            rows: [
              ["Traslado parcial", "Mueve solo ciertos artículos o cantidades de un LPN. Útil cuando el palet se divide."],
              ["Traslado específico de LPN", "Mueve un LPN identificado de forma individual."],
              ["Traslado de toda la carga", "Mueve el conjunto completo. Se usa cuando todo el palet va a la misma ubicación."],
            ],
          },
          {
            t: "warn",
            title: "Ubicación bloqueada o zona incorrecta",
            x: "Si el HH no permite confirmar, revisa que la ubicación no esté bloqueada, que pertenezca a la zona de almacenaje del artículo y que el recurso tenga acceso a esa zona.",
          },
          {
            t: "tip",
            title: "Usa la ubicación sugerida con criterio",
            x: "La sugerencia del sistema ayuda, pero el operador debe validar que la ubicación física exista, esté libre y sea segura para el producto.",
          },
        ],
      },
      {
        id: "validar-almacenaje",
        title: "Validar que el almacenaje quedó bien",
        summary: "Saldos de inventario y trazabilidad para confirmar ubicación, LPN y movimiento.",
        tags: ["Almacenaje", "Inventario", "Verificación"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "Nunca cierres una recepción completa sin verificar que el producto quedó donde crees. La validación toma menos de un minuto y evita diferencias que después cuestan horas.",
          },
          {
            t: "steps",
            items: [
              ["Abre Saldos de inventario", "Busca por artículo, por ubicación o por LPN, según el dato que tengas más a mano."],
              ["Confirma la ubicación", "El saldo debe mostrar la ubicación de destino que escaneaste en el HH."],
              ["Confirma el LPN", "Verifica que el LPN sea el mismo que se almacenó y que la cantidad coincida."],
              ["Revisa la trazabilidad", "Abre Trazabilidad de movimientos y busca el movimiento por documento o número de viaje."],
            ],
          },
          {
            t: "table",
            head: ["Síntoma", "Qué revisar"],
            rows: [
              ["El saldo sigue en la ubicación temporal", "La tarea de almacenaje no se confirmó o quedó pendiente en el HH."],
              ["El LPN aparece en otra ubicación", "Se escaneó una ubicación distinta o el traslado se hizo parcial."],
              ["No aparece el artículo", "El artículo no estaba en la recepción o se almacenó con otro LPN."],
              ["La cantidad no coincide", "Diferencia en la recepción o traslado parcial mal aplicado."],
            ],
          },
          {
            t: "note",
            title: "Una sola fuente de verdad",
            x: "El saldo del sistema es la referencia para la operación. Si el piso y el sistema no coinciden, no ajustes a mano: documenta la diferencia y sigue el proceso de conteo o corrección.",
          },
        ],
      },
    ],
  },

  {
    id: "picking",
    title: "Picking y expediciones",
    icon: "target",
    summary: "Del pedido de SAP al palet listo: generación de acciones, alisto en HH y ePacking.",
    articles: [
      {
        id: "flujo-expedicion",
        title: "Flujo completo de una expedición",
        summary: "Órdenes pendientes, generación de acciones, alisto, empaque y carga con integración automática.",
        tags: ["Expedición", "Picking", "SAP"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "La expedición sigue un camino parecido al de la recepción, pero con un final distinto: la integración a SAP ocurre automáticamente al cerrar la carga del camión.",
          },
          {
            t: "flow",
            items: ["Órdenes SAP pendientes", "Generar acciones", "Asignar", "Alisto HH", "ePacking", "Carga camión", "Integración SAP"],
          },
          {
            t: "steps",
            items: [
              ["Revisa las órdenes pendientes de SAP", "Son los pedidos que todavía no se convirtieron en trabajo de almacén."],
              ["Genera la expedición y sus acciones", "Al generar, eLC crea los trabajos automáticos que el HH necesita para alistar."],
              ["Asigna las acciones", "Automática, manual o bolsa de tareas, según la configuración del cliente."],
              ["Revisa ASIGNADAS", "Ahí se ve a quién se asignó, qué LPN se espera y qué productos debe contener."],
              ["Alista en el HH", "El recurso lee origen, ubicación, artículos, palet de preparación y destino."],
              ["Empaca si aplica", "Si el cliente usa ePacking, el palet debe quedar en estado packing antes de cargar."],
              ["Carga el camión", "Se valida el palet y se cierra la carga desde el HH."],
              ["Verifica la integración", "Al cerrar la carga, la expedición se integra a SAP automáticamente."],
            ],
          },
          {
            t: "warn",
            title: "No todas las operaciones empacan",
            x: "El paso por ePacking depende del cliente. En operaciones que no empacan, el palet puede pasar directo a carga. Confirma la regla antes de bloquear una expedición.",
          },
          {
            t: "tip",
            title: "El detalle está en ASIGNADAS",
            x: "Antes de que el operador salga a piso, revisa en ASIGNADAS el LPN y los productos esperados. Evita alistos incompletos y regresos innecesarios.",
          },
        ],
      },
      {
        id: "alisto-hh",
        title: "Alisto en el Hand Held",
        summary: "Los seis pasos del trabajo automático y los errores que más se repiten.",
        tags: ["Picking", "HH", "Alisto"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "El alisto es el corazón del picking. El HH guía al recurso con una secuencia fija: origen, ubicación de origen, artículos, palet de preparación y ubicación de destino.",
          },
          {
            t: "steps",
            items: [
              ["Entra a Trabajo automático", "Abre la pantalla de trabajos automáticos del HH y selecciona la tarea asignada o disponible."],
              ["Lee el origen", "Escanea el origen que indica la pantalla, normalmente el campo U.Origen."],
              ["Lee la ubicación de origen", "Confirma el pasillo, nivel y posición. No asumas que la ubicación sugerida es la única válida."],
              ["Lee los artículos", "Escanea artículo, lote o serie y cantidad. Verifica que correspondan al LPN esperado."],
              ["Lee el palet de preparación", "Identifica el LPN o palet donde se colocará lo alistado."],
              ["Lee la ubicación de destino", "Normalmente el sistema la sugiere. Confirma y cierra la tarea."],
            ],
          },
          {
            t: "note",
            title: "Cuando termina",
            x: "La tarea se pone en verde en el monitor de acciones. Eso indica que la acción quedó finalizada, no que la expedición completa esté cerrada.",
          },
          {
            t: "warn",
            title: "Dudas abiertas de alisto",
            x: "Están registradas: no ver el LPN de origen en web pero sí en HH, que el artículo no corresponda, registrar dos SKU en el mismo LPN y que el match de lote no detecte el saldo. No inventes una solución: regístralas en Dudas con evidencia.",
          },
          {
            t: "danger",
            title: "Nunca inventes lote o cantidad",
            x: "Forzar un lote “que cuadre” rompe la trazabilidad y puede despachar producto equivocado. Si el sistema no encuentra el saldo, detén la tarea y escala.",
          },
        ],
      },
      {
        id: "trabajos-automaticos",
        title: "Trabajos automáticos y monitor de acciones",
        summary: "EXCO, EXES, PICK, REPI, UBRE y UBCO: qué significan y por qué a veces no se generan.",
        tags: ["Picking", "Acciones", "HH"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "Los trabajos automáticos son las tareas que eLC crea para que el HH las ejecute. En eWMS se veían en el monitor de acciones; en eLC se consultan desde la torre de control y el HH.",
          },
          {
            t: "table",
            head: ["Código", "Significado", "Cuándo se usa"],
            rows: [
              ["EXCO", "Expedición de pallet completa", "Cuando se despacha un pallet completo."],
              ["EXES", "Expedición de pallet estibado", "Cuando el pallet se arma con varias unidades o estibas."],
              ["PICK", "Picking de alisto", "Para tomar producto de una ubicación de picking."],
              ["REPI", "Reposición de picking", "Para reponer una ubicación de picking desde almacenaje."],
              ["UBRE", "Ubicación de recepción", "Para mover producto desde la recepción."],
              ["UBCO", "Ubicación de contenedor", "Para mover el contenedor o LPN."],
            ],
          },
          { t: "h", x: "Por qué no se generan acciones" },
          {
            t: "list",
            items: [
              "El inventario está vencido.",
              "La ubicación está bloqueada.",
              "No hay inventario disponible.",
              "El artículo no tiene picking configurado.",
              "No hay acciones relacionadas con el inventario que se va a despachar.",
            ],
          },
          { t: "h", x: "Por qué el recurso no atiende la acción" },
          {
            t: "list",
            items: [
              "El almacén del recurso no está configurado de acuerdo con la zona.",
              "El recurso está bloqueado.",
              "La zona de trabajo del recurso no está configurada para ese tipo de trabajo.",
            ],
          },
          {
            t: "warn",
            title: "Diferencia clave",
            x: "“No se generó la acción” y “la acción existe pero nadie la toma” son problemas distintos. Primero confirma si la acción existe en la torre de control; después revisa al recurso.",
          },
          {
            t: "tip",
            title: "Checklist completo",
            x: "La sección Problemas tiene los dos checklists ampliados, con verificación y evidencia sugerida.",
          },
        ],
      },
      {
        id: "epacking",
        title: "ePacking: chequeo y empaque",
        summary: "Cuándo se usa, por qué el palet debe quedar en packing y qué validar antes de cargar.",
        tags: ["ePacking", "Expedición"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "ePacking es la aplicación de chequeo y empaque de órdenes. No todas las operaciones la usan: depende del cliente y de si el pedido se empaca antes de cargar.",
          },
          {
            t: "steps",
            items: [
              ["Confirma que el cliente usa ePacking", "No agregues un paso que la operación no tiene. Verifica la configuración del cliente."],
              ["Abre la orden o el palet", "Selecciona la expedición o el LPN que se va a chequear."],
              ["Verifica artículos y cantidades", "Compara lo físico con lo esperado. Reporta diferencias antes de empacar."],
              ["Empaca y cierra", "Al finalizar, el palet queda en estado packing."],
              ["Continúa a carga", "Solo entonces el palet está listo para la carga del camión."],
            ],
          },
          {
            t: "warn",
            title: "Palet sin packing no carga",
            x: "Si el cliente empaca, la carga rechazará el palet que no esté en packing. No intentes saltar el paso: revisa si ePacking se cerró correctamente.",
          },
          {
            t: "note",
            title: "Procedimiento por confirmar",
            x: "Las fuentes describen el uso general, pero no todos los botones de ePacking. Documenta el flujo exacto con el responsable de la operación antes de publicarlo como oficial.",
          },
        ],
      },
    ],
  },

  {
    id: "carga",
    title: "Carga de camión",
    icon: "truck",
    summary: "Choferes, camiones, unidades de transporte y cierre de carga con integración automática.",
    articles: [
      {
        id: "choferes-camiones",
        title: "Choferes, camiones y unidades de transporte",
        summary: "Qué se configura antes de cargar y por qué importa el peso de la unidad.",
        tags: ["Carga", "Transporte", "Configuración"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "En la pantalla de Choferes y camiones hay dos tarjetas: una para camiones y otra para choferes. Se usan principalmente para la carga de camión.",
          },
          {
            t: "p",
            x: "Antes de cargar, la expedición debe tener un camión configurado. Esto se hace en las pantallas de unidades de transporte y asignación de carga de camión.",
          },
          {
            t: "kv",
            rows: [
              ["Camiones", "Identificación de la unidad, placas y datos operativos."],
              ["Choferes", "Persona que retira o conduce la unidad."],
              ["Unidad de transporte", "Configuración que se asigna a la expedición para la carga."],
              ["Asignación de carga", "Relaciona la expedición con el camión y la unidad."],
            ],
          },
          { t: "h", x: "El peso de la unidad de transporte" },
          {
            t: "p",
            x: "El peso no es un dato decorativo. Los camiones pasan por balanzas y la unidad debe tener un peso específico para no sobrepasar el límite permitido. ePRAC cuenta con una aplicación para este control.",
          },
          {
            t: "note",
            title: "Respuesta de reunión",
            x: "La explicación anterior proviene de una reunión de levantamiento. Confirma con el cliente si el peso se controla en eLC, en la aplicación de balanzas o en ambos.",
          },
          {
            t: "tip",
            title: "Antes de cargar",
            x: "Verifica que la expedición tenga camión asignado y que el palet esté listo (en packing si el cliente empaca). Son las dos causas más comunes de una carga que no cierra.",
          },
        ],
      },
      {
        id: "carga-hh",
        title: "Carga de camión en el Hand Held",
        summary: "Validar el palet, cargarlo, cerrar la carga y confirmar la integración automática.",
        tags: ["Carga", "HH", "SAP"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "La carga es el último paso físico de la expedición. Cuando se cierra, el palet sale del almacén y la expedición se integra automáticamente a SAP.",
          },
          {
            t: "steps",
            items: [
              ["Entra a Carga camión en el HH", "Abre la pantalla y selecciona la expedición o unidad de transporte correspondiente."],
              ["Valida el palet", "Escanea el LPN o palet. El sistema confirma que pertenece a la expedición y que está listo."],
              ["Carga el palet", "Confirma la carga. Repite con cada palet de la unidad."],
              ["Cierra la carga", "Al terminar, cierra la carga del camión. Este paso dispara la integración."],
              ["Verifica en la torre de control", "La expedición debe reflejar el cierre y la integración a SAP."],
              ["Cruza con trazabilidad", "Busca el movimiento por número de viaje o documento para confirmar el registro."],
            ],
          },
          {
            t: "table",
            head: ["Problema", "Causa probable", "Qué hacer"],
            rows: [
              ["El palet no se deja cargar", "No está en packing y el cliente empaca.", "Revisa ePacking y cierra el empaque."],
              ["La expedición no aparece", "No tiene camión o unidad asignada.", "Configura la unidad y la asignación de carga."],
              ["La carga no cierra", "Quedan palets pendientes o hay una diferencia.", "Revisa los LPN esperados en ASIGNADAS."],
              ["No se integra a SAP", "La carga no se cerró o SAP rechazó el documento.", "Confirma el cierre y revisa el estado en la torre."],
            ],
          },
          {
            t: "danger",
            title: "Cerrar carga es irreversible en piso",
            x: "Antes de cerrar, confirma que todos los palets de la unidad están cargados. Reabrir una carga cerrada requiere el proceso de corrección definido por la operación.",
          },
          {
            t: "tip",
            title: "Evidencia de salida",
            x: "Guarda el número de viaje, la unidad y la hora de cierre. Son los datos que permiten rastrear la expedición si SAP o el cliente preguntan después.",
          },
        ],
      },
    ],
  }
);
