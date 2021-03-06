"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _web = require("../web3");

var _Users = _interopRequireDefault(require("./Users"));

var _Token = _interopRequireDefault(require("./Token"));

var _utils = require("ethers/utils");

var _ = require("../utils/_");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//WORK WITH BOUNTY TYPES AND SWITCH CASES TO DETERMINE WHICH FUNCTIONS SHOULD BE CALLED ON THE RESOLVER ?
// IF WE WORK WITH CONTRIBUTIONS FOR RECURRING BOUNTIES WE CAN USE THE SERVICE FOR BOTH TYPES
// THE OTHER OPTION IS TO PASS AN OBJECT WITH ADDRESS+TYPE TO GETTERS INSTEAD OF ADDRESS AND THEN WE CAN SKIP RECURRING BOUNTIES CONTRIBUTIONS
//all, get, create and createMintable  are already done
//should combine create and createMintable with a switch statement
class Bounties {
  /**
    * Initiate the Bounties module
    * @param {String} ethNetwork - the desired network to use (environment variable)
    * @param {String} swarmHost -  the desired swarm network to use (environment variable)
    * @returns {Object} bounties class object
    */
  static init({
    ethNetwork,
    swarmHost
  } = {
    ethNetwork: undefined,
    swarmHost: undefined
  }) {
    const bounties = new Bounties(); // Initiate EthResolver

    if (ethNetwork === undefined) {
      bounties.eth = _web.EthResolver.init();
    } else {
      bounties.eth = _web.EthResolver.init(ethNetwork);
    } // Initiate Swarm connector


    if (swarmHost === undefined) {
      bounties.bzz = _web.Swarm.init();
    } else {
      bounties.bzz = _web.Swarm.init(swarmHost);
    }

    return bounties;
  }
  /**
  * Retrieve all bounties
  * First query metadata on the blockchain
  * Then retrieve the associated JSON data
  */


  async all() {
    try {
      let singles = await this.eth.bounties.all();
      let recurring = await this.eth.recurringBounties.all();
      let allBounties = singles.concat(recurring);
      return (0, _.sortNewest)((await Promise.all(allBounties.map(b => this.meta(b)))).filter(b => b != undefined));
    } catch (err) {
      throw new Error(err);
    }
  }
  /**
  * Create a new bounty
  * @param {Object} bounty - object representing the bounty data entered by the user
  * @param {Object} wallet - object representing the user's wallet to sign the transaction
  */


  async create(bounty, wallet) {
    try {
      const swarmBounty = {
        title: bounty.title,
        description: bounty.description,
        deadline: bounty.deadline,
        attachments: bounty.attachments,
        tags: bounty.tags.map(t => t.toLowerCase())
      };
      const swarmHash = await this.bzz.upload(JSON.stringify(swarmBounty), {
        contentType: 'application/json'
      });
      let tx;

      switch (bounty.type) {
        case 'single':
          tx = await this.eth.bounties.create(swarmHash, bounty.deadline, bounty.reward, wallet);
          break;

        case 'recurring':
          tx = await this.eth.recurringBounties.create(swarmHash, bounty.deadline, bounty.reward, bounty.funding, wallet);
          break;

        default:
          throw new Error('Bounty type not valid or undefined');
      }

      return tx;
    } catch (err) {
      throw new Error(err);
    }
  }
  /**
  * Create a bounty as admin
  * This mints new tokens instead of paying from the user's wallet
  * @param {Object} bounty - object representing the bounty data entered by the user
  * @param {Object} wallet - object representing the user's wallet to sign the transaction
  */


  async createMintable(bounty, wallet) {
    try {
      const swarmBounty = {
        title: bounty.title,
        description: bounty.description,
        deadline: Date.parse(bounty.deadline),
        attachments: bounty.attachments,
        tags: bounty.tags.map(t => t.toLowerCase())
      };
      const swarmHash = await this.bzz.upload(JSON.stringify(swarmBounty), {
        contentType: 'application/json'
      });
      let tx;

      switch (bounty.type) {
        case 'single':
          tx = await this.eth.bounties.createMintable(swarmHash, bounty.deadline, bounty.reward, wallet);
          break;

        case 'recurring':
          tx = await this.eth.recurringBounties.createMintable(swarmHash, bounty.deadline, bounty.reward, bounty.funding, wallet);
          break;

        default:
          throw new Error('Bounty type not valid or undefined');
      }

      return tx;
    } catch (err) {
      throw new Error(err);
    }
  }
  /**
  * Lets an admin accept a commit of a minted bounty
  * @param {Object} bounty - Object containing the ethereum address of the bounty and its type
  * @param {Number} id - the index of the commit
  * @param {Object} wallet - Object representing the user's wallet to sign the transaction
  */


  async acceptMintable({
    address,
    type
  }, id, wallet) {
    try {
      let tx;

      switch (type) {
        case 'single':
          tx = await this.eth.bounties.acceptMintable(address, id, wallet);
          break;

        case 'recurring':
          tx = await this.eth.recurringBounties.acceptMintable(address, id, wallet);
          break;

        default:
          throw new Error('Bounty type not valid or undefined');
      }

      return tx;
    } catch (err) {
      throw Error(err.message);
    }
  }
  /**
  * Get a bounty's details
  * @param {String} address -  the ethereum address of the bounty contract
  * @param {String} type - the bounty type (recurring or single)
  * @returns {Object} Object representing the bounty
  */


  async get({
    address,
    type
  }) {
    try {
      let bounty;

      switch (type) {
        case 'single':
          bounty = await this.eth.bounties.get(address);
          break;

        case 'recurring':
          bounty = await this.eth.recurringBounties.get(address);
          break;

        default:
          throw new Error('Bounty type not valid or undefined');
      }

      bounty.address = address;
      bounty.type = type;
      let bountyDetails = await this.bzz.download(bounty.reference);
      bountyDetails = JSON.parse((await bountyDetails.text()));
      bounty.title = bountyDetails.title;
      bounty.description = bountyDetails.description;
      bounty.tags = bountyDetails.tags;
      bounty.attachments = [];
      let manifests = await Promise.all(bountyDetails.attachments.map(a => this.bzz.bzz.list(a)));
      let attachments = await Promise.all(manifests.map((m, i) => this.bzz.download(bountyDetails.attachments[i] + '/' + m.entries[0].path)));

      for (var i = 0; i < attachments.length; i++) {
        let url = attachments[i].url.split('/');
        attachments[i] = await attachments[i].blob();

        if (attachments[i].type.startsWith('image/')) {
          attachments[i] = {
            type: attachments[i].type,
            data: this.bzz.host + '/bzz:/' + url[4] + '/' + url[5],
            name: url[5]
          };
        } else {
          attachments[i] = {
            type: attachments[i].type,
            data: this.bzz.host + '/bzz:/' + url[4] + '/' + url[5],
            name: url[5]
          };
        }
      }

      bounty.attachments = attachments;

      const users = _Users.default.init();

      bounty.issuer = await users.get(bounty.issuer);
      if (bounty.issuer == undefined) return;
      let commitDetails = await Promise.all(bounty.commits.map(c => this.bzz.download(c.reference)));
      commitDetails = await Promise.all(commitDetails.map(cd => cd.text()));
      commitDetails = commitDetails.map(cd => JSON.parse(cd));
      manifests = await Promise.all(commitDetails.map(cd => {
        if (cd.attachment !== '' && cd.attachment.length > 0) {
          return this.bzz.bzz.list(cd.attachment);
        } else {
          return '';
        }
      }));
      attachments = await Promise.all(manifests.map((mf, i) => {
        if (mf == '') {
          return '';
        } else {
          return this.bzz.download(commitDetails[i].attachment + '/' + mf.entries[0].path);
        }
      }));

      for (var j = 0; j < attachments.length; j++) {
        if (attachments[j] != '') {
          let url = attachments[j].url.split('/');
          attachments[j] = await attachments[j].blob();

          if (attachments[j].type.startsWith('image/')) {
            attachments[j] = {
              type: attachments[j].type,
              data: this.bzz.host + '/bzz:/' + url[4] + '/' + url[5],
              name: url[5]
            };
          } else {
            attachments[j] = {
              type: attachments[j].type,
              data: this.bzz.host + '/bzz:/' + url[4] + '/' + url[5],
              name: url[5]
            };
          }
        }
      }

      let authors = await Promise.all(bounty.commits.map(c => users.get(c.author)));

      for (var k = 0; k < bounty.commits.length; k++) {
        bounty.commits[k].comment = commitDetails[k].comment;
        bounty.commits[k].attachment = attachments[k];
        bounty.commits[k].author = authors[k];
      }

      if (type === 'single') {
        let contributers = await Promise.all(bounty.contributions.map(bc => users.get(bc.contributer)));

        for (let l = 0; l < bounty.contributions.length; l++) {
          bounty.contributions[l].contributer = contributers[l];
        }
      }

      return bounty;
    } catch (err) {
      throw new Error(err);
    }
  }
  /**
  * Get a bounty's "meta" data
  * This does not resolve commits & contribution data
  * @param {String} address - ethereum address of the bounty
  */


  async meta({
    address,
    type
  }) {
    try {
      let bounty;

      switch (type) {
        case 'single':
          bounty = await this.eth.bounties.meta(address);
          break;

        case 'recurring':
          bounty = await this.eth.recurringBounties.meta(address);
          break;

        default:
          throw new Error('Bounty type not valid or undefined');
      }

      bounty.address = address;
      bounty.type = type;
      let bountyDetails = await this.bzz.download(bounty.reference);
      bountyDetails = JSON.parse((await bountyDetails.text()));
      bounty.title = bountyDetails.title;
      bounty.description = bountyDetails.description;
      bounty.tags = bountyDetails.tags;
      bounty.attachments = [];

      for (let i = 0; i < bountyDetails.attachments.length; i++) {
        const manifest = await this.bzz.bzz.list(bountyDetails.attachments[i]);
        let attachment = await this.bzz.download(bountyDetails.attachments[i] + '/' + manifest.entries[0].path);
        let url = attachment.url.split('/');
        attachment = await attachment.blob();

        if (attachment.type.startsWith('image/')) {
          bounty.attachments[i] = {
            type: attachment.type,
            data: URL.createObjectURL(attachment),
            name: url[5]
          };
        } else {
          bounty.attachments[i] = {
            type: attachment.type,
            data: this.bzz.host + '/bzz:/' + url[4] + '/' + url[5],
            name: url[5]
          };
        }
      }

      const users = _Users.default.init();

      bounty.issuer = await users.get(bounty.issuer);
      return bounty;
    } catch (err) {
      throw new Error(err);
    }
  }
  /**
  * Get all the bounties posted by a specific user
  * @param {String} userAddress - the ethereum address of the user
  * @returns {Array} array containing bounty objects
  */


  async from(userAddress) {
    try {
      let singles = await this.eth.bounties.from(userAddress);
      let recurring = await this.eth.recurringBounties.from(userAddress);
      let myBounties = singles.concat(recurring);
      myBounties = (await Promise.all(myBounties.map(mb => this.get.call(this, mb)))).filter(b => b != undefined);
      return myBounties;
    } catch (err) {
      throw Error(err.message);
    }
  }
  /**
  * TODO - rename to 'commit'
  * Make a commit to a bounty
  * @param {String} address - Ethereum address of the bounty to make a commit to
  * @param {Object} commit - object representing the commit data
  * @param {Object} wallet - Wallet of the user to sign the transaction with
  */


  async submit({
    address
  }, commit, wallet) {
    try {
      const swarmHash = await this.bzz.upload(JSON.stringify(commit), {
        contentType: 'application/json'
      });
      return await this.eth.bounties.submit(address, swarmHash, wallet);
    } catch (err) {
      throw new Error(err);
    }
  }
  /**
  * Get commits for a specific user
  * @param {String} userAddress - the ethereum address of the user
  * @returns {Array} array containing commit objects
  */


  async commitsFrom(userAddress) {
    try {
      let singles = await this.eth.bounties.commitsFrom(userAddress);
      let singleCommits = await Promise.all(singles.map(c => this.eth.bounties.getCommit(c._bounty, c._id.toString(10))));
      let recurring = await this.eth.recurringBounties.commitsFrom(userAddress);
      let recurringCommits = await Promise.all(recurring.map(c => this.eth.recurringBounties.getCommit(c._bounty, c._id.toString(10))));
      singleCommits = singleCommits.map((c, i) => {
        c.type = singles[i].type;
        return c;
      });
      recurringCommits = recurringCommits.map((c, i) => {
        c.type = recurring[i].type;
        return c;
      });
      let myCommits = singleCommits.concat(recurringCommits);
      let myCommitsDetails = await Promise.all(myCommits.map(mc => this.bzz.download(mc.reference)));
      myCommitsDetails = await Promise.all(myCommitsDetails.map(mcd => mcd.text()));
      myCommitsDetails = myCommitsDetails.map(mcd => JSON.parse(mcd));
      let myCommitsBounties = await Promise.all(myCommits.map(mc => this.meta({
        address: mc.bounty,
        type: mc.type
      })));

      for (var i = 0; i < myCommits.length; i++) {
        myCommits[i]['comment'] = myCommitsDetails[i].comment;
        myCommits[i]['attachment'] = myCommitsDetails[i].attachment;
        myCommits[i]['bounty'] = {
          title: myCommitsBounties[i].title,
          status: myCommitsBounties[i].status,
          reward: myCommitsBounties[i].reward,
          issuer: myCommitsBounties[i].issuer,
          address: myCommits[i].bounty,
          type: myCommits[i].type
        };
      }

      return myCommits;
    } catch (err) {
      throw Error(err.message);
    }
  }
  /**
  * As bounty issuer, accept a commit
  * @param {String} address - ethereum address of the bounty
  * @param {Number} id - index of the commit
  * @param {Object} wallet - user wallet to sign the transaction with
  */


  async accept({
    address
  }, id, wallet) {
    try {
      return await this.eth.bounties.accept(address, id, wallet);
    } catch (err) {
      throw new Error(err);
    }
  }
  /**
  * Get event logs of winning commits for a user
  * @param {String} userAddress - ethereum address of the user
  * @returns {Array} event logs of winning commits
  */


  async rewardsFor(userAddress) {
    try {
      let singles = await this.eth.bounties.rewardsFor(userAddress);
      let recurring = await this.eth.recurringBounties.rewardsFor(userAddress);
      let logs = singles.concat(recurring);
      logs = logs.map(r => {
        let log = { ...r
        };
        log._amount = (0, _utils.bigNumberify)(log._amount);
        return log;
      });
      return logs;
    } catch (err) {
      throw Error(err.message);
    }
  }
  /**
  * Get the activity feed of a bounty
  * @param {String} userAddress - ethereum address of the bounty
  * @returns {Array} containing the activity log for a bounty
  */


  async activity({
    address,
    type
  }) {
    try {
      let logs;

      switch (type) {
        case 'single':
          logs = await this.eth.bounties.activity(address);
          break;

        case 'recurring':
          logs = await this.eth.recurringBounties.activity(address);
          break;
      }

      const users = _Users.default.init();

      const logsBy = await Promise.all(logs.map(l => users.get(l.by)));

      for (var i = 0; i < logs.length; i++) {
        logs[i].by = logsBy[i];
      }

      return logs;
    } catch (err) {
      throw new Error(err);
    }
  }
  /**
  * Get the leaderboard of earned tokens
  * @returns {Array} contains objects with the user profile and his total reward earned
  */


  async leaderboard(period) {
    try {
      let leaderboard, singlesLead, recurringLead, timesheetRewards;
      [singlesLead, recurringLead, timesheetRewards] = await Promise.all([this.eth.bounties.leaderboard(period), this.eth.recurringBounties.leaderboard(period), this.eth.timesheets.rewards(period)]);
      leaderboard = [...singlesLead, ...recurringLead, ...timesheetRewards];
      leaderboard = (0, _.groupBy)(leaderboard, 'user');
      let output = [];

      for (var user in leaderboard) {
        let users = _Users.default.init();

        output.push({
          user: await users.get(user),
          rewards: leaderboard[user].length > 1 ? leaderboard[user].reduce((a, b) => {
            a.rewards = a.rewards.add(b.rewards);
            return a;
          }).rewards : leaderboard[user][0].rewards
        });
      }

      output = output.sort((a, b) => {
        if (a.rewards.gt(b.rewards)) {
          return -1;
        } else {
          return 1;
        }
      });
      output = output.map(l => {
        l.rewards = parseFloat((0, _utils.formatEther)(l.rewards)).toFixed(2);
        return l;
      });
      return output.filter(o => o.user != undefined);
    } catch (err) {
      throw new Error(err);
    }
  }
  /**
  * announce that you are starting work on a bounty
  * @param {String} userAddress -  ethereum address of the bounty
  * @param {Object} wallet - user wallet to sign the transaction with
  */


  async startWorking({
    address,
    type
  }, wallet) {
    try {
      switch (type) {
        case 'single':
          await this.eth.bounties.startWorking(address, wallet);
          break;

        case 'recurring':
          await this.eth.recurringBounties.startWorking(address, wallet);
          break;

        default:
          throw new Error('Invalid or undefined bounty type');
      }
    } catch (err) {
      throw new Error(err);
    }
  }
  /**
  * Contribute some tokens to a bounty
  * Only works with the currently deployed token and is not token agnostic
  * @param {String} address -  ethereum address of the bounty
  * @param {Number} amount - amount to contribute
  * @param {Object} wallet - user wallet to sign the transaction with
  */


  async contribute({
    address,
    type
  }, amount, wallet) {
    try {
      if (type != 'single') throw new Error('Can not contribute to recurring bounties, send tokens to the contract to add funding');
      return this.eth.bounties.contribute(address, amount, wallet);
    } catch (err) {
      throw new Error(err);
    }
  }
  /**
  * Refund your contributions when a bounty is still active or has been abandoned
  * @param {String} address - ethereum address of the bounty
  * @param {Number} contributionId - index of the contribution, can only refund contributions made by the user himself
  * @param {Number} amount - amount to refund
  * @param {Object} wallet - user wallet to sign the transaction with
  */


  async refundContribution({
    address,
    type
  }, contributionId, amount, wallet) {
    try {
      if (type != 'single') throw new Error('Can not refund recurring bounties');
      return this.eth.bounties.refundContribution(address, contributionId, amount, wallet);
    } catch (err) {
      throw new Error(err);
    }
  }
  /**
  * Cancel an active bounty with no commits
  * Can only be called by the bounty issuer
  * @param {Object} bounty - object representing the bounty type and address
  * @param {Object} wallet - user wallet to sign the transaction with
  */


  async cancel({
    address,
    type
  }, wallet) {
    try {
      let tx;

      switch (type) {
        case 'single':
          tx = await this.eth.bounties.cancel(address, wallet);
          break;

        case 'recurring':
          tx = await this.eth.recurringBounties.cancel(address, wallet);
          break;

        default:
          throw new Error('Bounty type not valid or undefined');
      }

      return tx;
    } catch (err) {
      throw Error(err.message);
    }
  }

  async cancelMintable({
    address,
    type
  }, wallet) {
    try {
      let tx;

      switch (type) {
        case 'single':
          tx = await this.eth.bounties.cancelMintable(address, wallet);
          break;

        case 'recurring':
          tx = await this.eth.recurringBounties.cancelMintable(address, wallet);
          break;

        default:
          throw new Error('Bounty type not valid or undefined');
      }

      return tx;
    } catch (e) {
      throw Error(e.message);
    }
  }

  async addFunding({
    address,
    type
  }, amount, wallet) {
    try {
      if (type !== 'recurring') throw new Error('Bounty type must be recurring');
      const issuer = (await this.eth.recurringBounties.meta(address)).issuer;

      if (issuer == wallet.address) {
        await this.eth.recurringBounties.addFunding(address, amount, wallet);
      } else {
        await this.eth.recurringBounties.mintFunding(address, amount, wallet);
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  async withdrawFunding({
    address,
    type
  }, amount, wallet) {
    try {
      if (type !== 'recurring') throw new Error('Bounty type must be recurring');

      const token = _Token.default.init();

      await this.eth.recurringBounties.withdrawFunding(address, amount, token.address(), wallet);
    } catch (err) {
      throw new Error(err);
    }
  }

}

var _default = Bounties;
exports.default = _default;