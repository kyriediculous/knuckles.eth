"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.add = add;
exports.remove = remove;
exports.get = get;
exports.update = update;
exports.getAll = getAll;
exports.purchase = purchase;
exports.changeStatus = changeStatus;

var _RewardStore = _interopRequireDefault(require("../../../contracts/build/contracts/RewardStore.json"));

var _TokenResolver = require("./TokenResolver");

var _utils = require("ethers/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//add remove get purchase
async function add(reference, price, wallet) {
  try {
    if (wallet === undefined) throw new Error('Must supply a signer');
    const rewardStore = this.ContractProvider(_RewardStore.default, this.provider, wallet);
    let tx = await rewardStore.addListing('0x' + reference, (0, _utils.parseEther)(price.toString()), {
      gasPrice: (0, _utils.parseEther)('0')
    });
    return await tx.wait();
  } catch (err) {
    throw new Error(err);
  }
}

async function remove(index, wallet) {
  try {
    if (wallet === undefined) throw new Error('Must supply a signer');
    const rewardStore = this.ContractProvider(_RewardStore.default, this.provider, wallet);
    let tx = await rewardStore.removeListing(index, {
      gasPrice: (0, _utils.parseEther)('0')
    });
    return await tx.wait();
  } catch (err) {
    throw new Error(err);
  }
}

async function get(index) {
  try {
    const rewardStore = this.ContractProvider(_RewardStore.default, this.provider);
    let reward = await rewardStore.listings(index);
    return {
      reference: reward[0],
      price: parseFloat((0, _utils.formatEther)((0, _utils.bigNumberify)(reward[1]))).toFixed(2),
      active: reward[2]
    };
  } catch (err) {
    throw new Error(err);
  }
}

async function update(index, reference, price, wallet) {
  try {
    if (wallet === undefined) throw new Error('Must supply a signer');
    const org = this.ContractProvider(_RewardStore.default, this.provider, wallet);
    let tx = await org.updateListing(index, '0x' + reference, (0, _utils.parseEther)(price.toString()), {
      gasPrice: (0, _utils.parseEther)('0')
    });
    return await tx.wait();
  } catch (err) {
    throw new Error(err);
  }
}

async function getAll() {
  try {
    const rewardStore = this.ContractProvider(_RewardStore.default, this.provider);
    const len = parseInt((await rewardStore.listingsAmount()).toString(10));
    let all = [];

    for (var i = 0; i < len; i++) {
      all.push(get.call(this, i));
    }

    all = await Promise.all(all);
    all = all.map((l, i) => {
      return {
        reference: l.reference,
        price: l.price,
        active: l.active,
        id: i
      };
    });
    return all.filter(l => {
      return l.reference.startsWith('0x0000') == false;
    });
  } catch (err) {
    throw new Error(err);
  }
}

async function purchase(item, wallet) {
  try {
    if (wallet === undefined) throw new Error('Must supply a signer');
    const rewardStore = this.ContractProvider(_RewardStore.default, this.provider, wallet);
    const spend = await _TokenResolver.approveSpend.call(this, rewardStore.address, item.price, wallet);
    await spend.wait();
    let tx = await rewardStore.purchase(item.id);
    return await tx.wait();
  } catch (err) {
    throw new Error(err);
  }
}

async function changeStatus(index, wallet) {
  try {
    if (wallet === undefined) throw new Error('Must supply a signer');
    const rewardStore = this.ContractProvider(_RewardStore.default, this.provider, wallet);
    let tx = await rewardStore.changeActive(index);
    return await tx.wait();
  } catch (err) {
    throw new Error(err);
  }
}