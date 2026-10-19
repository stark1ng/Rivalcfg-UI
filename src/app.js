"use strict";

/* ---------- constants ---------- */

const NAMED_COLORS = {
  red: "#db2f2f", lime: "#43d24f", blue: "#2f6bdb", purple: "#8a3ffc",
  yellow: "#f2c938", cyan: "#2fc4d2", magenta: "#d23ccb", white: "#f2f0ec",
  pink: "#f272b6", orange: "#f07f2e", green: "#3fae58", off: "#000000",
  disable: "#000000", none: "#000000",
};

const RU = {
  sensitivity: "Чувствительность (DPI)",
  polling_rate: "Частота опроса",
  sleep_timer: "Таймер сна",
  dim_timer: "Затемнение подсветки",
  buttons_mapping: "Назначение кнопок",
  rainbow_effect: "Радужная подсветка",
  default_lighting: "Подсветка при старте",
  light_effect: "Эффект подсветки",
  z1_color: "Зона 1 — верх",
  z2_color: "Зона 2 — середина",
  z3_color: "Зона 3 — низ",
  z4_color: "Зона 4 — логотип",
  logo_color: "Логотип",
  reactive_color: "Цвет при клике",
  strip_colors: "Полоса подсветки",
  speed: "Скорость",
};

const GROUPS = [
  { id: "dpi", title: "DPI и опрос", match: ["sensitivity", "polling_rate"] },
  { id: "light", title: "Подсветка", match: ["color", "light", "rainbow", "gradient", "reactive", "logo", "strip", "z1", "z2", "z3", "z4"] },
  { id: "power", title: "Питание", match: ["sleep", "dim", "battery", "idle"] },
  { id: "buttons", title: "Кнопки", match: ["buttons", "button"] },
];

const EFFECT_LABELS = {
  steady: "Постоянный", breath: "Дыхание", "breath-slow": "Дыхание (медл.)",
  "breath-fast": "Дыхание (быстр.)", "rainbow-shift": "Радуга (сдвиг)",
  "rainbow-breath": "Радуга (пульс)", disco: "Диско", reactive: "Реактивная",
  rainbow: "Радуга", "reactive-rainbow": "Реактивная радуга", off: "Выключено",
};

/* ---------- state ---------- */

const state = {
  catalog: [],
  device: null,        // current catalog entry
  values: {},          // parsed UI values per setting key
  clean: {},           // baseline to diff against
  periodId: null,
};

const $ = (id) => document.getElementById(id);

/* ---------- bridge ---------- */

async function bridge(payload) {
  try {
    return await window.rivalui.bridge(payload);
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/* ---------- toast ---------- */

let toastTimer = null;
function toast(msg, kind = "info") {
  const el = $("toast");
  el.textContent = msg;
  el.className = "toast " + kind;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
}

/* ---------- color helpers ---------- */

function toHex(name) {
  const n = (name || "").toLowerCase().trim();
  if (NAMED_COLORS[n]) return NAMED_COLORS[n];
  if (/^#[0-9a-f]{6}$/i.test(n)) return n;
  if (/^[0-9a-f]{6}$/i.test(n)) return "#" + n;
  return "#7a7a7a";
}

function fromHex(hex) {
  return hex.replace("#", "").toLowerCase();
}

/* ---------- value parsing / serialization ---------- */

function parseInitial(entry) {
  const v = {};
  const c = {};
  for (const [key, s] of Object.entries(entry.settings)) {
    const t = s.value_type;
    if (t === "multidpi_range_choice" || t === "multidpi_range") {
      const defl = String(s.default || "").split(",").map((x) => parseInt(x, 10)).filter(Number.isFinite);
      const n = s.max_preset_count || 5;
      const arr = [];
      for (let i = 0; i < n; i++) arr.push(defl[i] !== undefined ? defl[i] : defl[defl.length - 1] || s.input_range[0]);
      v[key] = arr; c[key] = arr.slice();
    } else if (t === "rgbcolor") {
      v[key] = toHex(s.default); c[key] = v[key];
    } else if (t === "reactive_rgbcolor") {
      const isOff = String(s.default).toLowerCase() === "off" || s.default === undefined;
      v[key] = { off: isOff, hex: toHex(isOff ? "red" : s.default) };
      c[key] = JSON.parse(JSON.stringify(v[key]));
    } else if (t === "choice") {
      v[key] = String(s.default !== undefined ? s.default : (s.choices || [])[0]);
      c[key] = v[key];
    } else if (t === "range") {
      v[key] = s.default !== undefined ? Number(s.default) : s.input_range[0];
      c[key] = v[key];
    } else if (t === "buttons") {
      v[key] = parseButtons(String(s.default || ""), s);
      c[key] = JSON.parse(JSON.stringify(v[key]));
    } else if (t === "none") {
      v[key] = false; c[key] = false;
    }
    // range_choice and others unsupported -> skipped silently
  }
  state.values = v;
  state.clean = c;
}

function parseButtons(defStr, schema) {
  const map = {};
  const inner = defStr.replace(/^buttons\(|\)$/g, "");
  for (const part of inner.split(";")) {
    const [name, value] = part.split("=").map((x) => x.trim());
    if (name && value) map[name] = value;
  }
  delete map.layout;
  return map;
}

function serializeButtons(map) {
  const parts = Object.entries(map).map(([k, v]) => `${k}=${v}`);
  return `buttons(${parts.join("; ")})`;
}

/* ---------- diff ---------- */

function buildArgs(entry) {
  const args = [];
  for (const [key, s] of Object.entries(entry.settings)) {
    const fresh = state.values[key];
    const base = state.clean[key];
    if (fresh === undefined) continue;
    const t = s.value_type;
    let cliVal = null;
    if (t === "multidpi_range_choice" || t === "multidpi_range") {
      cliVal = "" + fresh.join(",");
    } else if (t === "rgbcolor") {
      cliVal = fromHex(fresh);
    } else if (t === "reactive_rgbcolor") {
      cliVal = fresh.off ? "off" : fromHex(fresh.hex);
    } else if (t === "choice") {
      cliVal = String(fresh);
    } else if (t === "range") {
      cliVal = String(fresh);
    } else if (t === "buttons") {
      const changed = Object.entries(fresh).some(([k, v]) => base[k] !== v);
      if (changed) cliVal = serializeButtons(fresh);
    } else if (t === "none") {
      if (fresh === true && base !== true) args.push(s.cli[1] || s.cli[0]);
      continue;
    }
    if (cliVal === null) continue;
    if (JSON.stringify(base) === JSON.stringify(fresh)) continue;
    const cli = s.cli.find((x) => x.startsWith("--")) || s.cli[0];
    args.push(cli, cliVal);
  }
  return args;
}

function isDirty(entry) {
  return buildArgs(entry).length > 0;
}

/* ---------- rendering ---------- */

function groupFor(key) {
  const l = key.toLowerCase();
  for (const g of GROUPS) {
    if (g.match.some((m) => l.includes(m))) return g.id;
  }
  return "other";
}

const GROUP_TITLES = {
  dpi: "DPI И ОПРОС", light: "ПОДСВЕТКА", power: "ПИТАНИЕ",
  buttons: "КНОПКИ", other: "ПРОЧЕЕ",
};

function labelFor(entry, key, schema) {
  if (RU[key]) return RU[key];
  if (/_?color$/.test(key)) return key.replace(/_?color$/, "").replace(/_/g, " ");
  return schema.label || key.replace(/_/g, " ");
}

function render(entry) {
  const root = $("settings");
  root.innerHTML = "";
  $("page-title").textContent = entry.name;
  $("page-sub").textContent = `USB 1038:${entry.product_id}`;
  const docs = $("btn-docs");
  if (entry.docs_url) {
    docs.href = "#";
    docs.hidden = false;
    docs.onclick = (ev) => {
      ev.preventDefault();
      window.rivalui.openExternal(entry.docs_url);
    };
  } else {
    docs.hidden = true;
  }

  const buckets = {};
  for (const [key, schema] of Object.entries(entry.settings)) {
    const t = schema.value_type;
    if (!["multidpi_range_choice", "multidpi_range", "choice", "range", "rgbcolor", "reactive_rgbcolor", "buttons", "none"].includes(t)) continue;
    const g = groupFor(key);
    (buckets[g] = buckets[g] || []).push([key, schema]);
  }

  // strip_colors pseudo-grouping: show colors in their natural order (z1..z4)
  for (const gid of ["dpi", "light", "power", "buttons", "other"]) {
    if (!buckets[gid]) continue;
    const section = document.createElement("section");
    section.className = "group";
    const title = document.createElement("div");
    title.className = "group-title";
    title.textContent = GROUP_TITLES[gid];
    section.appendChild(title);
    const card = document.createElement("div");
    card.className = "card";
    for (const [key, schema] of buckets[gid]) {
      card.appendChild(renderRow(entry, key, schema));
    }
    section.appendChild(card);
    root.appendChild(section);
  }
  updateButtons();
}

function rowWrap(label, desc) {
  const row = document.createElement("div");
  row.className = "row";
  const left = document.createElement("div");
  const lab = document.createElement("div");
  lab.className = "row-label";
  lab.textContent = label;
  left.appendChild(lab);
  if (desc) {
    const d = document.createElement("div");
    d.className = "row-desc";
    d.textContent = desc;
    left.appendChild(d);
  }
  row.appendChild(left);
  return row;
}

function renderRow(entry, key, schema) {
  const t = schema.value_type;
  const label = labelFor(entry, key, schema);
  const row = rowWrap(label, schema.description && schema.description !== label ? schema.description : "");
  const ctrl = document.createElement("div");
  ctrl.className = "row-control";

  if (t === "choice") {
    ctrl.appendChild(segmented(schema.choices, EFFECT_LABELS, state.values[key], (val) => {
      state.values[key] = val;
      updateButtons();
    }));
  } else if (t === "range") {
    ctrl.appendChild(rangeControl(schema, state.values[key], (val) => {
      state.values[key] = val;
      updateButtons();
    }));
  } else if (t === "rgbcolor") {
    ctrl.appendChild(colorControl(state.values[key], (hex) => {
      state.values[key] = hex;
      updateButtons();
    }));
  } else if (t === "reactive_rgbcolor") {
    ctrl.appendChild(reactiveControl(state.values[key], (val) => {
      state.values[key] = val;
      updateButtons();
    }));
  } else if (t === "multidpi_range_choice" || t === "multidpi_range") {
    ctrl.appendChild(dpiEditor(schema, state.values[key], () => updateButtons()));
  } else if (t === "buttons") {
    ctrl.appendChild(buttonsEditor(schema, state.values[key], () => updateButtons()));
  } else if (t === "none") {
    ctrl.appendChild(toggleControl(state.values[key], (val) => {
      state.values[key] = val;
      updateButtons();
    }));
  }
  row.appendChild(ctrl);
  return row;
}

function segmented(options, labels, current, onChange) {
  const wrap = document.createElement("div");
  wrap.className = "segmented";
  const opts = Array.isArray(options) ? options : Object.keys(options || {});
  for (const opt of opts) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = (labels && labels[opt]) || opt;
    b.classList.toggle("selected", opt === current);
    b.addEventListener("click", () => {
      wrap.querySelectorAll("button").forEach((x) => x.classList.remove("selected"));
      b.classList.add("selected");
      onChange(opt);
    });
    wrap.appendChild(b);
  }
  return wrap;
}

function rangeControl(schema, current, onChange) {
  const [min, max, step] = schema.input_range;
  const wrap = document.createElement("div");
  wrap.className = "slider-wrap";
  const input = document.createElement("input");
  input.type = "range";
  input.min = min; input.max = max; input.step = step || 1; input.value = current;
  const val = document.createElement("div");
  val.className = "slider-value";
  val.textContent = current + (rangeUnit(schema));
  input.addEventListener("input", () => {
    val.textContent = input.value + rangeUnit(schema);
    onChange(Number(input.value));
  });
  wrap.append(input, val);
  return wrap;
}

function rangeUnit(schema) {
  if (schema.cli.includes("-T")) return " с";
  if (schema.cli.includes("-t")) return " мин";
  return "";
}

function colorControl(hex, onChange) {
  const wrap = document.createElement("div");
  wrap.className = "color-wrap";
  const picker = document.createElement("input");
  picker.type = "color";
  picker.value = hex;
  const txt = document.createElement("div");
  txt.className = "color-hex";
  txt.textContent = fromHex(hex);
  picker.addEventListener("input", () => {
    txt.textContent = fromHex(picker.value);
    onChange(picker.value);
  });
  wrap.append(picker, txt);
  return wrap;
}

function reactiveControl(val, onChange) {
  const wrap = document.createElement("div");
  wrap.className = "color-wrap";
  const offLabel = document.createElement("label");
  offLabel.className = "color-off";
  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.checked = val.off;
  offLabel.append(cb, document.createTextNode("выкл"));
  const picker = document.createElement("input");
  picker.type = "color";
  picker.value = val.hex;
  picker.disabled = val.off;
  const txt = document.createElement("div");
  txt.className = "color-hex";
  txt.textContent = val.off ? "off" : fromHex(val.hex);
  cb.addEventListener("change", () => {
    picker.disabled = cb.checked;
    txt.textContent = cb.checked ? "off" : fromHex(picker.value);
    onChange({ off: cb.checked, hex: val.hex });
  });
  picker.addEventListener("input", () => {
    txt.textContent = fromHex(picker.value);
    onChange({ off: false, hex: picker.value });
  });
  wrap.append(offLabel, picker, txt);
  return wrap;
}

function dpiEditor(schema, values, onChange) {
  const [min, max, step] = schema.input_range;
  const wrap = document.createElement("div");
  wrap.className = "dpi-grid";
  values.forEach((v, i) => {
    const row = document.createElement("div");
    row.className = "dpi-row";
    const name = document.createElement("div");
    name.className = "dpi-name";
    name.textContent = `Пресет ${i + 1}`;
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = min; slider.max = max; slider.step = step || 100;
    slider.value = v;
    const val = document.createElement("div");
    val.className = "dpi-val";
    val.textContent = v;
    slider.addEventListener("input", () => {
      val.textContent = slider.value;
      values[i] = Number(slider.value);
      onChange();
    });
    row.append(name, slider, val);
    wrap.appendChild(row);
  });
  return wrap;
}

function buttonsEditor(schema, map, onChange) {
  const labels = {
    button1: "ЛКМ", button2: "ПКМ", button3: "СКМ",
    button4: "Назад", button5: "Вперёд", button6: "Кнопка 6",
    button7: "Кнопка 7", button8: "Кнопка 8", button9: "Кнопка 9",
    scrollup: "Колесо вверх", scrolldown: "Колесо вниз", dpi: "Смена DPI",
    disabled: "Отключена",
  };
  const displayNames = { button1: "ЛКМ", button2: "ПКМ", button3: "СКМ", button4: "Назад", button5: "Вперёд", button6: "Кнопка 6", button7: "Кнопка 7", button8: "Кнопка 8", button9: "Кнопка 9", scrollup: "Колесо ↑", scrolldown: "Колесо ↓" };
  const wrap = document.createElement("div");
  wrap.className = "buttons-grid";
  for (const [phys, action] of Object.entries(map)) {
    const lab = document.createElement("label");
    lab.textContent = displayNames[phys] || phys;
    const sel = document.createElement("select");
    sel.className = "select";
    const opts = ["button1", "button2", "button3", "button4", "button5", "button6", "scrollup", "scrolldown", "dpi", "disabled"];
    for (const o of opts) {
      const op = document.createElement("option");
      op.value = o;
      op.textContent = labels[o] || o;
      if (o === action) op.selected = true;
      sel.appendChild(op);
    }
    sel.addEventListener("change", () => {
      map[phys] = sel.value;
      onChange();
    });
    lab.appendChild(sel);
    wrap.appendChild(lab);
  }
  return wrap;
}

function toggleControl(current, onChange) {
  const lab = document.createElement("label");
  lab.className = "toggle";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = current;
  const track = document.createElement("div");
  track.className = "track";
  const knob = document.createElement("div");
  knob.className = "knob";
  input.addEventListener("change", () => onChange(input.checked));
  lab.append(input, track, knob);
  return lab;
}

/* ---------- topbar / apply ---------- */

function updateButtons() {
  const dirty = state.device ? isDirty(state.device) : false;
  $("btn-apply").disabled = !dirty;
  $("btn-revert").disabled = !dirty;
}

async function apply() {
  if (!state.device) return;
  const args = buildArgs(state.device);
  if (!args.length) return;
  $("btn-apply").textContent = "Применяю…";
  $("btn-apply").disabled = true;
  const res = await bridge({ op: "run", args });
  $("btn-apply").textContent = "Применить";
  if (res.ok) {
    state.clean = JSON.parse(JSON.stringify(state.values));
    toast("Применено", "ok");
  } else {
    const detail = (res.stderr || res.error || "").split("\n").slice(-3).join(" ").trim();
    toast("Ошибка: " + detail, "err");
  }
  updateButtons();
}

function revert() {
  if (!state.device) return;
  parseInitial(state.device);
  render(state.device);
}

/* ---------- device list ---------- */

function renderDeviceList(filter) {
  const list = $("device-list");
  list.innerHTML = "";
  const q = (filter || "").toLowerCase();
  const entries = state.catalog.filter((e) => !q || e.name.toLowerCase().includes(q));
  for (const e of entries) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "device-item" + (state.device && state.device.product_id === e.product_id && state.device.name === e.name ? " selected" : "");
    b.innerHTML = "";
    const nameSpan = document.createElement("span");
    nameSpan.className = "name";
    nameSpan.textContent = e.name.replace("SteelSeries ", "");
    const pid = document.createElement("span");
    pid.className = "pid";
    pid.textContent = e.product_id;
    b.append(nameSpan, pid);
    b.addEventListener("click", () => selectDevice(e));
    list.appendChild(b);
  }
}

function selectDevice(entry) {
  if (typeof entry === "string") {
    entry = state.catalog.find((e) => e.product_id === entry && e.name.includes(entry)) || state.catalog.find((e) => e.product_id === entry);
  }
  if (!entry) return;
  state.device = entry;
  parseInitial(entry);
  render(entry);
  setStatus("ok", entry.name, `1038:${entry.product_id}`);
  renderDeviceList($("device-search").value);
}

function setStatus(kind, title, sub) {
  const dot = $("status-dot");
  dot.className = "status-dot " + (kind || "");
  $("status-name").textContent = title;
  $("status-id").textContent = sub || "";
}

/* ---------- detection ---------- */

let lastDetect = [];

async function detectLoop(first) {
  const res = await bridge({ op: "detect" });
  if (res.ok) {
    lastDetect = res.plugged || [];
    const found = (res.plugged || [])
      .map((d) => state.catalog.find((e) => e.product_id === d.product_id))
      .filter(Boolean);
    if (found.length) {
      const same = state.device && found.some((f) => f.product_id === state.device.product_id && f.name === state.device.name);
      if (!same || first) selectDevice(found[0]);
      return;
    }
  }
  if (first || (state.device && !lastDetect.some((d) => d.product_id === state.device.product_id))) {
    if (!state.device) {
      setStatus("err", "Мышь не найдена", "подключите мышь");
    }
  }
}

function nameVariantFor(d) {
  // catalog entries carry name + pid; match by product_id only
  return state.catalog.find((e) => e.product_id === d.product_id) ? { name: state.catalog.find((e) => e.product_id === d.product_id).name } : "";
}

/* ---------- profiles ---------- */

function profileKey() {
  return state.device ? "prof:" + state.device.product_id + ":" + state.device.name : null;
}

function refreshProfiles() {
  const sel = $("profile-select");
  sel.innerHTML = "";
  const key = profileKey();
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = "—";
  if (!key) { sel.appendChild(empty); return; }
  const store = JSON.parse(localStorage.getItem(key) || "{}");
  for (const name of Object.keys(store)) {
    const o = document.createElement("option");
    o.value = name;
    o.textContent = name;
    sel.appendChild(o);
  }
  if (Object.keys(store).length === 0) sel.appendChild(empty);
  sel.disabled = Object.keys(store).length === 0;
}

async function saveProfile() {
  if (!state.device) return;
  const sel = $("profile-select");
  const existing = sel.value;
  const name = existing || "Профиль " + (sel.options.length);
  const key = profileKey();
  const store = JSON.parse(localStorage.getItem(key) || "{}");
  store[name] = JSON.parse(JSON.stringify(state.values));
  localStorage.setItem(key, JSON.stringify(store));
  refreshProfiles();
  sel.value = name;
  toast(`Профиль «${name}» сохранён`, "ok");
}

function deleteProfile() {
  const sel = $("profile-select");
  const key = profileKey();
  if (!key || !sel.value) return;
  const store = JSON.parse(localStorage.getItem(key) || "{}");
  delete store[sel.value];
  localStorage.setItem(key, JSON.stringify(store));
  refreshProfiles();
  toast(`Профиль «${sel.value}» удалён`);
}

function loadProfile(name) {
  const key = profileKey();
  if (!key || !name) return;
  const store = JSON.parse(localStorage.getItem(key) || "{}");
  if (!store[name]) return;
  state.values = JSON.parse(JSON.stringify(store[name]));
  render(state.device);
  toast(`Профиль «${name}» загружен`, "ok");
}

/* ---------- theme ---------- */

function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light") document.documentElement.setAttribute("data-theme", "light");
  $("theme-toggle").addEventListener("click", () => {
    const light = document.documentElement.getAttribute("data-theme") === "light";
    if (light) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.removeItem("theme");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  });
}

/* ---------- boot ---------- */

async function boot() {
  initTheme();
  const cat = await bridge({ op: "devices" });
  state.catalog = cat.catalog || [];
  renderDeviceList("");
  detectLoop(true);
  setInterval(() => detectLoop(false), 4000);

  $("device-search").addEventListener("input", (e) => renderDeviceList(e.target.value));
  $("btn-apply").addEventListener("click", apply);
  $("btn-revert").addEventListener("click", revert);
  $("profile-save").addEventListener("click", saveProfile);
  $("profile-delete").addEventListener("click", deleteProfile);
  $("profile-select").addEventListener("change", (e) => loadProfile(e.target.value));
}

boot();