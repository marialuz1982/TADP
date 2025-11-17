/* =========================================================
   CRUD Libros (frontend + API PHP)
   - Usa ./api/read.php | create.php | update.php | delete.php
   - Modal crear/editar
   - Confirmación al borrar
   - Búsqueda por texto
   ======================================================= */

const API_BASE = 'http://localhost/BookManager/src/api';



// ------------------------ Helpers DOM ------------------------
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Elementos
const els = {
  tbody: $("#booksTbody"),
  empty: $("#emptyState"),
  btnAdd: $("#btnAdd"),
  search: $("#searchInput"),
  bookModal: $("#bookModal"),
  bookForm: $("#bookForm"),
  modalTitle: $("#modalTitle"),
  saveBtn: $("#saveBtn"),
  confirmModal: $("#confirmModal"),
  confirmMsg: $("#confirmMessage"),
  // Inputs del formulario
  id: $("#bookId"),
  title: $("#title"),
  author: $("#author"),
  year: $("#year"),
  genre: $("#genre"),
  isbn: $("#isbn"),
};

let confirmResolver = null; // para resolver confirmaciones
let BOOKS = [];             // cache local de libros

// ------------------------ Utils ------------------------
function escapeHTML(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toApi(book) {
  return {
    id: book.id ? Number(book.id) : undefined,
    titulo: book.title,
    autor: book.author,
    anio: Number(book.year),
    genero: book.genre || '',
    isbn: book.isbn,
  };
}

function fromApi(row) {
  return {
    id: String(row.id),
    title: row.titulo,
    author: row.autor,
    year: Number(row.anio),
    genre: row.genero || '',
    isbn: row.isbn,
  };
}

// ------------------------ API ------------------------
async function apiGet(path) {
  const r = await fetch(`${API_BASE}/${path}`);
  if (!r.ok) throw new Error(`GET ${path} → ${r.status}`);
  return r.json();
}

async function apiSend(path, method, body) {
  const r = await fetch(`${API_BASE}/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  let data = {};
  try { data = await r.json(); } catch {}
  if (!r.ok || data.ok === false) {
    const msg = data.error || `HTTP ${r.status}`;
    throw new Error(`${method} ${path}: ${msg}`);
  }
  return data;
}

// ------------------------ Store (con fetch) ------------------------
const Store = {
  async sync() {
    const data = await apiGet('read.php');
    if (!data.ok) throw new Error('Respuesta no OK');
    BOOKS = (data.data || []).map(fromApi);
  },

  list() {
    return BOOKS;
  },

  async upsert(book) {
    const payload = toApi(book);
    if (payload.id) {
      await apiSend('update.php', 'POST', payload);

    } else {
      await apiSend('create.php', 'POST', payload);
    }
    await this.sync();
  },

  // async remove(id) {
  //   await apiSend('delete.php', 'POST', { id: Number(id) });
  //   await this.sync();
  // }
  async remove(id) {
  const r = await fetch(`${API_BASE}/delete.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `id=${encodeURIComponent(id)}`
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || data.ok === false) {
    throw new Error(data.error || 'Error al borrar');
  }
  await this.sync();
}

};

// ------------------------ Render ------------------------
function render(filterText = "") {
  const ft = filterText.trim().toLowerCase();
  const rows = !ft
    ? Store.list()
    : Store.list().filter(b =>
        [b.title, b.author, b.isbn, b.genre, String(b.year)]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(ft))
      );

  els.tbody.innerHTML = "";

  if (rows.length === 0) {
    els.empty.classList.remove("hidden");
    return;
  }
  els.empty.classList.add("hidden");

  const frag = document.createDocumentFragment();
  for (const b of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHTML(b.title)}</td>
      <td>${escapeHTML(b.author)}</td>
      <td><span class="tag">${escapeHTML(b.year)}</span></td>
      <td>${escapeHTML(b.genre || "-")}</td>
      <td>${escapeHTML(b.isbn)}</td>
      <td class="col-actions">
        <button class="btn" data-action="edit" data-id="${b.id}">Editar</button>
        <button class="btn danger" data-action="delete" data-id="${b.id}">Borrar</button>
      </td>
    `;
    frag.appendChild(tr);
  }
  els.tbody.appendChild(frag);
}

// ------------------------ Validación ------------------------
function setError(fieldId, message) {
  const el = $(`.error[data-for="${fieldId}"]`);
  if (el) el.textContent = message;
}
function clearErrors() {
  $$(".error").forEach(e => e.textContent = "");
}
function validateForm() {
  const values = {
    id: els.id.value || null,
    title: els.title.value.trim(),
    author: els.author.value.trim(),
    year: Number(els.year.value),
    genre: els.genre.value.trim(),
    isbn: els.isbn.value.trim(),
  };

  let ok = true;
  clearErrors();

  if (!values.title) { setError("title", "El título es obligatorio."); ok = false; }
  if (!values.author) { setError("author", "El autor/la autora es obligatoria."); ok = false; }
  if (!values.year || isNaN(values.year) || values.year < 1000 || values.year > 2100) {
    setError("year", "Ingresá un año válido (1000–2100)."); ok = false;
  }
  if (!values.isbn) { setError("isbn", "El ISBN es obligatorio."); ok = false; }

  return ok ? values : null;
}

// ------------------------ Modales ------------------------
function openBookModal(mode = "create", data = null) {
  els.bookForm.reset();
  clearErrors();
  els.id.value = data?.id ?? "";
  els.title.value = data?.title ?? "";
  els.author.value = data?.author ?? "";
  els.year.value = data?.year ?? "";
  els.genre.value = data?.genre ?? "";
  els.isbn.value = data?.isbn ?? "";

  if (mode === "create") {
    els.modalTitle.textContent = "Nuevo libro";
    els.saveBtn.textContent = "Guardar";
  } else {
    els.modalTitle.textContent = "Editar libro";
    els.saveBtn.textContent = "Actualizar";
  }

  if (typeof els.bookModal.showModal === 'function') els.bookModal.showModal();
  else els.bookModal.classList.remove('hidden');

  els.title.focus();
}
function closeBookModal() {
  if (typeof els.bookModal.close === 'function') els.bookModal.close();
  else els.bookModal.classList.add('hidden');
}

function confirmDialog(message = "¿Confirmás esta acción?") {
  els.confirmMsg.textContent = message;
  if (typeof els.confirmModal.showModal === 'function') els.confirmModal.showModal();
  else els.confirmModal.classList.remove('hidden');
  return new Promise(resolve => { confirmResolver = resolve; });
}
function closeConfirm(result = false) {
  if (typeof els.confirmModal.close === 'function') els.confirmModal.close();
  else els.confirmModal.classList.add('hidden');
  if (confirmResolver) confirmResolver(result);
  confirmResolver = null;
}

// ------------------------ Eventos ------------------------
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  // cerrar modal (x o Cancelar)
  if (btn.dataset.action === "close") {
    closeBookModal();
  }

  // abrir modal crear
  if (btn.id === "btnAdd") {
    openBookModal("create");
  }

  // editar
  if (btn.dataset.action === "edit") {
    const id = btn.dataset.id;
    const book = Store.list().find(b => b.id === id);
    if (book) openBookModal("edit", book);
  }

  // borrar
  if (btn.dataset.action === "delete") {
    const id = btn.dataset.id;
    const book = Store.list().find(b => b.id === id);
    if (!book) return;

    confirmDialog(`¿Seguro que querés borrar “${book.title}”?`).then(async ok => {
      if (!ok) return;
      try {
        await Store.remove(id);
        render(els.search.value);
      } catch (err) {
        console.error(err);
        alert('No se pudo borrar.');
      }
    });
  }

  // botones del diálogo de confirmación
  if (btn.closest("#confirmModal")) {
    const act = btn.dataset.action;
    if (act === "confirm") closeConfirm(true);
    if (act === "cancel") closeConfirm(false);
  }
});

// submit crear/editar
els.bookForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const values = validateForm();
  if (!values) return;

  try {
    await Store.upsert(values);
    closeBookModal();
    render(els.search.value);
  } catch (err) {
    console.error(err);
    alert('No se pudo guardar. Revisá los datos.');
  }
});

// búsqueda
els.search.addEventListener("input", (e) => {
  render(e.target.value);
});

// cerrar modales con ESC
window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (els.confirmModal.open) closeConfirm(false);
  else if (els.bookModal.open) closeBookModal();
});

// ------------------------ Init ------------------------
(async function init() {
  try {
    await Store.sync();
  } catch (e) {
    console.error(e);
    alert('No se pudo cargar la lista de libros.');
  }
  render();
})();
