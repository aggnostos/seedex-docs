# seedex-agent

Эта страница описывает, как устроен репозиторий seedex-agent и как его собирать и линтить.

## Требования

* Go 1.22 для сборки API link.
* shfmt 3.13 и shellcheck 0.11 для линта.
* Сервер на Ubuntu 24.04, чтобы установить сборку.

## Структура проекта

* `sdx`: команда: диспетчер, статус, help и firewall.
* `lib/common.sh`: общие помощники: фаервол, systemd и логирование.
* `lib/vpn.sh`, `lib/proxy.sh` и `lib/link.sh`: по библиотеке на сервис. `vpn.sh` загружает модули протоколов из `lib/vpn/` и передаёт им действия.
* `lib/vpn/awg.sh` и `lib/vpn/wg.sh`: модули VPN-протоколов. Каждый определяет функции `vpn_<proto>_<action>`; оба опираются на `lib/wireguard.sh`, общий код семейства WireGuard, а `awg.sh` добавляет параметры обфускации и установку из PPA.
* `link/main.go`: API link: `GET /v1/configs` и `POST /v1/run`.
* `install.sh`: скрипт, который запускают пользователи. Он скачивает релиз, если запущен не из клона.
* `version`: версия.

## Сборка

Выполните команду:

```sh
make build
```

Команда собирает `seedex-link` для amd64 и arm64 в `build/` вместе с тарболом релиза и `checksums.txt`.

Чтобы установить сборку на сервер, скопируйте `sdx`, `version`, `lib`, `install.sh` и `build` на сервер и выполните там `bash install.sh files`. Режим `files` обновляет скрипты и бинарник существующей установки.

## Линт

`make lint` прогоняет shfmt и shellcheck по shell-файлам, а `gofmt` и `go vet` — по коду на Go.
