/* Capítulos 7 y 8 de la guía eLC */

(window.ELC_DATA.guide ||= []).push(
  {
    id: "restablecimiento",
    title: "Restablecimiento",
    icon: "refresh",
    summary: "Puntos de reorden y REPI: cómo se repone el picking sin perseguir el inventario a mano.",
    articles: [
      {
        id: "que-es-repi",
        title: "Qué es el restablecimiento (REPI)",
        summary: "Pantalla de eLC para consultar el restablecimiento y los puntos de reorden del picking.",
        tags: ["Restablecimiento", "REPI", "Picking"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "El restablecimiento es la pantalla de eLC donde se consultan y administran las tareas REPI. Estas tareas reponen una ubicación de picking cuando el inventario llega al punto de reorden configurado.",
          },
          {
            t: "p",
            x: "La analogía es la góndola de un supermercado: cuando el producto frente al pasillo se está acabando, alguien trae más desde la bodega. El punto de reorden es el nivel mínimo que dispara esa reposición.",
          },
          {
            t: "kv",
            rows: [
              ["Punto de reorden", "Cantidad mínima configurada en una ubicación de picking. Al llegar a ese nivel, el sistema busca producto en almacenaje y genera la reposición."],
              ["REPI", "Trabajo automático de reposición de picking."],
              ["Ubicación de picking", "La ubicación frente al pasillo desde la que se alista."],
              ["Ubicación de origen", "La ubicación de almacenaje desde la que se toma el producto para reponer."],
            ],
          },
          { t: "h", x: "Qué permite hacer la pantalla" },
          {
            t: "list",
            items: [
              "Reasignar un restablecimiento a otro recurso.",
              "Completar manualmente un restablecimiento que un recurso no pudo terminar.",
              "Cancelar un restablecimiento que ya no es necesario.",
              "Recibir alertas cuando hay faltante o sobrante.",
              "Configurar el punto de reorden de una ubicación de picking y otras reglas asociadas.",
            ],
          },
          {
            t: "note",
            title: "Funcionamiento del punto de reorden",
            x: "El proceso documentado utiliza puntos de reorden asociados a ubicaciones de picking. Cuando corresponde, eLC genera una tarea REPI para reponer producto desde una ubicación de almacenaje, de acuerdo con la configuración del cliente.",
          },
          {
            t: "warn",
            title: "Un punto mal configurado rompe el picking",
            x: "Si el mínimo es demasiado alto, se genera reposición constante y se satura el pasillo. Si es demasiado bajo, el alisto se queda sin producto. Valida los niveles con el cliente y con el histórico de consumo.",
          },
        ],
      },
      {
        id: "configurar-reorden",
        title: "Configurar el punto de reorden",
        summary: "Qué datos necesita una ubicación de picking para reponerse sola y cómo probarlo sin afectar producción.",
        tags: ["Restablecimiento", "Configuración"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "El punto de reorden se configura por ubicación de picking. La idea es que el sistema sepa cuándo reponer, desde dónde traer el producto y hasta qué nivel llenar.",
          },
          {
            t: "steps",
            items: [
              ["Identifica la ubicación de picking", "Confirma el layout y la zona de picking. No configures una ubicación que no existe o que está bloqueada."],
              ["Define el artículo", "El producto debe tener zona de almacenaje y zona de picking configuradas."],
              ["Define el origen", "Indica desde qué zona o ubicación de almacenaje se tomará el producto para reponer."],
              ["Configura el mínimo y el máximo", "El mínimo dispara la reposición; el máximo define hasta dónde llenar. Usa el consumo real, no un número arbitrario."],
              ["Activa la regla", "Guarda la configuración y confirma que la ubicación quede incluida en el restablecimiento."],
              ["Prueba en QA", "Baja el inventario de la ubicación de picking hasta el punto de reorden y verifica que se genere la REPI."],
              ["Documenta el cambio", "Anota fecha, responsable, ubicación, artículo y valores. Si algo falla, necesitarás revertir con precisión."],
            ],
          },
          {
            t: "note",
            title: "Campos por confirmar",
            x: "Los nombres exactos de los campos (mínimo, máximo, origen, zona) pueden variar según la versión. Confírmalos en la pantalla del cliente antes de dejar el procedimiento como oficial.",
          },
          {
            t: "warn",
            title: "No configures sobre producción sin ventana",
            x: "Un cambio de reorden puede disparar decenas de tareas. Coordina con el supervisor y hazlo en un momento de baja operación.",
          },
          {
            t: "tip",
            title: "Empieza por un artículo",
            x: "Prueba con un solo artículo de alta rotación, mide una semana y luego replica. Configurar todo el almacén de golpe hace imposible saber qué salió mal.",
          },
        ],
      },
      {
        id: "operar-repi",
        title: "Operar el restablecimiento en el HH",
        summary: "Reasignar, completar, cancelar y ejecutar la reposición sin perder trazabilidad.",
        tags: ["Restablecimiento", "HH", "REPI"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "Las tareas de restablecimiento se pueden configurar como automáticas, manuales o en bolsa de tareas. Una vez asignadas, el recurso las ejecuta desde la pantalla de Reabastecimiento del HH.",
          },
          {
            t: "steps",
            items: [
              ["Revisa la tarea en el HH", "Abre Reabastecimiento y selecciona la REPI asignada o disponible."],
              ["Lee el origen", "Escanea la ubicación de almacenaje desde donde tomarás el producto."],
              ["Lee el artículo y la cantidad", "Confirma lote, serie y cantidad según la pantalla. No tomes producto de otra ubicación."],
              ["Lee el destino", "Escanea la ubicación de picking que se está reponiendo."],
              ["Confirma la reposición", "Cierra la tarea y verifica que el saldo de la ubicación de picking aumentó."],
              ["Valida en Saldos de inventario", "Confirma origen y destino. Si hay faltante o sobrante, el sistema debe alertar."],
            ],
          },
          {
            t: "table",
            head: ["Situación", "Acción en la pantalla de restablecimiento"],
            rows: [
              ["El recurso no puede completar", "Completa manualmente o reasigna a otro recurso."],
              ["Ya no se necesita", "Cancela la tarea y documenta el motivo."],
              ["Faltante o sobrante", "Atiende la alerta, valida el inventario físico y registra la diferencia."],
              ["La tarea no se genera", "Revisa punto de reorden, stock en origen, zonas y configuración del artículo."],
            ],
          },
          {
            t: "warn",
            title: "Completar manualmente deja huella",
            x: "Cuando completas una tarea que el recurso no pudo terminar, queda un movimiento que no hizo el operador en piso. Registra quién y por qué para que la trazabilidad tenga sentido.",
          },
        ],
      },
    ],
  },

  {
    id: "inventario",
    title: "Inventario y conteos",
    icon: "database",
    summary: "Saldos, LPNs, trazabilidad, Kardex y planes de conteo.",
    articles: [
      {
        id: "saldos",
        title: "Saldos de inventario",
        summary: "La consulta de inventario de eLC: qué filtrar y para qué sirve cada filtro.",
        tags: ["Inventario", "Consulta"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "Saldos de inventario permite consultar las existencias registradas en eLC mediante los filtros disponibles, como artículo, ubicación o LPN.",
          },
          {
            t: "table",
            head: ["Filtro", "Cuándo usarlo"],
            rows: [
              ["Artículo / SKU", "Para saber dónde está un producto y en qué LPN."],
              ["Ubicación", "Para saber qué artículos o palets tiene una ubicación."],
              ["LPN", "Para revisar el contenido y estado de un palet o contenedor."],
              ["Zona", "Para revisar ocupación o existencia por zona del almacén."],
              ["Cliente", "Cuando la operación maneja inventario de varios clientes."],
            ],
          },
          {
            t: "tip",
            title: "Tres preguntas que resuelve",
            x: "¿Dónde está este artículo? ¿Qué hay en esta ubicación? ¿Este LPN tiene lo que debería? Si la respuesta no aparece, el problema puede estar en la recepción o en el almacenaje, no en la consulta.",
          },
          {
            t: "note",
            title: "Saldos no corrige",
            x: "La pantalla es de consulta. Las correcciones se hacen con el proceso de conteo o ajuste definido por la operación, no editando el saldo a mano.",
          },
        ],
      },
      {
        id: "lpns",
        title: "LPNs: palets, tarimas y contenedores",
        summary: "Qué representa un LPN en eLC, qué se consulta y qué queda por confirmar.",
        tags: ["Inventario", "LPN", "Por confirmar"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "En la operación, un LPN es el identificador del palet, tarima o contenedor donde se almacena el producto. La pantalla LPNs permite consultar su estado y sus acciones asignadas.",
          },
          {
            t: "kv",
            rows: [
              ["Qué identifica", "Un soporte físico con uno o varios artículos."],
              ["Qué muestra", "Estado del LPN, acciones asignadas y relación con ubicaciones."],
              ["Para qué sirve", "Seguir el palet desde la recepción hasta la carga o el almacenaje."],
            ],
          },
          {
            t: "warn",
            title: "Definición por confirmar",
            x: "Las fuentes indican que hay dudas sobre si “LPN” se usa exactamente así en eLC. No cierres la definición sin documentación oficial o validación del producto. Mientras tanto, trátalo como el identificador del palet o contenedor.",
          },
          {
            t: "note",
            title: "Dos SKU en un mismo LPN",
            x: "Está registrada la duda de por qué no se pueden registrar dos SKU en el mismo LPN. No es una regla documentada: es un comportamiento a validar con el equipo de producto.",
          },
        ],
      },
      {
        id: "trazabilidad",
        title: "Trazabilidad de movimientos",
        summary: "El registro de todo lo que pasó: de la orden de recepción al almacenaje y la expedición.",
        tags: ["Inventario", "Auditoría", "Trazabilidad"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "Trazabilidad de movimientos registra los movimientos de las órdenes de expedición y pedidos, las órdenes de recepción y el almacenaje del producto. Es la herramienta para reconstruir qué pasó y cuándo.",
          },
          {
            t: "steps",
            items: [
              ["Define el dato de búsqueda", "Número de documento, número de viaje, LPN, artículo o ubicación."],
              ["Filtra el rango de fechas", "Acota al día o a la ventana en la que ocurrió el movimiento."],
              ["Lee la secuencia", "Revisa el orden: recepción, almacenaje, alisto, carga. Un salto indica un paso faltante."],
              ["Cruza con la torre de control", "Confirma el estado del documento y la integración a SAP."],
              ["Guarda evidencia", "Si vas a escalar, adjunta documento, viaje, hora y movimiento."],
            ],
          },
          {
            t: "tip",
            title: "El número de viaje es tu mejor aliado",
            x: "En recepción y expedición, el número de viaje permite encontrar los movimientos relacionados sin conocer todos los documentos intermedios.",
          },
          {
            t: "note",
            title: "Trazabilidad no es auditoría contable",
            x: "Muestra movimientos operativos. Para el detalle contable existe la pantalla de Kardex, que aún no está documentada en las fuentes.",
          },
        ],
      },
      {
        id: "kardex",
        title: "Libro Diario de Kardex Contable",
        summary: "La pantalla existe, pero su procedimiento no está documentado. Esto es lo que se sabe y lo que falta.",
        tags: ["Inventario", "Kardex", "Por confirmar"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "Las fuentes mencionan una pantalla llamada Libro Diario de Kardex Contable, pero no describen su funcionamiento, sus filtros ni el proceso contable asociado. No se debe inventar.",
          },
          {
            t: "kv",
            rows: [
              ["Qué se sabe", "Existe una pantalla con ese nombre dentro de eLC."],
              ["Qué falta", "Alcance contable, columnas, filtros, frecuencia de uso, responsable y relación con SAP."],
              ["Riesgo de asumir", "Usar el Kardex para una conciliación sin conocer su lógica puede producir conclusiones contables incorrectas."],
            ],
          },
          {
            t: "warn",
            title: "No completar por inferencia",
            x: "Si necesitas el Kardex para una operación real, solicita una demostración o documentación oficial y registra el resultado en esta guía. Mientras tanto, usa Trazabilidad de movimientos para la parte operativa.",
          },
          {
            t: "tip",
            title: "Cómo cerrar la duda",
            x: "Crea una duda en la sección Dudas con cliente, versión y pregunta concreta. Adjunta una captura de la pantalla y la respuesta del responsable.",
          },
        ],
      },
      {
        id: "conteos",
        title: "Planificación y seguimiento de conteos",
        summary: "Planes de conteo, rutas y revisión de diferencias de inventario en eLC.",
        tags: ["Conteos", "Inventario", "Toma física"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "La pantalla de Planificación y Seguimiento de Conteos permite crear planes, ejecutar o revisar rutas de conteo y consultar las diferencias entre las cantidades contadas y las cantidades teóricas registradas en eLC.",
          },
          {
            t: "steps",
            items: [
              ["Crea un nuevo plan de conteo", "Define almacén, zona o ruta, artículos y criterios según las indicaciones de la pantalla."],
              ["Genera el plan", "El sistema arma las rutas y las tareas de conteo."],
              ["Ejecuta el conteo", "El personal cuenta en piso y registra las cantidades."],
              ["Revisa la zona virtual de diferencias", "Ahí se visualizan las diferencias entre lo contado y lo teórico."],
              ["Reconta si es necesario", "Puedes recontar cada ruta antes de cerrar el plan."],
              ["Cierra y documenta", "Registra el resultado y las acciones de corrección."],
            ],
          },
          {
            t: "note",
            title: "Alcance documentado",
            x: "Esta guía describe los planes, las rutas y la zona virtual de diferencias que aparecen en el material disponible de eLC. Otras opciones o reportes deben documentarse solo después de verificarlos en la versión del cliente.",
          },
          {
            t: "warn",
            title: "Diferencias no se borran",
            x: "La zona virtual de diferencias sirve para analizar, no para ocultar. Cada diferencia debe tener causa, responsable y acción. Si se cierra el plan sin explicación, el inventario queda contaminado.",
          },
          {
            t: "tip",
            title: "Conteo cíclico",
            x: "Para operaciones grandes, empieza con conteos por ruta o por zona de alta rotación. Un conteo total detiene el almacén; uno cíclico corrige sin frenar.",
          },
        ],
      },
    ],
  }
);
