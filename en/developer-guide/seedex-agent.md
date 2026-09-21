# seedex-agent

This page describes how the seedex-agent repository is laid out and how to build and lint it.

## Requirements

* Go 1.22, to build the Link API.
* shfmt 3.13 and shellcheck 0.11, for the lint.
* A server running Ubuntu 24.04, to install a build.

## Project structure

* `sdx`: The command: dispatch, status, help, and firewall.
* `lib/common.sh`: Shared helpers: firewall, systemd, and logging.
* `lib/vpn.sh`, `lib/proxy.sh`, and `lib/link.sh`: One library per service. `vpn.sh` loads the protocol modules from `lib/vpn/` and dispatches to them.
* `lib/vpn/awg.sh` and `lib/vpn/wg.sh`: VPN protocol modules. Each defines `vpn_<proto>_<action>` functions; both delegate to `lib/wireguard.sh`, the shared WireGuard-family code, and `awg.sh` adds the obfuscation parameters and the PPA install.
* `link/main.go`: The Link API: `GET /v1/configs` and `POST /v1/run`.
* `install.sh`: The script that users run. It downloads the release when it isn't run from a checkout.
* `version`: The version.

## Build

Run the following command:

```sh
make build
```

The command builds `seedex-link` for amd64 and arm64 into `build/`, together with the release tarball and `checksums.txt`.

To install the build on a server, copy `sdx`, `version`, `lib`, `install.sh`, and `build` to the server and run `bash install.sh files` there. The `files` mode updates the scripts and the binary of an existing installation.

## Lint

`make lint` runs shfmt and shellcheck over the shell files, and `gofmt` and `go vet` over the Go code.
