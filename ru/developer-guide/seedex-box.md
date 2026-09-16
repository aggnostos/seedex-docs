# seedex-box

Эта страница описывает, как устроен репозиторий seedex-openwrt и как его собирать и линтить.

## Требования

* Docker для сборки. В нём работает apk-tools, который собирает пакеты.
* shfmt 3.13 и shellcheck 0.11 для линта.
* Роутер на OpenWrt 24.10.2 или новее, чтобы установить сборку.
* По желанию — ключи подписи: ключ apk в `~/.seedex/apk-sign.key` и пара usign в `~/.seedex/opkg-sign.key` и `opkg-sign.pub`. Без них пакеты не подписаны, и `install.sh` ставит их без проверки подписи.

## Структура проекта

`seedex-box/files/` содержит пакет роутера:

* `usr/bin/sdx`: команда: диспетчер, статус и help.
* `usr/bin/seedex-router-watchdog`: пробует туннели и переключает overlay.
* `usr/lib/seedex/common.sh`: общие помощники: UCI, наборы nftables, пробы и строки статуса.
* `usr/lib/seedex/service.sh`: общее для всех сервисов: записи, apply, enable и import.
* `usr/lib/seedex/vpn.sh`, `proxy.sh`, `router.sh` и `dns.sh`: по библиотеке на сервис.
* `usr/lib/seedex/link.sh`: линк: соединение, синхронизация, выбор и удалённые команды.
* `etc/init.d/seedex`: сервис-зонтик, который запускает остальные по порядку.
* `etc/init.d/seedex-*`: по procd-сервису на модуль.
* `etc/config/seedex-*`: документированные UCI-конфиги, по умолчанию пустые.
* `etc/hotplug.d/net/50-seedex-proxy`: подключает интерфейс proxy, когда sing-box его поднимает.

`seedex-box/package/` содержит скрипты apk для установки, обновления и удаления.

`luci-app-seedex/files/` содержит приложение для LuCI:

* `usr/libexec/rpcd/luci.seedex`: rpcd-бэкенд, с которым говорит LuCI. Он запускает `sdx`.
* `www/luci-static/resources/seedex/api.js`: JavaScript-клиент бэкенда и общие виджеты.
* `www/luci-static/resources/view/seedex/*.js`: по представлению на вкладку.

На верхнем уровне `build.sh` собирает пакеты, `install.sh` — скрипт, который запускают пользователи, `version` хранит версию.

## Сборка

Выполните команду:

```sh
make build
```

Команда собирает `seedex-box` и `luci-app-seedex` в `build/noarch/` как `.apk` для OpenWrt 25.x и `.ipk` для 24.10, вместе с обоими индексами фида, и кладёт публичные ключи в `build/keys/`.

Чтобы установить сборку на роутер, скопируйте `install.sh`, `build/keys` и `build/noarch` на роутер и выполните там `sh install.sh noarch/*.apk`, а на 24.10 — `sh install.sh noarch/*.ipk`.

## Линт

`make lint` прогоняет shfmt и shellcheck по всем shell-файлам.
