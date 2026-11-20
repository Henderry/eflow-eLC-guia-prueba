/* =========================================================
   Dudas, fallos/mejoras y minutas
   ========================================================= */

/* ---------------- Dudas ---------------- */

function renderDoubts() {
  const open = db.doubts.filter((d) => !['resuelta', 'cerrada'].includes(d.status)).length;
  const chips = [
    { key: 'all', label: 'Todas', count: db.doubts.length },
    { key: 'open', label: 'Abiertas', count: open },
    { key: 'analisis', label: 'En análisis', count: db.doubts.filter((d) => d.status === 'analisis').length },
    { key: 'espera', label: 'En espera', count: db.doubts.filter((d) => d.status === 'espera').length },
    { key: 'resuelta', label: 'Resueltas', count: db.doubts.filter((d) => d.status === 'resuelta').length },
    { key: 'cerrada', label: 'Cerradas', count: db.doubts.filter((d) => d.status === 'cerrada').length },
  ];
  const clients = [...new Set(db.doubts.map((d) => d.client).filter(Boolean))].sort();
  return `
    <section class="page-head">
      <div>
        <span class="eyebrow">${icon('help')} Soporte</span>
        <h1>Dudas</h1>
        <p>Preguntas abiertas, respuestas y responsables. Cada duda conserva su contexto para que la respuesta no dependa de la memoria de alguien.</p>
      </div>
      <div class="head-actions">
        <button class="btn btn--primary" type="button" data-action="new-doubt">${icon('plus')} Nueva duda</button>
      </div>
    </section>

    <div class="toolbar card">
      <div class="search-field">
        ${icon('search')}
        <input id="doubtSearch" type="search" placeholder="Buscar por título, cliente, etiqueta o responsable…" value="${esc(ui.doubtSearch)}" autocomplete="off" />
      </div>
      <select class="input" id="doubtPriority" aria-label="Filtrar por prioridad">
        <option value="all" ${ui.doubtPriority === 'all' ? 'selected' : ''}>Toda prioridad</option>
        <option value="alta" ${ui.doubtPriority === 'alta' ? 'selected' : ''}>Alta</option>
        <option value="media" ${ui.doubtPriority === 'media' ? 'selected' : ''}>Media</option>
        <option value="baja" ${ui.doubtPriority === 'baja' ? 'selected' : ''}>Baja</option>
      </select>
      <select class="input" id="doubtClientFilter" aria-label="Filtrar por cliente">
        <option value="all" ${!ui.doubtClient || ui.doubtClient === 'all' ? 'selected' : ''}>Todo cliente</option>
        ${clients.map((c) => `<option value="${esc(c)}" ${ui.doubtClient === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
      </select>
    </div>

    <div class="chip-row" style="margin-bottom:14px">
      ${chips
        .map(
          (c) => `<button class="chip ${ui.doubtStatus === c.key ? 'is-active' : ''}" type="button" data-action="doubt-filter" data-status="${c.key}">
            ${esc(c.label)} <span class="count">${c.count}</span>
          </button>`
        )
        .join('')}
    </div>

    <div id="doubtList"></div>`;
}

function filteredDoubts() {
  const q = ui.doubtSearch.trim().toLowerCase();
  return db.doubts
    .filter((d) => {
      if (ui.doubtStatus === 'open') return !['resuelta', 'cerrada'].includes(d.status);
      if (ui.doubtStatus !== 'all' && d.status !== ui.doubtStatus) return false;
      if (ui.doubtPriority !== 'all' && d.priority !== ui.doubtPriority) return false;
      if (ui.doubtClient && ui.doubtClient !== 'all' && d.client !== ui.doubtClient) return false;
      if (q) {
        const hay = [d.title, d.description, d.client, d.category, d.owner, (d.tags || []).join(' ')].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const order = { alta: 0, media: 1, baja: 2 };
      const byPrio = (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
      if (byPrio !== 0) return byPrio;
      return String(b.updatedAt).localeCompare(String(a.updatedAt));
    });
}

function paintDoubtList() {
  const root = $('#doubtList');
  if (!root) return;
  const doubts = filteredDoubts();
  if (!doubts.length) {
    root.innerHTML = `<div class="empty card"><div class="empty-icon">${icon('help')}</div><h3>No hay dudas con este filtro</h3><p>Cambia el estado o la prioridad, o crea una nueva duda con el contexto del cliente.</p><button class="btn btn--primary" type="button" data-action="new-doubt">${icon('plus')} Nueva duda</button></div>`;
    return;
  }
  root.innerHTML = `<div class="list card">${doubts
    .map(
      (d) => `<a class="list-row" href="#/dudas/${d.id}" style="color:inherit">
        <span class="status-pill ${DOUBT_STATUS_CLASS[d.status] || ''}">${esc(DOUBT_STATUS[d.status] || d.status)}</span>
        <div class="row-main">
          <strong>${esc(d.title)}</strong>
          <p>${esc(d.client || 'General')} · ${esc(d.category || 'Sin categoría')} · ${esc(d.owner || 'Sin responsable')}</p>
        </div>
        <div class="row-side">
          <span class="prio ${PRIO_CLASS[d.priority] || ''}">${esc(d.priority || 'media')}</span>
          <span class="badge">${(d.replies || []).length} resp.</span>
          ${icon('chevron-right', 'chev')}
        </div>
      </a>`
    )
    .join('')}</div>`;
}

function renderDoubt(id) {
  const d = db.doubts.find((x) => x.id === id);
  if (!d) return renderNotFound('No encontramos esa duda. Puede haber sido eliminada.');
  const replies = [...(d.replies || [])].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const statuses = ['abierta', 'analisis', 'espera', 'resuelta', 'cerrada'];
  return `
    <section class="detail-head card">
      <div class="head-copy">
        <div class="tag-row" style="margin-bottom:8px">
          <span class="status-pill ${DOUBT_STATUS_CLASS[d.status] || ''}">${esc(DOUBT_STATUS[d.status] || d.status)}</span>
          <span class="prio ${PRIO_CLASS[d.priority] || ''}">Prioridad ${esc(d.priority || 'media')}</span>
          ${d.client ? `<span class="badge badge--blue">${esc(d.client)}</span>` : ''}
          ${d.category ? `<span class="badge">${esc(d.category)}</span>` : ''}
        </div>
        <h1>${esc(d.title)}</h1>
        <p>${esc(d.description)}</p>
      </div>
      <div class="head-actions">
        <button class="btn btn--outline" type="button" data-action="edit-doubt" data-id="${d.id}">${icon('edit')} Editar</button>
        <button class="btn btn--danger" type="button" data-action="delete-doubt" data-id="${d.id}">${icon('trash')} Eliminar</button>
      </div>
    </section>

    <div class="detail-grid">
      <div class="detail-main">
        <section class="card panel">
          <h2>${icon('help')} Conversación</h2>
          ${
            replies.length
              ? `<div class="thread">${replies
                  .map(
                    (r) => `<div class="reply">
                      <div class="reply-avatar">${esc(initials(r.author || 'Hub'))}</div>
                      <div class="reply-body">
                        <div class="reply-head"><strong>${esc(r.author || 'Equipo ePRAC')}</strong><time>${fmtDate(r.date)}</time></div>
                        <p>${esc(r.text)}</p>
                      </div>
                    </div>`
                  )
                  .join('')}</div>`
              : `<p class="small muted">Todavía no hay respuestas. Agrega la primera para dejar el contexto documentado.</p>`
          }
          <form class="reply-form" data-form="reply" data-id="${d.id}">
            <div style="flex:1;display:flex;flex-direction:column;gap:7px">
              <input class="input" name="author" placeholder="Tu nombre o equipo" value="Equipo ePRAC" style="max-width:260px" />
              <textarea class="input" name="text" placeholder="Escribe la respuesta, la hipótesis o el siguiente paso…" required></textarea>
            </div>
            <button class="btn btn--primary" type="submit">${icon('arrow-right')} Responder</button>
          </form>
        </section>

        <section class="card panel">
          <h2>${icon('flag')} Contexto</h2>
          <div class="field-list">
            <div class="field"><span class="k">Cliente</span><span class="v">${esc(d.client || 'General')}</span></div>
            <div class="field"><span class="k">Categoría</span><span class="v">${esc(d.category || 'Sin categoría')}</span></div>
            <div class="field"><span class="k">Responsable</span><span class="v">${esc(d.owner || 'Sin asignar')}</span></div>
            <div class="field"><span class="k">Creada</span><span class="v">${fmtDate(d.createdAt)}</span></div>
            <div class="field"><span class="k">Actualizada</span><span class="v">${fmtDate(d.updatedAt)}</span></div>
          </div>
          ${
            (d.tags || []).length
              ? `<div class="tag-row" style="margin-top:13px">${d.tags.map((t) => `<span class="badge badge--violet">${esc(t)}</span>`).join('')}</div>`
              : ''
          }
        </section>
      </div>

      <aside class="detail-side">
        <section class="card panel">
          <h2>${icon('refresh')} Estado</h2>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${statuses
              .map(
                (s) => `<button class="btn ${d.status === s ? 'btn--soft' : 'btn--outline'}" type="button" data-action="set-doubt-status" data-id="${d.id}" data-status="${s}" style="justify-content:flex-start">
                  ${d.status === s ? icon('check-circle') : icon('circle')} ${esc(DOUBT_STATUS[s])}
                </button>`
              )
              .join('')}
          </div>
        </section>
        <section class="card panel">
          <h2>${icon('sparkles')} Acciones</h2>
          <div style="display:flex;flex-direction:column;gap:8px">
            <button class="btn btn--soft" type="button" data-action="edit-doubt" data-id="${d.id}">${icon('edit')} Editar duda</button>
            <a class="btn btn--outline" href="#/problemas">${icon('wrench')} Buscar en problemas</a>
            <a class="btn btn--outline" href="#/registro">${icon('bug')} Ver fallos y mejoras</a>
          </div>
        </section>
        <section class="card panel">
          <h2>${icon('info')} Cómo cerrar una duda</h2>
          <p class="small muted">Una duda se resuelve cuando hay una respuesta verificable y, si aplica, un cambio documentado en la guía. Si sigue dependiendo de una confirmación externa, déjala en “En espera”.</p>
        </section>
      </aside>
    </div>`;
}

function openDoubtForm(id, prefill = {}) {
  const d =
    (id && db.doubts.find((x) => x.id === id)) || {
      title: prefill.title || '',
      description: prefill.description || '',
      status: prefill.status || 'abierta',
      priority: prefill.priority || 'media',
      client: prefill.client || '',
      category: prefill.category || '',
      owner: prefill.owner || '',
      tags: prefill.tags || [],
    };
  const clients = [...new Set(db.clients.map((c) => c.name).filter(Boolean))];
  openModal(`
    <form class="modal" data-form="doubt" data-id="${esc(id || '')}" role="dialog" aria-modal="true" aria-labelledby="doubtFormTitle">
      <div class="modal-head">
        <div><h2 id="doubtFormTitle">${id ? 'Editar duda' : 'Nueva duda'}</h2><p>Deja el contexto suficiente para que otra persona pueda responder sin preguntarte.</p></div>
        <button class="icon-btn" type="button" data-action="close-modal" aria-label="Cerrar">${icon('x')}</button>
      </div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="form-field form-field--full"><label for="dTitle">Título <span class="req">*</span></label><input id="dTitle" name="title" required value="${esc(d.title)}" placeholder="Una pregunta concreta" /></div>
          <div class="form-field form-field--full"><label for="dDescription">Descripción y contexto</label><textarea id="dDescription" name="description" placeholder="Qué pasó, dónde, con qué documento o pantalla, y qué esperabas.">${esc(d.description)}</textarea></div>
          <div class="form-field"><label for="dStatus">Estado</label><select id="dStatus" name="status">${Object.entries(DOUBT_STATUS)
            .map(([k, v]) => `<option value="${k}" ${d.status === k ? 'selected' : ''}>${esc(v)}</option>`)
            .join('')}</select></div>
          <div class="form-field"><label for="dPriority">Prioridad</label><select id="dPriority" name="priority">
            <option value="alta" ${d.priority === 'alta' ? 'selected' : ''}>Alta</option>
            <option value="media" ${d.priority === 'media' ? 'selected' : ''}>Media</option>
            <option value="baja" ${d.priority === 'baja' ? 'selected' : ''}>Baja</option>
          </select></div>
          <div class="form-field"><label for="dClient">Cliente</label><input id="dClient" name="client" list="clientNames" value="${esc(d.client)}" placeholder="General o nombre del cliente" /><datalist id="clientNames">${clients.map((c) => `<option value="${esc(c)}"></option>`).join('')}</datalist></div>
          <div class="form-field"><label for="dCategory">Categoría</label><input id="dCategory" name="category" value="${esc(d.category)}" placeholder="Ej. Picking, HH, Layouts" /></div>
          <div class="form-field"><label for="dOwner">Responsable</label><input id="dOwner" name="owner" value="${esc(d.owner)}" placeholder="Persona o equipo" /></div>
          <div class="form-field"><label for="dTags">Etiquetas (separadas por coma)</label><input id="dTags" name="tags" value="${esc((d.tags || []).join(', '))}" placeholder="LPN, Alisto, Versión" /></div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn--outline" type="button" data-action="close-modal">Cancelar</button>
        <button class="btn btn--primary" type="submit">${icon('save')} ${id ? 'Guardar cambios' : 'Crear duda'}</button>
      </div>
    </form>`);
}

function submitDoubt(form) {
  const fd = new FormData(form);
  const title = String(fd.get('title') || '').trim();
  if (!title) {
    toast('El título es obligatorio', 'error');
    return;
  }
  const id = form.dataset.id;
  const payload = {
    title,
    description: String(fd.get('description') || '').trim(),
    status: String(fd.get('status') || 'abierta'),
    priority: String(fd.get('priority') || 'media'),
    client: String(fd.get('client') || '').trim(),
    category: String(fd.get('category') || '').trim(),
    owner: String(fd.get('owner') || '').trim(),
    tags: String(fd.get('tags') || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    updatedAt: todayISO(),
  };
  let target;
  if (id) {
    target = db.doubts.find((d) => d.id === id);
    if (!target) return;
    Object.assign(target, payload);
  } else {
    target = { ...payload, id: uid('duda'), replies: [], createdAt: todayISO() };
    db.doubts.unshift(target);
  }
  save();
  searchIndexCache = null;
  closeModal();
  toast(id ? 'Duda actualizada' : 'Duda creada');
  go(`dudas/${target.id}`);
  render();
}

function deleteDoubt(id) {
  const d = db.doubts.find((x) => x.id === id);
  if (!d) return;
  openConfirm({
    title: 'Eliminar duda',
    message: `Se eliminará “${d.title}” y sus respuestas de este navegador.`,
    confirmText: 'Eliminar duda',
    onConfirm: () => {
      db.doubts = db.doubts.filter((x) => x.id !== id);
      save();
      searchIndexCache = null;
      toast('Duda eliminada');
      go('dudas');
      render();
    },
  });
}

function setDoubtStatus(id, status) {
  const d = db.doubts.find((x) => x.id === id);
  if (!d || !DOUBT_STATUS[status]) return;
  d.status = status;
  d.updatedAt = todayISO();
  save();
  toast(`Estado actualizado: ${DOUBT_STATUS[status]}`);
  render();
}

function submitReply(form) {
  const id = form.dataset.id;
  const d = db.doubts.find((x) => x.id === id);
  if (!d) return;
  const fd = new FormData(form);
  const text = String(fd.get('text') || '').trim();
  if (!text) {
    toast('Escribe una respuesta antes de enviarla', 'warn');
    return;
  }
  d.replies = d.replies || [];
  d.replies.push({
    date: todayISO(),
    author: String(fd.get('author') || 'Equipo ePRAC').trim() || 'Equipo ePRAC',
    text,
  });
  d.updatedAt = todayISO();
  save();
  searchIndexCache = null;
  toast('Respuesta agregada');
  render();
}

function doubtFromProblem(problemId) {
  const p = DATA.problems.find((x) => x.id === problemId);
  if (!p) return;
  openDoubtForm(null, {
    title: p.title,
    description: `Contexto desde el problema “${p.title}”.\n\nSíntoma: ${p.symptom}\n\nCausa probable: ${(p.cause || []).join('; ')}`,
    priority: 'media',
    category: p.process,
    tags: p.tags || [],
  });
}

/* ---------------- Fallos y mejoras ---------------- */

const FALLO_STATUS = ['Identificado', 'En revisión', 'Corregido', 'Descartado'];
const MEJORA_STATUS = ['Identificada', 'Aprobada', 'En desarrollo', 'Implementada', 'Descartada'];

function renderRecords() {
  const fallos = db.records.filter((r) => r.type === 'fallo');
  const mejoras = db.records.filter((r) => r.type === 'mejora');
  const tabs = [
    { key: 'todos', label: 'Todos', count: db.records.length },
    { key: 'fallo', label: 'Fallos', count: fallos.length },
    { key: 'mejora', label: 'Mejoras', count: mejoras.length },
  ];
  const statuses = [...new Set(db.records.map((r) => r.status))].sort();
  return `
    <section class="page-head">
      <div>
        <span class="eyebrow">${icon('bug')} Calidad</span>
        <h1>Fallos y mejoras</h1>
        <p>Registro real de defectos y propuestas de eLC, con versión afectada, estado, reproducción y seguimiento. Es la memoria técnica del producto.</p>
      </div>
      <div class="head-actions">
        <button class="btn btn--outline" type="button" data-action="new-record-fallo">${icon('bug')} Nuevo fallo</button>
        <button class="btn btn--primary" type="button" data-action="new-record-mejora">${icon('rocket')} Nueva mejora</button>
      </div>
    </section>

    <div class="toolbar card">
      <div class="search-field">
        ${icon('search')}
        <input id="recordSearch" type="search" placeholder="Buscar por código, título, área o descripción…" value="${esc(ui.recordSearch)}" autocomplete="off" />
      </div>
      <select class="input" id="recordStatus" aria-label="Filtrar por estado">
        <option value="all" ${ui.recordStatus === 'all' ? 'selected' : ''}>Todo estado</option>
        ${statuses.map((s) => `<option value="${esc(s)}" ${ui.recordStatus === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}
      </select>
    </div>

    <div class="chip-row" style="margin-bottom:14px">
      ${tabs
        .map(
          (t) => `<button class="chip ${ui.recordType === t.key ? 'is-active' : ''}" type="button" data-action="record-type" data-type="${t.key}">
            ${esc(t.label)} <span class="count">${t.count}</span>
          </button>`
        )
        .join('')}
    </div>

    <div id="recordList"></div>`;
}

function filteredRecords() {
  const q = ui.recordSearch.trim().toLowerCase();
  return db.records
    .filter((r) => {
      if (ui.recordType !== 'todos' && r.type !== ui.recordType) return false;
      if (ui.recordStatus !== 'all' && r.status !== ui.recordStatus) return false;
      if (q) {
        const hay = [r.code, r.title, r.area, r.description, r.notes, r.proposal].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => String(b.date || b.updatedAt).localeCompare(String(a.date || a.updatedAt)));
}

function paintRecordList() {
  const root = $('#recordList');
  if (!root) return;
  const records = filteredRecords();
  if (!records.length) {
    root.innerHTML = `<div class="empty card"><div class="empty-icon">${icon('bug')}</div><h3>No hay registros con este filtro</h3><p>Cambia el tipo o el estado, o crea un fallo o una mejora.</p></div>`;
    return;
  }
  root.innerHTML = `<div class="list card">${records
    .map(
      (r) => `<a class="list-row" href="#/registro/${r.id}" style="color:inherit">
        <span class="badge ${r.type === 'fallo' ? 'badge--red' : 'badge--violet'}">${esc(r.code)}</span>
        <div class="row-main"><strong>${esc(r.title)}</strong><p>${esc(r.area || 'Sin área')} · ${r.type === 'fallo' ? 'Fallo' : 'Mejora'} · ${esc(r.date ? fmtDate(r.date) : 'Sin fecha')}</p></div>
        <div class="row-side">
          <span class="prio ${PRIO_CLASS[String(r.priority || '').toLowerCase()] || ''}">${esc(r.priority || '—')}</span>
          <span class="status-pill ${RECORD_STATUS_CLASS[r.status] || ''}">${esc(r.status)}</span>
          ${icon('chevron-right', 'chev')}
        </div>
      </a>`
    )
    .join('')}</div>`;
}

function renderRecord(id) {
  const r = db.records.find((x) => x.id === id);
  if (!r) return renderNotFound('No encontramos ese registro. Puede haber sido eliminado.');
  const isFallo = r.type === 'fallo';
  return `
    <section class="detail-head card">
      <div class="head-copy">
        <div class="tag-row" style="margin-bottom:8px">
          <span class="badge ${isFallo ? 'badge--red' : 'badge--violet'}">${esc(r.code)}</span>
          <span class="badge">${isFallo ? 'Fallo' : 'Mejora'}</span>
          <span class="status-pill ${RECORD_STATUS_CLASS[r.status] || ''}">${esc(r.status)}</span>
          <span class="prio ${PRIO_CLASS[String(r.priority || '').toLowerCase()] || ''}">${esc(r.priority || 'Sin prioridad')}</span>
        </div>
        <h1>${esc(r.title)}</h1>
        <p>${esc(r.area || 'Sin área')} · ${esc(r.description || '')}</p>
      </div>
      <div class="head-actions">
        <button class="btn btn--outline" type="button" data-action="edit-record" data-id="${r.id}">${icon('edit')} Editar</button>
        <button class="btn btn--danger" type="button" data-action="delete-record" data-id="${r.id}">${icon('trash')} Eliminar</button>
      </div>
    </section>

    <div class="detail-grid">
      <div class="detail-main">
        <section class="card panel">
          <h2>${icon(isFallo ? 'bug' : 'rocket')} ${isFallo ? 'Descripción del fallo' : 'Situación actual y propuesta'}</h2>
          <div class="field-list">
            <div class="field field--stack"><span class="k">${isFallo ? 'Descripción' : 'Situación actual'}</span><span class="v">${esc(r.description || 'Sin descripción.')}</span></div>
            ${isFallo ? `<div class="field field--stack"><span class="k">Pasos para reproducir</span><span class="v">${esc(r.steps || 'No documentados.')}</span></div>
            <div class="field field--stack"><span class="k">Resultado actual</span><span class="v">${esc(r.currentResult || 'No documentado.')}</span></div>
            <div class="field field--stack"><span class="k">Resultado esperado</span><span class="v">${esc(r.expected || 'No documentado.')}</span></div>
            <div class="field field--stack"><span class="k">Solución o workaround</span><span class="v">${esc(r.workaround || 'N/A')}</span></div>` : `<div class="field field--stack"><span class="k">Mejora propuesta</span><span class="v">${esc(r.proposal || 'Sin propuesta.')}</span></div>
            <div class="field field--stack"><span class="k">Beneficio esperado</span><span class="v">${esc(r.benefit || 'No documentado.')}</span></div>`}
            <div class="field field--stack"><span class="k">Notas</span><span class="v">${esc(r.notes || 'Sin notas.')}</span></div>
          </div>
        </section>

        ${
          isFallo
            ? `<section class="card panel">
                <h2>${icon('layers')} Versiones y ambiente</h2>
                <div class="field-list">
                  <div class="field"><span class="k">Versión afectada</span><span class="v"><code>${esc(r.version || 'Por confirmar')}</code></span></div>
                  <div class="field"><span class="k">Versión corregida</span><span class="v"><code>${esc(r.fixedVersion || 'Pendiente')}</code></span></div>
                  <div class="field"><span class="k">Ambiente</span><span class="v">${esc(r.environment || 'N/A')}</span></div>
                </div>
              </section>`
            : ''
        }
      </div>

      <aside class="detail-side">
        <section class="card panel">
          <h2>${icon('flag')} Seguimiento</h2>
          <div class="field-list">
            <div class="field"><span class="k">Tipo</span><span class="v">${isFallo ? 'Fallo' : 'Mejora'}</span></div>
            <div class="field"><span class="k">Área</span><span class="v">${esc(r.area || '—')}</span></div>
            <div class="field"><span class="k">Prioridad</span><span class="v">${esc(r.priority || '—')}</span></div>
            <div class="field"><span class="k">Estado</span><span class="v">${esc(r.status)}</span></div>
            <div class="field"><span class="k">Reportado por</span><span class="v">${esc(r.reportedBy || '—')}</span></div>
            <div class="field"><span class="k">Fecha</span><span class="v">${fmtDate(r.date)}</span></div>
          </div>
        </section>
        <section class="card panel">
          <h2>${icon('sparkles')} Acciones</h2>
          <div style="display:flex;flex-direction:column;gap:8px">
            <button class="btn btn--soft" type="button" data-action="edit-record" data-id="${r.id}">${icon('edit')} Editar registro</button>
            <button class="btn btn--outline" type="button" data-action="new-doubt">${icon('help')} Crear duda relacionada</button>
            <a class="btn btn--outline" href="#/registro">${icon('arrow-left')} Volver al registro</a>
          </div>
        </section>
      </aside>
    </div>`;
}

function nextCode(type) {
  const prefix = type === 'fallo' ? 'FAL' : 'MEJ';
  const nums = db.records
    .filter((r) => r.type === type)
    .map((r) => {
      const m = String(r.code || '').match(/(\d+)/);
      return m ? Number(m[1]) : 0;
    });
  const next = Math.max(0, ...nums) + 1;
  return `${prefix}-${String(next).padStart(3, '0')}`;
}

function openRecordForm(id, forcedType) {
  const r =
    (id && db.records.find((x) => x.id === id)) || {
      type: forcedType || 'fallo',
      code: '',
      title: '',
      area: '',
      priority: 'Media',
      status: forcedType === 'mejora' ? 'Identificada' : 'Identificado',
      version: '',
      fixedVersion: '',
      environment: '',
      description: '',
      steps: '',
      currentResult: '',
      expected: '',
      workaround: '',
      proposal: '',
      benefit: '',
      notes: '',
      reportedBy: '',
      date: todayISO(),
    };
  const type = r.type || 'fallo';
  const statuses = type === 'fallo' ? FALLO_STATUS : MEJORA_STATUS;
  openModal(`
    <form class="modal modal--lg" data-form="record" data-id="${esc(id || '')}" role="dialog" aria-modal="true" aria-labelledby="recordFormTitle">
      <div class="modal-head">
        <div><h2 id="recordFormTitle">${id ? 'Editar registro' : type === 'fallo' ? 'Nuevo fallo' : 'Nueva mejora'}</h2><p>Documenta el contexto, la versión y el resultado esperado. Sin capturas dentro del hub.</p></div>
        <button class="icon-btn" type="button" data-action="close-modal" aria-label="Cerrar">${icon('x')}</button>
      </div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="form-field"><label for="recordFormType">Tipo</label><select id="recordFormType" name="type" ${id ? 'disabled' : ''}>
            <option value="fallo" ${type === 'fallo' ? 'selected' : ''}>Fallo</option>
            <option value="mejora" ${type === 'mejora' ? 'selected' : ''}>Mejora</option>
          </select></div>
          <div class="form-field"><label for="rCode">Código</label><input id="rCode" name="code" value="${esc(r.code || '')}" placeholder="${esc(nextCode(type))}" /></div>
          <div class="form-field form-field--full"><label for="rTitle">Título <span class="req">*</span></label><input id="rTitle" name="title" required value="${esc(r.title)}" /></div>
          <div class="form-field"><label for="rArea">Área / proceso</label><input id="rArea" name="area" value="${esc(r.area || '')}" placeholder="Ej. HH / Alisto" /></div>
          <div class="form-field"><label for="rPriority">Prioridad</label><select id="rPriority" name="priority">${['Alta', 'Media', 'Baja']
            .map((p) => `<option value="${p}" ${r.priority === p ? 'selected' : ''}>${p}</option>`)
            .join('')}</select></div>
          <div class="form-field"><label for="rStatus">Estado</label><select id="rStatus" name="status">${statuses
            .map((s) => `<option value="${esc(s)}" ${r.status === s ? 'selected' : ''}>${esc(s)}</option>`)
            .join('')}</select></div>
          <div class="form-field"><label for="rReportedBy">Reportado por</label><input id="rReportedBy" name="reportedBy" value="${esc(r.reportedBy || '')}" /></div>
          <div class="form-field"><label for="rDate">Fecha</label><input id="rDate" name="date" type="date" value="${esc(r.date || todayISO())}" /></div>
          <div class="form-field form-field--full"><label for="rDescription">${type === 'fallo' ? 'Descripción del fallo' : 'Situación actual'}</label><textarea id="rDescription" name="description">${esc(r.description || '')}</textarea></div>

          <div class="form-section fallo-only" ${type === 'mejora' ? 'hidden' : ''}><h3>Datos del fallo</h3></div>
          <div class="form-field fallo-only" ${type === 'mejora' ? 'hidden' : ''}><label for="rVersion">Versión afectada</label><input id="rVersion" name="version" value="${esc(r.version || '')}" placeholder="eLC / HH" /></div>
          <div class="form-field fallo-only" ${type === 'mejora' ? 'hidden' : ''}><label for="rFixed">Versión corregida</label><input id="rFixed" name="fixedVersion" value="${esc(r.fixedVersion || '')}" placeholder="Pendiente" /></div>
          <div class="form-field form-field--full fallo-only" ${type === 'mejora' ? 'hidden' : ''}><label for="rSteps">Pasos para reproducir</label><textarea id="rSteps" name="steps">${esc(r.steps || '')}</textarea></div>
          <div class="form-field fallo-only" ${type === 'mejora' ? 'hidden' : ''}><label for="rCurrent">Resultado actual</label><textarea id="rCurrent" name="currentResult">${esc(r.currentResult || '')}</textarea></div>
          <div class="form-field fallo-only" ${type === 'mejora' ? 'hidden' : ''}><label for="rExpected">Resultado esperado</label><textarea id="rExpected" name="expected">${esc(r.expected || '')}</textarea></div>
          <div class="form-field fallo-only" ${type === 'mejora' ? 'hidden' : ''}><label for="rWorkaround">Solución o workaround</label><textarea id="rWorkaround" name="workaround">${esc(r.workaround || '')}</textarea></div>
          <div class="form-field fallo-only" ${type === 'mejora' ? 'hidden' : ''}><label for="rEnvironment">Ambiente</label><input id="rEnvironment" name="environment" value="${esc(r.environment || '')}" placeholder="QA, producción, N/A" /></div>

          <div class="form-section mejora-only" ${type === 'fallo' ? 'hidden' : ''}><h3>Datos de la mejora</h3></div>
          <div class="form-field form-field--full mejora-only" ${type === 'fallo' ? 'hidden' : ''}><label for="rProposal">Mejora propuesta</label><textarea id="rProposal" name="proposal">${esc(r.proposal || '')}</textarea></div>
          <div class="form-field form-field--full mejora-only" ${type === 'fallo' ? 'hidden' : ''}><label for="rBenefit">Beneficio esperado</label><textarea id="rBenefit" name="benefit">${esc(r.benefit || '')}</textarea></div>

          <div class="form-section"><h3>Notas</h3></div>
          <div class="form-field form-field--full"><label for="rNotes">Notas internas</label><textarea id="rNotes" name="notes">${esc(r.notes || '')}</textarea></div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn--outline" type="button" data-action="close-modal">Cancelar</button>
        <button class="btn btn--primary" type="submit">${icon('save')} ${id ? 'Guardar cambios' : 'Crear registro'}</button>
      </div>
    </form>`);
}

function updateRecordFormVisibility(type) {
  const isFallo = type === 'fallo';
  $$('.fallo-only').forEach((el) => {
    el.hidden = !isFallo;
  });
  $$('.mejora-only').forEach((el) => {
    el.hidden = isFallo;
  });
  const status = $('#rStatus');
  if (status) {
    const current = status.value;
    const list = isFallo ? FALLO_STATUS : MEJORA_STATUS;
    status.innerHTML = list.map((s) => `<option value="${esc(s)}" ${s === current ? 'selected' : ''}>${esc(s)}</option>`).join('');
    if (!list.includes(current)) status.value = list[0];
  }
  const code = $('#rCode');
  if (code && !code.value) code.placeholder = nextCode(isFallo ? 'fallo' : 'mejora');
}

function submitRecord(form) {
  const fd = new FormData(form);
  const title = String(fd.get('title') || '').trim();
  if (!title) {
    toast('El título es obligatorio', 'error');
    return;
  }
  const id = form.dataset.id;
  const type = String(fd.get('type') || 'fallo');
  const payload = {
    type,
    code: String(fd.get('code') || '').trim() || nextCode(type),
    title,
    area: String(fd.get('area') || '').trim(),
    priority: String(fd.get('priority') || 'Media'),
    status: String(fd.get('status') || (type === 'fallo' ? 'Identificado' : 'Identificada')),
    version: String(fd.get('version') || '').trim(),
    fixedVersion: String(fd.get('fixedVersion') || '').trim(),
    environment: String(fd.get('environment') || '').trim(),
    description: String(fd.get('description') || '').trim(),
    steps: String(fd.get('steps') || '').trim(),
    currentResult: String(fd.get('currentResult') || '').trim(),
    expected: String(fd.get('expected') || '').trim(),
    workaround: String(fd.get('workaround') || '').trim(),
    proposal: String(fd.get('proposal') || '').trim(),
    benefit: String(fd.get('benefit') || '').trim(),
    notes: String(fd.get('notes') || '').trim(),
    reportedBy: String(fd.get('reportedBy') || '').trim(),
    date: String(fd.get('date') || todayISO()),
    updatedAt: todayISO(),
  };
  let target;
  if (id) {
    target = db.records.find((r) => r.id === id);
    if (!target) return;
    Object.assign(target, payload);
  } else {
    target = { ...payload, id: uid('reg'), createdAt: todayISO() };
    db.records.unshift(target);
  }
  save();
  searchIndexCache = null;
  closeModal();
  toast(id ? 'Registro actualizado' : 'Registro creado');
  go(`registro/${target.id}`);
  render();
}

function deleteRecord(id) {
  const r = db.records.find((x) => x.id === id);
  if (!r) return;
  openConfirm({
    title: 'Eliminar registro',
    message: `Se eliminará ${r.code} · “${r.title}” de este navegador.`,
    confirmText: 'Eliminar registro',
    onConfirm: () => {
      db.records = db.records.filter((x) => x.id !== id);
      save();
      searchIndexCache = null;
      toast('Registro eliminado');
      go('registro');
      render();
    },
  });
}

/* ---------------- Minutas ---------------- */

function renderMeetings() {
  return `
    <section class="page-head">
      <div>
        <span class="eyebrow">${icon('calendar')} Conocimiento</span>
        <h1>Minutas</h1>
        <p>Reuniones, decisiones y compromisos. Cada acción queda con responsable y estado para que no se pierda en el chat.</p>
      </div>
      <div class="head-actions">
        <button class="btn btn--primary" type="button" data-action="new-meeting">${icon('plus')} Nueva minuta</button>
      </div>
    </section>

    <div class="toolbar card">
      <div class="search-field">
        ${icon('search')}
        <input id="meetingSearch" type="search" placeholder="Buscar por título, cliente, participante o decisión…" value="${esc(ui.meetingSearch)}" autocomplete="off" />
      </div>
    </div>

    <div id="meetingList"></div>`;
}

function filteredMeetings() {
  const q = ui.meetingSearch.trim().toLowerCase();
  return db.meetings
    .filter((m) => {
      if (!q) return true;
      return [m.title, m.client, m.participants, m.summary, (m.decisions || []).join(' '), (m.tags || []).join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(q);
    })
    .sort((a, b) => String(b.date || b.updatedAt).localeCompare(String(a.date || a.updatedAt)));
}

function paintMeetingList() {
  const root = $('#meetingList');
  if (!root) return;
  const meetings = filteredMeetings();
  if (!meetings.length) {
    root.innerHTML = `<div class="empty card"><div class="empty-icon">${icon('calendar')}</div><h3>No hay minutas</h3><p>Registra la primera reunión con sus decisiones y compromisos.</p><button class="btn btn--primary" type="button" data-action="new-meeting">${icon('plus')} Nueva minuta</button></div>`;
    return;
  }
  root.innerHTML = `<div class="client-grid">${meetings.map(meetingCard).join('')}</div>`;
}

function meetingCard(m) {
  const pending = (m.actions || []).filter((a) => !a.done).length;
  return `<a class="meeting-card card card--hover" href="#/minutas/${m.id}" style="color:inherit">
    <div class="meeting-date">${icon('calendar')} ${fmtDate(m.date)}</div>
    <h3>${esc(m.title)}</h3>
    <p>${esc(m.summary || 'Sin resumen.')}</p>
    <div class="tag-row">${(m.tags || []).slice(0, 3).map((t) => `<span class="badge">${esc(t)}</span>`).join('')}</div>
    <div class="meeting-foot">
      <span>${esc(m.client || 'Interno')}</span>
      <span style="margin-left:auto">${pending ? `${pending} acción${pending === 1 ? '' : 'es'} pendiente${pending === 1 ? '' : 's'}` : 'Sin pendientes'}</span>
    </div>
  </a>`;
}

function renderMeeting(id) {
  const m = db.meetings.find((x) => x.id === id);
  if (!m) return renderNotFound('No encontramos esa minuta. Puede haber sido eliminada.');
  const actions = m.actions || [];
  const pending = actions.filter((a) => !a.done).length;
  return `
    <section class="detail-head card">
      <div class="head-copy">
        <div class="tag-row" style="margin-bottom:8px">
          <span class="badge badge--blue">${icon('calendar', 'ic--sm')} Minuta</span>
          ${m.client ? `<span class="badge badge--cyan">${esc(m.client)}</span>` : '<span class="badge">Interno</span>'}
          ${pending ? `<span class="badge badge--amber">${pending} pendientes</span>` : '<span class="badge badge--green">Sin pendientes</span>'}
        </div>
        <h1>${esc(m.title)}</h1>
        <p>${fmtDate(m.date)} · ${esc(m.participants || 'Participantes por confirmar')}</p>
      </div>
      <div class="head-actions">
        <button class="btn btn--outline" type="button" data-action="edit-meeting" data-id="${m.id}">${icon('edit')} Editar</button>
        <button class="btn btn--danger" type="button" data-action="delete-meeting" data-id="${m.id}">${icon('trash')} Eliminar</button>
      </div>
    </section>

    <div class="detail-grid">
      <div class="detail-main">
        <section class="card panel">
          <h2>${icon('file')} Resumen</h2>
          <p class="small" style="line-height:1.7">${esc(m.summary || 'Sin resumen.')}</p>
        </section>
        <section class="card panel">
          <h2>${icon('check-circle')} Decisiones</h2>
          ${
            (m.decisions || []).length
              ? `<ul class="small" style="margin:0;padding-left:20px;line-height:1.8">${m.decisions.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>`
              : `<p class="small muted">Sin decisiones registradas.</p>`
          }
        </section>
        <section class="card panel">
          <h2>${icon('flag')} Compromisos</h2>
          ${
            actions.length
              ? `<div class="check-list">${actions
                  .map(
                    (a, i) => `<label class="check-item ${a.done ? 'is-done' : ''}">
                      <input type="checkbox" ${a.done ? 'checked' : ''} data-action="toggle-meeting-action" data-id="${m.id}" data-index="${i}" />
                      <span>${esc(a.text)}<small>${esc(a.owner || 'Sin responsable')}${a.due ? ` · ${fmtDate(a.due)}` : ''}</small></span>
                    </label>`
                  )
                  .join('')}</div>`
              : `<p class="small muted">Sin compromisos registrados.</p>`
          }
        </section>
      </div>
      <aside class="detail-side">
        <section class="card panel">
          <h2>${icon('users')} Participantes</h2>
          <p class="small" style="line-height:1.7">${esc(m.participants || 'Por confirmar')}</p>
          <div class="divider"></div>
          <div class="field-list">
            <div class="field"><span class="k">Fecha</span><span class="v">${fmtDate(m.date)}</span></div>
            <div class="field"><span class="k">Cliente</span><span class="v">${esc(m.client || 'Interno')}</span></div>
            <div class="field"><span class="k">Acciones</span><span class="v">${actions.length - pending} de ${actions.length} completadas</span></div>
          </div>
          ${
            (m.tags || []).length
              ? `<div class="tag-row" style="margin-top:12px">${m.tags.map((t) => `<span class="badge badge--violet">${esc(t)}</span>`).join('')}</div>`
              : ''
          }
        </section>
        <section class="card panel">
          <h2>${icon('info')} Cómo usar las minutas</h2>
          <p class="small muted">Registra solo lo necesario: decisión, responsable y fecha. Si la reunión produjo un cambio en la operación, enlázalo con la guía o con una duda.</p>
        </section>
      </aside>
    </div>`;
}

function openMeetingForm(id) {
  const m =
    (id && db.meetings.find((x) => x.id === id)) || {
      title: '',
      date: todayISO(),
      client: '',
      participants: '',
      summary: '',
      decisions: [],
      actions: [],
      tags: [],
    };
  const decisionsText = (m.decisions || []).join('\n');
  const actionsText = (m.actions || [])
    .map((a) => [a.text, a.owner || '', a.due || ''].join(' | '))
    .join('\n');
  const clients = [...new Set(db.clients.map((c) => c.name).filter(Boolean))];
  openModal(`
    <form class="modal modal--lg" data-form="meeting" data-id="${esc(id || '')}" role="dialog" aria-modal="true" aria-labelledby="meetingFormTitle">
      <div class="modal-head">
        <div><h2 id="meetingFormTitle">${id ? 'Editar minuta' : 'Nueva minuta'}</h2><p>Una línea por decisión y una línea por compromiso.</p></div>
        <button class="icon-btn" type="button" data-action="close-modal" aria-label="Cerrar">${icon('x')}</button>
      </div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="form-field form-field--full"><label for="mTitle">Título <span class="req">*</span></label><input id="mTitle" name="title" required value="${esc(m.title)}" /></div>
          <div class="form-field"><label for="mDate">Fecha</label><input id="mDate" name="date" type="date" value="${esc(m.date || '')}" /></div>
          <div class="form-field"><label for="mClient">Cliente</label><input id="mClient" name="client" list="meetingClients" value="${esc(m.client || '')}" /><datalist id="meetingClients">${clients.map((c) => `<option value="${esc(c)}"></option>`).join('')}</datalist></div>
          <div class="form-field form-field--full"><label for="mParticipants">Participantes</label><input id="mParticipants" name="participants" value="${esc(m.participants || '')}" placeholder="Nombres separados por coma" /></div>
          <div class="form-field form-field--full"><label for="mSummary">Resumen</label><textarea id="mSummary" name="summary">${esc(m.summary || '')}</textarea></div>
          <div class="form-field form-field--full"><label for="mDecisions">Decisiones (una por línea)</label><textarea id="mDecisions" name="decisions">${esc(decisionsText)}</textarea></div>
          <div class="form-field form-field--full"><label for="mActions">Compromisos (uno por línea: texto | responsable | fecha)</label><textarea id="mActions" name="actions">${esc(actionsText)}</textarea></div>
          <div class="form-field form-field--full"><label for="mTags">Etiquetas (separadas por coma)</label><input id="mTags" name="tags" value="${esc((m.tags || []).join(', '))}" /></div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn--outline" type="button" data-action="close-modal">Cancelar</button>
        <button class="btn btn--primary" type="submit">${icon('save')} ${id ? 'Guardar cambios' : 'Crear minuta'}</button>
      </div>
    </form>`);
}

function submitMeeting(form) {
  const fd = new FormData(form);
  const title = String(fd.get('title') || '').trim();
  if (!title) {
    toast('El título es obligatorio', 'error');
    return;
  }
  const id = form.dataset.id;
  const existing = id ? db.meetings.find((x) => x.id === id) : null;
  const actions = String(fd.get('actions') || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [text, owner, due] = line.split('|').map((x) => (x || '').trim());
      const previous = existing?.actions?.[index];
      return { text, owner, due, done: previous?.done || false };
    });
  const payload = {
    title,
    date: String(fd.get('date') || ''),
    client: String(fd.get('client') || '').trim(),
    participants: String(fd.get('participants') || '').trim(),
    summary: String(fd.get('summary') || '').trim(),
    decisions: String(fd.get('decisions') || '')
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean),
    actions,
    tags: String(fd.get('tags') || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean),
    updatedAt: todayISO(),
  };
  let target;
  if (id) {
    target = db.meetings.find((x) => x.id === id);
    if (!target) return;
    Object.assign(target, payload);
  } else {
    target = { ...payload, id: uid('min'), createdAt: todayISO() };
    db.meetings.unshift(target);
  }
  save();
  searchIndexCache = null;
  closeModal();
  toast(id ? 'Minuta actualizada' : 'Minuta creada');
  go(`minutas/${target.id}`);
  render();
}

function deleteMeeting(id) {
  const m = db.meetings.find((x) => x.id === id);
  if (!m) return;
  openConfirm({
    title: 'Eliminar minuta',
    message: `Se eliminará “${m.title}” y sus compromisos de este navegador.`,
    confirmText: 'Eliminar minuta',
    onConfirm: () => {
      db.meetings = db.meetings.filter((x) => x.id !== id);
      save();
      searchIndexCache = null;
      toast('Minuta eliminada');
      go('minutas');
      render();
    },
  });
}

function toggleMeetingAction(id, index) {
  const m = db.meetings.find((x) => x.id === id);
  if (!m || !m.actions?.[index]) return;
  m.actions[index].done = !m.actions[index].done;
  m.updatedAt = todayISO();
  save();
  const label = document.querySelector(`.check-item input[data-id="${id}"][data-index="${index}"]`)?.closest('.check-item');
  if (label) label.classList.toggle('is-done', m.actions[index].done);
}

/* ---------------- Bitácora de cliente ---------------- */

function submitTimeline(form) {
  const id = form.dataset.id;
  const fd = new FormData(form);
  const text = String(fd.get('text') || '').trim();
  if (!text) {
    toast('Escribe una nota antes de agregarla', 'warn');
    return;
  }
  const c = db.clients.find((x) => x.id === id);
  if (!c) return;
  c.timeline = c.timeline || [];
  c.timeline.push({ date: todayISO(), text });
  c.updatedAt = todayISO();
  save();
  searchIndexCache = null;
  toast('Nota agregada a la bitácora');
  render();
}
