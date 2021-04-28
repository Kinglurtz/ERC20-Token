/*
    This is the testing 
*/

var NUDI_Token = artifacts.require("./NUDI_Token.sol");

contract("NUDI_Token", function(accounts)
{

    it('Initializes the contract with the correct values', function() {
        return NUDI_Token.deployed().then(function(instance) {
          tokenInstance = instance;
          return tokenInstance.name();
        }).then(function(name) {
          assert.equal(name, 'NuggetSkadiToken', 'Has the correct name');
          return tokenInstance.symbol();
        }).then(function(symbol){
            assert.equal(symbol, "NUDI", "Has the correct Symbol")
            return tokenInstance.standard();
        }).then(function(standard){
            assert.equal(standard, "NUDI Token v1.0", "Has the correct standard");
        });
    });

    it('Allocates the inital supply upon deployment', function() {
        return NUDI_Token.deployed().then(function(instance) {
          tokenInstance = instance;
          return tokenInstance.totalSupply();
        }).then(function(totalSupply) {
          assert.equal(totalSupply, 1000000, 'has the correct supply');
          return tokenInstance.balanceOf(accounts[0]);
        }).then(function(adminBalance){
            assert.equal(adminBalance.toNumber(), 1000000, "It allocates the inital supply to the admin account")
        });
    });

    it("Transfers token ownership", function(){
        return NUDI_Token.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.transfer.call(accounts[1], 99999999)
            //Using the call does not trigger a transaction receipt
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, "Error message must contain revert");
            return tokenInstance.transfer.call(accounts[1], 250000, {from: accounts[0]});
        }).then(function(success){
            assert.equal(success, true, "Bool true was to be returned");
            return tokenInstance.transfer(accounts[1], 250000, {from: accounts[0]} );
        }).then(function(receipt){
            //receipt generated because  .call was not used to call transfer()
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'Should be the transfer event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'Should be the from account');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'Should be the to account');
            assert.equal(receipt.logs[0].args._value, 250000, 'Should be the transfer amount of 250,000');
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance){
            assert.equal(balance.toNumber(), 250000, "Balance was not equal to transfered amount 250,000");
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance){
            assert.equal(balance.toNumber(), 750000, "Balance of sender was not correct amount 750,000");
        });
    });

    it('Approve tokens for delegated transfer', function(){
        return NUDI_Token.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
        }).then(function(success){
            assert.equal(success, true, "Expected transfer to be approved");
            return tokenInstance.approve(accounts[1], 100);
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Approval', 'Should be the approval event');
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'Should be the owner account');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'Should be the spender account');
            assert.equal(receipt.logs[0].args._value, 100, 'Should be the transfer amount of 100');
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function(allowance){
            assert.equal(allowance, 100, "Stores the allowance for delegated transfers");
        });
    });

    it("Handles delegated transfer", function(){
        return NUDI_Token.deployed().then(function(instance){
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];
            return tokenInstance.transfer(fromAccount, 100, {from: accounts[0]});
        }).then(function(receipt){
            //approve spending account to spend 10 tokens from the fromAccount
            return tokenInstance.approve(spendingAccount, 10, {from: fromAccount});
        }).then(function(receipt){
            //Try transfering larger than the senders balance
            return tokenInstance.transferFrom(fromAccount, toAccount, 999, {from: spendingAccount});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf("revert") >= 0, "Transfer amount was larger than allowed spending");
            return tokenInstance.transferFrom(fromAccount, toAccount, 25, {from: spendingAccount});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf("revert") >= 0, "Allowance amount was larger than allowed spending");
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from: spendingAccount}); 
        }).then(function(success){
            assert.equal(success, true, "Boolean was to be returned by transferFrom()");
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spendingAccount});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'Should be the transfer event');
            assert.equal(receipt.logs[0].args._from, fromAccount, 'Should be the from account');
            assert.equal(receipt.logs[0].args._to, toAccount, 'Should be the to account');
            assert.equal(receipt.logs[0].args._value, 10, 'Should be the transfer amount of 10');
            return tokenInstance.balanceOf(fromAccount);
        }).then(function(balance){
            assert.equal(balance.toNumber(), 90, "Deduct amount form the sending account");
            return tokenInstance.balanceOf(toAccount);
        }).then(function(balance){
            assert.equal(balance.toNumber(), 10, "Adds amount form the sending account");
            return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then(function(allowance){
            assert.equal(allowance, 0, "Deducts the amount from the allowance");
        });
    });

});

