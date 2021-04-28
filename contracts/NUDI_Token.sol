// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

//This is the Nugget And Skadi Token(NUDI) pronounced like nutty
//This token has no intention of launching but is ERC20 compliant 
//ERC20 Standard: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
contract NUDI_Token
{
    /*TODO
    Constructor
    Set tokens
    Read total tokens
    */
    uint256 public totalSupply;
    string public name = "NuggetSkadiToken";
    string public symbol = "NUDI";
    string public standard = "NUDI Token v1.0";

    //Make hash table of key value store
    //This meets the balanceOf requirements found on the ERC20 interface standard
    mapping(address => uint256) public balanceOf;
    //This meets the allowance requirements fround on the ERC20 interface standard
    //This is basically a dictionary of a dictionary similar to python
    mapping(address => mapping(address => uint256)) public allowance;

    //Events are a form of signal that can be emitted from inside the smart contract
    //These events can be subscribed to and listened to on the network
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value);

    constructor(uint256 _initialSupply) public
    {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }
    /*
        Transfers _value amount of tokens to address _to, and MUST fire the Transfer event. 
        The function SHOULD throw if the message caller's account balance does not have enough tokens to spend.
     */
    function transfer(address _to, uint256 _value) public returns(bool success)
    {
        require(balanceOf[msg.sender] >= _value, "Error: 001");

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    /*
        Transfers _value amount of tokens from address _from to address _to, and MUST fire the Transfer event.

        The transferFrom method is used for a withdraw workflow, allowing contracts to transfer tokens on your behalf. 
    */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success)
    {
        //make sure the from account has enough tokens to transfer
        require(balanceOf[_from] >= _value);
        //Make sure the allowance amount is less than the approved amount
        require(allowance[_from][msg.sender] >= _value);

        balanceOf[_to] += _value;
        balanceOf[_from] -= _value;

        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);
        return true;
    }

    /*
        Allows _spender to withdraw from your account multiple times, up to the _value amount. 
        If this function is called again it overwrites the current allowance with _value.
    */
    function approve(address _spender, uint256 _value) public returns (bool success)
    {
        address _owner = msg.sender;
        allowance[msg.sender][_spender] = _value;

        emit Approval(_owner, _spender, _value);
        return true;
    }
}