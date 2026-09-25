# seedex-agent

This page describes the `sdx` command on the server.

## The `sdx` command

`sdx` on the server is built around three services—`vpn`, `proxy`, and `link`—and follows the same pattern as on the router:

* `sdx` shows the status of the server.
* `sdx <service>` shows the status of one service.
* `sdx <service> <action>` runs one action on one service.
* `sdx <action>` runs the same action on every service that has it.
* `sdx <service> help` lists the actions of a service.

You can also run every command on this page from the router as `sdx link <name> ...`.

### Actions of every service

* `sdx <service> start`, `stop`, and `restart` control the service. Without a service, `sdx start` starts all three services. The installer enables the services but doesn't start them, and a VPN protocol doesn't start when its first client is added: run `sdx start` after the first `add`.

### Server-wide actions

* `sdx firewall setup` configures the firewall for the ports in use, and `sdx firewall status` shows the firewall.
* `sdx version` prints the installed agent version.

## VPN

The VPN service runs WireGuard (WG) and AmneziaWG (AWG) servers, one per protocol: `awg` (AWG, with obfuscation parameters generated for the installation so that no two servers look alike on the wire) and `wg` (plain WG, for clients that don't speak AWG). Each protocol has its own port, subnet, and interface, and comes up when its first client is added.

{% hint style="warning" %}
Plain WG is recognized by deep packet inspection: on networks that filter it, the handshake goes through and the tunnel dies seconds later. From Russia and similar networks, use `awg`. Use `wg` on networks without such filtering, or to check a server before its clients are set up.
{% endhint %}

* `sdx vpn` shows whether the service runs and lists the configured protocols with their ports and clients.
* `sdx vpn add <protocol> [<name>]` adds a client. It generates the keys and a preshared key, assigns the next free address, adds a peer to the running interface without restarting it, and writes a client config. The first client also sets the protocol up but doesn't start it. Without a name, clients are numbered.
* `sdx vpn remove <protocol> <name>` revokes a client. `sdx vpn remove <protocol> --all` revokes every client of the protocol.
* `sdx vpn config [<protocol>]` shows the endpoint, public key, and, for `awg`, the obfuscation parameters.
* `sdx vpn export [<protocol> [<name>]] [-o <dir>]` writes the client configs as `.conf` files that `sdx import` accepts on the router. Files are named `<server>-<protocol>-<name>.conf`. With a link, you don't need this: the router pulls the configs itself.
* `sdx vpn rotate [<protocol>]` generates new server keys and, for `awg`, new obfuscation parameters. Every client of the protocol stops working. Add the clients again.
* `sdx vpn start`, `stop`, and `restart` take an optional protocol.

## Proxy

The proxy service is a sing-box server with the protocols that you pick: `vless` (Reality), `trojan`, `shadowsocks`, `shadowtls`, `vmess`, `hysteria2`, `tuic`, and `anytls`.

* `sdx proxy` shows whether the service runs and lists the protocols with their ports.
* `sdx proxy add <protocol> <port>` adds a protocol on a port. It generates the credentials, opens the port, and restarts sing-box, or starts it if it isn't running.
* `sdx proxy remove <protocol>` removes a protocol and closes its port.
* `sdx proxy config` shows the connection credentials of every protocol.
* `sdx proxy export [<protocol>] [-o <dir>]` writes the client configs, one protocol or all, as `.json` files that `sdx import` accepts on the router.
* `sdx proxy export [<protocol>] --link` prints share links instead, for phone and desktop apps. Links for TLS protocols carry `insecure=1` because a link can't hold the certificate; the `.json` form pins it. ShadowTLS has no link form.
* `sdx proxy export [<protocol>] --link --base64` encodes the same links as a subscription body, which is what panels serve. `sdx import` on the router takes it as a file or over HTTP.
* `sdx proxy rotate [<protocol>]` generates credentials again for one protocol or for all protocols. The ports don't change.

## Link

The link service is the API that the router pairs with. The router pulls its configs from it and runs `sdx` on the server through it. It listens on port 8282 unless the installer was given another one:

```sh
SEEDEX_LINK_PORT=9443 wget -O - https://github.com/aggnostos/seedex-agent/releases/latest/download/install.sh | bash
```

The port is written into the systemd unit at that point, so setting the variable later changes nothing.

* `sdx link` shows whether the service runs, the port, the certificate fingerprint, and the paired routers.
* `sdx link add <router>` pairs a router. It issues a token and prints the token, the fingerprint, and the exact `sdx link add` command for the router. The token is shown once.
* `sdx link remove <router>` unpairs a router. Its token stops working.
* `sdx link rotate` generates the API certificate again. Every router must pair again with the resulting fingerprint.
