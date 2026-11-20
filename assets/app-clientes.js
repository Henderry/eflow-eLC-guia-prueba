/* =========================================================
   Clientes
   ========================================================= */

const COMPONENTS = [
  { key: "elc", label: "eLC" },
  { key: "hh", label: "Hand Held" },
  { key: "epacking", label: "ePacking" },
  { key: "desktop", label: "Desktop" },
  { key: "web", label: "Web" },
];

const COMPONENT_STATE = {
  used: { label: "Usa", cls: "badge--green" },
  not_used: { label: "No usa", cls: "" },
  unknown: { label: "Por confirmar", cls: "badge--amber" },
};

const COMPLETENESS_LABELS = {
  name: "Nombre",
  description: "Descripción",
  group: "Grupo",
  process: "Proceso operativo",
  qa: "Servidor QA",
  prod: "Servidor producción",
  vpn: "Nota de VPN",
  path: "Ruta de conexiones",
  contact: "Contacto",
  components: "Componentes y versiones",
  links: "Enlaces",
  custom: "Campos personalizados",
  timeline: "Bitácora",
  notes: "Notas internas",
};

function componentSummary(client) {
  const c = client.components || {};
  const used = COMPONENTS.filter((x) => c[x.key] === "used").map((x) => x.label);
  return used.length ? used.join(" + ") : "Componentes por confirmar";
}

function avatarClass(name) {
  const classes = ["", "avatar--green", "avatar--amber", "avatar--violet", "avatar--slate"];
  let sum = 0;
  for (const ch of String(name || "")) sum += ch.charCodeAt(0);
  return classes[sum % classes.length];
}

function completeness(client) {
  const c = client.components || {};
  const checks = [
    { key: "name", w: 8, ok: Boolean(String(client.name || "").trim()) },
    { key: "description", w: 8, ok: String(client.description || "").trim().length > 20 },
    { key: "group", w: 6, ok: Boolean(String(client.group || "").trim()) },
    { key: "process", w: 10, ok: String(client.process || "").trim().length > 20 },
    { key: "qa", w: 8, ok: Boolean(String(client.qaServer || "").trim()) },
    { key: "prod", w: 8, ok: Boolean(String(client.prodServer || "").trim()) },
    { key: "vpn", w: 4, ok: !client.vpn || String(client.vpnNotes || "").trim().length > 5 },
    { key: "path", w: 4, ok: Boolean(String(client.connectionsPath || "").trim()) },
    { key: "contact", w: 8, ok: Boolean(String(client.contactName || "").trim() || String(client.contactEmail || "").trim()) },
    {
      key: "components",
      w: 8,
      ok: COMPONENTS.every((x) => c[x.key] && c[x.key] !== "unknown"),
    },
    { key: "links", w: 4, ok: (client.links || []).length > 0 },
    { key: "custom", w: 4, ok: (client.custom || []).length > 0 },
    { key: "timeline", w: 4, ok: (client.timeline || []).length > 0 },
    { key: "notes", w: 4, ok: String(client.notes || "").trim().length > 0 },
  ];
  const total = checks.reduce((s, x) => s + x.w, 0);
  const got = checks.filter((x) => x.ok).reduce((s, x) => s + x.w, 0);
  return {
    pct: Math.round((got / total) * 100),
    missing: checks.filter((x) => !x.ok).map((x) => COMPLETENESS_LABELS[x.key] || x.key),
  };
}

/* ---------------- Lista ---------------- */

function renderClients() {
  return `
    <section class="page-head">
      <div>
        <span class="eyebrow">${icon('building')} Operación</span>
        <h1>Clientes</h1>
        <p>Fichas editables con contexto, VPN, ambientes QA y producción, componentes, proceso operativo, enlaces y bitácora.</p>
      </div>
      <div class="head-actions">
        <button class="btn btn--primary" type="button" data-action="new-client">${icon('plus')} Nuevo cliente</button>
      </div>
    </section>

    <div class="toolbar card">
      <div class="search-field">
        ${icon('search')}
        <input id="clientSearch" type="search" placeholder="Buscar por nombre, grupo, proceso o contacto…" value="${esc(ui.clientSearch)}" autocomplete="off" />
      </div>
      <select class="input" id="clientFilter" aria-label="Filtrar clientes">
        <option value="all" ${ui.clientFilter === 'all' ? 'selected' : ''}>Todos los clientes</option>
        <option value="incomplete" ${ui.clientFilter === 'incomplete' ? 'selected' : ''}>Fichas incompletas</option>
        <option value="vpn" ${ui.clientFilter === 'vpn' ? 'selected' : ''}>Con VPN</option>
        <option value="elc" ${ui.clientFilter === 'elc' ? 'selected' : ''}>Con eLC activo</option>
        <option value="example" ${ui.clientFilter === 'example' ? 'selected' : ''}>Solo ejemplos</option>
      </select>
      <div class="view-toggle" role="group" aria-label="Vista de clientes">
        <button type="button" data-action="client-view" data-view="cards" class="${ui.clientView === 'cards' ? 'is-active' : ''}" aria-label="Vista de tarjetas">${icon('grid')}</button>
        <button type="button" data-action="client-view" data-view="table" class="${ui.clientView === 'table' ? 'is-active' : ''}" aria-label="Vista de tabla">${icon('list')}</button>
      </div>
    </div>

    <div id="clientList"></div>`;
}

function filteredClients() {
  const q = ui.clientSearch.trim().toLowerCase();
  return db.clients.filter((c) => {
    if (q) {
      const hay = [c.name, c.group, c.description, c.process, c.contactName, c.contactEmail, c.notes].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (ui.clientFilter === "incomplete" && completeness(c).pct >= 100) return false;
    if (ui.clientFilter === "vpn" && !c.vpn) return false;
    if (ui.clientFilter === "elc" && c.components?.elc !== "used") return false;
    if (ui.clientFilter === "example" && !c.example) return false;
    return true;
  });
}

function paintClientList() {
  const root = $("#clientList");
  if (!root) return;
  const clients = filteredClients();
  if (!clients.length) {
    root.innerHTML = `<div class="empty card">
      <div class="empty-icon">${icon('building')}</div>
      <h3>${db.clients.length ? 'Ningún cliente coincide con el filtro' : 'Aún no hay clientes'}</h3>
      <p>${db.clients.length ? 'Prueba con otro término o limpia el filtro.' : 'Crea la primera ficha con ambientes, versiones, proceso y bitácora.'}</p>
      <button class="btn btn--primary" type="button" data-action="new-client">${icon('plus')} Nuevo cliente</button>
    </div>`;
    return;
  }
  if (ui.clientView === "table") {
    root.innerHTML = `<div class="table-wrap card"><table class="data">
      <thead><tr><th>Cliente</th><th>Grupo</th><th>Componentes</th><th>VPN</th><th>Ficha</th><th>Actualizado</th><th></th></tr></thead>
      <tbody>${clients
        .map((c) => {
          const comp = completeness(c);
          return `<tr>
            <td><a href="#/clientes/${c.id}"><strong>${esc(c.name)}</strong></a><div class="tiny muted">${esc(c.description || '')}</div></td>
            <td>${esc(c.group || '—')}</td>
            <td>${esc(componentSummary(c))}</td>
            <td>${c.vpn ? '<span class="badge badge--blue">Sí</span>' : '<span class="badge">No</span>'}</td>
            <td><div style="display:flex;align-items:center;gap:7px"><div class="bar" style="width:70px"><i style="width:${comp.pct}%"></i></div><span class="tiny strong">${comp.pct}%</span></div></td>
            <td class="tiny muted">${fmtDate(c.updatedAt)}</td>
            <td><div style="display:flex;gap:4px"><button class="icon-btn icon-btn--ghost" type="button" data-action="edit-client" data-id="${c.id}" aria-label="Editar">${icon('edit', 'ic--sm')}</button></div></td>
          </tr>`;
        })
        .join("")}</tbody></table></div>`;
    return;
  }
  root.innerHTML = `<div class="client-grid">${clients.map(clientCard).join("")}</div>`;
}

function clientCard(c) {
  const comp = completeness(c);
  return `<a class="client-card card card--hover" href="#/clientes/${c.id}" style="color:inherit">
    <div class="client-top">
      <div class="avatar ${avatarClass(c.name)}">${esc(initials(c.name))}</div>
      <div class="client-title">
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.group || 'Sin grupo')} · ${esc(componentSummary(c))}</p>
      </div>
      ${c.example ? '<span class="badge badge--amber">Ejemplo</span>' : ''}
    </div>
    <p class="client-desc">${esc(c.description || 'Sin descripción todavía.')}</p>
    <div class="tag-row">
      ${c.vpn ? `<span class="badge badge--blue">${icon('lock', 'ic--sm')} VPN</span>` : ''}
      ${c.components?.elc === 'used' ? '<span class="badge badge--cyan">eLC</span>' : ''}
      ${c.components?.hh === 'used' ? '<span class="badge badge--violet">HH</span>' : ''}
      ${c.components?.epacking === 'used' ? '<span class="badge">ePacking</span>' : ''}
    </div>
    <div class="client-foot">
      <div class="bar"><i style="width:${comp.pct}%"></i></div>
      <span class="pct">${comp.pct}%</span>
      <span>${fmtDate(c.updatedAt)}</span>
    </div>
  </a>`;
}

/* ---------------- Detalle ---------------- */

function renderClient(id) {
  const c = db.clients.find((x) => x.id === id);
  if (!c) return renderNotFound("No encontramos esa ficha de cliente. Puede haber sido eliminada.");
  const comp = completeness(c);
  const components = c.components || {};
  const links = c.links || [];
  const custom = c.custom || [];
  const timeline = [...(c.timeline || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)));

  return `
    <section class="detail-head card">
      <div class="avatar ${avatarClass(c.name)}">${esc(initials(c.name))}</div>
      <div class="head-copy">
        <div class="tag-row" style="margin-bottom:7px">
          <span class="badge badge--blue">${icon('building', 'ic--sm')} Cliente</span>
          ${c.example ? '<span class="badge badge--amber">Ficha de ejemplo</span>' : ''}
          ${c.vpn ? `<span class="badge badge--cyan">${icon('lock', 'ic--sm')} VPN</span>` : ''}
        </div>
        <h1>${esc(c.name)}</h1>
        <p>${esc(c.description || 'Sin descripción todavía.')}</p>
      </div>
      <div class="head-actions">
        <button class="btn btn--outline" type="button" data-action="edit-client" data-id="${c.id}">${icon('edit')} Editar</button>
        <button class="btn btn--danger" type="button" data-action="delete-client" data-id="${c.id}">${icon('trash')} Eliminar</button>
      </div>
    </section>

    <div class="detail-grid">
      <div class="detail-main">
        <section class="card panel">
          <h2>${icon('layers')} Contexto y operación</h2>
          <div class="field-list">
            <div class="field"><span class="k">Grupo</span><span class="v">${esc(c.group || 'Sin grupo asignado')}</span></div>
            <div class="field field--stack"><span class="k">Proceso operativo</span><span class="v">${esc(c.process || 'Pendiente de documentar.')}</span></div>
            <div class="field"><span class="k">Contacto</span><span class="v">${esc(c.contactName || '—')}${c.contactEmail ? ` · <a href="mailto:${esc(c.contactEmail)}">${esc(c.contactEmail)}</a>` : ''}${c.contactPhone ? ` · ${esc(c.contactPhone)}` : ''}</span></div>
            <div class="field"><span class="k">Notas internas</span><span class="v">${esc(c.notes || 'Sin notas.')}</span></div>
          </div>
        </section>

        <section class="card panel">
          <h2>${icon('shield')} Ambientes y conexión</h2>
          <div class="field-list">
            <div class="field"><span class="k">VPN</span><span class="v">${c.vpn ? '<span class="badge badge--cyan">Requiere VPN</span>' : '<span class="badge">No requiere</span>'}</span></div>
            <div class="field field--stack"><span class="k">Proceso de conexión / notas</span><span class="v">${esc(c.vpnNotes || 'Sin nota. No guardar credenciales aquí.')}</span></div>
            <div class="field"><span class="k">Servidor QA</span><span class="v"><code>${esc(c.qaServer || 'Por confirmar')}</code></span></div>
            <div class="field"><span class="k">Servidor producción</span><span class="v"><code>${esc(c.prodServer || 'Por confirmar')}</code></span></div>
            <div class="field"><span class="k">Ruta de conexiones</span><span class="v">${esc(c.connectionsPath || 'Sin ruta registrada')}</span></div>
          </div>
          <div class="callout callout--warn" style="margin-top:14px">${icon('alert')}<div><strong>Referencia informativa</strong><p>Una página web no puede abrir rutas del disco o de la red del usuario. Guarda la ruta solo como referencia y mantén las credenciales en el gestor aprobado.</p></div></div>
        </section>

        <section class="card panel">
          <h2>${icon('grid')} Componentes y versiones</h2>
          <div class="table-wrap"><table class="data">
            <thead><tr><th>Componente</th><th>Estado</th><th>Versión / nota</th></tr></thead>
            <tbody>${COMPONENTS.map((comp) => {
              const state = components[comp.key] || "unknown";
              const meta = COMPONENT_STATE[state] || COMPONENT_STATE.unknown;
              return `<tr><td><strong>${esc(comp.label)}</strong></td><td><span class="badge ${meta.cls}">${esc(meta.label)}</span></td><td class="muted">${esc(c.componentNotes?.[comp.key] || '—')}</td></tr>`;
            }).join("")}</tbody>
          </table></div>
        </section>

        ${
          links.length
            ? `<section class="card panel">
                <h2>${icon('link')} Enlaces y archivos</h2>
                <div class="mini-list">${links
                  .map(
                    (l) => `<a class="mini-row" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer" style="color:inherit">
                      <span class="mini-dot mini-dot--blue"></span>
                      <div><strong>${esc(l.label || l.url)}</strong><p>${esc(l.url)}</p></div>
                      ${icon('external', 'chev')}
                    </a>`
                  )
                  .join("")}</div>
              </section>`
            : ""
        }

        ${
          custom.length
            ? `<section class="card panel">
                <h2>${icon('list')} Campos personalizados</h2>
                <div class="field-list">${custom
                  .map((f) => `<div class="field"><span class="k">${esc(f.label)}</span><span class="v">${esc(f.value)}</span></div>`)
                  .join("")}</div>
              </section>`
            : ""
        }

        <section class="card panel">
          <h2>${icon('clock')} Bitácora</h2>
          <form class="reply-form" data-form="timeline" data-id="${c.id}" style="margin-top:0">
            <input class="input" id="timelineText" name="text" placeholder="Agregar una nota con fecha (cambio, decisión, incidencia)…" style="flex:1" />
            <button class="btn btn--primary" type="submit">${icon('plus')} Agregar</button>
          </form>
          <div class="divider"></div>
          ${
            timeline.length
              ? `<div class="timeline">${timeline
                  .map(
                    (t) => `<div class="timeline-item"><time>${fmtDate(t.date)}</time><p>${esc(t.text)}</p></div>`
                  )
                  .join("")}</div>`
              : `<p class="small muted">Sin eventos todavía. Agrega la primera nota arriba.</p>`
          }
        </section>
      </div>

      <aside class="detail-side">
        <section class="card panel">
          <h2>${icon('target')} Completitud de la ficha</h2>
          <div class="completion-card">
            <div class="ring" style="--p:${comp.pct}"><span>${comp.pct}%</span></div>
            <div><strong>${comp.pct === 100 ? 'Ficha completa' : 'Faltan datos'}</strong><p>${comp.missing.length ? `${comp.missing.length} campos por completar` : 'Todos los campos clave están llenos.'}</p></div>
          </div>
          ${
            comp.missing.length
              ? `<div class="missing-list">${comp.missing.map((m) => `<span class="badge badge--amber">${esc(m)}</span>`).join("")}</div>`
              : `<div class="callout callout--tip" style="margin-top:12px">${icon('check-circle')}<div><p>Ficha lista para operar y compartir con el grupo autorizado.</p></div></div>`
          }
        </section>

        <section class="card panel">
          <h2>${icon('info')} Ficha</h2>
          <div class="field-list">
            <div class="field"><span class="k">Creada</span><span class="v">${fmtDate(c.createdAt)}</span></div>
            <div class="field"><span class="k">Actualizada</span><span class="v">${fmtDate(c.updatedAt)}</span></div>
            <div class="field"><span class="k">Registros</span><span class="v">${timeline.length} en bitácora</span></div>
          </div>
          <div class="divider"></div>
          <div class="callout callout--info">${icon('lock')}<div><p>Esta ficha es local. No incluyas contraseñas, llaves ni cadenas de conexión.</p></div></div>
        </section>

        <section class="card panel">
          <h2>${icon('sparkles')} Acciones</h2>
          <div style="display:flex;flex-direction:column;gap:8px">
            <button class="btn btn--soft" type="button" data-action="edit-client" data-id="${c.id}">${icon('edit')} Editar ficha</button>
            <a class="btn btn--outline" href="#/dudas">${icon('help')} Ver dudas del cliente</a>
            <a class="btn btn--outline" href="#/guia">${icon('book')} Abrir la guía</a>
          </div>
        </section>
      </aside>
    </div>`;
}

/* ---------------- Formulario ---------------- */

function openClientForm(id) {
  const c =
    (id && db.clients.find((x) => x.id === id)) || {
      name: "",
      group: "",
      description: "",
      process: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      vpn: false,
      vpnNotes: "",
      qaServer: "",
      prodServer: "",
      connectionsPath: "",
      components: { elc: "unknown", hh: "unknown", epacking: "unknown", desktop: "unknown", web: "unknown" },
      notes: "",
      links: [],
      custom: [],
      timeline: [],
    };
  const components = c.components || {};
  const linksText = (c.links || []).map((l) => `${l.label || ""} | ${l.url || ""}`).join("\n");
  const customText = (c.custom || []).map((f) => `${f.label || ""}: ${f.value || ""}`).join("\n");

  openModal(`
    <form class="modal modal--lg" data-form="client" data-id="${esc(id || '')}" role="dialog" aria-modal="true" aria-labelledby="clientFormTitle">
      <div class="modal-head">
        <div><h2 id="clientFormTitle">${id ? 'Editar cliente' : 'Nuevo cliente'}</h2><p>Los campos marcados con * son obligatorios. No guardes credenciales.</p></div>
        <button class="icon-btn" type="button" data-action="close-modal" aria-label="Cerrar">${icon('x')}</button>
      </div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="form-section"><h3>Identificación</h3></div>
          <div class="form-field"><label for="cName">Nombre del cliente <span class="req">*</span></label><input id="cName" name="name" required value="${esc(c.name)}" placeholder="Ej. Cliente / operación" /></div>
          <div class="form-field"><label for="cGroup">Grupo o equipo</label><input id="cGroup" name="group" value="${esc(c.group || '')}" placeholder="Ej. ePRAC Interno" /></div>
          <div class="form-field form-field--full"><label for="cDescription">Descripción</label><textarea id="cDescription" name="description" placeholder="Quién es el cliente y qué opera.">${esc(c.description || '')}</textarea></div>
          <div class="form-field form-field--full"><label for="cProcess">Proceso operativo</label><textarea id="cProcess" name="process" placeholder="Recepción, almacenaje, picking, ePacking, carga y particularidades.">${esc(c.process || '')}</textarea></div>

          <div class="form-section"><h3>Contacto</h3></div>
          <div class="form-field"><label for="cContactName">Nombre</label><input id="cContactName" name="contactName" value="${esc(c.contactName || '')}" /></div>
          <div class="form-field"><label for="cContactEmail">Correo</label><input id="cContactEmail" name="contactEmail" type="email" value="${esc(c.contactEmail || '')}" /></div>
          <div class="form-field"><label for="cContactPhone">Teléfono</label><input id="cContactPhone" name="contactPhone" value="${esc(c.contactPhone || '')}" /></div>

          <div class="form-section"><h3>Ambientes y conexión</h3></div>
          <div class="form-field form-field--full checkbox-row"><input id="cVpn" name="vpn" type="checkbox" ${c.vpn ? 'checked' : ''} /><label for="cVpn" style="padding:0">Requiere VPN</label></div>
          <div class="form-field form-field--full"><label for="cVpnNotes">Proceso de conexión / notas de VPN</label><textarea id="cVpnNotes" name="vpnNotes" placeholder="Solo el proceso autorizado. Nunca contraseñas ni llaves.">${esc(c.vpnNotes || '')}</textarea></div>
          <div class="form-field"><label for="cQa">Servidor QA</label><input id="cQa" name="qaServer" value="${esc(c.qaServer || '')}" placeholder="host o URL de QA" /></div>
          <div class="form-field"><label for="cProd">Servidor producción</label><input id="cProd" name="prodServer" value="${esc(c.prodServer || '')}" placeholder="host o URL de producción" /></div>
          <div class="form-field form-field--full"><label for="cPath">Ruta de conexiones (referencia)</label><input id="cPath" name="connectionsPath" value="${esc(c.connectionsPath || '')}" placeholder="\\\\servidor\\Conexiones\\Cliente" /></div>

          <div class="form-section"><h3>Componentes</h3></div>
          ${COMPONENTS.map(
            (comp) => `<div class="form-field"><label for="comp-${comp.key}">${esc(comp.label)}</label>
              <select id="comp-${comp.key}" name="comp_${comp.key}">
                <option value="used" ${components[comp.key] === 'used' ? 'selected' : ''}>Usa</option>
                <option value="not_used" ${components[comp.key] === 'not_used' ? 'selected' : ''}>No usa</option>
                <option value="unknown" ${!components[comp.key] || components[comp.key] === 'unknown' ? 'selected' : ''}>Por confirmar</option>
              </select></div>`
          ).join("")}

          <div class="form-section"><h3>Notas y referencias</h3></div>
          <div class="form-field form-field--full"><label for="cNotes">Notas internas</label><textarea id="cNotes" name="notes" placeholder="Contexto, acuerdos, cuidados especiales.">${esc(c.notes || '')}</textarea></div>
          <div class="form-field form-field--full"><label for="cLinks">Enlaces (uno por línea, formato: etiqueta | URL)</label><textarea id="cLinks" name="links" placeholder="Documentación | https://...">${esc(linksText)}</textarea></div>
          <div class="form-field form-field--full"><label for="cCustom">Campos personalizados (uno por línea, formato: etiqueta: valor)</label><textarea id="cCustom" name="custom" placeholder="Horario: 06:00 - 22:00">${esc(customText)}</textarea></div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn--outline" type="button" data-action="close-modal">Cancelar</button>
        <button class="btn btn--primary" type="submit">${icon('save')} ${id ? 'Guardar cambios' : 'Crear cliente'}</button>
      </div>
    </form>`);
}

function parseLinks(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split("|");
      return { label: (label || "").trim(), url: rest.join("|").trim() };
    })
    .filter((l) => l.url);
}

function parseCustom(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(":");
      return idx > 0 ? { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() } : { label: line, value: "" };
    });
}

function submitClient(form) {
  const fd = new FormData(form);
  const name = String(fd.get("name") || "").trim();
  if (!name) {
    toast("El nombre del cliente es obligatorio", "error");
    return;
  }
  const id = form.dataset.id;
  const components = {};
  COMPONENTS.forEach((comp) => {
    components[comp.key] = String(fd.get(`comp_${comp.key}`) || "unknown");
  });
  const payload = {
    name,
    group: String(fd.get("group") || "").trim(),
    description: String(fd.get("description") || "").trim(),
    process: String(fd.get("process") || "").trim(),
    contactName: String(fd.get("contactName") || "").trim(),
    contactEmail: String(fd.get("contactEmail") || "").trim(),
    contactPhone: String(fd.get("contactPhone") || "").trim(),
    vpn: fd.get("vpn") === "on",
    vpnNotes: String(fd.get("vpnNotes") || "").trim(),
    qaServer: String(fd.get("qaServer") || "").trim(),
    prodServer: String(fd.get("prodServer") || "").trim(),
    connectionsPath: String(fd.get("connectionsPath") || "").trim(),
    components,
    notes: String(fd.get("notes") || "").trim(),
    links: parseLinks(fd.get("links")),
    custom: parseCustom(fd.get("custom")),
    updatedAt: todayISO(),
  };
  let target;
  if (id) {
    target = db.clients.find((c) => c.id === id);
    if (!target) return;
    Object.assign(target, payload);
  } else {
    target = {
      ...payload,
      id: uid("cli"),
      timeline: [{ date: todayISO(), text: "Ficha creada." }],
      createdAt: todayISO(),
    };
    db.clients.unshift(target);
  }
  save();
  searchIndexCache = null;
  closeModal();
  toast(id ? "Cliente actualizado" : "Cliente creado");
  go(`clientes/${target.id}`);
  render();
}

function deleteClient(id) {
  const c = db.clients.find((x) => x.id === id);
  if (!c) return;
  openConfirm({
    title: "Eliminar cliente",
    message: `Se eliminará la ficha de “${c.name}” de este navegador. Exporta un respaldo si necesitas conservarla.`,
    confirmText: "Eliminar ficha",
    onConfirm: () => {
      db.clients = db.clients.filter((x) => x.id !== id);
      save();
      searchIndexCache = null;
      toast("Cliente eliminado");
      go("clientes");
      render();
    },
  });
}

function addTimeline(id) {
  const input = $("#timelineText");
  const text = String(input?.value || "").trim();
  if (!text) {
    toast("Escribe una nota antes de agregarla", "warn");
    return;
  }
  const c = db.clients.find((x) => x.id === id);
  if (!c) return;
  c.timeline = c.timeline || [];
  c.timeline.push({ date: todayISO(), text });
  c.updatedAt = todayISO();
  save();
  toast("Nota agregada a la bitácora");
  render();
}
