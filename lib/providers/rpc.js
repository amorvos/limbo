// Generated by CoffeeScript 1.10.0
(function() {
  var EventEmitter, Rpc, axon, getRpcClient, rpc,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  axon = require('axon');

  rpc = require('axon-rpc');

  EventEmitter = require('events').EventEmitter;

  getRpcClient = function(conn, options) {
    var client, req;
    if (options == null) {
      options = {};
    }
    req = axon.socket('req');
    client = new rpc.Client(req);
    if (options.tls) {
      req.set('tls', options.tls);
    }
    req.set('max retry', 10);
    req.connect(conn);
    return client;
  };

  Rpc = (function(superClass) {
    extend(Rpc, superClass);

    function Rpc(options) {
      var group;
      group = options.group;
      this._group = group;
    }

    Rpc.prototype.connect = function(conn, callback) {
      var _bindMethods, group, self;
      if (typeof conn === 'string') {
        this._client = getRpcClient(conn);
      } else {
        this._client = getRpcClient(conn.url, conn);
      }
      group = this._group;
      self = this;
      this._client.sock.on('error', function(error) {
        return self.emit('error', error);
      });
      this._client.sock.on('close', function() {
        return self.emit('error', new Error('remote rpc closed'));
      });
      _bindMethods = function(methods) {
        var _group, _methods, fn, name, ref;
        if (methods == null) {
          methods = {};
        }
        fn = function(_methods) {
          var name1;
          self[name1 = _methods[0]] || (self[name1] = {});
          self[_methods[0]][_methods[1]] = function() {
            var args, k, v;
            args = (function() {
              var results;
              results = [];
              for (k in arguments) {
                v = arguments[k];
                results.push(v);
              }
              return results;
            }).apply(this, arguments);
            args.unshift(_methods.join('.'));
            return self.call.apply(self, args);
          };
          return self[_methods[0]][_methods[1] + 'Async'] = function() {
            var args, k, v;
            args = (function() {
              var results;
              results = [];
              for (k in arguments) {
                v = arguments[k];
                results.push(v);
              }
              return results;
            }).apply(this, arguments);
            args.unshift(_methods.join('.'));
            return new Promise(function(resolve, reject) {
              args.push(function(err, result) {
                if (err) {
                  return reject(err);
                }
                return resolve(result);
              });
              return self.call.apply(self, args);
            });
          };
        };
        for (name in methods) {
          ref = name.split('.'), _group = ref[0], _methods = 2 <= ref.length ? slice.call(ref, 1) : [];
          if (_group !== group) {
            continue;
          }
          fn(_methods);
        }
        return self;
      };
      this.methods(function(err, methods) {
        if (err) {
          return callback(err);
        }
        _bindMethods(methods);
        return callback(err, methods);
      });
      return this;
    };

    Rpc.prototype.call = function(method) {
      method = this._group + "." + method;
      arguments[0] = method;
      return this._client.call.apply(this._client, arguments);
    };

    Rpc.prototype.methods = function() {
      return this._client.methods.apply(this._client, arguments);
    };

    return Rpc;

  })(EventEmitter);

  module.exports = Rpc;

}).call(this);