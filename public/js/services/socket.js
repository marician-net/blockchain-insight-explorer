'use strict';

var ScopedSocket = function(socket, $rootScope) {
	this.socket = socket;
	this.$rootScope = $rootScope;
	this.listeners = [];
};

ScopedSocket.prototype.removeAllListeners = function() {
  console.log('remove all listeners');
	for (var i = 0; i < this.listeners.length; i++) {
		var details = this.listeners[i];
    console.log('removing listener '+i);
		this.socket.removeListener(details.event, details.fn);
	}
  this.listeners = [];
};

ScopedSocket.prototype.on = function(event, callback) {
	var socket = this.socket;
	var $rootScope = this.$rootScope;


	var wrapped_callback = function() {
		var args = arguments;
		$rootScope.$apply(function() {
			callback.apply(socket, args);
		});
	};
  socket.on(event, wrapped_callback);

	this.listeners.push({
		event: event,
		fn: wrapped_callback
	});
};

ScopedSocket.prototype.emit = function(event, data, callback) {
	var socket = this.socket;
	var $rootScope = this.$rootScope;

	socket.emit(event, data, function() {
		var args = arguments;
		$rootScope.$apply(function() {
			if (callback) {
				callback.apply(socket, args);
			}
		});
	});
};

angular.module('insight.socket').factory('get_socket', ['$rootScope', function($rootScope) {
	var socket = io.connect();
	return function(scope) {
		var scopedSocket = new ScopedSocket(socket, $rootScope);
		scope.$on('$destroy', function() {
			scopedSocket.removeAllListeners();
		});
		return scopedSocket;
	};
}]);

