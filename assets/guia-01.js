/* Capítulos 1 a 3 de la guía eLC */

(window.ELC_DATA.guide ||= []).push(
  {
    id: "primeros-pasos",
    title: "Primeros pasos",
    icon: "rocket",
    summary: "Qué es eLC, cómo se conecta con SAP y el HH, y cómo dejar un usuario listo para operar.",
    articles: [
      {
        id: "que-es-elc",
        title: "Qué es eLC y qué cambia frente a eWMS",
        summary: "eLC es la capa web de operación y control de eflow, con su propio Hand Held. No cambia la lógica del almacén: cambia dónde y cómo se opera.",
        tags: ["Conceptos", "eWMS", "Torre de control"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "eLC es la nueva generación de la operación eflow: una torre de control web para ver documentos, acciones y estados, más un Hand Held (HH) para ejecutar el trabajo físico en el almacén. En las fuentes se usa como sucesor operativo de las pantallas de eWMS, no como un sistema con otra lógica de negocio.",
          },
          {
            t: "p",
            x: "La forma fácil de entenderlo: eWMS era un tablero con muchos interruptores separados; eLC es una torre de control que muestra el vuelo completo —documento, acción, recurso, inventario e integración— y desde ahí se asignan las tareas.",
          },
          { t: "h", x: "Equivalencias que más se usan" },
          {
            t: "table",
            head: ["En eWMS lo conocías como", "En eLC lo encuentras como", "Para qué sirve"],
            rows: [
              ["Consulta de inventario", "Saldos de inventario", "Consultar existencias por artículo, ubicación o LPN."],
              ["Almacenamientos ubicaciones", "Catálogo de layouts", "Buscar y configurar ubicaciones del almacén."],
              ["Monitor de acciones", "Torre de control", "Ver documentos, acciones y estados en un solo lugar."],
              ["Toma física", "Planificación y seguimiento de conteos", "Crear planes de conteo y revisar diferencias."],
              ["Acciones automáticas PICK", "Restablecimiento (REPI)", "Reponer picking según puntos de reorden."],
              ["Recursos", "Operadores & roles", "Usuarios, perfiles y permisos del HH."],
              ["Recepción y expedición", "Documentos en torre de control", "Seguir el ciclo completo del documento."],
              ["Carga camión", "Carga camión en HH + Choferes y camiones", "Asignar camión y despachar los palets."],
            ],
          },
          {
            t: "note",
            title: "La lógica se mantiene",
            x: "Siguen existiendo documentos, acciones, recursos, zonas, ubicaciones, LPN y trabajos automáticos como UBRE, UBCO, PICK, EXCO y EXES. Lo que cambia es la pantalla desde la que se administran y la forma de asignarlos.",
          },
          {
            t: "warn",
            title: "Valida por cliente y por versión",
            x: "No todas las pantallas ni todos los campos existen igual en todas las versiones de eLC. Este hub se basa en material de noviembre de 2026; antes de un cambio en producción, confirma la versión del cliente y prueba en QA.",
          },
          {
            t: "tip",
            title: "Cómo usar esta guía",
            x: "Si vienes de eWMS, lee primero esta página y luego “Estados de un documento”. Si vas a operar el HH, ve directo a Recepción, Almacenaje, Alisto y Carga.",
          },
        ],
      },
      {
        id: "arquitectura",
        title: "Arquitectura: SAP, eLC, API y HH",
        summary: "Las piezas que intervienen en una operación y en qué orden se comunican.",
        tags: ["Conceptos", "Integración", "HH"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "Una operación en eLC atraviesa cuatro piezas principales. Entender el recorrido evita buscar el problema en el lugar equivocado.",
          },
          {
            t: "flow",
            items: ["SAP", "eLC Web", "API", "Hand Held", "eLC Web", "SAP"],
          },
          {
            t: "kv",
            rows: [
              ["SAP", "Origen o destino de los documentos de recepción y expedición. Envía la información y recibe la integración final."],
              ["eLC Web", "Torre de control: convierte, genera, asigna y muestra estados, saldos, trazabilidad y conteos."],
              ["API", "Servicio que atiende al HH. Se configura por cliente y ambiente con su cadena de conexión."],
              ["Hand Held", "Aplicación Android donde el recurso ejecuta recepción, almacenaje, alisto, reabastecimiento y carga."],
              ["ePacking", "Aplicación de chequeo y empaque. Se usa solo en operaciones que empacan antes de cargar."],
            ],
          },
          { t: "h", x: "El recorrido de una recepción" },
          {
            t: "steps",
            items: [
              ["SAP envía la información", "eLC recibe el documento de recepción con artículos y cantidades."],
              ["eLC lo convierte y genera", "El documento pasa a estado GENERADA y queda disponible para asignación."],
              ["Se asigna a un recurso", "Por bolsa de tareas, asignación manual o automática."],
              ["El HH ejecuta", "El recurso recibe, escanea artículos, confirma el palet y almacena."],
              ["eLC confirma y espera integración", "El documento queda en FINALIZADAS SIN INTEGRAR."],
              ["Se integra a SAP", "Cuando la integración termina, aparece en INTEGRADAS SAP (HOY)."],
            ],
          },
          {
            t: "warn",
            title: "Ambientes separados",
            x: "QA y producción no comparten base de datos ni cadena de conexión. Un cambio de cliente o de ambiente en el HH se hace con el procedimiento de “Conectar el HH”, nunca editando archivos a mano sin respaldo.",
          },
          {
            t: "danger",
            title: "Secretos fuera del hub",
            x: "Las cadenas de conexión, contraseñas y llaves no se guardan en esta página, en documentos compartidos ni en Git. Usa el gestor de secretos aprobado por TI.",
          },
        ],
      },
      {
        id: "seguridad-usuarios",
        title: "Usuarios, perfiles, recursos y permisos",
        summary: "El orden correcto para que un operador pueda entrar al HH y ejecutar solo lo que le corresponde.",
        tags: ["Seguridad", "Usuarios", "HH"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "En eLC un usuario no queda listo solo por crearlo. Hay una cadena de configuración: usuario, perfil, recurso, asignaciones de seguridad, permisos por pantalla y zona de trabajo. Si un eslabón falta, el HH puede dejar entrar al usuario pero no mostrarle tareas.",
          },
          {
            t: "steps",
            items: [
              ["Crear el usuario", "Identifica a la persona. No reutilices usuarios genéricos para operación real: se pierde la trazabilidad."],
              ["Crear el perfil", "El perfil agrupa permisos. Piensa en él como el “paquete de llaves” del puesto."],
              ["Vincular perfil y usuario", "Asigna el perfil al usuario para heredar sus permisos."],
              ["Configurar aprobaciones", "Define qué autorizaciones necesita el perfil, si la operación las usa."],
              ["Crear el recurso perfil", "Es la plantilla del recurso que después se enlaza con el recurso real."],
              ["Crear el recurso", "Representa a la persona o equipo que ejecuta en piso. Se enlaza con el recurso perfil."],
              ["Enlazar recurso y usuario", "Sin este enlace, el usuario puede existir pero no operar como recurso."],
              ["Asignaciones de seguridad", "Define el módulo general autorizado: Android (HH) y/o Desktop. Aquí se decide si el usuario puede usar el HH."],
              ["Permisos por pantalla", "Detalla botones y opciones dentro de cada pantalla. Es lo que permite o bloquea una acción concreta."],
              ["Zona de trabajo del recurso", "Define qué trabajos automáticos puede tomar: PICK, EXES, EXCO, UBRE, UBCO, etc."],
              ["Reglas", "Ajustes internos definidos por sistemas: contraseña, omitir pasos y otras políticas del cliente."],
            ],
          },
          { t: "h", x: "Analogía rápida" },
          {
            t: "p",
            x: "El usuario es la persona; el perfil es el llavero; las asignaciones de seguridad son las puertas del edificio; los permisos por pantalla son los botones dentro de cada sala; y la zona de trabajo es el tipo de trabajo que esa persona puede tomar de la cola.",
          },
          {
            t: "warn",
            title: "Si “tiene permisos” pero el HH no lo deja",
            x: "Revisa en este orden: módulo Android asignado, permiso de la pantalla específica, enlace recurso-usuario, zona de trabajo y versión del HH. El fallo FAL-001 es exactamente de permisos en Alisto y está registrado en la sección Fallos y mejoras.",
          },
          {
            t: "note",
            title: "Usuarios genéricos",
            x: "Las notas mencionan un usuario genérico histórico para pruebas. No debe usarse para operación real ni documentarse con su contraseña: impide saber quién hizo cada movimiento.",
          },
        ],
      },
      {
        id: "conexion-hh",
        title: "Conectar el HH a otro cliente o ambiente",
        summary: "Procedimiento de cuatro pasos para cambiar la base de datos del API sin exponer credenciales.",
        tags: ["HH", "Técnico", "API"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "El HH no guarda la conexión a la base de datos: la pide al API. Para apuntar un HH a otro cliente se cambia la cadena de conexión del API, se encripta y se reinicia el servicio. Es una operación sensible: un error deja el HH sin operación o, peor, apuntando al cliente equivocado.",
          },
          {
            t: "steps",
            items: [
              ["Abre la carpeta del API", "Localiza la carpeta del API del cliente y abre el archivo appsettings.json con un editor de texto. Haz una copia de respaldo antes de tocarlo."],
              ["Copia la cadena actual", "Copia el valor completo de la conexión. No la pegues en chats, correos ni en este hub."],
              ["Desencripta", "Abre el desencriptador interno aprobado, pega la cadena y ejecuta el proceso. Copia el resultado solo en un lugar seguro y temporal."],
              ["Cambia el catálogo", "En la cadena desencriptada busca Initial Catalog=EFLOW_CLIENTE y reemplaza el nombre por la base del cliente correcto. Verifica dos veces el nombre."],
              ["Vuelve a encriptar", "Pega la cadena modificada en el encriptador, ejecuta y copia la nueva cadena cifrada."],
              ["Reemplaza y reinicia", "Pega la cadena cifrada en appsettings.json, guarda y reinicia el servicio del API. No dejes la cadena desencriptada en ningún archivo."],
              ["Prueba en QA", "Abre el HH, inicia sesión y ejecuta una consulta o una recepción de prueba. Confirma que el cliente y el ambiente son los correctos antes de operar."],
            ],
          },
          {
            t: "code",
            x: "URL de referencia del API: http://<IP-del-servidor-HH>:8086/api/\nCadena a localizar: Initial Catalog=EFLOW_CLIENTE",
          },
          {
            t: "warn",
            title: "Pendiente de confirmar",
            x: "La ruta exacta de la carpeta del API y la ubicación del encriptador interno no están confirmadas en las fuentes. Confírmalas con el responsable técnico de cada cliente antes de documentarlas como procedimiento oficial.",
          },
          {
            t: "danger",
            title: "Nunca compartas la cadena",
            x: "La cadena contiene usuario y contraseña de base de datos. No la pegues en el chat, en esta página, en Git, en correos ni en capturas. Si sospechas que se expuso, cámbiala con TI.",
          },
          {
            t: "tip",
            title: "Antes de cambiar",
            x: "Confirma con el usuario qué cliente y qué ambiente necesita. Un HH apuntando a producción cuando se pedía QA puede provocar movimientos reales irreversibles.",
          },
        ],
      },
      {
        id: "navegacion",
        title: "Navegación, buscador y atajos del hub",
        summary: "Cómo moverse por el hub, buscar en todo el contenido y guardar un respaldo.",
        tags: ["Hub", "Uso interno"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "Este hub es una página local: no necesita servidor ni instalación. Se abre con doble clic en index.html y guarda clientes, dudas y registros en el almacenamiento del navegador.",
          },
          {
            t: "list",
            items: [
              "Ctrl + K abre el buscador global sobre guía, clientes, dudas, fallos, mejoras, problemas y glosario.",
              "La barra lateral agrupa Operación, Conocimiento y Sistema. En móvil se abre con el botón de menú.",
              "Cada artículo tiene un botón para marcarlo como leído; el avance se guarda por navegador.",
              "El botón Nuevo permite crear un cliente, una duda, un fallo, una mejora o una minuta según la sección.",
              "Ajustes y datos permite exportar un respaldo JSON, importarlo y borrar los datos locales.",
            ],
          },
          {
            t: "note",
            title: "Buscar en el hub no es buscar en eLC",
            x: "El buscador del hub encuentra contenido de esta documentación. Los buscadores dentro de eLC Web son otra cosa y tienen dudas abiertas registradas en la sección Dudas.",
          },
          {
            t: "warn",
            title: "Datos locales",
            x: "Si abres el hub en otro navegador u otro equipo, no verás los clientes ni las dudas que creaste aquí. Exporta el respaldo y guárdalo en el lugar aprobado antes de cambiar de equipo.",
          },
        ],
      },
    ],
  },

  {
    id: "torre-control",
    title: "Torre de control",
    icon: "layers",
    summary: "El tablero principal: documentos, acciones, asignación y putaway.",
    articles: [
      {
        id: "vista-general",
        title: "Qué se ve en la torre de control",
        summary: "Documentos de recepción y expedición, sus acciones y la sub-pestaña de almacenaje.",
        tags: ["Torre de control", "Documentos"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "La torre de control es la pantalla principal de eLC Web. Muestra los documentos de recepción y expedición con sus acciones generadas, asignadas, finalizadas sin integrar, pendientes e integradas a SAP. También tiene una sub-pestaña de Almacenaje/Putaway con las tareas UBRE y UBCO.",
          },
          {
            t: "table",
            head: ["Bloque", "Qué muestra", "Qué haces ahí"],
            rows: [
              ["Documentos de recepción", "Recepciones y su estado de integración.", "Asignar, seguir y detectar documentos detenidos."],
              ["Documentos de expedición", "Expediciones, acciones y estado.", "Asignar alisto, revisar avance e integración."],
              ["Acciones generadas", "Trabajos automáticos creados para el documento.", "Asignar al recurso o dejarlos en bolsa."],
              ["Almacenaje / Putaway", "Tareas UBRE y UBCO.", "Asignar y seguir el almacenaje posterior a la recepción."],
              ["Integración SAP", "Finalizadas sin integrar e integradas del día.", "Verificar que el documento llegó a SAP."],
            ],
          },
          {
            t: "note",
            title: "La torre no ejecuta: coordina",
            x: "El trabajo físico se hace en el HH. La torre sirve para ver el estado, asignar, detectar atascos y verificar la integración.",
          },
          {
            t: "tip",
            title: "Revisión de la mañana",
            x: "Filtra por FINALIZADAS SIN INTEGRAR y por PENDIENTES. Son los dos estados donde suele acumularse el trabajo que bloquea al cliente.",
          },
        ],
      },
      {
        id: "estados-documentos",
        title: "Estados de un documento y formas de asignación",
        summary: "GENERADAS, ASIGNADAS, finalizadas sin integrar e integradas a SAP. Tres formas de asignar.",
        tags: ["Torre de control", "Asignación"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "El ciclo es el mismo para recepción y expedición, con una diferencia importante: la recepción se integra cuando se procesa la integración; la expedición se integra automáticamente al cerrar la carga del camión.",
          },
          {
            t: "flow",
            items: ["SAP", "GENERADAS", "ASIGNADAS", "En ejecución", "Finalizadas sin integrar", "Integradas SAP"],
          },
          {
            t: "table",
            head: ["Estado", "Qué significa", "Qué se hace"],
            rows: [
              ["GENERADAS", "El documento existe, pero no tiene recurso.", "Asignarlo o dejarlo en bolsa de tareas."],
              ["ASIGNADAS", "Ya tiene recurso y está en ejecución.", "Seguir el avance y revisar detalles de la orden."],
              ["En ejecución", "El recurso está trabajando en el HH.", "No reasignar sin coordinar con el operador."],
              ["FINALIZADAS SIN INTEGRAR", "Terminó en piso, pero no llegó a SAP.", "Procesar o revisar la integración."],
              ["INTEGRADAS SAP (HOY)", "SAP confirmó el documento.", "Verificar y cerrar el seguimiento."],
              ["PENDIENTES", "Requiere atención o quedó incompleto.", "Revisar causa antes de forzar."],
            ],
          },
          { t: "h", x: "Tres formas de asignar" },
          {
            t: "kv",
            rows: [
              ["Bolsa de tareas", "El documento queda disponible y cualquier usuario del HH puede tomarlo desde la pantalla de DISPONIBLES."],
              ["Manual", "Un usuario de la web selecciona el documento y lo asigna a un recurso específico."],
              ["Automática", "El sistema asigna al usuario del HH que haya estado activo en los últimos 10 minutos, según la configuración."],
            ],
          },
          {
            t: "warn",
            title: "Asignada no es terminada",
            x: "Una tarea asignada puede seguir abierta durante horas. Para medir avance, revisa el estado real de las acciones y la integración, no solo quién tiene la tarea.",
          },
          {
            t: "tip",
            title: "Bolsa de tareas en el HH",
            x: "Si la operación usa bolsa, el recurso debe entrar a DISPONIBLES y tomar la tarea. Si no la ve, revisa módulo Android, permisos de pantalla y zona de trabajo.",
          },
        ],
      },
      {
        id: "putaway",
        title: "Almacenaje / Putaway: UBRE y UBCO",
        summary: "Qué son las tareas de almacenaje, cuándo se generan y cómo se asignan.",
        tags: ["Torre de control", "Putaway", "UBRE", "UBCO"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "La sub-pestaña de Almacenaje/Putaway muestra las tareas de almacenaje que en eWMS se conocían como UBRE y UBCO. Son el puente entre la recepción y la ubicación final del producto.",
          },
          {
            t: "kv",
            rows: [
              ["UBRE", "Ubicación de recepción. Trabajo automático relacionado con mover el producto desde la zona de recepción."],
              ["UBCO", "Ubicación de contenedor. Trabajo automático relacionado con el contenedor o LPN."],
            ],
          },
          {
            t: "p",
            x: "Estas tareas se pueden asignar desde la torre de control o dejar configuradas en bolsa de tareas o en modo automático, igual que la recepción y el alisto. El recurso las ve en el HH en la pantalla de Almacenaje.",
          },
          {
            t: "warn",
            title: "No siempre se generan",
            x: "Los trabajos automáticos de recepción, como UBRE y UBCO, solo pueden generarse si el artículo tiene zona de almacenaje y zona de picking, y si las ubicaciones existen en esas zonas. Si falta una condición, la tarea no aparece.",
          },
          {
            t: "tip",
            title: "Antes de asignar",
            x: "Confirma que la recepción esté confirmada y que el artículo tenga configuración de zonas. Asignar una tarea que no existe solo retrasa la detección del problema.",
          },
        ],
      },
    ],
  },

  {
    id: "recepcion",
    title: "Recepción",
    icon: "box",
    summary: "Del aviso de SAP al documento integrado: recepción en web, recepción en HH y cierre.",
    articles: [
      {
        id: "flujo-recepcion",
        title: "Flujo completo de una recepción",
        summary: "Los diez pasos desde que llega la información de SAP hasta que la recepción queda integrada.",
        tags: ["Recepción", "SAP", "HH"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "La recepción empieza en SAP y termina en SAP, pero el trabajo físico ocurre en el HH y el control en la torre. Este es el recorrido completo documentado para eLC.",
          },
          {
            t: "steps",
            items: [
              ["Espera la información de SAP", "SAP envía los documentos de recepción. eLC no inventa la orden: la recibe."],
              ["Convierte y genera", "La información se convierte en un documento de recepción en estado GENERADA."],
              ["Asigna el documento", "Puede quedar en bolsa de tareas, asignarse manualmente o asignarse de forma automática al recurso activo."],
              ["El recurso lo toma en el HH", "Si está en bolsa, entra a DISPONIBLES. Si es manual o automática, lo ve en su pantalla de recepción."],
              ["Recibe y escanea", "Lee el documento, los artículos y las cantidades. Puede validar con la opción de validación general o de recepción."],
              ["Finaliza el palet", "Cierra el palet actual y continúa con otro si la recepción tiene más carga."],
              ["Cierra la confirmación", "Solo cuando todos los artículos fueron leídos. Si falta uno, la confirmación no debe cerrarse."],
              ["Almacena", "Con el procedimiento de almacenaje que corresponda: LPN completo, parcial o artículo específico."],
              ["Confirma la recepción", "El documento pasa a FINALIZADAS SIN INTEGRAR."],
              ["Integra y verifica", "Se procesa la integración y el documento aparece en INTEGRADAS SAP (HOY)."],
            ],
          },
          {
            t: "note",
            title: "Dos niveles de cierre",
            x: "Cerrar el palet no es cerrar la recepción. Primero se finalizan los palets y la confirmación; después se cierra el documento y se integra.",
          },
          {
            t: "warn",
            title: "Si la recepción no aparece en el HH",
            x: "Revisa en orden: que el documento esté GENERADO o ASIGNADO, que el recurso tenga módulo Android, que tenga permiso de la pantalla de recepción y que la zona de trabajo incluya el trabajo correspondiente.",
          },
        ],
      },
      {
        id: "recepcion-hh",
        title: "Recepción en el Hand Held",
        summary: "Qué hace el operador paso a paso, qué errores son normales y cuándo cerrar la confirmación.",
        tags: ["Recepción", "HH"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "En el HH el objetivo es simple: recibir lo que llegó, dejarlo identificado en un palet o LPN y confirmar sin diferencias. La disciplina en el escaneo evita diferencias de inventario y reprocesos.",
          },
          {
            t: "steps",
            items: [
              ["Entra a Recepción o Disponibles", "Si la tarea está en bolsa, tómala desde DISPONIBLES. Si está asignada, ábrela desde tu lista."],
              ["Lee el documento", "Escanea o selecciona la recepción correcta. Verifica proveedor, documento y cantidad esperada."],
              ["Lee los artículos", "Escanea artículo, lote o serie y cantidad según lo solicite la pantalla."],
              ["Reporta diferencias si existen", "Si falta o sobra mercancía, usa la opción de reporte antes de confirmar. No ajustes cantidades “para que cuadre”."],
              ["Finaliza el palet", "Cuando el palet esté completo, ciérralo. El sistema pedirá el siguiente si hay más carga."],
              ["Cierra la confirmación", "Solo cuando todos los artículos estén leídos. Si la pantalla no cierra, revisa el artículo pendiente."],
              ["Almacena el palet", "Pasa a la pantalla de Almacenaje y sigue el procedimiento correspondiente."],
            ],
          },
          {
            t: "warn",
            title: "No cierres con faltantes sin reportar",
            x: "Cerrar una confirmación con artículos pendientes deja el documento inconsistente y obliga a corregir después. Reporta la diferencia en el momento y deja evidencia.",
          },
          {
            t: "note",
            title: "Mejora registrada",
            x: "El reporte de sobrante hoy se hace con una opción independiente y obliga a digitar de nuevo lote o serie. La mejora MEJ-001 propone reportarlo desde el propio artículo. Está en la sección Fallos y mejoras.",
          },
          {
            t: "tip",
            title: "Verifica antes de salir",
            x: "Al terminar, revisa en Saldos de inventario que el LPN y la ubicación reflejen lo que acabas de recibir.",
          },
        ],
      },
      {
        id: "integracion-sap",
        title: "Integración a SAP y documentos detenidos",
        summary: "Cómo pasar de FINALIZADAS SIN INTEGRAR a INTEGRADAS SAP y qué revisar si no avanza.",
        tags: ["Recepción", "SAP", "Integración"],
        updated: "2026-11-20",
        blocks: [
          {
            t: "p",
            x: "Que la recepción esté finalizada en piso no significa que SAP ya la tenga. El estado FINALIZADAS SIN INTEGRAR es la cola de trabajo entre eLC y SAP.",
          },
          {
            t: "steps",
            items: [
              ["Filtra FINALIZADAS SIN INTEGRAR", "En la torre de control, revisa los documentos del día y su antigüedad."],
              ["Confirma que el documento esté completo", "Verifica que no tenga acciones pendientes ni diferencias sin reportar."],
              ["Procesa la integración", "Ejecuta el proceso definido por la operación. No cambies el estado a mano sin autorización."],
              ["Confirma en INTEGRADAS SAP (HOY)", "El documento debe aparecer en el bloque de integradas del día."],
              ["Cruza con trazabilidad", "Busca el movimiento por número de viaje o documento para confirmar que el flujo quedó registrado."],
            ],
          },
          {
            t: "warn",
            title: "Si se queda detenido",
            x: "No reintentes en bucle ni dupliques documentos. Revisa primero: documento completo, conexión con SAP, diferencias de cantidad y errores de la interfaz. Escala con evidencia (documento, viaje, hora y mensaje).",
          },
          {
            t: "note",
            title: "La expedición es distinta",
            x: "En expedición, la integración a SAP ocurre automáticamente después de cerrar la carga del camión. No requiere el mismo paso manual que la recepción.",
          },
        ],
      },
    ],
  }
);
