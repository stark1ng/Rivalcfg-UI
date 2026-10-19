"use strict";

/* ---------- constants ---------- */

const NAMED_COLORS = {
  red: "#db2f2f", lime: "#43d24f", blue: "#2f6bdb", purple: "#8a3ffc",
  yellow: "#f2c938", cyan: "#2fc4d2", magenta: "#d23ccb", white: "#f2f0ec",
  pink: "#f272b6", orange: "#f07f2e", green: "#3fae58", off: "#000000",
  disable: "#000000", none: "#000000",
};

/* ---------- i18n ---------- */

let lang = localStorage.getItem("lang") || "en";

function t(key) {
  return UI[lang][key] !== undefined ? UI[lang][key] : UI.en[key] !== undefined ? UI.en[key] : key;
}

const UI = {
  en: {
    save: "Save", deletebt: "Delete", profiles: "Profiles", docs: "Docs",
    revert: "Revert", apply: "Apply", applying: "Applying…", auto_apply: "Auto-apply",
    applied: "Applied to mouse: {n} parameters", err_apply: "Apply failed: ",
    profile_saved: "Profile \"{name}\" saved", profile_deleted: "Profile \"{name}\" deleted",
    profile_loaded: "Profile \"{name}\" loaded", profile_n: "Profile {n}",
    status_searching: "Searching for mouse…", status_none: "No mouse found",
    status_none_sub: "connect a mouse", pick_hint: "The current model is highlighted. You can browse another model's settings, but they can only be applied to the connected mouse.",
    language: "Language",
    search_ph: "Search model…", devices_title: "Devices",
    devices_sub_none: "Connect a mouse or pick a model manually",
    group_dpi: "DPI AND POLLING", group_light: "LIGHTING", group_power: "POWER",
    group_buttons: "BUTTONS", group_other: "OTHER",
    nav_devices: "Device", nav_dpi: "DPI & polling", nav_light: "Lighting",
    nav_power: "Power", nav_buttons: "Buttons", nav_other: "Other",
    preset: "Preset {n}", off_label: "off", unit_min: " min", unit_sec: " s",
    effect_steady: "Steady", effect_breath: "Breath", effect_breath_slow: "Breath (slow)",
    effect_breath_fast: "Breath (fast)", effect_rainbow_shift: "Rainbow (shift)",
    effect_rainbow_breath: "Rainbow (pulse)", effect_disco: "Disco",
    effect_reactive: "Reactive", effect_rainbow: "Rainbow",
    effect_reactive_rainbow: "Reactive rainbow", effect_off: "Off",
    btn_left: "Left button", btn_right: "Right button", btn_middle: "Middle button",
    btn_back: "Back", btn_forward: "Forward", btn_side6: "Side 6", btn_side7: "Side 7",
    btn_side8: "Side 8", btn_side9: "Side 9", btn_scrollup: "Wheel up",
    btn_scrolldown: "Wheel down", act_dpi: "DPI switch", act_disabled: "Disabled",
    act_button6: "Button 6", act_button7: "Button 7", act_button8: "Button 8",
    act_button9: "Button 9", act_scrollup: "Wheel up", act_scrolldown: "Wheel down",
  },
  ru: {
    save: "Сохранить", deletebt: "Удалить", profiles: "Профили", docs: "Документация",
    revert: "Отменить", apply: "Применить", applying: "Применяю…", auto_apply: "Авто-применение",
    applied: "Применено к мыши: {n} параметров", err_apply: "Ошибка применения: ",
    profile_saved: "Профиль «{name}» сохранён", profile_deleted: "Профиль «{name}» удалён",
    profile_loaded: "Профиль «{name}» загружен", profile_n: "Профиль {n}",
    status_searching: "Поиск мыши…", status_none: "Мышь не найдена",
    status_none_sub: "подключите мышь", pick_hint: "Текущая модель выделена. Можно посмотреть настройки другой модели, но применять можно только к подключённой.",
    language: "Язык",
    search_ph: "Поиск модели…", devices_title: "Устройства",
    devices_sub_none: "Подключите мышь или выберите модель вручную",
    group_dpi: "DPI И ОПРОС", group_light: "ПОДСВЕТКА", group_power: "ПИТАНИЕ",
    group_buttons: "КНОПКИ", group_other: "ПРОЧЕЕ",
    nav_devices: "Устройство", nav_dpi: "DPI и опрос", nav_light: "Подсветка",
    nav_power: "Питание", nav_buttons: "Кнопки", nav_other: "Прочее",
    preset: "Пресет {n}", off_label: "выкл", unit_min: " мин", unit_sec: " с",
    effect_steady: "Постоянный", effect_breath: "Дыхание", effect_breath_slow: "Дыхание (медл.)",
    effect_breath_fast: "Дыхание (быстр.)", effect_rainbow_shift: "Радуга (сдвиг)",
    effect_rainbow_breath: "Радуга (пульс)", effect_disco: "Диско",
    effect_reactive: "Реактивная", effect_rainbow: "Радуга",
    effect_reactive_rainbow: "Реактивная радуга", effect_off: "Выключено",
    btn_left: "Левая кнопка", btn_right: "Правая кнопка", btn_middle: "Средняя кнопка",
    btn_back: "Назад", btn_forward: "Вперёд", btn_side6: "Боковая 6", btn_side7: "Боковая 7",
    btn_side8: "Боковая 8", btn_side9: "Боковая 9", btn_scrollup: "Колесо вверх",
    btn_scrolldown: "Колесо вниз", act_dpi: "Смена DPI", act_disabled: "Отключена",
    act_button6: "Кнопка 6", act_button7: "Кнопка 7", act_button8: "Кнопка 8",
    act_button9: "Кнопка 9", act_scrollup: "Колесо вверх", act_scrolldown: "Колесо вниз",
  },
};

const LABEL_RU = {
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

const DESC_RU = {
  sensitivity: "До пяти предустановок, переключаются кнопкой смены DPI на мыши",
  polling_rate: "Как часто мышь отправляет данные компьютеру",
  z1_color: "Цвет верхней зоны подсветки",
  z2_color: "Цвет средней зоны подсветки",
  z3_color: "Цвет нижней зоны подсветки",
  z4_color: "Цвет зоны логотипа",
  logo_color: "Цвет зоны логотипа",
  reactive_color: "Цвет подсветки при нажатии кнопок",
  sleep_timer: "Время бездействия до перехода мыши в сон, минут (0 - выключить)",
  dim_timer: "Время бездействия до затемнения подсветки, секунд (0 - выключить)",
  buttons_mapping: "Переназначение кнопок и колеса мыши",
  rainbow_effect: "Постоянный радужный эффект подсветки",
  default_lighting: "Режим подсветки при подключении мыши",
  light_effect: "Эффект анимации подсветки",
};

const EFFECT_EN = {
  steady: "Steady", breath: "Breath", "breath-slow": "Breath (slow)",
  "breath-fast": "Breath (fast)", "rainbow-shift": "Rainbow (shift)",
  "rainbow-breath": "Rainbow (pulse)", disco: "Disco", reactive: "Reactive",
  rainbow: "Rainbow", "reactive-rainbow": "Reactive rainbow", off: "Off",
};

function effectLabel(v) {
  if (lang === "ru") {
    return UI.ru["effect_" + v.replace(/-/g, "_")] || v;
  }
  return EFFECT_EN[v] || v;
}

const GROUPS = [
  { id: "dpi", match: ["sensitivity", "polling_rate"] },
  { id: "light", match: ["color", "light", "rainbow", "gradient", "reactive", "logo", "strip", "z1", "z2", "z3", "z4"] },
  { id: "power", match: ["sleep", "dim", "battery", "idle"] },
  { id: "buttons", match: ["buttons", "button"] },
];

/* ---------- state ---------- */

const state = {
  catalog: [],
  device: null,        // current catalog entry
  values: {},          // parsed UI values per setting key
  clean: {},           // baseline to diff against
  periodId: null,
  page: "devices",     // devices | dpi | light | power | buttons | other
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

const LABEL_RU_GROUPS = {
  dpi: "DPI И ОПРОС", light: "ПОДСВЕТКА", power: "ПИТАНИЕ",
  buttons: "КНОПКИ", other: "ПРОЧЕЕ",
};

function groupTitle(gid) {
  if (lang === "ru") {
    return LABEL_RU_GROUPS[gid] || gid;
  }
  return t("group_" + gid);
}

function labelFor(entry, key, schema) {
  if (lang === "ru") {
    if (LABEL_RU[key]) return LABEL_RU[key];
  }
  if (/_?color$/.test(key)) return key.replace(/_?color$/, "").replace(/_/g, " ");
  return schema.label || key.replace(/_/g, " ");
}

function descFor(key, schema) {
  if (lang === "ru") {
    if (DESC_RU[key]) return DESC_RU[key];
    return null; // английские описания профилей в русской локали не показываем
  }
  if (schema.description) {
    return schema.description.replace(/buttonsX/, "buttons").replace(/\s*\(default:.*\)\s*$/i, "");
  }
  return null; // английские описания профилей не показываем
}

function render(entry) {
  const root = $("settings");
  root.innerHTML = "";
  const docs = $("btn-docs");
  const isDevicePage = state.page === "devices";
  const showSettings = Boolean(entry) && !isDevicePage;
  docs.hidden = !entry || !entry.docs_url || isDevicePage;
  if (entry && entry.docs_url) {
    docs.href = "#";
    docs.onclick = (ev) => {
      ev.preventDefault();
      window.rivalui.openExternal(entry.docs_url);
    };
  }
  $("btn-apply").hidden = !showSettings;
  $("btn-revert").hidden = !showSettings;
  $("auto-apply").closest(".auto-apply").hidden = !showSettings;
  renderNav();
  if (isDevicePage) {
    $("page-title").textContent = t("devices_title");
    $("page-sub").textContent = state.device ? state.device.name : t("devices_sub_none");
    buildPicker();
    return;
  }
  if (!showSettings) return;

  $("page-title").textContent = entry.name;
  $("page-sub").textContent = `USB 1038:${entry.product_id}`;

  const buckets = {};
  for (const [key, schema] of Object.entries(entry.settings)) {
    const t = schema.value_type;
    if (!["multidpi_range_choice", "multidpi_range", "choice", "range", "rgbcolor", "reactive_rgbcolor", "buttons", "none"].includes(t)) continue;
    const g = groupFor(key);
    (buckets[g] = buckets[g] || []).push([key, schema]);
  }

  const sections = state.page === "all" ? ["dpi", "light", "power", "buttons", "other"] : [state.page];
  for (const gid of sections) {
    if (!buckets[gid]) continue;
    const section = document.createElement("section");
    section.className = "group";
    const title = document.createElement("div");
    title.className = "group-title";
    title.textContent = groupTitle(gid);
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
  const row = rowWrap(label, descFor(key, schema) || "");
  const ctrl = document.createElement("div");
  ctrl.className = "row-control";

  if (t === "choice") {
    ctrl.appendChild(segmented(schema.choices, effectLabel, state.values[key], (val) => {
      state.values[key] = val;
      userChanged();
    }));
  } else if (t === "range") {
    ctrl.appendChild(rangeControl(schema, state.values[key], (val) => {
      state.values[key] = val;
      userChanged();
    }));
  } else if (t === "rgbcolor") {
    ctrl.appendChild(colorControl(state.values[key], (hex) => {
      state.values[key] = hex;
      userChanged();
    }));
  } else if (t === "reactive_rgbcolor") {
    ctrl.appendChild(reactiveControl(state.values[key], (val) => {
      state.values[key] = val;
      userChanged();
    }));
  } else if (t === "multidpi_range_choice" || t === "multidpi_range") {
    ctrl.appendChild(dpiEditor(schema, state.values[key], userChanged));
  } else if (t === "buttons") {
    ctrl.appendChild(buttonsEditor(schema, state.values[key], userChanged));
  } else if (t === "none") {
    ctrl.appendChild(toggleControl(state.values[key], (val) => {
      state.values[key] = val;
      userChanged();
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
  if (schema.cli.includes("-T")) return t("unit_sec");
  if (schema.cli.includes("-t")) return t("unit_min");
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
  offLabel.append(cb, document.createTextNode(t("off_label")));
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
    name.textContent = t("preset").replace("{n}", i + 1);
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
    button1: t("btn_left"), button2: t("btn_right"), button3: t("btn_middle"),
    button4: t("btn_back"), button5: t("btn_forward"), button6: t("act_button6"),
    button7: t("act_button7"), button8: t("act_button8"), button9: t("act_button9"),
    scrollup: t("act_scrollup"), scrolldown: t("act_scrolldown"),
    disabled: t("act_disabled"),
  };
  const physNames = {
    button1: t("btn_left"), button2: t("btn_right"), button3: t("btn_middle"),
    button4: t("btn_back"), button5: t("btn_forward"), button6: t("btn_side6"),
    button7: t("btn_side7"), button8: t("btn_side8"), button9: t("btn_side9"),
    scrollup: t("btn_scrollup"), scrolldown: t("btn_scrolldown"),
  };
  const opts = ["button1", "button2", "button3", "button4", "button5", "button6", "button7", "button8", "button9", "scrollup", "scrolldown", "dpi", "disabled"];
  const wrap = document.createElement("div");
  wrap.className = "buttons-grid";
  Object.entries(map).forEach(([phys, action], i, arr) => {
    const row = document.createElement("div");
    row.className = "buttons-row";
    const lab = document.createElement("span");
    lab.className = "b-name";
    lab.textContent = physNames[phys] || phys;
    const sel = document.createElement("select");
    sel.className = "select";
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
    row.append(lab, sel);
    wrap.appendChild(row);
  });
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

function userChanged() {
  updateButtons();
  if ($("auto-apply").checked && state.device && isDirty(state.device)) apply();
}

async function apply() {
  if (!state.device) return;
  const args = buildArgs(state.device);
  if (!args.length) return;
  $("btn-apply").textContent = t("applying");
  $("btn-apply").disabled = true;
  const res = await bridge({ op: "run", args });
  $("btn-apply").textContent = t("apply");
  if (res.ok) {
    const n = args.filter((a) => a.startsWith("--") || a.startsWith("-")).length;
    state.clean = JSON.parse(JSON.stringify(state.values));
    toast(t("applied").replace("{n}", n), "ok");
  } else {
    const detail = (res.stderr || res.error || "").split("\n").slice(-2).join(" ").trim();
    toast(t("err_apply") + detail, "err");
  }
  updateButtons();
}

function revert() {
  if (!state.device) return;
  parseInitial(state.device);
  render(state.device);
}

/* ---------- device list / picker page ---------- */

const PAGES = [
  { id: "devices", label: () => t("nav_devices") },
  { id: "dpi", label: () => t("nav_dpi") },
  { id: "light", label: () => t("nav_light") },
  { id: "power", label: () => t("nav_power") },
  { id: "buttons", label: () => t("nav_buttons") },
  { id: "other", label: () => t("nav_other") },
];

function renderNav() {
  const nav = $("side-nav");
  nav.innerHTML = "";
  const available = state.device
    ? new Set(
        Object.entries(state.device.settings)
          .map(([k, s]) =>
            ["multidpi_range_choice", "multidpi_range", "choice", "range", "rgbcolor", "reactive_rgbcolor", "buttons", "none"].includes(s.value_type)
              ? groupFor(k)
              : null
          )
          .filter(Boolean)
      )
    : new Set();
  for (const p of PAGES) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "nav-item" + (state.page === p.id ? " active" : "");
    const enabled = p.id === "devices" ? state.catalog.length > 0 : state.device && available.has(p.id);
    b.disabled = !enabled;
    b.textContent = p.label();
    b.addEventListener("click", () => selectPage(p.id));
    nav.appendChild(b);
  }
}

function selectPage(page) {
  state.page = page;
  $("settings").scrollTop = 0;
  if (page === "devices") {
    render(null);
    renderDeviceList((document.getElementById("device-search") || {}).value || "");
  } else if (state.device) {
    render(state.device);
  }
}

function buildPicker() {
  const root = $("settings");
  const wrap = document.createElement("div");
  wrap.className = "picker";
  wrap.innerHTML = "";
  const hint = document.createElement("div");
  hint.className = "picker-hint";
  hint.textContent = state.device ? t("pick_hint") : "";
  const search = document.createElement("input");
  search.className = "search";
  search.id = "device-search";
  search.type = "search";
  search.placeholder = t("search_ph");
  const list = document.createElement("div");
  list.className = "device-list device-list-page";
  list.id = "device-list";
  search.addEventListener("input", () => renderDeviceList(search.value));
  wrap.append(hint, search, list);
  root.appendChild(wrap);
  renderDeviceList("");
}

function renderDeviceList(filter) {
  const list = $("device-list");
  if (!list) return;
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
  if (state.page === "devices") {
    // после выбора модели показываем первую доступную категорию настроек
    const order = ["dpi", "light", "power", "buttons", "other"];
    const first = order.find((g) => Object.keys(entry.settings).some((k) => groupFor(k) === g));
    state.page = first || "other";
  }
  render(state.device);
  setStatus("ok", entry.name, `1038:${entry.product_id}`);
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
      setStatus("err", t("status_none"), t("status_none_sub"));
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
  $("profile-delete").disabled = sel.value === "";
  sel.addEventListener("change", () => {
    $("profile-delete").disabled = sel.value === "";
  });
}

async function saveProfile() {
  if (!state.device) return;
  const sel = $("profile-select");
  const existing = sel.value;
  const name = existing || t("profile_n").replace("{n}", sel.options.length);
  const key = profileKey();
  const store = JSON.parse(localStorage.getItem(key) || "{}");
  store[name] = JSON.parse(JSON.stringify(state.values));
  localStorage.setItem(key, JSON.stringify(store));
  refreshProfiles();
  sel.value = name;
  toast(t("profile_saved").replace("{name}", name), "ok");
}

function deleteProfile() {
  const sel = $("profile-select");
  const key = profileKey();
  if (!key || !sel.value) return;
  const removed = sel.value;
  const store = JSON.parse(localStorage.getItem(key) || "{}");
  delete store[removed];
  localStorage.setItem(key, JSON.stringify(store));
  refreshProfiles();
  toast(t("profile_deleted").replace("{name}", removed));
}

function loadProfile(name) {
  const key = profileKey();
  if (!key || !name) return;
  const store = JSON.parse(localStorage.getItem(key) || "{}");
  if (!store[name]) return;
  state.values = JSON.parse(JSON.stringify(store[name]));
  render(state.device);
  toast(t("profile_loaded").replace("{name}", name), "ok");
}

/* ---------- i18n: static translation + switcher ---------- */

function translateStatic() {
  document.documentElement.lang = lang;
  $("profiles-label").textContent = t("profiles");
  $("lang-label").textContent = t("language");
  $("profile-save").textContent = t("save");
  $("profile-delete").textContent = t("deletebt");
  $("btn-docs").textContent = t("docs");
  $("btn-revert").textContent = t("revert");
  $("btn-apply").textContent = t("apply");
  document.querySelector(".auto-apply span").textContent = t("auto_apply");
  refreshProfiles();
  renderNav();
}

function initLang() {
  translateStatic();
  const sel = $("lang-select");
  sel.value = lang;
  const pop = $("settings-pop");
  const toggle = $("settings-toggle");
  toggle.addEventListener("click", (ev) => {
    ev.stopPropagation();
    pop.classList.toggle("open");
  });
  document.addEventListener("click", (ev) => {
    if (pop.classList.contains("open") && !pop.contains(ev.target)) {
      pop.classList.remove("open");
    }
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") pop.classList.remove("open");
  });
  sel.addEventListener("change", () => {
    lang = sel.value;
    localStorage.setItem("lang", lang);
    translateStatic();
    if (state.page === "devices") {
      render(null);
      renderDeviceList($("device-search") ? $("device-search").value : "");
    } else if (state.device) {
      render(state.device);
    }
    if (!state.device) setStatus("", t("status_searching"), " ");
  });
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
  initLang();
  const cat = await bridge({ op: "devices" });
  state.catalog = cat.catalog || [];
  if (!state.device) setStatus("", t("status_searching"), " ");
  render(null);
  detectLoop(true);
  setInterval(() => detectLoop(false), 4000);

  const statusCard = $("device-status");
  statusCard.addEventListener("click", () => {
    state.page = "devices";
    render(null);
    renderDeviceList("");
  });
  statusCard.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      state.page = "devices";
      render(null);
      renderDeviceList("");
    }
  });
  $("btn-apply").addEventListener("click", apply);
  $("btn-revert").addEventListener("click", revert);
  $("profile-save").addEventListener("click", saveProfile);
  $("profile-delete").addEventListener("click", deleteProfile);
  $("profile-select").addEventListener("change", (e) => loadProfile(e.target.value));
}

boot();