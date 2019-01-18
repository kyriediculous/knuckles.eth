"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.remove0x = exports.isBN = exports.toBN = exports.checkAddressChecksum = exports.isAddress = exports.isHex = exports.bytes32ToString = exports.stringToHex = exports.sortOldest = exports.sortNewest = exports.groupBy = void 0;

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

const stringToHex = str => {
  return _ethers.utils.formatBytes32String(str);
};

exports.stringToHex = stringToHex;

const bytes32ToString = hex => {
  return _ethers.utils.toUtf8String(hex).replace(/\u0000/g, '');
};

exports.bytes32ToString = bytes32ToString;

const isHex = hex => {
  if (!/^(0x){1}[0-9a-f]*$/i.test(hex)) {
    return false;
  } else {
    return true;
  }
};
/**
 * Checks if the given string is an address
 *
 * @method isAddress
 * @param {String} address the given HEX address
 * @return {Boolean}
 */


exports.isHex = isHex;

const isAddress = address => {
  // check if it has the basic requirements of an address
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    return false; // If it's ALL lowercase or ALL upppercase
  } else if (/^(0x|0X)?[0-9a-f]{40}$/.test(address) || /^(0x|0X)?[0-9A-F]{40}$/.test(address)) {
    return true; // Otherwise check each case
  } else {
    return checkAddressChecksum(address);
  }
};
/**
 * Checks if the given string is a checksummed address
 *
 * @method checkAddressChecksum
 * @param {String} address the given HEX address
 * @return {Boolean}
 */


exports.isAddress = isAddress;

const checkAddressChecksum = address => {
  // Check each case
  address = address.replace(/^0x/i, '');
  var addressHash = (0, _sha.default)(address.toLowerCase());

  for (var i = 0; i < 40; i++) {
    // the nth letter should be uppercase if the nth digit of casemap is 1
    if (parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i] || parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i]) {
      return false;
    }
  }

  return true;
};
/**
 * Takes an input and transforms it into an BN
 *
 * @method toBN
 * @param {Number|String|BN} number, string, HEX string or BN
 * @return {BN} BN
 */


exports.checkAddressChecksum = checkAddressChecksum;

const toBN = number => {
  try {
    return _ethers.utils.bigNumberify(number);
  } catch (e) {
    throw new Error(e + ' Given value: "' + number + '"');
  }
};
/**
 * Returns true if object is BN, otherwise false
 *
 * @method isBN
 * @param {Object} object
 * @return {Boolean}
 */


exports.toBN = toBN;

const isBN = object => {
  return object && object.constructor && object.constructor.name === 'BN' || object && object.constructor && object.constructor.name === 'BigNumber';
};

exports.isBN = isBN;

const remove0x = str => {
  if (str.startsWith('0x')) return str.substring(2);else return str;
};

exports.remove0x = remove0x;