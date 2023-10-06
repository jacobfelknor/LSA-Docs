# How Pipenv and setup.py work together

> NOTE! Ripped from this [GitHub gist](https://gist.github.com/dpboard/887b74f242605c3a409b90f0cf706531), but copied here for my future reference. This [article comparing requirements.txt to setup.py](https://caremad.io/posts/2013/07/setup-vs-requirement/) is also interesting.

I've always found the world of python packaging  and environment management to be somewhat confusing. 
Here are some notes that I hope will remind me how it works when I forget.

*N.B. I have focused on Pipenv and Pipfile in this article, as they are the latest and greatest way of managing project
environments, but the same principles apply to older workflows using virtualenv, pip and requirements.txt.*

## What is setup.py for?

[`setup.py`][1] is the file you should use to define your dependencies for something that is is primarily intended to be 
*redistributable*. The most obvious example of that is a library that can be used in multiple applications. Another example could be a 
development tool (e.g. [IPython][2] or [pylint][3]) which many people might install in different situations. The primary purpose
of setup.py is to give consumers an easy way of installing your packages and all it's dependencies.

Because of this, any requirements specified in `setup.py` should be as loose as possible, i.e. you should only exclude versions which 
will not work at all with your package. We want consumers of our library to have some flexibility when it comes to exactly what
dependency verions are installed in their environment. We also want our library to benefit 

For example, if our package required the [requests][4] library we would ideally specify it like so:

```
install_requires=[
  requests
 ]
```

If we knew that our package required features introduced in version 2.1 to work, then we could do this:

```
install_requires=[
  requests>=2.1
 ]
```

If we knew that there was a particular version that did not work with our package for some reason (perhaps a bug), and that an API
change in version 3 was also incompatible with our package, then the following would be appropirate:

```
install_requires=[
  requests>=2.1, !=2.2.12, <3.0
 ]
```

However, it would be unwise to be any more specific than this, as it would unnecessarily limit the options for consumers of our
package. For example, the following would be bad:

```
install_requires=[
  requests==2.1.15
 ]
```

The rule of thumb is: only exclude a version of a requirement if you *know* that is breaks your package.

## What is Pipenv for?

[Pipenv][5] (and the associated [Pipfile][6]) is a tool for managing *environments*.  Pipenv's purpose is to make it easy to manage a
reproducable and deterministic environment for your project. By this we mean that it allows to you accurately freeze and later reproduce 
your working enviroment with the exact same versions of any depedencies installed. Reasons you would want this would include:

- Allowing a team of developers to each work on identical environments on their respective machines.
- Allowing a project to be deployed to production with a certain set of dependency versions which are known to work and be reliable.

Note, in contrast to `setup.py`, these situations require you to pin your dependency versions as rigidly as possible.

Pipenv is very useful for developing and deploying non-redistributable applications at the very end of the dependency chain, but is
also useful during the development of redistributable libraries and tools. What it does *not* get involved in specifying the loose
dependencies required by consumers of a redistibutable package. That's the job of `setup.py`.

## Which do I need?

Pipenv and Pipfile are useful for *every* project. They are useful *internal* tools for easing development and deployment within your
team (or even if you are working solo).

`setup.py` is only needed when you want to distribute your project as a package that can be used by other projects/teams. This could be
distributing a library to the world on [PyPI][7] or simply packaging up a library that you intend to reuse in other in-house projects.

You would *not* require a `setup.py`file if your project was an end use-case application that had limited redistribution potential.

## See also

- [This Stack Overflow answer](https://stackoverflow.com/a/47594760)
- [This article by Python packaging expert Donald Stufft](https://caremad.io/posts/2013/07/setup-vs-requirement/)

[1]: https://docs.python.org/3.6/distutils/setupscript.html
[2]: https://ipython.org/
[3]: https://www.pylint.org/
[4]: https://pypi.python.org/pypi/requests
[5]: http://pipenv.readthedocs.io/en/latest/
[6]: https://github.com/pypa/pipfile
[7]: https://pypi.python.org/pypi