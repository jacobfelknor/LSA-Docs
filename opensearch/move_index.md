# Move OpenSearch/ElasticSearch Index

It is a common scenario when you need to move opensearch/elasticsearch data from one host to another. Here's how I've done it:

Based on <https://stackoverflow.com/a/35705575>

## Tooling

I used the `elasticdump` utility, whose source is at <https://github.com/elasticsearch-dump/elasticsearch-dump>. You'll first need to install `node` + `npm`, which is outside the scope of these notes.

```bash
npm install -g elasticdump
```

## Single Index

To move a single index, we can use the following strategy. Since these indexes are usually very large, this method has the advantage of copying data from one instance to another without requiring space for an additional copy.

```bash
elasticdump --input=http://src:9200/my_index --output=http://dest:9200/my_index --type=analyzer
elasticdump --input=http://src:9200/my_index --output=http://dest:9200/my_index --type=mapping
elasticdump --input=http://src:9200/my_index --output=http://dest:9200/my_index --type=data
```

## All Indexes

Original GitHub Gist: <https://gist.github.com/fijimunkii/20227aff19aafa10dbdb654e2770b287#file-elasticdump_all_indices-sh-L2>

If instead, you need to move all indexes (indices?) from one host to the other, we loop over all indexes and preform the same idea as before. We can wrap this into a shell script called `elasticdump_all_indices.sh`

```bash
# elasticdump_all_indices.sh
INPUT=$1
DEST=$2
indices=$(curl -s -XGET $INPUT/_cat/indices?h=i)
for INDEX in $indices
do
    elasticdump --input=$INPUT/$INDEX --output=$DEST/$INDEX --type=analyzer
    elasticdump --input=$INPUT/$INDEX --output=$DEST/$INDEX --type=mapping
    elasticdump --input=$INPUT/$INDEX --output=$DEST/$INDEX --type=data
done
```

And then call the script like

```bash
./elasticdump_all_indices.sh http://src:9200 http://dest:9200
```

## MultiElasticDump

See documentation at <https://github.com/elasticsearch-dump/elasticsearch-dump>

An alternative strategy is using the `multielasticdump` utility included in the `elasticdump` install. However, it should be noted that **this strategy requires an intermediate copy and the space available to do so!**

For dumps, the `--input` **must be a server** and `--output` **must be a directory**, and vice versa for a load (restore).

```bash
# dump
multielasticdump --direction=dump --input=http://src:9200 --output=/tmp/es_backup

# load
multielasticdump --direction=load --input=/tmp/es_backup --output=http://dest:9200
```

## Or Keep it Simple - rsync

Another option is to just use a tool like `rsync` to copy over the data directory from the old server to the new server.

**It is very important that the source and destination opensearch servers are stopped during trasfer!**

```bash
rsync -a --progress /data/opensearch/ user@dest:/data/opensearch/
```
