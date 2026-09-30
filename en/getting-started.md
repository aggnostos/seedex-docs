# Getting started

This page takes you from a plain router to one that sends its traffic through servers you own. Seedex works with any WireGuard (WG), AmneziaWG (AWG), or sing-box server: bring the client configs you already have, or set up a server with seedex-agent and let the router pull its configs from there.

## Before you begin

You need the following:

* A router running OpenWrt 24.10.2 or later with outbound internet access.
* A server: any WG, AWG, or sing-box server with its client configs, or a server running Ubuntu 24.04 or later with a public IP address and root access for seedex-agent.

Minimum router requirements (provisional): **256 MB RAM** and **100 MB of free storage** for package installation.

Choose how to configure the router: [CLI](#cli) or [LuCI](#luci).

## CLI

### Install seedex-box

On the router, run the installer as root:

```sh
wget -O - https://feed.seedex.net/install.sh | sh
```

The installer adds the Seedex package feed and installs `seedex-box` and `luci-app-seedex` for LuCI. Nothing is started until you apply the first config. To skip LuCI, run the installer with `| sh -s -- --no-luci`.

### Use your own servers

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

### Install seedex-agent

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

### Connect the router to seedex-agent

1. On the router, paste the line that the server printed:

   ```sh
   sdx link add agent https://203.0.113.5:8282 <token> <fingerprint>
   ```

   The command opens a menu with the configs that the server offers. Move with the arrow keys, toggle a config with Space, and confirm with Enter. The router imports the selected configs as pending changes.

2. Apply the changes:

   ```sh
   sdx apply
   ```

   The command saves the configs and starts the services: the tunnels come up, and the router and DNS services start with them.

From then on, the router pulls the configs from the server by itself, and `sdx link agent ...` runs the server's `sdx` from the router.

### Check the status

Run `sdx`:

```
Uplink:
  [*] Internet             118 ms
  [*] Overlay (anytls)     286 ms

[*] Router:
  Routing:      overlay
  Kill switch:  on
  Watchdog:     fastest
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
    [ ] vless       311 ms

[*] DNS:
  Upstream:   encrypted
  Resolver:   cloudflare
  Intercept:  on

Link:
  [*] agent        https://203.0.113.5:8282         2 vpn, 2 proxy, 4 min ago
```

The **Uplink** section shows the tunnel that carries the traffic. A running service is marked `[*]`.

### Troubleshoot

If the router doesn't route traffic, use:

* `sdx logs` to see the service logs.
* `sdx restart` to restart services in the right order.

## LuCI

Configure the router through its web interface.
Installing packages requires SSH; preparing the server requires its console.

### Install seedex-box

On the router, run the installer as root:

```sh
wget -O - https://feed.seedex.net/install.sh | sh
```

The installer adds the Seedex feed, installs `seedex-box` and `luci-app-seedex`.
After installation, open the router's web interface, then go to **Services > Seedex**.

### Use your own servers

If you already have a server, the router takes what its clients use: a WG or AWG `.conf` file, a sing-box `.json` file, or a share link such as `vless://...`.

1. Open the router's web interface, then go to **Services > Seedex**.
2. For WG or AWG, open **VPN > Add config**. Enter a config name in **File name**,
   paste the `.conf` file contents into **Contents**, then click **Import**.
3. For a proxy, open **Proxy > Add config**. Paste a `vless://...` link or a sing-box JSON
   config into **Contents**. For JSON, fill in **File name**; a link provides its own name.
   Click **Import**.
4. Click **Apply** under **Unsaved changes** on each tab where you added configs:
   **VPN**, **Proxy**. This saves the settings and starts the tunnels. Router and DNS start automatically.

You can also upload an existing file through **System > Import config > Import**.
After uploading, apply the changes on the **VPN** or **Proxy** tab.
Use **Apply** within Seedex: OpenWrt's standard **Save & Apply** does not see these changes.

Skip to [Check the status](#check-the-status-1). Several configs are fine: the router routes through the fastest live tunnel and moves the traffic when a tunnel fails.

### Install seedex-agent

Complete this step in the server console.

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

### Connect the router to seedex-agent

1. Open **Services > Seedex > Link**, then click **Add link**.
2. Enter a connection name in **Name**, for example `agent`.
   Fill in **URL**, **Token**, **Fingerprint** using the values printed by `sdx link add router`
   on the server. Click **Add**.
3. In the dialog that opens, select the configs you need or **Import everything the server offers**.
   Click **Save**.
4. Open the **VPN** and **Proxy** tabs where configs were imported.
   Click **Apply** under **Unsaved changes** on each tab.
   The tunnels start along with Router and DNS.


From then on, the router pulls configs from the server automatically.

### Check the status

Open **Services > Seedex > Status**.

The **Uplink** section shows the tunnel that carries the traffic.
A running service is marked `[*]`.

### Troubleshoot

Open **Services > Seedex > System**. Under **Logs**, select a service, then click **Refresh**.
To restart a service, click its **Restart** button on the **Status** tab.

## Where to go next

* [seedex-box](user-guide/seedex-box.md) covers rules, DNS settings, and LuCI.
* [seedex-agent](user-guide/seedex-agent.md) covers clients, protocols, and rotation.
