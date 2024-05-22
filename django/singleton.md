# Singleton Django Model

Originally sourced from <https://stackoverflow.com/a/49736970>, this abstract model enforces the singleton design pattern on models who inherit it.

```python
from django.db import models


# https://stackoverflow.com/a/49736970
class SingletonModel(models.Model):
    """Singleton Django Model"""

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        """
        Save object to the database. Removes all other entries if there
        are any.
        """
        self.__class__.objects.exclude(id=self.id).delete()
        super(SingletonModel, self).save(*args, **kwargs)

    @classmethod
    def load(cls):
        """
        Load object from the database. Failing that, create a new empty
        (default) instance of the object and return it (without saving it
        to the database).
        """

        try:
            # NOTE: .get() with no arguments returns all objects in the database
            # Since we're enforcing a singleton, this will only ever return 1 or 0 objects
            # if 0, we just return an instance of this class to be initialized and then saved
            return cls.objects.get()
        except cls.DoesNotExist:
            # if any default values should be set, you may do so in the __init__ of your subclass
            # AFTER super().__init__
            return cls()

```
