# Enabling Nested Virtualization for a Windows Guest

By default, nested virtualization may not work for windows guest machines. The following tends to fix this.

Shutdown the guest. In the CPUs section of the VM settings, uncheck the "Copy host CPU configuration" setting. Two options follow. I've seen better performance from the first one

1. Option 1
    - choose `host-passthrough` for the CPU model
    - Manually set CPI topology.
        - sockets=1, cores=x, threads=2, where x is the number of cores you want

2. Option 2
    - Pick the version of the default CPU that ends with `-noTSX-IBRS`
    - In the XML, ensure the `<cpu>` section looks something like this

    ```xml
    <cpu mode="custom" match="exact" check="partial">
        <model fallback="allow">Haswell-noTSX-IBRS</model>
        <feature policy="disable" name="hypervisor"/>
        <feature policy="require" name="vmx"/>
    </cpu>
    ```
3. Restart the machine and see if it worked
