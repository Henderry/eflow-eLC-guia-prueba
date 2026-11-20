# eLC — Texto extraído del documento fuente

Aprendizaje sobre eLC

Torre de control:

SSdocumentos de recepcion y expedición con sus acciones generadas, asignadas, finalizadas sin integrar, pendientes y integradas a sap

Tambien se tiene la sub-pestanna de Almacenaje/Putaway, en la cual vemos las tareas de almacenaje (Estas en WMS son UBRE y UBCO)

Restablecimiento:

En la pantalla de restablecimiento podemos ver las tareas que en eWMS se llaman REPI, son tareas del restablecimiento de las ubicaciones, esta pantalla nos permite reasignar restablecimientos, completar manualmente un restablecimiento que un recurso no haya podido completar, o cancelarlo de no se necesario, la misma también tirara alerta cuando haya faltante o sobrante

También se puede configurar el punto de reorden de una ubicación de picking para poder abastecerla de manera distinta, entre otras configuraciones relacionadas con el restablecimiento de la ubicación :

Saldos de Inventario

En esta pantalla, podremos ver lo que en eWMS veíamos como consulta de inventario, nos va a servir para consultar el inventario existente en el almacén mediante diferentes filtros:

LPNs(Hay dudas de si esto es asi):
Estos básicamente vienen siendo los palets/tarimas/contenedores, en donde se almacenara el producto/artículos, en esta pantalla básicamente consultaremos el estado de estos, sus acciones asignadas, etc:

Trazabilidad de Movimientos

Esta registra todos los movimientos ya sea de las ordenes de expedicion/pedidos hasta las ordenes de recepcion, o el almacenaje de producto:

Libro Diario de Kardex Contable

¿??

Planificación & Seguimiento de Conteos

La pantalla básicamente consiste en generar un plan de reconteo, en el cual también se permite recontar cada ruta, este plan lo genera automáticamente el sistema con las indicaciones dadas en Nuevo Plan de Conteo:

También tendremos una Zona virtual de Diferencias, donde podremos visualizar las diferencias que hay entre el material contado, y el teórico:

Esta pestana es básicamente los reportes que ya existían previamente en eWMS:

Especialización SKU:
En esta pantalla, veremos la configuración de los SKU/Articulos, ya sea sus días de vencimiento, estrategia de rotación etc…:

Catálogo de Layouts:
Este vendría siendo como un equivalente a un almacenamiento ubicaciones, en donde podremos realizar las configuraciones especificas de alguna ubicación, buscar alguna ubicación de un almacén, etc…:

Catalogo de Clientes:
Esto depende mucho de la empresa, si implementar o no dicha opción, la misma como su nombre lo indica, maneja el catalogo de los clientes:

Choferes y Camiones:
En esta pantalla encontraremos 2 tarjetas, en la cual veremos los camiones y en otra los choferes, dichos camiones y choferes, principalmente están pensados para la carga camión:

Editor de etiquetas:

Este editor, es para realizar etiquetas predeterminadas, se usa para tener una estructura claramente definida de las mismas en cuanto a las ubicaciones, artículos etc..., el mismo incluye un editor, el cual nos permite modificar múltiples opciones de diseño en el editor:

Operadores & Roles:
En esta pantalla, nos podemos encontrar con los usuarios, perfiles y roles, que vienen siendo lo mismo que los recursos, dicha lógica se mantiene muy parecida o casi que igual a eWMS:

Impresoras:
En esta pantalla, se llega a ver la instalación del software que maneja las impresoras, su flujo de instalación, y su funcionamiento, además de cuales están operativas:

Configuración:
Esta pantalla hace ajustes más específicos como el despacho a SAP:

Flujo normal de trabajo:

En eLC, tenemos que primero esperar a que SAP nos envíen la info, para nosotros poder convertirla, y de ahí poder asignarla o dejar que cualquier usuario se la autoasigne:

Después quedaría en el proceso de GENERADAS en el cual, si la configuración está en bolsa de tareas, cualquier usuario que visualice la recepción generada podrá tomarla, o bien, si esta manual, seleccionarla y asignar al usuario manualmente, también está la opción automática, que, si cualquier usuario de la HH esta en los últimos 10 min, lo asignara automaticamente:

Después viene el proceso de ASIGNADAS en el cual, la misma ya está en ejecución, en esta parte también podremos consultar los detalles de las ordenes de recepción recibidas:

Para tenerlo en cuenta, desde el HH, se puede asignar, SI es que esta en bolsa de tareas, desde la pantalla de DISPONIBLES:

Después de, viene la ubicación de los artículos en el almacén, el cual se encuentra en la pantalla de RECEPCION:

Por si existe alguna duda, o se quiere consultar cuales ubicaciones están disponible, se puede llegar a hacer desde Catalogo De Layouts:

Después de escanear la ubicación, mostrara todos los artículos relacionados a esa recepción, para poder ir confirmándolos:

Después de haber ubicado todas las recepciones, se debe de confirmar la recepción:

Después de haber finalizado la asignación a la ubicación, el siguiente paso, como lo señala la torre de control, es realizar la integración en FINALIZADAS SIN INTEGRAR:

Habiendo finalizado todo, esto se vera en INTEGRADAS SAP (HOY), Indicando que ya se integro con sap efectivamente

En la pantalla Trazabilidad de Movimientos,  podemos ver los movimientos relacionados a nuestra recepción, en numero de viaje:

También tendremos las tareas de almacenaje, las cuales e pueden asignar desde torre de control, o como las 2 anteriores, desde configuración, dejarlo en bolsa de tareas o en automática:

Seguido a esto, el usuario con la tarea asignada, podrá ver las tareas pendientes en el HH en la pantalla de Almacenaje:

Después de escanear el almacenamiento, encontraremos distintas opciones, tanto de traslado parcial, el cual funciona como el traslado de ciertos artículos de un lpn, o traslado especifico de lpn, o traslado de toda la carga

Después de almacenar todo, se puede visualizar si de verdad si guardo todo en dichas ubicaciones en la pantalla Saldos de Inventario:

En picking, el proceso seria muy similar al de recibo, comenzando desde Ordenes SAP Pendientes:

Se generan y se autoasignan, asignan manualmente, o algún usuario se la asigna, todo dependiendo de la configuración que tengan:

Después, en la parte de ASIGNADAS, se visualiza la información de a quien se le asigno, cual LPN, y cuales productos específicos se espera que haya:

Se continua con el flujo en la pantalla de alisto en el HH:

Despues de alistar todos los LPN’s, se debe realizar la Carga Camion desde el HH:

Para leer los LPN, podemos ver desde Torre de Control los detalles de nuestro documento de expedición:

Automáticamente, después de haber cerrado la carga de camión, la expedición se integrará a SAP:

En la parte de restablecimientos, encontramos lo que en WMS veíamos como acciones automáticas de tipo PICK, acá lo que configuramos únicamente son los puntos de reorden, en base a estos puntos de reorden, el mismo dentro del almacen que le demos, buscara si es que esta en el punto de reorden, el producto y lo ubicara en lo ubicación de picking que le indicamos:

Estas tareas, de igual forma se pueden configurar para que sean automáticas, manuales o en bolsa de tareas, posterior a haber asignado la tarea a algún recurso, el mismo deberá ubicarla en la pantalla de Reabastecimiento y posterior a, ubicarla:

Después de haber reabastecido correctamente la ubicación, podremos ver los resultados en Saldo de Inventario:
