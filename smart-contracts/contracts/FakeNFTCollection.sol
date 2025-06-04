// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FakeNFTCollection {

    uint256 public totalSupply;

    mapping(uint256 => address) public ownerOf;

    mapping(address => uint256[]) public tokensOf;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

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

    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "Cannot query balance of zero address");
        return tokensOf[owner].length;
    }

    function getTokensOf(address owner) public view returns (uint256[] memory) {
        return tokensOf[owner];
    }

    function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256) {
        require(index < tokensOf[owner].length, "Index out of bounds");
        return tokensOf[owner][index];
    }

}