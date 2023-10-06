# If Else One-Liner

The "if else" bash one-liner can be done a few different ways with some possibly unexpected results. This was a lesson learned from writing a Python test GitLab CI/CD script that aimed to be compatible with both projects that used `pipenv` and projects that used standard Python virtual environments.

## Method 1

The general form of this method is the following:

```bash
testcmd && truecmd || falsecmd
```

However, this has the (possibly unintended) consequence of running `falsecmd` even if `testcmd` returns success if `truecmd` fails.

For example, when we were using this our CI/CD script contained this (simplified for presentation):

```bash
ls | grep -q Pipfile && pipenv run pytest || python -m  pytest
```

If `pipenv` tests failed, the script would proceed to re-run tests under the second command. These would fail with misleading import errors because the environment was not configured to run under the second command. This was not what we intended.

## Method 2

The general form of this method is the following:

```bash
if testcmd; then truecmd; else falsecmd; fi
```

This has slightly different behavior than the first method, in that `falsecmd` is only executed if and only if `testcmd` is successful. The second possibility of `falsecmd` running also if `truecmd` fails is resolved.

This ended up being the correct approach in my lesson learned situation described above. We wanted to check if the project had a `Pipfile`, then run tests under `pipenv`, and f the project did not have a `Pipfile`, we wanted to run tests under a normal Python virtual environment - never both. The corrected command (simplified for presentation) we used is below:

```bash
if ls | grep -q Pipfile; then pipenv run pytest; else python -m  pytest; fi
```

## Interesting Observation...

The "unix style" is to return 0 on success and non-zero on failure. That means that in bash scripts, checking for a "true" condition actually looks for 0, opposite of what we're used to in traditional programming. This is because we don't really care "how" a program succeeds, just that it did, where we probably care "how" a program fails - hence the single value 0 for success and any other integer to represent different kinds of failure.
