# Offline Docker

Sometimes it is required to be in an offline environment to meet compliance or other policies. In order to bring images to a machine disconnected from any network, we must create tarballs of all images we need to bring with us.

## Pre-requisites

Pull any required images you wish to bring offline on a computer connected to the network.

## Docker Save

Next, we can use `docker save` to generate a tarball of each image we wish to bring.

```bash
docker save -o <image_as_tar_filename> <image_name>
```

Get these files (plus any compose files, if needed) to the offline environment using the technique of choice (i.e USB stick).

## Docker Load

Once in offline environment, you can load these saved images back into Docker with the following

```bash
docker load -i <image_as_tar_filename>
```

At this point, you should have all necessary images to run your application.
