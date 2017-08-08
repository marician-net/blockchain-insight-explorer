# Bitcore - Bcoin - Insight
Rebuilt Bitcore with Bcoin engine and Insight API sitting on top of Mongo.

### Requirements
Mongodb running on your system.

node >=7.6.0 - This requirement comes from Bcoin. Developed under 8.2.0.

### Usage
```
npm install
npm start
```

A Full Bcoin node will start. As blocks come in they will be stored in Mongo.

### Configuration

A configuration object exists in /config/index.js that accepts a config for Bcoin, Mongo and the new insight-api. During dev this is included. As a best practice this should be part of the gitignore to prevent anyone from saving credentials to Github. However, credentials should be ENV VARS anyway.

### Misc Gotchas / Needs Docs & clarity

Mongo will create the bitcore db and a blocks/transactions collection automatically. These collectionss have indexes. Bcoin also syncs to the prefix set in config. To reset/start over you need to drop both collections and delete the bcoin datadir.

Bcoin offers a few database types. The most ideal for our purpose is the in memory database. Unfortunately, Bcoin will not record blockchain sync checkpoints in this mode. Every restart of the client would result in Bcoin sync'ing from the Genesis block. Long term, we should consider sending them a friendly PR.

Alternatively, I've explored putting mongo into Bcoin. The db interface seems simple enough. Bcoin mostly get/puts but it is surprisingly complicated under the hood.

So Bcoin creates its own leveldb.

### Resetting Application State
```
mongo
use bitcore
db.blocks.drop()
db.transactions.drop()

Ctrl+D out of mongo

rm -rf ~/.bcoin/chain.ldb
```

### Nginx

The API is configured to run on port 3000 by default. Use the standard Nginx reverse proxy on ports 80/443 to flip http to https and handle ssl certs.

### Priorities
1. Required for Insight-UI

* /addr/:addrStr/?noTxList=1
* X /block/:blockhash
* X /blocks
* X /block-index/:blockHeight
* X /currency
* X /version
* X /status - Stubbed. Prior status was for bitcoind
* /sync - Tricky. Bcoin gets the bestHeight from peers but does not save that information. Will show best height - currently Mocked
* X /peer
* X /tx/:txId
* /txs - Done(ish - no pagination) for most recent txs. Needs block (hash) and address

* sockets

# ToDo but required for a release
* API Endpoints
* Mongo Models : Bcoin primitives. A Bcoin block primitive does not represent all of bitcore's data.
1. scriptpubkey asm
2. peer's best block height is learned on peer connect but not retained by the app. Block height is the current sync height

# ToDo but not Required for a release
* Reorg testing - Bcoin will handle this but we need to account for this in our mongo indexes.
* JSDoc & Unit tests
* Rate Limiting
* Helmet for security
* Caching
* Sanitize user input - mongo and api params. Just make a quick middleware.
* Change Mongo subdocuments into .populate Object Id relationships. This will reduce size & increase performance
* Make the current api the 'legacy' api and setup a real api with uniform verbage/params
* Remove hh:mm:ss from log file names and append to same file for the same day