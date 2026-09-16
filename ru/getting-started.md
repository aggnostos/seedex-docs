# Начало работы

Эта страница проводит от двух пустых машин до роутера, который отправляет трафик через ваш собственный сервер.

## Перед началом

Вам понадобится:

* Сервер на Ubuntu 24.04 с публичным IP-адресом и правами root.
* Роутер на OpenWrt 24.10.2 или новее с выходом в интернет.

{% hint style="info" %}
Любой другой сервер AmneziaWG или sing-box тоже подойдёт. Роутер принимает их родные клиентские конфиги через `sdx import`. Шаги на этой странице описывают seedex-agent.
{% endhint %}

## Установите seedex-agent

1. На сервере запустите установщик от root:

   ```sh
   wget -O - https://github.com/aggnostos/seedex-agent/releases/latest/download/install.sh | bash
   ```

   Установщик скачивает последний релиз и устанавливает `sdx`, AmneziaWG, sing-box и бинарный файл Link API. Он генерирует ключи сервера, открывает порты и включает сервисы. Чтобы обновиться позже, запустите ту же команду ещё раз.

2. Запустите сервисы:

   ```sh
   sdx start
   ```

3. Добавьте прокси-протокол. Например, VLESS Reality на порту 443:

   ```sh
   sdx proxy add vless 443
   ```

4. Добавьте роутер:

   ```sh
   sdx link add router
   ```

   Команда печатает токен, отпечаток сертификата и одну строку для роутера. Сохраните вывод. Токен показывается один раз.

## Установите seedex-box

1. На роутере запустите установщик от root:

   ```sh
   wget -O - https://aggnostos.github.io/seedex-openwrt/install.sh | sh
   ```

   Установщик подключает фид пакетов Seedex, ставит `seedex-box` и `luci-app-seedex` для LuCI. Сервисы запускаются с первым конфигом. Чтобы обойтись без LuCI, запустите установщик с `| sh -s -- --no-luci`.

2. Вставьте строку, которую напечатал сервер:

   ```sh
   sdx link add agent https://203.0.113.5:8447 <token> <fingerprint>
   ```

   Команда открывает меню с конфигами, которые предлагает сервер. Перемещайтесь стрелками, отмечайте конфиг пробелом и подтвердите Enter. Роутер импортирует выбранные конфиги, поднимает туннели и вместе с ними запускает сервисы Router и DNS.

3. Проверьте статус:

   ```
   $ sdx
   seedex v0.1.0

   Uplink:
     [*] Internet             118 ms
     [*] Overlay (anytls)     286 ms

   [*] Router:
     Routing:      overlay
     Kill switch:  on
     Watchdog:     every 30s
     Rules:
       [*] ads                block    list
       [*] tv                 direct   1 client

   [*] VPN:
     Configs:
       [ ] awg         362 ms

   [*] Proxy:
     Configs:
       [*] anytls      286 ms
       [ ] vless

   [*] DNS:
     Upstream:   encrypted
     Resolver:   cloudflare
     Intercept:  on

   Link:
     [*] agent        https://203.0.113.5:8447         1 vpn, 2 proxy, 4 min ago
   ```

   Раздел **Uplink** показывает туннель, который несёт трафик. Работающий сервис отмечен `[*]`.

## Если что-то не работает

Если роутер не маршрутизирует трафик используйте:

* `sdx logs` для просмотра сервисных логов.

* `sdx restart` для перезапуска сервисов в правильном порядке.
## Что дальше

* [seedex-box](user-guide/seedex-box.md) описывает правила, настройки DNS и LuCI.
* [seedex-agent](user-guide/seedex-agent.md) описывает клиентов, протоколы и ротацию.
