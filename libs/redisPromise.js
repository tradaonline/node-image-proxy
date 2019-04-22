const Promise = require('bluebird');
const config = require('../config');
const redis = Promise.promisifyAll( require('redis') );
const rdscli = redis.createClient( config.redisServer );
const debug = require('debug')('redis:event');

rdscli.on('ready', err => {

  debug('redis ready');

});

rdscli.on('connect', err => {

  debug('redis connect');

});

rdscli.on('reconnecting', err => {

  debug('redis reconnecting');

});

rdscli.on('error', err => {

  throw err;

});

rdscli.on('end', err => {

  debug('redis end');

});

exports.rdscli = rdscli;