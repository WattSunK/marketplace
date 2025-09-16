/* public/admin/js/admin-users.js
   Admin Users — event-driven controller (list rendering only, no UI changes)
   - Activates ONLY when the Users partial fires `admin:partial-loaded`
   - Tolerant to different API response shapes
   - Uses IDs if present; otherwise falls back to root-scoped selectors
*/
(function () {
  // Guard against double-loading
  if (window.__ADMIN_USERS_CONTROLLER__) return;
  window.__ADMIN_USERS_CONTROLLER__ = true;

  const DEBUG = true; // set false after verification

  // ---------------- State & small helpers ----------------
  const State = {
    all: [],
    filtered: [],
    page: 1,
    per: 10,
    root: null,
    els: {}
  };
  window.UsersState = State; // optional for debugging

  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) =>
    (s == null ? "" : String(s)).replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m]));

  // ---------------- Endpoint resolution ----------------
  const USERS_ENDPOINT_CANDIDATES = ["/api/admin/users", "/api/users", "/admin/users", "/users"];
  let USERS_BASE = null;

  async function resolveUsersBase() {
    if (USERS_BASE) return USERS_BASE;
    USERS_BASE = localStorage.getItem("wsUsersBase") || null;

    async function check(url) {
      try {
        const r = await fetch(url, { method: "GET", credentials: "same-origin" });
        // ok (200) or 405 (method not allowed) is enough to accept the base
        if (r.ok || r.status === 405) return true;
      } catch (_) {}
      return false;
    }

    for (const base of USERS_ENDPOINT_CANDIDATES) {
      if (await check(base)) {
        USERS_BASE = base;
        localStorage.setItem("wsUsersBase", base);
        break;
      }
    }

    USERS_BASE = USERS_BASE || "/api/admin/users";
    return USERS_BASE;
  }

  // ---------------- Data helpers ----------------
  function normalize(u) {
    const created = u.createdAt || u.created_at || u.lastActive || u.last_active || "";
    return {
      id: u.id ?? u.userId ?? u._id ?? "",
      name: u.name ?? u.fullName ?? u.full_name ?? "",
      email: u.email ?? "",
      phone: u.phone ?? u.msisdn ?? "",
      type: u.type ?? u.role ?? "",
      status: u.status ?? "Active",
      createdAt: created,
      orders: Number.isFinite(u.orders) ? u.orders : (u.orderCount ?? u.orders_count ?? 0),
      _raw: u
    };
  }

  async function fetchList() {
    const base = await resolveUsersBase();
    const per = parseInt(State.els?.per?.value || State.per || 10, 10) || 10;
    const page = 1;
    const url = `${base}?page=${page}&per=${per}`;

    const r = await fetch(url, { credentials: "include" });
    const ct = r.headers.get("content-type") || "";
    const body = ct.includes("json") ? await r.json() : await r.text();

    if (DEBUG) {
      console.log("🧪 [Users] fetch", {
        url,
        status: r.status,
        ct,
        shape: typeof body === "object" ? Object.keys(body) : "text",
      });
    }

    // Accept common shapes: [], {users:[]}, {data:[]}, {rows:[]}, {results:[]}, {list:[]}, {items:[]}, or nested under .data
    let list = [];
    if (Array.isArray(body)) {
      list = body;
    } else if (body && typeof body === "object") {
      if (Array.isArray(body.users)) list = body.users;
      else {
        const keys = ["data", "rows", "results", "list", "items"];
        for (const k of keys) {
          if (Array.isArray(body[k])) { list = body[k]; break; }
        }
        if (!list.length && body.data && typeof body.data === "object") {
          for (const k of keys) {
            if (Array.isArray(body.data[k])) { list = body.data[k]; break; }
          }
        }
      }
    }

    if (DEBUG) console.log("🧪 [Users] parsed length:", list.length);
    return list.map(normalize);
  }

  // ---------------- Render ----------------
  function rowHtml(u, slno) {
    const badge = (u.status === "Active") ? "ws-badge-success" : "ws-badge-muted";
    return `
      <tr data-users-row data-user-id="${esc(u.id)}">
        <td>${slno}</td>
        <td><a href="#" class="ws-link" data-users-action="open-edit" data-id="${esc(u.id)}">${esc(u.name || "(no name)")}</a></td>
        <td>${esc(u.email)}</td>
        <td>${esc(u.phone)}</td>
        <td>${esc(u.type)}</td>
        <td>${esc(u.orders)}</td>
        <td><span class="ws-badge ${badge}">${esc(u.status || "Active")}</span></td>
        <td>${u.createdAt ? esc(u.createdAt) : ""}</td>
        <td class="ws-actions">
          <button class="ws-btn ws-btn-xs ws-btn-primary" data-users-action="open-edit" data-id="${esc(u.id)}">View</button>
          <button class="ws-btn ws-btn-xs ws-btn-ghost"   data-users-action="deactivate" data-id="${esc(u.id)}">Delete</button>
        </td>
      </tr>`;
  }

  function renderPager(total) {
    const { page, per, els } = State;
    const pages = Math.max(1, Math.ceil(total / per));
    if (State.page > pages) State.page = pages;

    const mk = (p, label, dis = false, act = false) =>
      `<button class="ws-page-btn ${act ? "is-active" : ""} ${dis ? "is-disabled" : ""}" data-users-action="page" data-page="${p}" ${dis ? "disabled" : ""}>${label}</button>`;

    let html = "";
    html += mk(1, "«", page === 1);
    html += mk(Math.max(1, page - 1), "‹", page === 1);
    const win = 5, s = Math.max(1, page - Math.floor(win / 2)), e = Math.min(pages, s + win - 1);
    for (let p = s; p <= e; p++) html += mk(p, String(p), false, p === page);
    html += mk(Math.min(pages, page + 1), "›", page === pages);
    html += mk(pages, "»", page === pages);

    if (els.pager) els.pager.innerHTML = html;
  }

  function render() {
    const { page, per, filtered, els } = State;
    const start = (page - 1) * per;
    const rows = filtered.slice(start, start + per);

    if (DEBUG) console.log("🧪 [Users] render()", {
      tbodyFound: !!els.tbody,
      pagerFound: !!els.pager,
      infoFound:  !!els.info,
      page, per, filteredTotal: filtered.length, pageRows: rows.length
    });

    if (els.tbody) {
      els.tbody.innerHTML = rows.length
        ? rows.map((u, i) => rowHtml(u, start + i + 1)).join("")
        : `<tr class="ws-empty"><td colspan="9">No users found</td></tr>`;
    }

    const total = filtered.length;
    const end = Math.min(start + rows.length, total);
    if (els.info) els.info.textContent = total ? `${start + 1}–${end} of ${total}` : "0–0 of 0";

    renderPager(total);
    window.dispatchEvent(new CustomEvent("users:rendered"));
  }

  function applyFilters() {
    const rawQ      = (State.els.search?.value || "").trim();
    const rawType   = (State.els.type?.value   || "").trim();
    const rawStatus = (State.els.status?.value || "").trim();

    // Normalize “All …” to empty (no filter)
    const type   = (!rawType   || /^all\b/i.test(rawType))   ? "" : rawType;
    const status = (!rawStatus || /^all\b/i.test(rawStatus)) ? "" : rawStatus;

    const q = rawQ.toLowerCase();

    State.filtered = State.all.filter(u => {
      if (type   && (u.type || "").trim()   !== type)   return false;
      if (status && (u.status || "Active")  !== status) return false;
      if (q) {
        const hay = `${u.name || ""} ${u.email || ""} ${u.phone || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    State.page = 1;
    render();
  }

  // ---------------- Modal stubs (future increments) ----------------
  function mget() {
    const modal = document.getElementById("usersModal");
    return {
      modal,
      title:  $("#users-modal-title", modal),
      id:     $("#u-id", modal),
      name:   $("#u-name", modal),
      email:  $("#u-email", modal),
      phone:  $("#u-phone", modal),
      type:   $("#u-type", modal),
      status: $("#u-status", modal),
      pwd:    $("#u-password", modal)
    };
  }

  function openModal(user) {
    const m = mget(); if (!m.modal) return;
    const isNew = !user || !user.id;
    m.title.textContent = isNew ? "Add User" : "Edit User";
    m.id.value     = user?.id    || "";
    m.name.value   = user?.name  || "";
    m.email.value  = user?.email || "";
    m.phone.value  = user?.phone || "";
    m.type.value   = user?.type  || "";
    m.status.value = user?.status|| "Active";
    m.pwd.value    = "";
    m.modal.style.display = "";
    m.modal.removeAttribute("aria-hidden");
    setTimeout(() => m.name?.focus(), 10);
  }

  function closeModal() {
    const m = mget(); if (!m.modal) return;
    m.modal.style.display = "none";
    m.modal.setAttribute("aria-hidden", "true");
  }

  async function saveModal() {
    // Wired in a later step
  }

  // ---------------- Events ----------------
  function onRootClick(e) {
    if (!State.root?.contains(e.target)) return;
    const actEl = e.target.closest("[data-users-action], a.ws-link");
    if (!actEl) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    let action = actEl.getAttribute("data-users-action") || "";
    const row = actEl.closest("[data-users-row]");
    const id  = actEl.getAttribute("data-id") || row?.getAttribute("data-user-id") || "";

    if (!action && actEl.matches("a.ws-link")) action = "open-edit";

    switch (action) {
      case "open-create": openModal(null); break;
      case "open-edit":   openModal(State.all.find(x => String(x.id) === String(id))); break;
      case "deactivate":
        // Will wire to PATCH/DELETE in a subsequent increment
        alert("Deactivate wiring lands in the next step.");
        break;
      case "search": applyFilters(); break;
      case "clear":
        if (State.els.search) State.els.search.value = "";
        if (State.els.type)   State.els.type.value   = "";
        if (State.els.status) State.els.status.value = "";
        State.page = 1; applyFilters();
        break;
      case "page": {
        const p = parseInt(actEl.getAttribute("data-page"), 10);
        if (Number.isFinite(p)) { State.page = p; render(); }
        break;
      }
      case "close": closeModal(); break;
      case "save":  saveModal();  break;
      default: break;
    }
  }

  function wire() {
    const { root, els } = State;

    root.addEventListener("click", onRootClick, true);

    els.search?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") applyFilters();
    });
    els.type?.addEventListener("change", applyFilters);
    els.status?.addEventListener("change", applyFilters);
    els.per?.addEventListener("change", () => {
      State.per = parseInt(els.per.value, 10) || 10;
      State.page = 1;
      render();
    });

    document.addEventListener("keydown", (e) => {
      const m = $("#usersModal");
      if (m && m.style.display !== "none" && e.key === "Escape") closeModal();
    });
  }

  // ---------------- Loader ----------------
  async function load() {
    try {
      const list = await fetchList();
      State.all = Array.isArray(list) ? list : [];
      State.filtered = State.all.slice();

      const perVal = parseInt(State.els.per?.value || "10", 10);
      if (Number.isFinite(perVal)) State.per = perVal;

      if (DEBUG) {
        console.log("🧪 [Users] load()", {
          found: {
            root:   !!State.root,
            tbody:  !!State.els.tbody,
            pager:  !!State.els.pager,
            info:   !!State.els.info,
            type:   !!State.els.type,
            status: !!State.els.status,
            search: !!State.els.search,
            per:    !!State.els.per
          },
          count: State.all.length
        });
      }

      render();
    } catch (err) {
      console.warn("[Users] load() failed:", err);
      State.all = [];
      State.filtered = [];
      render();
    }
  }

  // ---------------- Init ----------------
  async function init() {
    const root = document.getElementById("users-root");
    if (!root) return;
    if (root.dataset.wsInit === "1") return;

    State.root = root;

    // Prefer IDs. If absent, fall back to elements scoped under the Users root.
    State.els = {
      tbody:  document.querySelector("#usersTbody")  || root.querySelector("tbody"),
      pager:  document.querySelector("#usersPager")  || root.querySelector("[data-users-pager]") || null,
      info:   document.querySelector("#usersInfo")   || root.querySelector("[data-users-info]")  || null,
      type:   document.querySelector("#usersType")   || root.querySelector("select[name='type']")   || null,
      status: document.querySelector("#usersStatus") || root.querySelector("select[name='status']") || null,
      search: document.querySelector("#usersSearch") || root.querySelector("input[type='search'], input[name='search']") || null,
      per:    document.querySelector("#usersPer")    || root.querySelector("select[name='per'], select[name='perPage']") || null,
      addBtn: document.querySelector("#btnUsersAdd") || root.querySelector("[data-users-action='open-create']") || null
    };

    await load();
    wire();

    root.dataset.wsInit = "1";
    console.log("👷 [Users] controller attached (event-driven).");
  }

  // ---------------- Activation (event-driven only) ----------------
  function onPartialLoaded(evt) {
    const name = (evt && evt.detail && (evt.detail.name || evt.detail)) || "";
    if (!/users/i.test(String(name))) return;
    init();
  }

  window.AdminUsers = { init }; // optional manual trigger
  document.addEventListener("admin:partial-loaded", onPartialLoaded);
  console.log("🔎 [Users] controller armed for admin:partial-loaded (passive).");
})();
