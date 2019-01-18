import {
  utils
} from 'ethers'
import bs58 from 'bs58'
import sha3 from 'crypto-js/sha3'
import bs64 from 'bs64'

function stringToHex(str) {
  if (!str)
    return "0x00";
  var hex = "";
  for (var i = 0; i < str.length; i++) {
    var code = str.charCodeAt(i);
    var n = code.toString(16);
    hex += n.length < 2 ? '0' + n : n;
  }

  return ("0x" + hex).toString(hex);
};

function bytes32ToString(hex) {
  return utils.toUtf8String(hex).replace(/\u0000/g, '')
}

function isHex(hex) {
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
function isAddress(address) {
  // check if it has the basic requirements of an address
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    return false;
    // If it's ALL lowercase or ALL upppercase
  } else if (/^(0x|0X)?[0-9a-f]{40}$/.test(address) || /^(0x|0X)?[0-9A-F]{40}$/.test(address)) {
    return true;
    // Otherwise check each case
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
function checkAddressChecksum(address) {
  // Check each case
  address = address.replace(/^0x/i, '');
  var addressHash = sha3(address.toLowerCase());

  for (var i = 0; i < 40; i++) {
    // the nth letter should be uppercase if the nth digit of casemap is 1
    if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
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
var toBN = function(number) {
  try {
    return utils.bigNumberify(number)
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
var isBN = function(object) {
  return (object && object.constructor && object.constructor.name === 'BN') || (object && object.constructor && object.constructor.name === 'BigNumber');
};

function remove0x(str) {
  if (str.startsWith('0x'))
    return str.substring(2);
  else return str;
}


export {
  stringToHex,
  bytes32ToString,
  isAddress,
  isHex,
  toBN,
  isBN,
  remove0x
}
