'use strict';

angular.module('insight.blocks').factory('Block',
  function($resource) {
  return $resource('/api/block/:blockHash', {
    blockHash: '@blockHash'
  }, {
    get: {
      method: 'GET',
      interceptor: {
        response: function (res) {
          return res.data;
        },
        responseError: function (res) {
          if (res.status === 404) {
            return res;
          }
        }
      }
    }
  });
});

angular.module('insight.blocks').factory('Blocks',
  function($resource) {
    return $resource('/api/blocks');
});

angular.module('insight.blocks').factory('BlockByHeight',
  function($resource) {
  return $resource('/api/block-index/:blockHeight');
});

