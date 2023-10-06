# CTRL-S "Pauses" Session

Sometimes it can be hard to break habits and I find myself using `CTRL-S` by accident inside of `vim` sessions. As a result, the terminal session you're working in "pauses" and no further input appears to be received,

To escape this, we can trigger a "continue" by using `CTRL-Q`. This reveals to us that our previous keystrokes were not in fact lost, but buffered, and now appear in the console we're working from.

This behavior is called "Software Flow Control", and according to this [Quora answer](https://www.quora.com/Does-Ctrl-S-actually-stop-the-process-on-terminal):

> CTRL-S (XOFF) is part of Software flow control. XOFF notifies the process or device sending data that the input buffer is full and it shouldn't send any more data. The software (outputting process, firmware, terminal etc) can choose how to handle the notification - i.e. keep running and buffer data, drop data, pause until XON is received, etc.

It is important to realize that this is not the behavior of `vim` itself, but a behavior of the OS itself. The same behavior is observed in a simple `bash` shell as well. I've organized this note in the `vim` folder simply because I make this mistake the most while using `vim`.
