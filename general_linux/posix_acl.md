# POSIX ACL for Granular Filesystem Permissions

In Linux, the basic permission system is fairly easy to understand and can handle a majority of cases where we need to set permissions. It is based on three fundamental categories:

1. User Permissions
2. Group Permissions
3. World/Other Permissions

We can set the permission level for each one of these categories independently. For example, we could make a file we own read/write/execute for us, read/execute for group, and just execute for world.

## Octal Values

Default linux permissions rely on 3 numbers to encode the permission level of the file. Together, these are called "octal values" and each permission is assigned a different "weight":

- r (read): 4
- w (write): 2
- x (execute): 1

To get the permission level for a particular category, you add up the "weights" for the permissions you'd like to permit and assign that category that number. To cover the 3 main categories, we get a 3 digit number, where the first digit describes the user permission, the second describes the group permission, and the third describes the world/other permissions.

The command `chmod 751 /path/to/file` encodes the permissions I described earlier: read/write/execute for user, read/execute for group, and just execute for world.

## SUID, SGID, and Sticky Bit

There is a "hidden" digit that can be pre-pended to our octal value that can control other properties of how permissions on files and the processes they create. For now, I leave this as further reading. See <https://www.redhat.com/sysadmin/suid-sgid-sticky-bit>

## Filesystem ACL

The basic filesystem permissions described above can cover most cases. However, sometimes a more granular permission system is required to achieve the desired results. In this example, I will show a particular case in which I needed an ACL, but there is so much more possible. For a more detailed explanation, see <https://www.redhat.com/sysadmin/linux-access-control-lists>.

Another helpful post on this topic: <https://www.cs.swarthmore.edu/newhelp/sharing_files.html#:~:text=setfacl%20is%20the%20command%20used,make%20these%20ACLs%20the%20default.>

### Case Example

In my case, I needed a specific directory to be group read/writeable for all members of the particular group. Any user in this group must be able to create files within that directory, and any other user must be able to read, write, or delete the file that the first user left for them.

You may be thinking, "Why can't we just set the group read/write permission on the directory and be done?". This is where I initially started, however it became clear quickly that this was inadequate. When the first user wrote a file to this directory, it was created in a manner that only they could write/delete it, because that file was created with `755` permissions and had `exampleuser:exampleuser` ownership.

#### SGID

My first idea was to set `SGUI` on the directory and give it group rw (`chmod 2775`). This is one of those "special permissions" I was describing before and left to further reading. It mandates that any new files created within this directory be assigned to the same group and the directory. This got me part of the way there.... Any new files my `exampleuser` created inside this directory now had `exampleuser:examplegroup` ownership, but still had `755` permissions, meaning the group could read/execute but not write.

#### umask

The default permissions a file gets when a user creates it is controlled by the `umask` for that particular user. By default, most distributions set `umask 022`, which results in the `755` file permission observed before. The `umask` value is a global settinga and does not depend on where a file is created, so in my case it was not appropriate to modify this.

#### ACL to the Rescue

Finally, we get to my solution. It was possible for me to set a POSIX ACL for the particular directory achieving what I wanted.

```bash
# set the default ACL for this and any sub-directories, so newly created files take on these permissions
# omit -R if you don't want to do this recursively
setfacl -R -d -m group:GROUPNAME:rw /path/to/directory
# set the ACL for existing files
# omit -R if you don't want to do this recursively
setfacl -R -m group:GROUPNAME:rw /path/to/directory
```

Now, in combination with setting `SGID` on the parent directory (`chmod g+s`), any new files created in this directory will have `exampleuser:examplegroup` ownership with `664` permissions.

## Further Research

There is still more I want to understand here. It feels like the default ACL is also influenced by the permissions of the parent folder. I'm still uncertain exactly how to wrangle all the perms the way I want to, but I got to where I needed to for the time being.
