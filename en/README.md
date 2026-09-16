# Seedex

Seedex turns an OpenWrt router into the secure privacy layer of a home network. All traffic leaves through tunnels to servers that you own, nobody along the way reads your DNS queries, and you decide per domain, per list, or per device where traffic goes.

## Parts

Seedex consists of two parts:

* **seedex-openwrt** is the router side: the `sdx` command, the services, and a LuCI app. The source is at [github.com/aggnostos/seedex-openwrt](https://github.com/aggnostos/seedex-openwrt).
* **seedex-agent** is the server side: one command turns an Ubuntu server into the far end of the tunnels. The source is at [github.com/aggnostos/seedex-agent](https://github.com/aggnostos/seedex-agent).

## seedex-box modules

* **VPN**: AmneziaWG tunnels. The router keeps traffic on the fastest live tunnel.
* **Proxy**: A sing-box tunnel built from your proxy configs. sing-box picks the best outbound itself.
* **Router**: The policy. It decides what goes through a tunnel, what goes straight to the provider, and what is blocked, by domain, by list, or by device. A kill switch covers the moments when no tunnel is up.
* **DNS**: A private resolver for the whole network, with an encrypted upstream and interception of devices that resolve on their own.
* **Link**: The connection to [seedex-agent](https://github.com/aggnostos/seedex-openwrt). The router pulls its configs from the server and manages the server remotely.

## seedex-agent modules

* **VPN**: An AmneziaWG server with obfuscation parameters generated for each installation.
* **Proxy**: A sing-box server with the protocols that you pick: VLESS Reality, Trojan, Shadowsocks, ShadowTLS, VMess, Hysteria2, TUIC, and AnyTLS.
* **Link**: The API that the router pairs with.

## Where to go next

* [Getting started](getting-started.md) walks you through installing the server and the router.
* [User guide](user-guide/README.md) describes every `sdx` command on the router and on the server, and the LuCI app.
* [Developer guide](developer-guide/README.md) covers the project structure, building, and linting.
