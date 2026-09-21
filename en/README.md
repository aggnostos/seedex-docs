# Seedex

Seedex is a secure network privacy layer for OpenWrt routers: VPN and Proxy, convenient routing, secured DNS, managed with a single command or the LuCI app, along with a self-hosted VPN and proxy server.

## Parts

Seedex consists of two parts:

* **Seedex OpenWrt** is a secure network privacy layer for OpenWrt routers: VPN and proxy, convenient routing, secured DNS, managed with a single command or the LuCI app. It works with any WireGuard (WG), AmneziaWG (AWG), or sing-box server. The source is at [github.com/aggnostos/seedex-openwrt](https://github.com/aggnostos/seedex-openwrt).
* **Seedex Agent** is the server side: one command turns an Ubuntu server into a VPN and proxy server: AWG, WG, sing-box, and the Link API that the router pulls its configs from. The client configs are native WG, AWG, and sing-box files, so any device with the usual apps can use the same server. The source is at [github.com/aggnostos/seedex-agent](https://github.com/aggnostos/seedex-agent).

## seedex-box modules

* **VPN**: WG and AWG tunnels. The router keeps traffic on the fastest live tunnel.
* **Proxy**: A sing-box tunnel built from your proxy configs. sing-box picks the best outbound itself.
* **Router**: The routing policies that decide what goes through a tunnel, what goes straight to the provider, and what is blocked by domain, list, or device. A kill switch drops traffic when no tunnel is up.
* **DNS**: A private resolver for the whole network, with an encrypted upstream and interception of devices that resolve on their own.
* **Link**: The connection to [seedex-agent](https://github.com/aggnostos/seedex-agent). The router pulls its configs from the server and manages the server remotely.

## seedex-agent modules

* **VPN**: WG and AWG server with obfuscation parameters generated for each installation.
* **Proxy**: A sing-box server with the protocols that you pick: VLESS Reality, Trojan, Shadowsocks, ShadowTLS, VMess, Hysteria2, TUIC, and AnyTLS.
* **Link**: The API that the router pairs with.

## Where to go next

* [Getting started](getting-started.md) walks you through installing the server and the router.
* [User guide](user-guide/README.md) describes every `sdx` command on the router and on the server, and the LuCI app.
* [Developer guide](developer-guide/README.md) covers the project structure, building, and linting.
