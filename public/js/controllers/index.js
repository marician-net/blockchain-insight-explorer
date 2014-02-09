'use strict';

var TRANSACTION_DISPLAYED = 5;
var BLOCKS_DISPLAYED = 5;

angular.module('insight.system').controller('IndexController',
  function($scope, $rootScope, Global, getSocket, Blocks, Block, Transactions, Transaction) {
  $scope.global = Global;

  var _getTransaction = function(txid, cb) {
    Transaction.get({
      txId: txid
    }, function(res) {
      cb(res);
    });
  };

  var _getBlock = function(hash) {
    Block.get({
      blockHash: hash
    }, function(res) {
      $scope.blocks.unshift(res);
    });
  };

  var socket = getSocket($scope);
  socket.emit('subscribe', 'inv');

  //show errors
  $scope.flashMessage = $rootScope.flashMessage || null;

  socket.on('tx', function(tx) {
    console.log('Transaction received! ' + JSON.stringify(tx));

    var txStr = tx.toString();
    _getTransaction(txStr, function(res) {
      $scope.txs.unshift(res);
      if (parseInt($scope.txs.length, 10) >= parseInt(TRANSACTION_DISPLAYED, 10)) {
        $scope.txs = $scope.txs.splice(0, TRANSACTION_DISPLAYED);
      }
    });
  });

  socket.on('block', function(block) {
    console.log('Block received! ' + JSON.stringify(block));

    var blockHash = block.toString();
    if (parseInt($scope.blocks.length, 10) > parseInt(BLOCKS_DISPLAYED, 10) - 1) {
      $scope.blocks.pop();
    }

    _getBlock(blockHash);
  });

  $scope.humanSince = function(time) {
    var m = moment.unix(time);
    return m.max().fromNow();
  };

  $scope.index = function() {
    Blocks.get({
      limit: BLOCKS_DISPLAYED
    }, function(res) {
      $scope.blocks = res.blocks;
      $scope.blocksLength = res.lenght;
    });

    Transactions.get({
      limit: TRANSACTION_DISPLAYED
    }, function(res) {
      $scope.txs = res.txs;
    });
  };

  $scope.txs = [];
  $scope.blocks = [];
});
