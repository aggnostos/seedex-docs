# Getting started

This page takes you from two empty machines to a router that sends its traffic through your own server.

## Before you begin

You need the following:

* A server running Ubuntu 24.04 with a public IP address and root access.
* A router running OpenWrt 24.10.2 or later with outbound internet access.

{% hint style="info" %}
Any other AmneziaWG or sing-box server works too. The router accepts their native client configs through `sdx import`. The steps on this page assume seedex-agent.
{% endhint %}

## Install seedex-agent

1. On the server, run the installer as root:

   ```sh
   wget -O - https://github.com/aggnostos/seedex-agent/releases/latest/download/install.sh | bash
   ```

   The installer downloads the latest release and installs the `sdx` executable, AmneziaWG, a sing-box, and the Link API binary. It generates the server keys, opens the ports, and enables the services. To update later, run the same command again.

2. Start the services:

   ```sh
   sdx start
   ```

3. Add a proxy protocol. For example, VLESS Reality on port 443:

   ```sh
   sdx proxy add vless 443
   ```

4. Pair a router:

   ```sh
   sdx link add router
   ```

   The command prints the token, the certificate fingerprint, and one line to run on the router. Keep the output. The token is shown once.

## Install seedex-box

1. On the router, run the installer as root:

   ```sh
   wget -O - https://aggnostos.github.io/seedex-openwrt/install.sh | sh
   ```

   The installer adds the Seedex package feed, installs `seedex-box` and `luci-app-seedex` for LuCI. The services start with the first config. To skip LuCI, run the installer with `| sh -s -- --no-luci`.

2. Paste the line that the server printed:

   ```sh
   sdx link add agent https://203.0.113.5:8447 <token> <fingerprint>
   ```

   The command opens a menu with the configs that the server offers. Move with the arrow keys, toggle a config with Space, and confirm with Enter. The router imports the selected configs, brings the tunnels up, and starts the router and DNS services with them.

3. Check the status:

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
     [*] admin        https://203.0.113.5:8447         1 vpn, 2 proxy, 4 min ago
   ```

   The **Uplink** section shows the tunnel that carries the traffic. A running service is marked `[*]`.

## Troubleshoot

If the router doesn't route traffic use:

* `sdx logs` to see the service logs.
* `sdx restart` to restart services in the right order.
## Where to go next

* [seedex-box](user-guide/seedex-box.md) covers rules, DNS settings, and LuCI.
* [seedex-agent](user-guide/seedex-agent.md) covers clients, protocols, and rotation.
