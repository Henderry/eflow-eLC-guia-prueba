/* =========================================================
   Problemas frecuentes y glosario
   ========================================================= */

/* ---------------- Problemas ---------------- */

const PROBLEM_STATUS = {
  confirmado: { label: 'Confirmado en fuentes', cls: 'badge--green' },
  por_confirmar: { label: 'Por confirmar', cls: 'badge--amber' },
};

function problemProcesses() {
  return [...new Set((DATA.problems || []).map((p) => p.process).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'es')
  );
}

function renderProblems(problemId) {
  ui.problemSearch = '';
  ui.problemProcess = 'all';
  const total = (DATA.problems || []).length;
  const processes = problemProcesses();
  return `
    <section class="page-head">
      <div>
        <span class="eyebrow">${icon('wrench')} Diagnóstico</span>
        <h1>Problemas frecuentes</h1>
        <p>${total} casos documentados para diagnosticar sin adivinar. Cada ficha separa el síntoma, las causas posibles, la solución y cómo verificar que quedó resuelto.</p>
      </div>
      <div class="head-actions">
        <button class="btn btn--outline" type="button" data-action="new-doubt">${icon('help')} Registrar duda</button>
      </div>
    </section>

    <div class="toolbar card">
      <div class="search-field">
        ${icon('search')}
        <input id="problemSearch" type="search" placeholder="Buscar síntoma, causa, solución o etiqueta…" value="${esc(ui.problemSearch)}" autocomplete="off" />
      </div>
      <select class="input" id="problemProcess" aria-label="Filtrar por proceso">
        <option value="all" ${ui.problemProcess === 'all' ? 'selected' : ''}>Todo proceso</option>
        ${processes
          .map(
            (p) => `<option value="${esc(p)}" ${ui.problemProcess === p ? 'selected' : ''}>${esc(p)}</option>`
          )
          .join('')}
      </select>
      <span class="small muted" id="problemCount">${total} casos</span>
    </div>

    <div class="callout callout--info" style="margin-bottom:16px">
      ${icon('info')}
      <div><p><strong>Antes de tocar producción:</strong> identifica el cliente, la versión de eLC, el ambiente (QA o producción) y el documento afectado. Un caso “por confirmar” no debe tratarse como regla general.</p></div>
    </div>

    <div id="problemList">${problemListHTML()}</div>`;
}

function filteredProblems() {
  const q = ui.problemSearch.trim().toLowerCase();
  return (DATA.problems || [])
    .filter((p) => {
      if (ui.problemProcess !== 'all' && p.process !== ui.problemProcess) return false;
      if (q) {
        const hay = [
          p.title,
          p.symptom,
          p.process,
          (p.cause || []).join(' '),
          (p.solution || []).join(' '),
          (p.tags || []).join(' '),
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const order = { confirmado: 0, por_confirmar: 1 };
      const byStatus = (order[a.status] ?? 2) - (order[b.status] ?? 2);
      if (byStatus !== 0) return byStatus;
      return String(a.process).localeCompare(String(b.process), 'es');
    });
}

function problemListHTML() {
  const problems = filteredProblems();
  if (!problems.length) {
    return `<div class="empty card"><div class="empty-icon">${icon('search')}</div><h3>No hay casos con este filtro</h3><p>Prueba con otra palabra o cambia el proceso. Si el caso no existe, regístralo como duda para documentarlo.</p><button class="btn btn--primary" type="button" data-action="new-doubt">${icon('plus')} Registrar duda</button></div>`;
  }
  return `<div style="display:flex;flex-direction:column;gap:10px">${problems.map(problemCard).join('')}</div>`;
}

function problemCard(p) {
  const status = PROBLEM_STATUS[p.status] || { label: 'Sin estado', cls: 'badge--dark' };
  return `<details class="card problem-card" id="prob-${esc(p.id)}">
    <summary>
      <span class="chapter-icon" style="width:36px;height:36px;border-radius:10px;margin:0">${icon('wrench', 'ic--sm')}</span>
      <div class="p-main">
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.process)} · ${esc(p.symptom)}</p>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex:none;flex-wrap:wrap;justify-content:flex-end">
        <span class="badge ${status.cls}">${esc(status.label)}</span>
        ${icon('chevron-down', 'p-chev')}
      </div>
    </summary>
    <div class="problem-body">
      <div>
        <h4>Síntoma</h4>
        <p>${esc(p.symptom)}</p>
      </div>
      <div>
        <h4>Causas posibles</h4>
        <ul>${(p.cause || []).map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
      </div>
      <div>
        <h4>Qué revisar y cómo resolverlo</h4>
        <ol>${(p.solution || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
      </div>
      <div class="callout callout--tip">
        ${icon('check-circle')}
        <div><strong>Cómo verificar</strong><p>${esc(p.verify || 'Repite el flujo y confirma el resultado con el cliente antes de cerrar el caso.')}</p></div>
      </div>
      <div class="tag-row" style="align-items:center;justify-content:space-between;gap:10px">
        <div class="tag-row">
          ${(p.tags || []).map((t) => `<span class="badge">${esc(t)}</span>`).join('')}
        </div>
        <div class="tag-row">
          <button class="btn btn--sm btn--outline" type="button" data-action="copy-link" data-hash="problemas/${esc(p.id)}">${icon('copy')} Copiar enlace</button>
          <button class="btn btn--sm btn--soft" type="button" data-action="doubt-from-problem" data-id="${esc(p.id)}">${icon('help')} Crear duda</button>
        </div>
      </div>
      <p class="small muted">Fuente: ${esc(p.source || 'Documentación interna de eLC')}</p>
    </div>
  </details>`;
}

function paintProblemList() {
  const root = $('#problemList');
  if (!root) return;
  root.innerHTML = problemListHTML();
  const count = $('#problemCount');
  if (count) {
    const n = filteredProblems().length;
    count.textContent = `${n} caso${n === 1 ? '' : 's'}`;
  }
}

/* ---------------- Glosario ---------------- */

const GLOSSARY_CAT_CLASS = {
  eLC: 'badge--blue',
  Logística: 'badge--cyan',
  Técnico: 'badge--dark',
  Integración: 'badge--amber',
};

const normLetter = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

function glossaryLetter(term) {
  const c = normLetter(term).charAt(0);
  return /[A-Z]/.test(c) ? c : '#';
}

function glossaryLetters() {
  return [...new Set((DATA.glossary || []).map((g) => glossaryLetter(g.term)))].sort((a, b) =>
    a.localeCompare(b, 'es')
  );
}

function renderGlossary(param) {
  if (param) {
    const decoded = (() => {
      try {
        return decodeURIComponent(param);
      } catch {
        return param;
      }
    })();
    if (decoded.length === 1 && /^[a-záéíóúñ#]$/i.test(decoded)) {
      ui.glossaryLetter = decoded.toUpperCase();
      ui.glossarySearch = '';
    } else {
      ui.glossaryLetter = '';
      ui.glossarySearch = decoded;
    }
  } else {
    ui.glossaryLetter = '';
    ui.glossarySearch = '';
  }
  const total = (DATA.glossary || []).length;
  return `
    <section class="page-head">
      <div>
        <span class="eyebrow">${icon('alpha')} Conocimiento</span>
        <h1>Glosario</h1>
        <p>${total} términos y siglas utilizados en eLC, sus procesos y su integración con SAP.</p>
      </div>
      <div class="head-actions">
        <button class="btn btn--outline" type="button" data-action="new-doubt">${icon('help')} Dudar de un término</button>
      </div>
    </section>

    <div class="toolbar card">
      <div class="search-field">
        ${icon('search')}
        <input id="glossarySearch" type="search" placeholder="Buscar un término o su definición…" value="${esc(ui.glossarySearch)}" autocomplete="off" />
      </div>
      <span class="small muted" id="glossaryCount">${total} términos</span>
    </div>

    <nav class="letter-nav" aria-label="Filtrar por letra">
      <a href="#/glosario" class="${ui.glossaryLetter ? '' : 'is-active'}" data-action="glossary-letter" data-letter="">Todas</a>
      ${glossaryLetters()
        .map(
          (l) => `<a href="#/glosario/${encodeURIComponent(l)}" class="${ui.glossaryLetter === l ? 'is-active' : ''}" data-action="glossary-letter" data-letter="${esc(l)}">${esc(l)}</a>`
        )
        .join('')}
    </nav>

    <div id="glossaryList">${glossaryListHTML()}</div>`;
}

function filteredGlossary() {
  const q = ui.glossarySearch.trim().toLowerCase();
  return (DATA.glossary || [])
    .filter((g) => {
      if (ui.glossaryLetter && glossaryLetter(g.term) !== ui.glossaryLetter) return false;
      if (q) {
        const hay = `${g.term} ${g.def} ${g.cat}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => a.term.localeCompare(b.term, 'es'));
}

function glossaryListHTML() {
  const items = filteredGlossary();
  if (!items.length) {
    return `<div class="empty card"><div class="empty-icon">${icon('search')}</div><h3>Sin términos con este filtro</h3><p>Borra la búsqueda o elige otra letra. Si el término falta, regístralo como duda para agregarlo después.</p></div>`;
  }
  const groups = new Map();
  items.forEach((g) => {
    const letter = glossaryLetter(g.term);
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter).push(g);
  });
  return [...groups.entries()]
    .map(
      ([letter, entries]) => `<section class="glossary-group">
        <h2 class="glossary-letter">${esc(letter)}</h2>
        <div class="glossary-grid">
          ${entries
            .map(
              (g) => `<article class="glossary-item">
                <strong>${esc(g.term)}</strong>
                <p>${esc(g.def)}</p>
                <span class="badge ${GLOSSARY_CAT_CLASS[g.cat] || ''}">${esc(g.cat)}</span>
              </article>`
            )
            .join('')}
        </div>
      </section>`
    )
    .join('');
}

function paintGlossary() {
  const root = $('#glossaryList');
  if (!root) return;
  root.innerHTML = glossaryListHTML();
  const count = $('#glossaryCount');
  if (count) {
    const n = filteredGlossary().length;
    count.textContent = `${n} término${n === 1 ? '' : 's'}`;
  }
  $$('.letter-nav [data-action="glossary-letter"]').forEach((link) => {
    link.classList.toggle('is-active', (link.dataset.letter || '') === ui.glossaryLetter);
  });
}
