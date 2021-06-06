// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Address.sol";

/// @title Birthday
/// @author Thibault C.
/// @notice Deploy this contract to create a giving pool for a friend
/// @dev Contract will be update after a configured period of time
contract Birthday {
  using Address for address payable;
  address private _star;
  uint private _birthday;

  event Gave(address indexed sender, uint amount);
  event Claimed(address indexed star,uint amount);

  /** @notice
  * @param star_: address of person will celebrates his birthday
  * @param timeRemaining: numbers of seconds before the birthday
  * Using timestamp and timeRemaining, users can set birthday at the specific second
  */
  constructor(address star_, uint timeRemaining) {
    _star = star_;
    _birthday = block.timestamp + timeRemaining;
  }

  /// @notice Check star address 
  function star() public view returns (address) {
    return _star;
  }

  /// @notice Check birthday exact timestamp
  function day() public view returns (uint) {
    return _birthday;
  }

  /// @notice Check seconds left before birthday
  function timeleft() public view returns (uint) {
    return _birthday - block.timestamp;
  }

  /// @notice Check balance of this contract
  function balance() public view returns (uint) {
    return address(this).balance;
  }

  /// @notice Use this function to send an ethers amount to the star
  function give() public payable returns(bool) {
    require(msg.sender != _star, "Birthday: cannot give to yourself");
    require(_birthday > block.timestamp, "Birthday: cannot give if birthday already pass");
    emit Gave(msg.sender, msg.value);
    return true;
  }

  /// @notice Use this function to claim your gift when is it your birthday
  function claim() public returns (bool) {
    require(msg.sender == _star, "Birthday: cannot withdraw star gift");
    require(_birthday <= block.timestamp, "Birthday: cannot get gift before birthday");
    emit Claimed(msg.sender, address(this).balance);
    payable(msg.sender).sendValue(address(this).balance);
    return true;
  }
}