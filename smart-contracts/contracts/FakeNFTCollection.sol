// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FakeNFTCollection is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    string private _baseTokenURI;

    event BaseURIUpdated(string newBaseURI);

    constructor() ERC721("FakeNFTCollection", "FAKE") Ownable(msg.sender) {}

    function mint(address to, uint256 quantity) public {
        require(to != address(0), "Cannot mint to zero address");
        require(quantity > 0, "Quantity must be greater than 0");
        require(quantity <= 100, "Cannot mint more than 100 at once");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;
            _safeMint(to, tokenId);
        }
    }

    function getTotalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    function getTokensOf(address owner) public view returns (uint256[] memory) {
        require(owner != address(0), "Cannot query tokens of zero address");
        
        uint256 balance = balanceOf(owner);
        uint256[] memory tokens = new uint256[](balance);
        uint256 index = 0;
        
        for (uint256 tokenId = 0; tokenId < _tokenIdCounter; tokenId++) {
            if (_ownerOf(tokenId) == owner) {
                tokens[index] = tokenId;
                index++;
                if (index == balance) break;
            }
        }
        
        return tokens;
    }

    function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256) {
        uint256[] memory tokens = getTokensOf(owner);
        require(index < tokens.length, "Index out of bounds");
        return tokens[index];
    }

    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function burn(uint256 tokenId) public {
        address owner = ownerOf(tokenId);
        require(
            msg.sender == owner || 
            getApproved(tokenId) == msg.sender || 
            isApprovedForAll(owner, msg.sender),
            "Caller is not owner nor approved"
        );
        
        _burn(tokenId);
    }

    function batchMintTo(address[] memory recipients, uint256[] memory quantities) public onlyOwner {
        require(recipients.length == quantities.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            mint(recipients[i], quantities[i]);
        }
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return tokenId < _tokenIdCounter && _ownerOf(tokenId) != address(0);
    }
}