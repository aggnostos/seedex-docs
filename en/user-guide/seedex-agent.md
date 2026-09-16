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

* `sdx <service> start`, `stop`, and `restart` control the service. Without a service, `sdx start` starts all three services.

### Server-wide actions

* `sdx firewall setup` configures the firewall for the ports in use, and `sdx firewall status` shows the firewall.
* `sdx version` prints the installed agent version.

## VPN

The VPN service is an AmneziaWG server. The obfuscation parameters are generated for the installation, so no two servers look alike on the wire. Every client gets the same set.

* `sdx vpn` shows whether the service runs, the interface, the port, and the clients.
* `sdx vpn add [<name>]` adds a client. It generates the keys and a preshared key, assigns the next free address, adds a peer to the running interface without restarting it, and writes a client config. Without a name, clients are numbered.
* `sdx vpn remove <name>` revokes a client. `sdx vpn remove --all` revokes every client.
* `sdx vpn config` shows the server's endpoint, public key, and obfuscation parameters.
* `sdx vpn export [<name>] [-o <dir>]` writes the client configs, one or all, as `.conf` files that `sdx import` accepts on the router. With a link, you don't need this: the router pulls the configs itself.
* `sdx vpn rotate` generates server keys and obfuscation parameters again. Every existing client stops working. Add the clients again.

## Proxy

The proxy service is a sing-box server with the protocols that you pick: `vless` (Reality), `trojan`, `shadowsocks`, `shadowtls`, `vmess`, `hysteria2`, `tuic`, and `anytls`.

* `sdx proxy` shows whether the service runs and lists the protocols with their ports.
* `sdx proxy add <protocol> <port>` adds a protocol on a port. It generates the credentials, opens the port, and restarts sing-box.
* `sdx proxy remove <protocol>` removes a protocol and closes its port.
* `sdx proxy config` shows the connection credentials of every protocol.
* `sdx proxy export [<protocol>] [-o <dir>]` writes the client configs, one protocol or all, as `.json` files that `sdx import` accepts on the router.
* `sdx proxy rotate [<protocol>]` generates credentials again for one protocol or for all protocols. The ports don't change.

## Link

The link service is the API that the router pairs with. The router pulls its configs from it and runs `sdx` on the server through it.

* `sdx link` shows whether the service runs, the port, the certificate fingerprint, and the paired routers.
* `sdx link add <router>` pairs a router. It issues a token and prints the token, the fingerprint, and the exact `sdx link add` command for the router. The token is shown once.
* `sdx link remove <router>` unpairs a router. Its token stops working.
* `sdx link rotate` generates the API certificate again. Every router must pair again with the resulting fingerprint.
