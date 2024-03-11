# SOCKS Tunnel for Web Traffic

This guide is based on a [digital ocean article](https://www.digitalocean.com/community/tutorials/how-to-route-web-traffic-securely-without-a-vpn-using-a-socks-tunnel)

Sometimes it can be useful to forward network traffic through an ssh tunnel. This can be used to secure access to the internet on unsecured networks, or can be used similarly to a VPN to spoof locations.

The specific situation that prompted me to use this method was to allow watching XFINITY stream "in home" channels on the go. Outside of the home network, XFINITY will block many channels. However, if I have a server (in my case, a Raspberry Pi) to tunnel my web traffic through, I can appear to XFINITY to be streaming from my house even when I'm not.

## Command Line Method

You can start a new ssh session like the following to start our SOCKS tunnel.

```bash
ssh -D <port> user@host
```

If you want the tunnel to run in the background and you don't need an interactive session, you can use this version instead.

```bash
ssh -D <port> -f -q -N user@host
```

`-f` specifiies a forking version (i.e in background), `-q` specifies quiet mode (causes all warning and diagnostic messages to be suppressed), and `-N` tells SSH that no command will be sent once the tunnel is up.

If you're on a slow network, you can also do compression by using the `-C` option. However, this can have a negative effect if you have a good connection to the ssh server since CPU cycles will be used to do the compression.

## PuTTY

If you're on Windows and want to use PuTTY, you can specify a dynamic port forward in the tunnels section of the SSH settings.

## Firefox Setup

Any application that can use a SOCKS proxy will work, but Firefox is the example we will use here.

1. In the upper right hand corner, click on the hamburger icon to access Firefox's menu.

2. Click on the Preferences or Options menu item.

3. Scroll to the bottom and under Network Settings select the Settings… button.

4. Under the 'Configure Proxy Access to the Internet' heading select Manual proxy configuration.

5. For the SOCKS Host enter localhost or 127.0.0.1 and for the port, use the custom port specified in your tunnel.

6. Near the bottom, check the box 'Proxy DNS when using SOCKS v5'

7. Click the OK button to save and close your configuration
