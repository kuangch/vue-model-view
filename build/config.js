var path = require('path');
var fs = require('fs');
var nodeExternals = require('webpack-node-externals');

var externals = {};

externals = [Object.assign({
  // vue: 'vue'
}, externals), nodeExternals()];

exports.externals = externals;

exports.alias = {
  main: path.resolve(__dirname, '../src/lib'),
  examples: path.resolve(__dirname, '../src/examples'),
};

exports.vue = {
  root: 'Vue',
  commonjs: 'vue',
  commonjs2: 'vue',
  amd: 'vue'
};

exports.jsexclude = /node_modules/;
