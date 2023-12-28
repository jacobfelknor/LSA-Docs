# Comparison of Network Storage Types

Recently, I became interested in comparing the different types of network storage and their use cases. The three fundamental types of network storage I'm referring to are filesystem, object, and block level storage. These notes will not go into significant low-level detail, but should serve as a quick guide on when to use each type.

It should be noted that this comparison is not specific to their network versions. However, my research began when comparing iSCSI (block) to NFS (filesystem) options for connecting network storage to a VM.

These notes adapted from [this StackExchange post](https://serverfault.com/a/672035)

## Filesystem Storage

Examples of network filesystem storage are NFS and SMB/CIFS ("samba", windows network shares, etc). These sorts of network storage are best used when you'd like to make a shared filesystem available to guests on your network. The keyword here is ***filesystem***. The clients connecting to this type of storage expect the volume it sits on to be pre-formatted and a filesystem already built on top of it.

It short, this sort of storage can be used when applications are expecting a filesystem, yet you'd like to share that filesystem across multiple nodes. For example, you may want to create your `$HOME` directory on top of an NFS share on linux so that it is available on multiple machines you may login to.

## Object Storage

In contrast, object storage provides means to store files, or other binary blobs, in some remote location available to multiple clients. At first glance, ths may sound the same as network filesystem storage, however there is a key difference: no true filesystem is exposed via this connection. This means typical file operations - like opening a file and making edits inside an application - aren't optimized to happen in this setting. Instead, the files/blobs in object storage are typically static and in a final state. If their contents need to change frequently, filesystem storage may be a better option.

In short, this type of storage is ideal for static, archival purposes. For example, a media company may use object storage to store their media collection.

## Block Storage

Finally, block storage is the "lowest level" version of the three. It provides storage that, to the client, looks like a raw attached disk. This provides maximum flexibility to the client to do with the raw storage what it wishes. If it wants to format the volume an make a filesystem on top of it, it can. If it wants to use the raw storage in some other way, it can.

In short, block storage is ideal when maximum flexibility is required, and when the client should be able to partition or format the storage as it wants to.