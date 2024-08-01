# Get Size of Documents

Mongo has a 16MB limit. If you want to check whether any of the documents in your collection are coming close to this limit, you can run the following aggregation in print the largest documents descending:

```python
from pymongo import MongoClient

client = MongoClient('mongodb://................................')
result = client['database_name']['collection_name'].aggregate([
    {
        '$project': {
            'size_MB': {
                '$divide': [
                    {
                        '$bsonSize': '$$ROOT'
                    }, 1048576
                ]
            }
        }
    }, {
        '$sort': {
            'size_MB': -1
        }
    }
])
```
