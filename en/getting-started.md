# Getting started

This page takes you from a plain router to one that sends its traffic through servers you own. Seedex works with any WireGuard (WG), AmneziaWG (AWG), or sing-box server: bring the client configs you already have, or set up a server with seedex-agent and let the router pull its configs from there.

## Before you begin

You need the following:

* A router running OpenWrt 24.10.2 or later with outbound internet access.
* A server: any WG, AWG, or sing-box server with its client configs, or a server running Ubuntu 24.04 or later with a public IP address and root access for seedex-agent.

## Install seedex-box

On the router, run the installer as root:

```sh
wget -O - https://aggnostos.github.io/seedex-openwrt/install.sh | sh
```

The installer adds the Seedex package feed and installs `seedex-box` and `luci-app-seedex` for LuCI. Nothing is started until you apply the first config. To skip LuCI, run the installer with `| sh -s -- --no-luci`.

## Use your own servers

If you already have a server, the router takes what its clients use: a WG or AWG `.conf` file, a sing-box `.json` file, or a share link such as `vless://...`.

1. Copy the config files to the router, or keep the links at hand.

2. Import them:

   ```sh
   sdx import awg.conf
   sdx import wg.conf
   sdx import sing-box.json
   sdx import 'vless://...'
   ```

   The file name becomes the config name, and a link brings its own name. A directory imports every config in it, and a text file with one link per line imports every link.

3. Apply the changes:

   ```sh
   sdx apply
   ```

   The command saves the configs and starts the services: the tunnels come up, and the router and DNS services start with them.

Skip to [Check the status](#check-the-status). Several configs are fine: the router routes through the fastest live tunnel and moves the traffic when a tunnel fails.

## Install seedex-agent

If you have a server but nothing on it yet, seedex-agent sets it up.

1. On the server, run the installer as root:

   ```sh
   wget -O - https://github.com/aggnostos/seedex-agent/releases/latest/download/install.sh | bash
   ```

   The installer downloads the latest release and installs the `sdx` command, AWG, WG, sing-box, and the Link API binary. It generates the server keys, opens the ports, and enables the services. Nothing is started yet. To update later, run the same command again.

2. Add VPN clients for the router and a proxy protocol. For example, an AWG client, a WG client, and VLESS Reality on port 443. On a network that filters WG, such as in Russia, only the AWG client works; the router picks the fastest live tunnel by itself:

   ```sh
   sdx vpn add awg router
   sdx vpn add wg router
   sdx proxy add vless 443
   ```

3. Start the services:

   ```sh
   sdx start
   ```

   The services are not running until you start them. `sdx start` brings up every protocol that has a client or a port, so run it after the first `add`; a protocol added later starts with `sdx vpn start` or `sdx proxy start`.

4. Pair a router:

   ```sh
   sdx link add router
   ```

   The command prints the token, the certificate fingerprint, and one line to run on the router. Keep the output. The token is shown once.

## Connect the router to seedex-agent

1. On the router, paste the line that the server printed:

   ```sh
   sdx link add agent https://203.0.113.5:8447 <token> <fingerprint>
   ```

   The command opens a menu with the configs that the server offers. Move with the arrow keys, toggle a config with Space, and confirm with Enter. The router imports the selected configs as pending changes.

2. Apply the changes:

   ```sh
   sdx apply
   ```

   The command saves the configs and starts the services: the tunnels come up, and the router and DNS services start with them.

From then on, the router pulls the configs from the server by itself, and `sdx link agent ...` runs the server's `sdx` from the router.

## Check the status

Run `sdx`:

```
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
    [ ] wg          324 ms

[*] Proxy:
  Configs:
    [*] anytls      286 ms
    [ ] vless

[*] DNS:
  Upstream:   encrypted
  Resolver:   cloudflare
  Intercept:  on

Link:
  [*] admin        https://203.0.113.5:8447         2 vpn, 2 proxy, 4 min ago
```

The **Uplink** section shows the tunnel that carries the traffic. A running service is marked `[*]`.

## Troubleshoot

If the router doesn't route traffic, use:

* `sdx logs` to see the service logs.
* `sdx restart` to restart services in the right order.

## Where to go next

* [seedex-box](user-guide/seedex-box.md) covers rules, DNS settings, and LuCI.
* [seedex-agent](user-guide/seedex-agent.md) covers clients, protocols, and rotation.
