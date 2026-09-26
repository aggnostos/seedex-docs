# Seedex

Seedex is a simple but flexible tool that turns an OpenWrt router into a privacy layer for the home network. It can send traffic selected by its routing policy through WireGuard, AmneziaWG, or sing-box tunnels.

## Parts

Seedex consists of two parts:

* **Seedex OpenWrt** is the router side: VPN and proxy, policy routing, and encrypted DNS, managed with a single command or the LuCI app. It works with any WireGuard, AmneziaWG, or sing-box server. Source code: [github.com/aggnostos/seedex-openwrt](https://github.com/aggnostos/seedex-openwrt).
* **Seedex Agent** is the server side: one command installs WireGuard, AmneziaWG, sing-box, and the Link API on an Ubuntu server. You then add the clients or proxy protocols that you want to use. The client configs are native files of supported protocols, so any device with the usual apps can use the same server. Source code: [github.com/aggnostos/seedex-agent](https://github.com/aggnostos/seedex-agent).

## seedex-box modules

* **VPN**: WG and AWG tunnels. The router keeps traffic on the fastest live tunnel.
* **Proxy**: A sing-box tunnel built from your proxy configs. sing-box picks the best outbound itself.
* **Router**: Policies that decide what goes through an overlay tunnel, what goes straight to the provider, and what is blocked by domain, list, or device. A kill switch drops overlay traffic when no overlay tunnel is up.
* **DNS**: A private resolver for the whole network, with an encrypted upstream and interception of standard DNS requests from devices that use their own resolver.
* **Link**: The connection to [seedex-agent](https://github.com/aggnostos/seedex-agent). The router pulls its selected configs from the server and runs a restricted set of server actions remotely.

## seedex-agent modules

* **VPN**: WG and AWG server with obfuscation parameters generated for each installation.
* **Proxy**: A sing-box server with the protocols that you pick: VLESS Reality, Trojan, Shadowsocks, ShadowTLS, VMess, Hysteria2, TUIC, and AnyTLS.
* **Link**: The API that the router pairs with.

## Where to go next

* [Getting started](getting-started.md) walks you through installing the server and the router.
* [User guide](user-guide/README.md) describes every `sdx` command on the router and on the server, and the LuCI app.
* [Developer guide](developer-guide/README.md) covers the project structure, building, and linting.
