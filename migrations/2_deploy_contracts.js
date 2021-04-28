const NUDI_Token = artifacts.require("NUDI_Token.sol");

module.exports = function (deployer) {
  deployer.deploy(NUDI_Token, 1000000);
};
