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

## Get IDs to Operate on

In  my case, I wanted to delete documents larger than a certain value. This was done with

```python
from pymongo import MongoClient

# Requires the PyMongo package.
# https://api.mongodb.com/python/current

client = MongoClient('mongodb://................................')
result = client['database_name']['collection_name'].aggregate(
    [
        {
            "$project": {
                "size_MB": {
                    "$divide": [
                        {"$bsonSize": "$$ROOT"},
                        1048576,
                    ],
                },
                # if you wanted to include other fields in the aggregation
                "some_field": 1,
            },
        },
        {
            "$match": {
                "size_MB": {
                    "$gte": 1,
                },
            },
        },
        {
            "$sort": {
                "size_MB": -1,
            },
        },
    ]
)

ids = [x["_id"] for x in list(results)]


client["database_name"]["collection_name"].delete_many(
    {
        "_id": {"$in": ids},
    },
)
```
