# rivalcfgUI — План

Стильный GUI для rivalcfg, работает со всеми поддерживаемыми мышами через data-driven UI,
сгенерированный из профилей самой библиотеки rivalcfg.

## Стек
Electron (main.js + preload.cjs по образцу GalaxyWF) + vanilla JS, без сборщика —Electron грузит src/index.html напрямую. Бэнд-слой: python3 + rivalcfg CLI(уже установлен system-wide).

## Архитектура
- `main.js` — окно, IPC (exec bridge, открытие ссылок)
- `preload.cjs` — contextBridge API
- `bridge/rivalcfg_bridge.py` — одиночный процесс-хелпер: сохранённый каталог устройств (`src/data/devices.json`, сгенерирован из библиотеки), определение подключённой мыши, вызовы rivalcfg CLI
- `src/` — UI: сайдбар (статус мыши, профили), страница настроек, генерируется по `value_type` каждого параметра:
  - sensitivity / multidpi_* → редактор DPI-пресетов
  - choice → селект; range → слайдер
  - rgbcolor → цвет;
 rgbgradient → эффект+градиент
  - buttons → маппинг кнопок
- Применение: собрать изменённые параметры → ОДИН вызов rivalcfg CLI со всеми ключами

## Статус
- [x] Каталог 76 продуктов (30+ моделей) выгружен в src/data/devices.json
- [x] Каркас Electron+без build
- [ ] Форк на GitHub stark1ng/rivalcfg (ждётRoman: Create fork по https://github.com/flozz/rivalcfg/fork)
- [ ] Push: SSH-ключ id_ed25519.pub не добавлен в аккаунт (github.com/settings/keys)
- [ ] Иконка/hero-арт: gpt-image-2.5 medium 1k (openrouter)