"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
<<<<<<< HEAD
Object.defineProperty(exports, "Wallet", {
  enumerable: true,
  get: function () {
    return _wallet.default;
  }
});
exports.blockies = exports.utils = exports.services = exports.Web3 = void 0;
=======
Object.defineProperty(exports, "blockies", {
  enumerable: true,
  get: function () {
    return _blockies.default;
  }
});
exports.utils = exports.services = exports.Web3 = exports.Wallet = void 0;

var Wallet = _interopRequireWildcard(require("./wallet/"));
>>>>>>> 88c623d209748aee74c821818616efadb0dd4272

var _wallet = _interopRequireDefault(require("./wallet/"));

var Web3 = _interopRequireWildcard(require("./web3/"));

exports.Web3 = Web3;

var services = _interopRequireWildcard(require("./services/"));

exports.services = services;

var utils = _interopRequireWildcard(require("./utils/_"));

exports.utils = utils;

var _blockies = _interopRequireDefault(require("./utils/blockies"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }