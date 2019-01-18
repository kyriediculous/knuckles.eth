"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sortOldest = exports.sortNewest = exports.groupBy = void 0;

var _ethers = require("ethers");

var _sha = _interopRequireDefault(require("crypto-js/sha3"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const groupBy = (array, key) => array.reduce((rv, x) => {
  (rv[x[key]] = rv[x[key]] || []).push(x);
  return rv;
}, {});

exports.groupBy = groupBy;

const sortNewest = array => {
  return array.sort((a, b) => {
    if (a.timestamp.isBefore(b.timestamp)) {
      return 1;
    } else {
      return -1;
    }
  });
};

exports.sortNewest = sortNewest;

const sortOldest = array => {
  return array.sort((a, b) => {
    if (a.timestamp.isBefore(b.timestamp)) {
      return -1;
    } else {
      return 1;
    }
  });
};

exports.sortOldest = sortOldest;