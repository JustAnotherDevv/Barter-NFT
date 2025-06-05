// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FakeNFTCollection {

    uint256 public totalSupply;
    address public owner;
    string private _baseTokenURI;

    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256[]) public tokensOf;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event BaseURIUpdated(string newBaseURI);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function mint(address to, uint256 quantity) public {
        require(to != address(0), "Cannot mint to zero address");
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = totalSupply;
            ownerOf[tokenId] = to;
            tokensOf[to].push(tokenId);
            totalSupply++;
            emit Transfer(address(0), to, tokenId);
        }
    }

    function getTotalSupply() public view returns (uint256) {
        return totalSupply;
    }

    function balanceOf(address tokenOwner) public view returns (uint256) {
        require(tokenOwner != address(0), "Cannot query balance of zero address");
        return tokensOf[tokenOwner].length;
    }

    function getTokensOf(address tokenOwner) public view returns (uint256[] memory) {
        return tokensOf[tokenOwner];
    }

    function tokenOfOwnerByIndex(address tokenOwner, uint256 index) public view returns (uint256) {
        require(index < tokensOf[tokenOwner].length, "Index out of bounds");
        return tokensOf[tokenOwner][index];
    }

    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }

    function baseURI() public view returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(ownerOf[tokenId] != address(0), "Token does not exist");
        
        string memory baseUri = _baseTokenURI;
        if (bytes(baseUri).length == 0) {
            return "";
        }
        
        return string(abi.encodePacked(baseUri, toString(tokenId), ".json"));
    }

    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return ownerOf[tokenId] != address(0);
    }
}