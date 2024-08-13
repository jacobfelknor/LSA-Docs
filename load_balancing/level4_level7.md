# Load Balancers

These are intended to be quick notes that I may expand later....

Recently I was doing some reading on load balancing and the different options for routing and TLS termination.

## Level 4

Operates at the TCP level.

Disadvantages are that it cannot inject headers, inspect messages, or decrypt traffic. Therefore, routing decisions can not be made based on the content of the request, and we must resort to simpler balancing algorithms like round robin.

Advantage is efficiency, since there is no overhead associated with inspecting the traffic. The balance also does not need to handle any certificates, since it is just forwarding raw traffic.

> **NOTE:** routing based on server name with NGINX [may still be possible](https://nginx.org/en/docs/stream/ngx_stream_ssl_preread_module.html) through SNI ([Server Name Indication](https://datatracker.ietf.org/doc/html/rfc6066#section-3)), but I haven't ever tested this.

## Level 7

Operates at the application level.

The typical approach I've done with load balancers/reverse proxies like NGINX.

Disadvantages are that it takes resources to process all the decryption, so traffic is routed slower than at level 4. Additionally, if your backend exists on different servers, you must either proxy to these servers unencrypted (only "acceptable" if behind the proxy on a "trusted" network), or setup additional TLS infrastructure to re-encrypt traffic before it goes out to backend. This is especially necessary if your backend servers are not collocated with the proxy, and may even require another trip over the internet. If the backends exist on an internal network, you can probably get away with a long lived certificate from an internal CA as long as you configure your machines to trust it, though this may not be easier than just obtaining new widely trusted certs.

Advantages are TLS terminates here, so once the traffic is decrypted, I can inspect the request headers and make routing decisions based on this such as server name, URI (serve different routes from different backends), or session token ("sticky" sessions for users, where user will route to same backend over life of session).
