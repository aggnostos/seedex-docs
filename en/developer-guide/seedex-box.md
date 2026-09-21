# seedex-box

This page describes how the seedex-openwrt repository is laid out and how to build and lint it.

## Requirements

* Docker, for the build. It hosts apk-tools, which builds the packages.
* shfmt 3.13 and shellcheck 0.11, for the lint.
* A router running OpenWrt 24.10.2 or later, to install a build.
* Optionally, signing keys: an apk key in `~/.seedex/apk-sign.key` and a usign key pair in `~/.seedex/opkg-sign.key` and `opkg-sign.pub`. Without them, the packages are unsigned and `install.sh` installs them without signature checks.

## Project structure

`seedex-box/files/` contains the router package:

* `usr/bin/sdx`: The command: dispatch, status, and help.
* `usr/bin/seedex-router-watchdog`: Probes the tunnels and switches the overlay.
* `usr/lib/seedex/common.sh`: Shared helpers: UCI, nftables sets, probes, and status lines.
* `usr/lib/seedex/service.sh`: What every service shares: entries, apply, enable, and import.
* `usr/lib/seedex/vpn.sh`, `proxy.sh`, `router.sh`, and `dns.sh`: One library per service.
* `usr/lib/seedex/vpn/awg.sh` and `wg.sh`: VPN protocol modules. Each defines `vpn_<proto>_detect`, `_validate`, `_endpoints`, `_up`, and `_down`; both delegate to `usr/lib/seedex/wireguard.sh`. The VPN service and the importer find protocols through these modules and don't know their names.
* `usr/lib/seedex/link.sh`: The link: pairing, sync, selection, and remote commands.
* `etc/init.d/seedex`: The umbrella service that starts the others in order.
* `etc/init.d/seedex-*`: One procd service per module.
* `etc/config/seedex-*`: Documented UCI configs, empty by default.
* `etc/hotplug.d/net/50-seedex-proxy`: Attaches the proxy interface when sing-box brings it up.

`seedex-box/package/` contains the apk scripts for installation, upgrade, and removal.

`luci-app-seedex/files/` contains the LuCI app:

* `usr/libexec/rpcd/luci.seedex`: The rpcd backend that LuCI talks to. It runs `sdx`.
* `www/luci-static/resources/seedex/api.js`: The JavaScript client of the backend and the shared widgets.
* `www/luci-static/resources/view/seedex/*.js`: One view per tab.

At the top level, `build.sh` builds the packages, `install.sh` is the script that users run, and `version` holds the version.

## Build

Run the following command:

```sh
make build
```

The command builds `seedex-box` and `luci-app-seedex` into `build/noarch/` as `.apk` for OpenWrt 25.x and `.ipk` for 24.10, together with both feed indexes, and puts the public keys in `build/keys/`.

To install the build on a router, copy `install.sh`, `build/keys`, and `build/noarch` to the router and run `sh install.sh noarch/*.apk` there, or `sh install.sh noarch/*.ipk` on 24.10.

## Lint

`make lint` runs shfmt and shellcheck over every shell file.
