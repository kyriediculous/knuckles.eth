import {
  utils
} from 'ethers'
import sha3 from 'crypto-js/sha3'

export const groupBy = (array, key) => array.reduce((rv, x) => {
  (rv[x[key]] = rv[x[key]] || []).push(x);
  return rv
}, {})


export const sortNewest = (array) => {
  return array.sort((a, b) => {
    if (a.timestamp.isBefore(b.timestamp)) {
      return 1
    } else {
      return -1
    }
  })
}

export const sortOldest = (array) => {
  return array.sort((a, b) => {
    if (a.timestamp.isBefore(b.timestamp)) {
      return -1
    } else {
      return 1
    }
  })
}


export const stringToHex = (str) => {
  return utils.formatBytes32String(str)
};

export const bytes32ToString = (hex) => {
  return utils.toUtf8String(hex).replace(/\u0000/g, '')
}

export const isHex = (hex) => {
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
export const isAddress = (address) => {
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
export const  checkAddressChecksum = (address) => {
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
export const toBN = (number) => {
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
export const isBN = (object) => {
  return (object && object.constructor && object.constructor.name === 'BN') || (object && object.constructor && object.constructor.name === 'BigNumber');
};

export const remove0x = (str) => {
  if (str.startsWith('0x'))
    return str.substring(2);
  else return str;
}


export const parseKnuckles = (bn) => {
  return parseFloat(utils.formatEther(utils.bigNumberify(bn))).toFixed(2)
}
