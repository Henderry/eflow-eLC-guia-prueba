/* =========================================================
   eLC Operations Hub · núcleo de la aplicación
   ========================================================= */
'use strict';

const DATA = window.ELC_DATA;
const DB_KEY = 'elc-hub-v1';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clone = (v) => JSON.parse(JSON.stringify(v));
const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (name, cls = '') => `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso) => {
  if (!iso) return 'Fecha por confirmar';
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
};

const DOUBT_STATUS = { abierta: 'Abierta', analisis: 'En análisis', espera: 'En espera', resuelta: 'Resuelta', cerrada: 'Cerrada' };
const DOUBT_STATUS_CLASS = { abierta: 'status--abierta', analisis: 'status--analisis', espera: 'status--espera', resuelta: 'status--resuelta', cerrada: 'status--cerrada' };
const RECORD_STATUS_CLASS = {
  Identificado: 'status--identificado',
  'En revisión': 'status--revision',
  Corregido: 'status--corregido',
  Descartado: 'status--descartado',
  Identificada: 'status--abierta',
  Aprobada: 'status--analisis',
  'En desarrollo': 'status--espera',
  Implementada: 'status--resuelta',
};
const PRIO_CLASS = { alta: 'prio--alta', media: 'prio--media', baja: 'prio--baja' };

const ui = {
  clientView: 'cards',
  clientSearch: '',
  clientFilter: 'all',
  doubtSearch: '',
  doubtStatus: 'open',
  doubtPriority: 'all',
  doubtClient: 'all',
  recordSearch: '',
  recordType: 'todos',
  recordStatus: 'all',
  problemSearch: '',
  problemProcess: 'all',
  glossarySearch: '',
  glossaryLetter: '',
  meetingSearch: '',
  searchSel: 0,
};

/* ---------------- Persistencia ---------------- */

function defaultDB() {
  return {
    version: 1,
    clients: clone(DATA.seed.clients),
    doubts: clone(DATA.seed.doubts),
    records: clone(DATA.seed.records),
    meetings: clone(DATA.seed.meetings),
    read: [],
    settings: {},
  };
}

let db;
try {
  const raw = localStorage.getItem(DB_KEY);
  db = raw ? JSON.parse(raw) : defaultDB();
} catch (err) {
  console.warn('No se pudo leer el almacenamiento local:', err);
  db = defaultDB();
}
['clients', 'doubts', 'records', 'meetings', 'read'].forEach((k) => {
  if (!Array.isArray(db[k])) db[k] = [];
});

function save() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (err) {
    console.error(err);
    toast('No se pudo guardar. Revisa el espacio del navegador o exporta un respaldo.', 'error');
  }
  updateNav();
}

/* ---------------- Utilidades de contenido ---------------- */

function allArticles() {
  return DATA.guide.flatMap((ch) =>
    ch.articles.map((a) => ({ ...a, chapterId: ch.id, chapterTitle: ch.title, chapterIcon: ch.icon }))
  );
}

function articleKey(chapterId, articleId) {
  return `${chapterId}/${articleId}`;
}

function isRead(chapterId, articleId) {
  return db.read.includes(articleKey(chapterId, articleId));
}

function readingTime(article) {
  const words = JSON.stringify(article.blocks || '').split(/\s+/).length;
  return Math.max(2, Math.round(words / 190));
}

function flattenText(value) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(flattenText).join(' ');
  if (value && typeof value === 'object') return Object.values(value).map(flattenText).join(' ');
  return '';
}

function articleText(article) {
  return `${article.title} ${article.summary} ${(article.tags || []).join(' ')} ${flattenText(article.blocks)}`;
}

function updateNav() {
  const openDoubts = db.doubts.filter((d) => !['resuelta', 'cerrada'].includes(d.status)).length;
  const openRecords = db.records.filter((r) => !['Corregido', 'Descartado', 'Implementada'].includes(r.status)).length;
  const elClients = $('#navClients');
  const elDoubts = $('#navDoubts');
  const elRecords = $('#navRecords');
  if (elClients) elClients.textContent = db.clients.length;
  if (elDoubts) elDoubts.textContent = openDoubts;
  if (elRecords) elRecords.textContent = openRecords;
  const dot = $('#navGuideDot');
  if (dot) dot.style.display = db.read.length ? 'block' : 'none';
}

/* ---------------- Router ---------------- */

function currentRoute() {
  const raw = (location.hash || '').replace(/^#\/?/, '');
  const parts = raw.split('/').filter(Boolean);
  return { section: parts[0] || 'panel', a: parts[1] || '', b: parts[2] || '' };
}

function go(route) {
  location.hash = `#/${route}`;
}

function render() {
  const r = currentRoute();
  $$('.nav-item').forEach((n) => n.classList.toggle('is-active', n.dataset.nav === r.section));
  closeSidebar();
  const view = $('#view');
  let html = '';
  try {
    switch (r.section) {
      case 'panel':
        html = renderPanel();
        break;
      case 'guia':
        html = renderGuide(r.a, r.b);
        break;
      case 'clientes':
        html = r.a ? renderClient(r.a) : renderClients();
        break;
      case 'dudas':
        html = r.a ? renderDoubt(r.a) : renderDoubts();
        break;
      case 'registro':
        html = r.a ? renderRecord(r.a) : renderRecords();
        break;
      case 'problemas':
        html = renderProblems(r.a);
        break;
      case 'glosario':
        html = renderGlossary(r.a);
        break;
      case 'minutas':
        html = r.a ? renderMeeting(r.a) : renderMeetings();
        break;
      case 'ajustes':
        html = renderSettings();
        break;
      default:
        html = renderNotFound();
    }
  } catch (err) {
    console.error(err);
    html = `<section class="empty card"><div class="empty-icon">${icon('alert')}</div><h3>No se pudo mostrar esta sección</h3><p>${esc(err.message)}</p><a class="btn btn--primary" href="#/panel">Volver al panel</a></section>`;
  }
  view.innerHTML = html;
  setCrumbs(r);
  updateNav();
  window.scrollTo({ top: 0, behavior: 'auto' });
  bindView(r);
}

function setCrumbs(r) {
  const parts = [`<a href="#/panel">Inicio</a>`];
  const labels = {
    guia: 'Guía eLC',
    clientes: 'Clientes',
    dudas: 'Dudas',
    registro: 'Fallos y mejoras',
    problemas: 'Problemas',
    glosario: 'Glosario',
    minutas: 'Minutas',
    ajustes: 'Ajustes y datos',
  };
  if (r.section === 'panel') {
    parts.push('<strong>Panel</strong>');
  } else {
    parts.push(`<a href="#/${r.section}">${labels[r.section] || 'Sección'}</a>`);
    if (r.section === 'guia' && r.a) {
      const ch = DATA.guide.find((c) => c.id === r.a);
      if (ch) parts.push(`<a href="#/guia/${ch.id}">${esc(ch.title)}</a>`);
      if (r.b) {
        const art = ch?.articles.find((a) => a.id === r.b);
        if (art) parts.push(`<strong>${esc(art.title)}</strong>`);
      }
    } else if (r.section === 'clientes' && r.a) {
      const c = db.clients.find((x) => x.id === r.a);
      if (c) parts.push(`<strong>${esc(c.name)}</strong>`);
    } else if (r.section === 'dudas' && r.a) {
      const d = db.doubts.find((x) => x.id === r.a);
      if (d) parts.push(`<strong>${esc(d.title)}</strong>`);
    } else if (r.section === 'registro' && r.a) {
      const rec = db.records.find((x) => x.id === r.a);
      if (rec) parts.push(`<strong>${esc(rec.code)}</strong>`);
    } else if (r.section === 'minutas' && r.a) {
      const m = db.meetings.find((x) => x.id === r.a);
      if (m) parts.push(`<strong>${esc(m.title)}</strong>`);
    } else if (r.section === 'problemas' && r.a) {
      const p = DATA.problems.find((x) => x.id === r.a);
      if (p) parts.push(`<strong>${esc(p.title)}</strong>`);
    }
  }
  $('#crumbs').innerHTML = parts.join('<span class="sep">/</span>');
}

function bindView(r) {
  if (r.section === 'problemas' && r.a) {
    const el = document.getElementById(`prob-${r.a}`);
    if (el) {
      el.setAttribute('open', '');
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
    }
  }
  if (r.section === 'guia' && r.a && r.b) {
    const art = document.querySelector('.article');
    if (art) art.dataset.article = `${r.a}/${r.b}`;
  }
}

/* ---------------- UI: modales, toasts ---------------- */

let lastFocus = null;
let confirmCallback = null;

function openModal(html) {
  lastFocus = document.activeElement;
  const root = $('#modalRoot');
  root.hidden = false;
  root.innerHTML = `<div class="modal-backdrop" data-action="close-modal"></div>${html}`;
  document.body.classList.add('modal-open');
  setTimeout(() => {
    const f = root.querySelector('input:not([type="hidden"]), textarea, select, button');
    if (f) f.focus();
  }, 30);
}

function closeModal() {
  const root = $('#modalRoot');
  if (!root || root.hidden) return;
  root.hidden = true;
  root.innerHTML = '';
  document.body.classList.remove('modal-open');
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

function openConfirm({ title, message, confirmText = 'Eliminar', danger = true, onConfirm }) {
  confirmCallback = onConfirm;
  openModal(`
    <div class="modal modal--sm" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
      <div class="modal-head">
        <div><h2 id="confirmTitle">${esc(title)}</h2><p>${esc(message)}</p></div>
        <button class="icon-btn" type="button" data-action="close-modal" aria-label="Cerrar">${icon('x')}</button>
      </div>
      <div class="modal-foot">
        <button class="btn btn--outline" type="button" data-action="close-modal">Cancelar</button>
        <button class="btn ${danger ? 'btn--danger' : 'btn--primary'}" type="button" data-action="confirm-yes">${esc(confirmText)}</button>
      </div>
    </div>`);
}

function toast(message, type = 'ok') {
  const root = $('#toastRoot');
  if (!root) return;
  const el = document.createElement('div');
  el.className = `toast${type === 'error' ? ' toast--error' : type === 'warn' ? ' toast--warn' : ''}`;
  el.innerHTML = `${icon(type === 'error' ? 'alert' : type === 'warn' ? 'alert' : 'check-circle')}<span>${esc(message)}</span>`;
  root.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

/* ---------------- Panel ---------------- */

function statCard({ value, label, iconName, cls = '', hint = '' }) {
  return `
    <div class="stat card ${cls}">
      <div class="stat-top">
        <div class="stat-icon">${icon(iconName)}</div>
        ${hint ? `<span class="stat-trend stat-trend--muted">${esc(hint)}</span>` : ''}
      </div>
      <div class="stat-value">${value}</div>
      <div class="stat-label">${esc(label)}</div>
    </div>`;
}

function renderPanel() {
  const articles = allArticles();
  const openDoubts = db.doubts.filter((d) => !['resuelta', 'cerrada'].includes(d.status));
  const openFails = db.records.filter((r) => r.type === 'fallo' && !['Corregido', 'Descartado'].includes(r.status));
  const readPct = articles.length ? Math.round((db.read.length / articles.length) * 100) : 0;
  const recentDoubts = [...openDoubts].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0, 4);
  const recentClients = [...db.clients].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0, 3);

  return `
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow eyebrow--light">${icon('layers')} eLC · Operations Hub</span>
        <h1>La operación de eLC,<br><em>en un solo lugar.</em></h1>
        <p class="lead">Guía paso a paso, fichas de clientes, dudas de soporte, fallos y mejoras. Todo lo que aplica a eLC y su Hand Held, sin buscar en cinco archivos.</p>
        <div class="hero-actions">
          <a class="btn btn--primary btn--lg" href="#/guia">${icon('book')} Abrir la guía</a>
          <a class="btn btn--ghost btn--lg" href="#/clientes">${icon('building')} Ver clientes</a>
        </div>
        <div class="hero-meta">
          <span>${icon('check-circle')} ${articles.length} artículos</span>
          <span>${icon('building')} ${db.clients.length} clientes</span>
          <span>${icon('help')} ${openDoubts.length} dudas abiertas</span>
          <span>${icon('shield')} Datos locales</span>
        </div>
      </div>
      <div class="hero-panel">
        <p class="hero-panel-label">Flujo eLC</p>
        ${DATA.flow.slice(0, 4)
          .map(
            (f) => `<a class="hero-step" href="#/${f.route}">
              <span class="hero-step-num">${f.n}</span>
              <span><strong>${esc(f.title)}</strong><small>${esc(f.text)}</small></span>
            </a>`
          )
          .join('')}
      </div>
    </section>

    <div class="stats-grid">
      ${statCard({ value: articles.length, label: 'Artículos en la guía', iconName: 'book', hint: `${readPct}% leído` })}
      ${statCard({ value: db.clients.length, label: 'Clientes registrados', iconName: 'building', cls: 'stat--cyan' })}
      ${statCard({ value: openDoubts.length, label: 'Dudas abiertas', iconName: 'help', cls: 'stat--amber', hint: `${db.doubts.length} en total` })}
      ${statCard({ value: openFails.length, label: 'Fallos sin corregir', iconName: 'bug', cls: 'stat--red', hint: `${db.records.filter((r) => r.type === 'mejora').length} mejoras` })}
    </div>

    <section class="section">
      <div class="section-head">
        <div><h2>${icon('target')} Flujo de trabajo</h2><p>El recorrido completo de un documento, desde SAP hasta la auditoría.</p></div>
        <a class="section-link" href="#/guia/recepcion/flujo-recepcion">Ver detalle ${icon('arrow-right')}</a>
      </div>
      <div class="card flow-map">
        ${DATA.flow
          .map(
            (f) => `<a class="flow-node" href="#/${f.route}">
              <span class="flow-node-num">${f.n}</span>
              <h3>${esc(f.title)}</h3>
              <p>${esc(f.text)}</p>
            </a>`
          )
          .join('')}
      </div>
    </section>

    <div class="split-grid section">
      <section class="card card-pad">
        <div class="section-head">
          <div><h2>${icon('flag')} Pendientes por confirmar</h2><p>Puntos que no deben darse por cerrados.</p></div>
          <a class="section-link" href="#/dudas">Ver dudas ${icon('arrow-right')}</a>
        </div>
        <div class="mini-list">
          ${DATA.pending
            .slice(0, 5)
            .map(
              (p) => `<div class="mini-row">
                <span class="mini-dot"></span>
                <div><strong>${esc(p.title)}</strong><p>${esc(p.area)} · ${esc(p.detail)}</p></div>
              </div>`
            )
            .join('')}
        </div>
      </section>

      <section class="card card-pad">
        <div class="section-head">
          <div><h2>${icon('help')} Dudas recientes</h2><p>Lo que está esperando respuesta o decisión.</p></div>
          <a class="section-link" href="#/dudas">Abrir ${icon('arrow-right')}</a>
        </div>
        ${
          recentDoubts.length
            ? `<div class="mini-list">${recentDoubts
                .map(
                  (d) => `<a class="mini-row" href="#/dudas/${d.id}" style="color:inherit">
                    <span class="mini-dot ${d.priority === 'alta' ? 'mini-dot--red' : d.priority === 'media' ? '' : 'mini-dot--blue'}"></span>
                    <div><strong>${esc(d.title)}</strong><p>${esc(DOUBT_STATUS[d.status])} · ${esc(d.client || 'General')}</p></div>
                    <span class="mini-side">${esc(d.priority)}</span>
                  </a>`
                )
                .join('')}</div>`
            : `<div class="empty" style="padding:24px 10px"><p>No hay dudas abiertas. Buen momento para documentar la siguiente.</p></div>`
        }
      </section>
    </div>

    <div class="split-grid section">
      <section class="card card-pad">
        <div class="section-head">
          <div><h2>${icon('building')} Clientes</h2><p>Fichas con contexto, ambientes y versiones.</p></div>
          <a class="section-link" href="#/clientes">Gestionar ${icon('arrow-right')}</a>
        </div>
        ${
          recentClients.length
            ? `<div class="mini-list">${recentClients
                .map(
                  (c) => `<a class="mini-row" href="#/clientes/${c.id}" style="color:inherit">
                    <div class="avatar avatar--slate" style="width:30px;height:30px;border-radius:8px;font-size:.65rem">${esc(initials(c.name))}</div>
                    <div><strong>${esc(c.name)}</strong><p>${esc(c.group || 'Sin grupo')} · ${esc(componentSummary(c))}</p></div>
                    <span class="mini-side">${completeness(c).pct}%</span>
                  </a>`
                )
                .join('')}</div>`
            : `<div class="empty" style="padding:24px 10px"><p>Aún no hay clientes. Crea el primero con el botón Nuevo.</p></div>`
        }
      </section>

      <section class="card card-pad">
        <div class="section-head">
          <div><h2>${icon('book')} Avance de la guía</h2><p>${db.read.length} de ${articles.length} artículos leídos.</p></div>
          <a class="section-link" href="#/guia">Continuar ${icon('arrow-right')}</a>
        </div>
        <div class="bar" style="height:9px"><i style="width:${readPct}%"></i></div>
        <div class="mini-list" style="margin-top:14px">
          ${DATA.guide
            .slice(0, 4)
            .map((ch) => {
              const total = ch.articles.length;
              const read = ch.articles.filter((a) => isRead(ch.id, a.id)).length;
              const pct = total ? Math.round((read / total) * 100) : 0;
              return `<a class="mini-row" href="#/guia/${ch.id}" style="color:inherit">
                <div class="chapter-icon" style="width:28px;height:28px;border-radius:8px;margin:0">${icon(ch.icon, 'ic--sm')}</div>
                <div style="flex:1"><strong>${esc(ch.title)}</strong><div class="bar" style="margin-top:5px;height:5px"><i style="width:${pct}%"></i></div></div>
                <span class="mini-side">${read}/${total}</span>
              </a>`;
            })
            .join('')}
        </div>
      </section>
    </div>

    <section class="section">
      <div class="section-head"><div><h2>${icon('sparkles')} Accesos rápidos</h2><p>Las tareas que más se repiten.</p></div></div>
      <div class="three-grid">
        ${quickCard('book', 'Guía eLC', 'Recepción, almacenaje, picking, carga y configuración.', 'guia')}
        ${quickCard('building', 'Clientes', 'Ficha completa: VPN, ambientes, versiones y bitácora.', 'clientes')}
        ${quickCard('help', 'Dudas', 'Preguntas abiertas, respuestas y responsables.', 'dudas')}
        ${quickCard('bug', 'Fallos y mejoras', 'Registro real con versión, estado y seguimiento.', 'registro')}
        ${quickCard('wrench', 'Problemas', 'Checklists para diagnosticar sin adivinar.', 'problemas')}
        ${quickCard('alpha', 'Glosario', 'Términos y siglas de eLC y su integración con SAP.', 'glosario')}
      </div>
    </section>`;
}

function quickCard(iconName, title, text, route) {
  return `<a class="card card-pad card--hover" href="#/${route}" style="color:inherit">
    <div class="chapter-icon">${icon(iconName)}</div>
    <h3>${esc(title)}</h3>
    <p class="small muted" style="margin-top:6px">${esc(text)}</p>
  </a>`;
}

function initials(name) {
  return String(name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/* ---------------- Guía ---------------- */

function renderGuide(chapterId, articleId) {
  if (chapterId) {
    const ch = DATA.guide.find((c) => c.id === chapterId);
    if (!ch) return renderNotFound('Capítulo no encontrado');
    if (articleId) {
      const article = ch.articles.find((a) => a.id === articleId);
      if (!article) return renderNotFound('Artículo no encontrado');
      return renderArticle(ch, article);
    }
    return renderChapter(ch);
  }
  return renderGuideOverview();
}

function renderGuideOverview() {
  const articles = allArticles();
  const pct = articles.length ? Math.round((db.read.length / articles.length) * 100) : 0;
  return `
    <section class="page-head">
      <div>
        <span class="eyebrow">${icon('book')} Conocimiento</span>
        <h1>Guía eLC</h1>
        <p>Diez capítulos y ${articles.length} artículos para operar eLC y su Hand Held. Cada artículo explica el propósito, los pasos, el resultado esperado y los errores frecuentes.</p>
      </div>
      <div class="head-actions">
        <button class="btn btn--outline" type="button" data-action="print-guide">${icon('print')} Imprimir guía</button>
        <button class="btn btn--primary" type="button" data-action="new-doubt">${icon('plus')} Nueva duda</button>
      </div>
    </section>

    <div class="progress-strip card">
      <div class="ring" style="--p:${pct}"><span>${pct}%</span></div>
      <div style="flex:1;min-width:180px">
        <strong style="font-size:.88rem">Avance de lectura</strong>
        <p class="small muted" style="margin-top:2px">${db.read.length} de ${articles.length} artículos marcados como leídos en este navegador.</p>
      </div>
      <div class="bar" style="max-width:280px"><i style="width:${pct}%"></i></div>
    </div>

    <div class="toolbar card">
      <div class="search-field">
        ${icon('search')}
        <input id="guideSearch" type="search" placeholder="Buscar un tema, una pantalla o un procedimiento…" autocomplete="off" />
      </div>
      <span class="small muted" id="guideSearchCount">${articles.length} artículos</span>
    </div>

    <div class="chapter-grid" id="guideChapters">
      ${DATA.guide.map((ch) => chapterCard(ch)).join('')}
    </div>
    <div id="guideResults" hidden></div>`;
}

function chapterCard(ch) {
  const read = ch.articles.filter((a) => isRead(ch.id, a.id)).length;
  const pct = ch.articles.length ? Math.round((read / ch.articles.length) * 100) : 0;
  return `<a class="card chapter-card card--hover" href="#/guia/${ch.id}" style="color:inherit">
    <div class="chapter-icon">${icon(ch.icon)}</div>
    <h3>${esc(ch.title)}</h3>
    <p>${esc(ch.summary)}</p>
    <div class="chapter-foot">
      <span>${ch.articles.length} artículos</span>
      <span class="badge ${read === ch.articles.length ? 'badge--green' : 'badge--blue'}">${read}/${ch.articles.length} leídos</span>
    </div>
    <div class="bar" style="margin-top:9px;height:5px"><i style="width:${pct}%"></i></div>
  </a>`;
}

function renderChapter(ch) {
  const read = ch.articles.filter((a) => isRead(ch.id, a.id)).length;
  const pct = ch.articles.length ? Math.round((read / ch.articles.length) * 100) : 0;
  return `
    <section class="page-head">
      <div>
        <span class="eyebrow">${icon(ch.icon)} Guía eLC</span>
        <h1>${esc(ch.title)}</h1>
        <p>${esc(ch.summary)}</p>
      </div>
      <div class="head-actions">
        <button class="btn btn--outline" type="button" data-action="print-chapter" data-chapter="${ch.id}">${icon('print')} Imprimir capítulo</button>
      </div>
    </section>
    <div class="guide-layout">
      <aside class="chapter-rail card">
        <h3>${esc(ch.title)}</h3>
        <div class="rail-list">
          ${ch.articles
            .map(
              (a, i) => `<a class="rail-link ${isRead(ch.id, a.id) ? 'is-read' : ''}" data-key="${articleKey(ch.id, a.id)}" href="#/guia/${ch.id}/${a.id}">
                <span class="rail-num">${isRead(ch.id, a.id) ? '✓' : i + 1}</span>
                <span>${esc(a.title)}</span>
              </a>`
            )
            .join('')}
        </div>
      </aside>
      <div class="guide-main">
        <div class="card card-pad" style="margin-bottom:14px">
          <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
            <div class="ring" style="--p:${pct}"><span>${pct}%</span></div>
            <div style="flex:1;min-width:180px">
              <strong>${read} de ${ch.articles.length} artículos leídos</strong>
              <p class="small muted" style="margin-top:2px">Marca cada artículo al terminarlo para llevar tu avance.</p>
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${ch.articles
            .map(
              (a, i) => `<a class="card list-row" href="#/guia/${ch.id}/${a.id}" style="color:inherit">
                <span class="rail-num" style="width:30px;height:30px;border-radius:9px;font-size:.72rem">${i + 1}</span>
                <div class="row-main"><strong>${esc(a.title)}</strong><p>${esc(a.summary)}</p></div>
                <div class="row-side">
                  ${isRead(ch.id, a.id) ? '<span class="badge badge--green">Leído</span>' : '<span class="badge">Pendiente</span>'}
                  ${icon('chevron-right', 'chev')}
                </div>
              </a>`
            )
            .join('')}
        </div>
      </div>
    </div>`;
}

function renderArticle(ch, article) {
  const flat = allArticles();
  const idx = flat.findIndex((a) => a.chapterId === ch.id && a.id === article.id);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;
  const read = isRead(ch.id, article.id);
  const key = articleKey(ch.id, article.id);
  return `
    <div class="guide-layout">
      <aside class="chapter-rail card">
        <h3>${esc(ch.title)}</h3>
        <div class="rail-list">
          ${ch.articles
            .map(
              (a, i) => `<a class="rail-link ${a.id === article.id ? 'is-active' : ''} ${isRead(ch.id, a.id) ? 'is-read' : ''}" data-key="${articleKey(ch.id, a.id)}" href="#/guia/${ch.id}/${a.id}">
                <span class="rail-num">${isRead(ch.id, a.id) ? '✓' : i + 1}</span>
                <span>${esc(a.title)}</span>
              </a>`
            )
            .join('')}
        </div>
      </aside>
      <div class="guide-main">
        <article class="article card">
          <header class="article-head">
            <div class="tag-row">
              <span class="badge badge--blue">${icon(ch.icon, 'ic--sm')} ${esc(ch.title)}</span>
              ${(article.tags || []).map((t) => `<span class="badge">${esc(t)}</span>`).join('')}
            </div>
            <h1>${esc(article.title)}</h1>
            <p class="lead">${esc(article.summary)}</p>
            <div class="article-meta">
              <span>${icon('calendar')} Actualizado ${fmtDate(article.updated)}</span>
              <span>${icon('clock')} ${readingTime(article)} min de lectura</span>
              <span>${icon('check-circle')} ${read ? 'Leído' : 'Pendiente'}</span>
            </div>
          </header>
          <div class="article-body">${renderBlocks(article.blocks)}</div>
          <footer class="article-foot">
            <div class="done-state">${icon(read ? 'check-circle' : 'book')} ${read ? 'Marcado como leído' : 'Aún no lo marcas como leído'}</div>
            <div class="tag-row">
              <button class="btn btn--sm btn--outline" type="button" data-action="copy-link" data-hash="guia/${ch.id}/${article.id}">${icon('copy')} Copiar enlace</button>
              <button class="btn btn--sm btn--outline" type="button" data-action="print-article" data-chapter="${ch.id}" data-article="${article.id}">${icon('print')} Imprimir</button>
              <button class="btn btn--sm ${read ? 'btn--soft' : 'btn--primary'}" type="button" data-action="toggle-read" data-key="${key}">
                ${icon(read ? 'check-circle' : 'book')} ${read ? 'Leído' : 'Marcar como leído'}
              </button>
            </div>
          </footer>
        </article>
        <div class="article-nav">
          ${
            prev
              ? `<a href="#/guia/${prev.chapterId}/${prev.id}"><small>${icon('chevron-left', 'ic--sm')} Anterior</small><strong>${esc(prev.title)}</strong></a>`
              : `<span></span>`
          }
          ${
            next
              ? `<a class="next" href="#/guia/${next.chapterId}/${next.id}"><small>Siguiente ${icon('chevron-right', 'ic--sm')}</small><strong>${esc(next.title)}</strong></a>`
              : `<span></span>`
          }
        </div>
      </div>
    </div>`;
}

function renderBlocks(blocks = []) {
  return blocks
    .map((b) => {
      switch (b.t) {
        case 'p':
          return `<p>${esc(b.x)}</p>`;
        case 'h':
          return `<h2>${esc(b.x)}</h2>`;
        case 'h3':
          return `<h3>${esc(b.x)}</h3>`;
        case 'note':
        case 'tip':
        case 'warn':
        case 'danger': {
          const cls = b.t === 'note' ? 'info' : b.t;
          const ic = b.t === 'note' ? 'info' : b.t === 'tip' ? 'check-circle' : 'alert';
          return `<div class="callout callout--${cls}">${icon(ic)}<div>${b.title ? `<strong>${esc(b.title)}</strong>` : ''}<p>${esc(b.x)}</p></div></div>`;
        }
        case 'steps':
          return `<ol class="steps">${(b.items || [])
            .map((it) => {
              const [t, d] = Array.isArray(it) ? it : [it, ''];
              return `<li><strong>${esc(t)}</strong>${d ? `<p>${esc(d)}</p>` : ''}</li>`;
            })
            .join('')}</ol>`;
        case 'list':
          return `<ul>${(b.items || []).map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
        case 'ol':
          return `<ol>${(b.items || []).map((i) => `<li>${esc(i)}</li>`).join('')}</ol>`;
        case 'kv':
          return `<div class="kv">${(b.rows || [])
            .map(([k, v]) => `<div class="k">${esc(k)}</div><div class="v">${esc(v)}</div>`)
            .join('')}</div>`;
        case 'table':
          return `<div class="table-wrap"><table class="data"><thead><tr>${(b.head || [])
            .map((h) => `<th>${esc(h)}</th>`)
            .join('')}</tr></thead><tbody>${(b.rows || [])
            .map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
            .join('')}</tbody></table></div>`;
        case 'flow':
          return `<div class="flow-inline">${(b.items || [])
            .map((i, idx) => `${idx ? '<span class="flow-arrow">→</span>' : ''}<span class="flow-chip">${esc(i)}</span>`)
            .join('')}</div>`;
        case 'code':
          return `<pre><code>${esc(b.x)}</code></pre>`;
        case 'quote':
          return `<blockquote style="margin:0;padding:12px 16px;border-left:3px solid var(--brand-500);background:var(--surface-2);border-radius:0 9px 9px 0;color:var(--muted);font-size:.88rem">${esc(b.x)}</blockquote>`;
        default:
          return '';
      }
    })
    .join('');
}

function paintGuideSearch(query) {
  const q = query.trim().toLowerCase();
  const chapters = $('#guideChapters');
  const results = $('#guideResults');
  const count = $('#guideSearchCount');
  if (!chapters || !results) return;
  if (q.length < 2) {
    chapters.hidden = false;
    results.hidden = true;
    if (count) count.textContent = `${allArticles().length} artículos`;
    return;
  }
  const matches = allArticles().filter((a) => `${a.title} ${a.summary} ${(a.tags || []).join(' ')}`.toLowerCase().includes(q));
  chapters.hidden = true;
  results.hidden = false;
  if (count) count.textContent = `${matches.length} resultado${matches.length === 1 ? '' : 's'}`;
  results.innerHTML = matches.length
    ? `<div class="list card">${matches
        .map(
          (a) => `<a class="list-row" href="#/guia/${a.chapterId}/${a.id}" style="color:inherit">
            <div class="chapter-icon" style="width:30px;height:30px;border-radius:8px;margin:0">${icon(a.chapterIcon, 'ic--sm')}</div>
            <div class="row-main"><strong>${esc(a.title)}</strong><p>${esc(a.chapterTitle)} · ${esc(a.summary)}</p></div>
            ${icon('chevron-right', 'chev')}
          </a>`
        )
        .join('')}</div>`
    : `<div class="empty card"><div class="empty-icon">${icon('search')}</div><h3>Sin resultados</h3><p>Prueba con otra palabra o revisa el glosario.</p></div>`;
}

/* ---------------- Búsqueda global ---------------- */

let searchIndexCache = null;

function getSearchIndex() {
  if (searchIndexCache) return searchIndexCache;
  const items = [];
  allArticles().forEach((a) =>
    items.push({
      group: 'Guía',
      title: a.title,
      sub: `${a.chapterTitle} · ${a.summary}`,
      route: `guia/${a.chapterId}/${a.id}`,
      icon: 'book',
      text: articleText(a),
    })
  );
  db.clients.forEach((c) =>
    items.push({
      group: 'Clientes',
      title: c.name,
      sub: c.description || c.group || 'Ficha de cliente',
      route: `clientes/${c.id}`,
      icon: 'building',
      text: [c.name, c.description, c.process, c.group, c.notes, c.contactName, c.qaServer, c.prodServer].join(' '),
    })
  );
  db.doubts.forEach((d) =>
    items.push({
      group: 'Dudas',
      title: d.title,
      sub: `${DOUBT_STATUS[d.status] || d.status} · ${d.priority}`,
      route: `dudas/${d.id}`,
      icon: 'help',
      text: [d.title, d.description, (d.tags || []).join(' '), d.owner, d.client].join(' '),
    })
  );
  db.records.forEach((r) =>
    items.push({
      group: 'Fallos y mejoras',
      title: `${r.code} · ${r.title}`,
      sub: `${r.type === 'fallo' ? 'Fallo' : 'Mejora'} · ${r.area}`,
      route: `registro/${r.id}`,
      icon: 'bug',
      text: [r.code, r.title, r.description, r.area, r.notes, r.proposal].join(' '),
    })
  );
  DATA.problems.forEach((p) =>
    items.push({
      group: 'Problemas',
      title: p.title,
      sub: p.process,
      route: `problemas/${p.id}`,
      icon: 'wrench',
      text: [p.title, p.symptom, (p.cause || []).join(' '), (p.tags || []).join(' ')].join(' '),
    })
  );
  DATA.glossary.forEach((g) =>
    items.push({
      group: 'Glosario',
      title: g.term,
      sub: g.def,
      route: `glosario/${encodeURIComponent(g.term)}`,
      icon: 'alpha',
      text: `${g.term} ${g.def} ${g.cat}`,
    })
  );
  db.meetings.forEach((m) =>
    items.push({
      group: 'Minutas',
      title: m.title,
      sub: m.client || m.participants || 'Minuta',
      route: `minutas/${m.id}`,
      icon: 'calendar',
      text: [m.title, m.summary, (m.decisions || []).join(' '), (m.tags || []).join(' ')].join(' '),
    })
  );
  searchIndexCache = items;
  return items;
}

function openSearch() {
  openModal(`
    <div class="modal modal--lg search-modal" role="dialog" aria-modal="true" aria-label="Buscar en el hub">
      <div class="search-box">
        ${icon('search')}
        <input id="globalSearch" type="search" placeholder="Buscar artículo, cliente, duda, fallo, término…" autocomplete="off" />
        <button class="icon-btn icon-btn--ghost" type="button" data-action="close-modal" aria-label="Cerrar">${icon('x')}</button>
      </div>
      <div class="search-results" id="searchResults"><div class="search-empty">Escribe al menos 2 caracteres para buscar en todo el hub.</div></div>
      <div class="search-foot">
        <span><kbd>Esc</kbd> cerrar</span>
        <span><kbd>↑</kbd><kbd>↓</kbd> mover</span>
        <span><kbd>Enter</kbd> abrir</span>
        <span>${allArticles().length} artículos indexados</span>
      </div>
    </div>`);
  ui.searchSel = 0;
  setTimeout(() => $('#globalSearch')?.focus(), 30);
}

function runSearch(query) {
  const results = $('#searchResults');
  if (!results) return;
  const q = query.trim().toLowerCase();
  if (q.length < 2) {
    results.innerHTML = '<div class="search-empty">Escribe al menos 2 caracteres para buscar en todo el hub.</div>';
    ui.searchSel = 0;
    return;
  }
  const all = getSearchIndex().filter((item) => `${item.title} ${item.sub} ${item.text}`.toLowerCase().includes(q));
  if (!all.length) {
    results.innerHTML = `<div class="search-empty">No hay resultados para “${esc(query)}”. Prueba con otra palabra.</div>`;
    ui.searchSel = 0;
    return;
  }
  const groups = {};
  all.forEach((item) => {
    groups[item.group] ||= [];
    if (groups[item.group].length < 6) groups[item.group].push(item);
  });
  let i = 0;
  results.innerHTML = Object.entries(groups)
    .map(
      ([group, items]) => `<div class="search-group-label">${esc(group)}</div>${items
        .map((item) => {
          const sel = i === 0 ? ' is-selected' : '';
          i += 1;
          return `<button class="search-result${sel}" type="button" data-action="search-go" data-route="${esc(item.route)}">
            ${icon(item.icon)}<span><strong>${esc(item.title)}</strong><small>${esc(item.sub)}</small></span><span class="go">${icon('arrow-right', 'ic--sm')}</span>
          </button>`;
        })
        .join('')}`
    )
    .join('');
  ui.searchSel = 0;
}

function moveSearchSelection(delta) {
  const items = $$('.search-result');
  if (!items.length) return;
  ui.searchSel = (ui.searchSel + delta + items.length) % items.length;
  items.forEach((el, i) => el.classList.toggle('is-selected', i === ui.searchSel));
  items[ui.searchSel].scrollIntoView({ block: 'nearest' });
}

/* ---------------- Ajustes ---------------- */

function renderSettings() {
  const totalArticles = allArticles().length;
  return `
    <section class="page-head">
      <div>
        <span class="eyebrow">${icon('settings')} Sistema</span>
        <h1>Ajustes y datos</h1>
        <p>Este hub guarda la información en el navegador. Exporta un respaldo con frecuencia y no publiques datos reales sin autenticación y permisos.</p>
      </div>
    </section>

    <div class="settings-grid">
      <section class="settings-card card">
        <h2>${icon('download')} Respaldo y restauración</h2>
        <p>Descarga un archivo JSON con clientes, dudas, fallos, mejoras, minutas y tu avance de lectura. Puedes importarlo en otro navegador u otro equipo.</p>
        <div class="actions">
          <button class="btn btn--primary" type="button" data-action="export">${icon('download')} Exportar respaldo</button>
          <button class="btn btn--outline" type="button" data-action="import-data">${icon('upload')} Importar</button>
          <input type="file" id="importFile" accept="application/json,.json" hidden />
        </div>
      </section>

      <section class="settings-card card">
        <h2>${icon('database')} Datos locales</h2>
        <p>${db.clients.length} clientes, ${db.doubts.length} dudas, ${db.records.length} registros y ${db.meetings.length} minutas. El avance de lectura tiene ${db.read.length} de ${totalArticles} artículos.</p>
        <div class="actions">
          <button class="btn btn--danger" type="button" data-action="reset-data">${icon('trash')} Borrar datos locales</button>
        </div>
      </section>

      <section class="settings-card card">
        <h2>${icon('print')} Imprimir o guardar en PDF</h2>
        <p>Genera la guía completa en una ventana nueva. Desde el diálogo de impresión puedes elegir “Guardar como PDF”.</p>
        <div class="actions">
          <button class="btn btn--outline" type="button" data-action="print-guide">${icon('print')} Imprimir guía completa</button>
        </div>
      </section>

      <section class="settings-card card">
        <h2>${icon('shield')} Seguridad</h2>
        <p>No guardes contraseñas, cadenas de conexión, llaves ni datos sensibles de clientes. Para secretos usa el gestor aprobado por TI. Si publicas este hub, hazlo detrás de autenticación y con permisos por grupo.</p>
        <div class="actions">
          <a class="btn btn--outline" href="#/guia/primeros-pasos/conexion-hh">${icon('lock')} Ver política de conexión</a>
        </div>
      </section>

      <section class="settings-card card settings-card--wide">
        <h2>${icon('info')} Sobre este hub</h2>
        <p><strong>eLC Operations Hub · v${esc(DATA.meta.version)}</strong> · actualizado ${fmtDate(DATA.meta.updated)}. ${esc(DATA.meta.disclaimer)}</p>
        <div class="palette" aria-label="Paleta de colores">
          <span class="swatch" style="background:#081a2c" title="Navy"></span>
          <span class="swatch" style="background:#1168d8" title="Azul ePRAC"></span>
          <span class="swatch" style="background:#22b8cf" title="Cian"></span>
          <span class="swatch" style="background:#f59e0b" title="Ámbar"></span>
          <span class="swatch" style="background:#0f9d58" title="Verde"></span>
        </div>
        <div class="divider"></div>
        <h3 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">Fuentes</h3>
        <ul class="small muted" style="margin:8px 0 0;padding-left:18px;line-height:1.7">
          ${DATA.meta.sources.map((s) => `<li>${esc(s)}</li>`).join('')}
        </ul>
      </section>

      <section class="settings-card card settings-card--wide">
        <h2>${icon('rocket')} Próximos pasos sugeridos</h2>
        <p>Este hub es local y no reemplaza la aplicación real. Para llevarlo a producción con datos reales, el orden recomendado es:</p>
        <ol class="small muted" style="margin:10px 0 0;padding-left:20px;line-height:1.8">
          <li>Autenticación y permisos por grupo antes de cargar datos de clientes.</li>
          <li>Base de datos (Supabase/PostgreSQL) con RLS y almacenamiento privado para archivos.</li>
          <li>Importar la guía y las fichas reales, conservando fuente y fecha de revisión.</li>
          <li>Buscador global indexado y adjuntos con URLs firmadas.</li>
          <li>Generador de almacén 3D y slotting solo cuando el modelo de datos esté estable.</li>
        </ol>
      </section>
    </div>`;
}

/* ---------------- Exportar / importar ---------------- */

function exportData() {
  const payload = { ...db, exportedAt: new Date().toISOString(), app: 'eLC Operations Hub', version: 1 };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `elc-hub-backup-${todayISO()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast('Respaldo exportado');
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!parsed || !Array.isArray(parsed.clients) || !Array.isArray(parsed.doubts)) {
        throw new Error('El archivo no parece un respaldo válido del hub.');
      }
      openConfirm({
        title: 'Reemplazar los datos locales',
        message: 'El respaldo reemplazará clientes, dudas, registros, minutas y avance de lectura de este navegador. Esta acción no se puede deshacer.',
        confirmText: 'Importar y reemplazar',
        danger: false,
        onConfirm: () => {
          db = {
            version: 1,
            clients: parsed.clients || [],
            doubts: parsed.doubts || [],
            records: parsed.records || [],
            meetings: parsed.meetings || [],
            read: parsed.read || [],
            settings: parsed.settings || {},
          };
          save();
          searchIndexCache = null;
          toast('Respaldo importado');
          render();
        },
      });
    } catch (err) {
      toast(err.message || 'No se pudo leer el archivo', 'error');
    }
  };
  reader.readAsText(file);
}

function resetData() {
  openConfirm({
    title: 'Borrar todos los datos locales',
    message: 'Se eliminarán clientes, dudas, fallos, mejoras, minutas y avance de lectura de este navegador. Exporta un respaldo antes de continuar.',
    confirmText: 'Sí, borrar todo',
    onConfirm: () => {
      localStorage.removeItem(DB_KEY);
      db = defaultDB();
      searchIndexCache = null;
      save();
      toast('Datos restaurados al contenido inicial');
      go('panel');
      render();
    },
  });
}

/* ---------------- Impresión ---------------- */

function printHTML(title, body) {
  const w = window.open('', '_blank');
  if (!w) {
    toast('El navegador bloqueó la ventana de impresión. Permite ventanas emergentes e inténtalo de nuevo.', 'warn');
    return;
  }
  const css = new URL('assets/styles.css', location.href).href;
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(title)}</title>
    <link rel="stylesheet" href="${css}">
    <style>
      body{background:#fff}
      .print-doc .view{padding:24px;max-width:none}
      .print-chapter{page-break-before:always}
      .print-chapter:first-child{page-break-before:auto}
      .print-chapter .article{margin:20px 0;box-shadow:none;border:0}
      .print-chapter .article-head{padding:0 0 10px;background:#fff}
      .print-chapter .article-body{padding:0;max-width:none}
      .print-chapter h1{font-size:1.8rem}
    </style></head>
    <body class="print-doc"><main class="view">${body}</main></body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 700);
}

function printGuide() {
  const body = DATA.guide
    .map(
      (ch) => `<section class="print-chapter">
        <h1>${esc(ch.title)}</h1>
        <p>${esc(ch.summary)}</p>
        ${ch.articles
          .map(
            (a) => `<article class="article">
              <header class="article-head"><h1>${esc(a.title)}</h1><p class="lead">${esc(a.summary)}</p></header>
              <div class="article-body">${renderBlocks(a.blocks)}</div>
            </article>`
          )
          .join('')}
      </section>`
    )
    .join('');
  printHTML('Guía eLC', body);
}

function printChapter(chapterId) {
  const ch = DATA.guide.find((c) => c.id === chapterId);
  if (!ch) return;
  const body = `<section class="print-chapter"><h1>${esc(ch.title)}</h1><p>${esc(ch.summary)}</p>${ch.articles
    .map(
      (a) => `<article class="article"><header class="article-head"><h1>${esc(a.title)}</h1><p class="lead">${esc(a.summary)}</p></header><div class="article-body">${renderBlocks(a.blocks)}</div></article>`
    )
    .join('')}</section>`;
  printHTML(ch.title, body);
}

function printArticle(chapterId, articleId) {
  const ch = DATA.guide.find((c) => c.id === chapterId);
  const article = ch?.articles.find((a) => a.id === articleId);
  if (!ch || !article) return;
  printHTML(
    article.title,
    `<section class="print-chapter"><h1>${esc(ch.title)}</h1><article class="article"><header class="article-head"><h1>${esc(article.title)}</h1><p class="lead">${esc(article.summary)}</p></header><div class="article-body">${renderBlocks(article.blocks)}</div></article></section>`
  );
}

/* ---------------- Nuevo (menú rápido) ---------------- */

function openNewMenu() {
  openModal(`
    <div class="modal modal--sm" role="dialog" aria-modal="true" aria-labelledby="newTitle">
      <div class="modal-head">
        <div><h2 id="newTitle">¿Qué quieres crear?</h2><p>Elige el tipo de registro.</p></div>
        <button class="icon-btn" type="button" data-action="close-modal" aria-label="Cerrar">${icon('x')}</button>
      </div>
      <div class="modal-body">
        <div style="display:flex;flex-direction:column;gap:9px">
          ${newOption('building', 'Cliente', 'Ficha con ambientes, versiones y bitácora.', 'new-client')}
          ${newOption('help', 'Duda', 'Pregunta abierta con prioridad y responsable.', 'new-doubt')}
          ${newOption('bug', 'Fallo', 'Error con versión, reproducción y estado.', 'new-record-fallo')}
          ${newOption('rocket', 'Mejora', 'Propuesta con impacto y beneficio esperado.', 'new-record-mejora')}
          ${newOption('calendar', 'Minuta', 'Reunión, decisiones y compromisos.', 'new-meeting')}
        </div>
      </div>
    </div>`);
}

function newOption(iconName, title, text, action) {
  return `<button class="list-row card" type="button" data-action="${action}" style="text-align:left;width:100%;background:#fff">
    <div class="chapter-icon" style="width:34px;height:34px;border-radius:9px;margin:0">${icon(iconName, 'ic--sm')}</div>
    <div class="row-main"><strong>${esc(title)}</strong><p>${esc(text)}</p></div>
    ${icon('chevron-right', 'chev')}
  </button>`;
}

/* ---------------- Eventos globales ---------------- */

document.addEventListener('click', (event) => {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  const id = el.dataset.id;

  switch (action) {
    case 'close-modal':
      closeModal();
      return;
    case 'confirm-yes': {
      const cb = confirmCallback;
      confirmCallback = null;
      closeModal();
      if (cb) cb();
      return;
    }
    case 'export':
      exportData();
      return;
    case 'import-data':
      $('#importFile')?.click();
      return;
    case 'reset-data':
      resetData();
      return;
    case 'print-guide':
      printGuide();
      return;
    case 'print-chapter':
      printChapter(el.dataset.chapter);
      return;
    case 'print-article':
      printArticle(el.dataset.chapter, el.dataset.article);
      return;
    case 'new-client':
      openClientForm();
      return;
    case 'edit-client':
      openClientForm(id);
      return;
    case 'delete-client':
      deleteClient(id);
      return;
    case 'add-timeline':
      addTimeline(id);
      return;
    case 'new-doubt':
      openDoubtForm();
      return;
    case 'edit-doubt':
      openDoubtForm(id);
      return;
    case 'delete-doubt':
      deleteDoubt(id);
      return;
    case 'set-doubt-status':
      setDoubtStatus(id, el.dataset.status);
      return;
    case 'new-record':
    case 'new-record-fallo':
      openRecordForm(null, 'fallo');
      return;
    case 'new-record-mejora':
      openRecordForm(null, 'mejora');
      return;
    case 'edit-record':
      openRecordForm(id);
      return;
    case 'delete-record':
      deleteRecord(id);
      return;
    case 'new-meeting':
      openMeetingForm();
      return;
    case 'edit-meeting':
      openMeetingForm(id);
      return;
    case 'delete-meeting':
      deleteMeeting(id);
      return;
    case 'toggle-meeting-action':
      toggleMeetingAction(id, Number(el.dataset.index));
      return;
    case 'doubt-from-problem':
      doubtFromProblem(id);
      return;
    case 'toggle-read':
      toggleRead(el.dataset.key);
      return;
    case 'copy-link':
      copyLink(el.dataset.hash);
      return;
    case 'search-go':
      closeModal();
      go(el.dataset.route);
      return;
    case 'glossary-letter':
      ui.glossaryLetter = el.dataset.letter;
      ui.glossarySearch = '';
      {
        const input = $('#glossarySearch');
        if (input) input.value = '';
      }
      paintGlossary();
      return;
    case 'client-view':
      ui.clientView = el.dataset.view;
      $$('[data-action="client-view"]').forEach((b) =>
        b.classList.toggle('is-active', b.dataset.view === ui.clientView)
      );
      paintClientList();
      return;
    case 'doubt-filter':
      ui.doubtStatus = el.dataset.status;
      $$('[data-action="doubt-filter"]').forEach((c) =>
        c.classList.toggle('is-active', c.dataset.status === ui.doubtStatus)
      );
      paintDoubtList();
      return;
    case 'record-type':
      ui.recordType = el.dataset.type;
      $$('[data-action="record-type"]').forEach((c) =>
        c.classList.toggle('is-active', c.dataset.type === ui.recordType)
      );
      paintRecordList();
      return;
    case 'problem-filter':
      ui.problemProcess = el.dataset.process;
      paintProblemList();
      return;
    case 'quick-new':
      openNewMenu();
      return;
    case 'open-search':
      openSearch();
      return;
    default:
      return;
  }
});

document.addEventListener('submit', (event) => {
  const form = event.target;
  if (!form.dataset.form) return;
  event.preventDefault();
  switch (form.dataset.form) {
    case 'client':
      submitClient(form);
      break;
    case 'doubt':
      submitDoubt(form);
      break;
    case 'reply':
      submitReply(form);
      break;
    case 'record':
      submitRecord(form);
      break;
    case 'meeting':
      submitMeeting(form);
      break;
    case 'timeline':
      submitTimeline(form);
      break;
    default:
      break;
  }
});

document.addEventListener('input', (event) => {
  const t = event.target;
  switch (t.id) {
    case 'guideSearch':
      paintGuideSearch(t.value);
      break;
    case 'clientSearch':
      ui.clientSearch = t.value;
      paintClientList();
      break;
    case 'doubtSearch':
      ui.doubtSearch = t.value;
      paintDoubtList();
      break;
    case 'problemSearch':
      ui.problemSearch = t.value;
      paintProblemList();
      break;
    case 'glossarySearch':
      ui.glossarySearch = t.value;
      paintGlossary();
      break;
    case 'recordSearch':
      ui.recordSearch = t.value;
      paintRecordList();
      break;
    case 'meetingSearch':
      ui.meetingSearch = t.value;
      paintMeetingList();
      break;
    case 'globalSearch':
      runSearch(t.value);
      break;
    default:
      break;
  }
});

document.addEventListener('change', (event) => {
  const t = event.target;
  switch (t.id) {
    case 'clientFilter':
      ui.clientFilter = t.value;
      paintClientList();
      break;
    case 'doubtStatus':
      ui.doubtStatus = t.value;
      paintDoubtList();
      break;
    case 'doubtPriority':
      ui.doubtPriority = t.value;
      paintDoubtList();
      break;
    case 'doubtClientFilter':
      ui.doubtClient = t.value;
      paintDoubtList();
      break;
    case 'problemProcess':
      ui.problemProcess = t.value;
      paintProblemList();
      break;
    case 'recordType':
      ui.recordType = t.value;
      paintRecordList();
      break;
    case 'recordStatus':
      ui.recordStatus = t.value;
      paintRecordList();
      break;
    case 'importFile':
      importData(t.files?.[0]);
      t.value = '';
      break;
    case 'recordFormType':
      updateRecordFormVisibility(t.value);
      break;
    default:
      break;
  }
});

document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openSearch();
    return;
  }
  if (event.key === 'Escape') {
    if (!$('#modalRoot')?.hidden) closeModal();
    return;
  }
  if (event.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) {
    event.preventDefault();
    openSearch();
    return;
  }
  if (event.target.id === 'globalSearch') {
    if (event.key === 'Enter') {
      event.preventDefault();
      const sel = $('.search-result.is-selected') || $('.search-result');
      if (sel) sel.click();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveSearchSelection(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveSearchSelection(-1);
    }
  }
});

$('#menuBtn')?.addEventListener('click', () => {
  const sidebar = $('#sidebar');
  const backdrop = $('#sidebarBackdrop');
  sidebar.classList.add('is-open');
  backdrop.hidden = false;
});

$('#sidebarBackdrop')?.addEventListener('click', closeSidebar);
$$('.nav-item').forEach((n) => n.addEventListener('click', closeSidebar));

function closeSidebar() {
  $('#sidebar')?.classList.remove('is-open');
  const backdrop = $('#sidebarBackdrop');
  if (backdrop) backdrop.hidden = true;
}

$('#searchTrigger')?.addEventListener('click', openSearch);
$('#quickNew')?.addEventListener('click', openNewMenu);

/* ---------------- Utilidades compartidas ---------------- */

function toggleRead(key) {
  if (!key) return;
  const idx = db.read.indexOf(key);
  if (idx >= 0) db.read.splice(idx, 1);
  else db.read.push(key);
  save();
  const read = db.read.includes(key);
  const btn = document.querySelector(`[data-action="toggle-read"][data-key="${key}"]`);
  if (btn) {
    btn.className = `btn btn--sm ${read ? 'btn--soft' : 'btn--primary'}`;
    btn.innerHTML = `${icon(read ? 'check-circle' : 'book')} ${read ? 'Leído' : 'Marcar como leído'}`;
  }
  $$(`.rail-link[data-key="${key}"]`).forEach((link) => {
    link.classList.toggle('is-read', read);
    const num = link.querySelector('.rail-num');
    if (num && read) num.textContent = '✓';
  });
  const state = document.querySelector('.article-foot .done-state');
  if (state) state.innerHTML = `${icon(read ? 'check-circle' : 'book')} ${read ? 'Marcado como leído' : 'Aún no lo marcas como leído'}`;
  toast(read ? 'Artículo marcado como leído' : 'Artículo marcado como pendiente');
}

function copyLink(hash) {
  const base =
    location.protocol === 'file:' ? location.href.split('#')[0] : `${location.origin}${location.pathname}`;
  const url = `${base}#/${hash}`;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard
      .writeText(url)
      .then(() => toast('Enlace copiado'))
      .catch(() => fallbackCopy(url));
  } else {
    fallbackCopy(url);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    toast('Enlace copiado');
  } catch {
    toast('No se pudo copiar el enlace', 'error');
  }
  ta.remove();
}

function renderNotFound(message = 'La página que buscas no existe o fue movida.') {
  return `<section class="empty card"><div class="empty-icon">${icon('alert')}</div><h3>No encontrado</h3><p>${esc(message)}</p><a class="btn btn--primary" href="#/panel">Volver al panel</a></section>`;
}

/* ---------------- Arranque ---------------- */

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', () => {
  if (!location.hash) location.hash = '#/panel';
  updateNav();
  render();
});
