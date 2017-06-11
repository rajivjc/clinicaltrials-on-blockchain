var ClinicalTrial = artifacts.require("./ClinicalTrial.sol");
var Regulator = artifacts.require("./Regulator.sol");

module.exports = function(deployer) {
  deployer.deploy(ClinicalTrial);
  deployer.deploy(Regulator);
};
