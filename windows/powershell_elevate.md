# Powershell Elevate

## Self Elevate

If a certain powershell script needs to be run as an Administrator, you can self-elevate it with

```powershell
function Pass-Parameters {
    Param ([hashtable]$NamedParameters)
    return ($NamedParameters.GetEnumerator() | % { "-$($_.Key) `"$($_.Value)`"" }) -join " "
}

# Self-elevate the script if required
if (-Not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] 'Administrator')) {
    if ([int](Get-CimInstance -Class Win32_OperatingSystem | Select-Object -ExpandProperty BuildNumber) -ge 6000) {
        $CommandLine = "-File `"" + $MyInvocation.MyCommand.Path + "`" " + (Pass-Parameters $MyInvocation.BoundParameters) + " " + $MyInvocation.UnboundArguments
        Start-Process -FilePath PowerShell.exe -Verb Runas -ArgumentList $CommandLine
        Exit
    }
}

# self-elevating from https://stackoverflow.com/a/70869951

# put the rest of the script here!
Write-Host "hello elevated world!"
```

This code was originally found at <https://stackoverflow.com/a/70869951>

## Invoke Other Executable

If instead, you're using a wrapper script of some kind that starts running as a normal user, but must then invoke some other executable who needs to elevate, you should do the following

```powershell
# do all necessary user functions
Write-Host "this part of the script runs as the user!"

# Start the process which requires elevation 
# This could be auto-elevated with a tool like ThreatLocker with a policy for the specified -FilePath
Start-Process -FilePath 'C:\Program Files\path\to\program.exe' -ArgumentList "--example", "args" -Verb RunAs
```
