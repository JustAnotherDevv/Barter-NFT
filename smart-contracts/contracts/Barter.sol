// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
// import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// contract NFTBarteringPlatform is IERC721Receiver, ReentrancyGuard, Pausable, Ownable {
    contract NFTBarteringPlatform is IERC721Receiver, Ownable {

    // Structure to represent an NFT
    struct NFTItem {
        address nftContract;
        uint256 tokenId;
    }
    
    // Structure to represent a trade proposal
    struct TradeProposal {
        address proposer;
        address recipient;
        NFTItem[] offeredNFTs;
        NFTItem[] requestedNFTs;
        uint256 expirationTime;
        TradeStatus status;
        bool proposerDeposited;
        bool recipientDeposited;
    }
    
    // Trade status enum
    enum TradeStatus {
        Active,
        Accepted,
        Executed,
        Cancelled,
        Expired,
        CounterOffered
    }
    
    // Mapping from trade ID to TradeProposal
    mapping(uint256 => TradeProposal) public trades;
    
    // Mapping to track NFTs currently in escrow (nftContract => tokenId => tradeId)
    mapping(address => mapping(uint256 => uint256)) public nftInEscrow;
    
    // Mapping to track counter offers (original trade ID => counter trade ID)
    mapping(uint256 => uint256) public counterOffers;
    
    // Mapping to track user's active trades
    mapping(address => uint256[]) public userActiveTrades;
    
    // Counter for trade IDs
    uint256 public nextTradeId = 1;
    
    // Platform fee in basis points (e.g., 250 = 2.5%)
    uint256 public platformFeePercentage = 250;
    
    // Total fees collected (in ETH)
    uint256 public totalFeesCollected;
    
    // Fee per NFT in a trade (optional, can be 0)
    uint256 public feePerNFT = 0.001 ether;
    
    // Events
    event TradeProposed(
        uint256 indexed tradeId,
        address indexed proposer,
        address indexed recipient,
        uint256 offeredCount,
        uint256 requestedCount,
        uint256 expirationTime
    );
    
    event TradeAccepted(uint256 indexed tradeId, address indexed recipient);
    
    event NFTsDeposited(uint256 indexed tradeId, address indexed depositor, uint256 nftCount);
    
    event TradeExecuted(
        uint256 indexed tradeId,
        address indexed proposer,
        address indexed recipient,
        uint256 totalNFTsTraded
    );
    
    event TradeCancelled(uint256 indexed tradeId, address indexed canceller);
    
    event CounterOfferMade(
        uint256 indexed originalTradeId,
        uint256 indexed counterTradeId,
        address indexed counterOfferer
    );
    
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    
    event FeesWithdrawn(address indexed owner, uint256 amount);
    
    // Modifiers
    modifier tradeExists(uint256 _tradeId) {
        require(_tradeId > 0 && _tradeId < nextTradeId, "Trade does not exist");
        _;
    }
    
    modifier onlyTradeParticipant(uint256 _tradeId) {
        require(
            trades[_tradeId].proposer == msg.sender || 
            trades[_tradeId].recipient == msg.sender,
            "Not a trade participant"
        );
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Propose a new trade
     * @param _recipient Address of the recipient
     * @param _offeredNFTs Array of NFTs being offered
     * @param _requestedNFTs Array of NFTs being requested
     * @param _expirationTime Unix timestamp when the trade expires
     */
    function proposeTrade(
        address _recipient,
        NFTItem[] calldata _offeredNFTs,
        NFTItem[] calldata _requestedNFTs,
        uint256 _expirationTime
    ) public payable returns (uint256) {
        require(_recipient != address(0) && _recipient != msg.sender, "Invalid recipient");
        require(_offeredNFTs.length > 0, "Must offer at least one NFT");
        require(_requestedNFTs.length > 0, "Must request at least one NFT");
        require(_expirationTime > block.timestamp, "Expiration time must be in the future");
        
        // Calculate and verify fee payment
        uint256 totalNFTs = _offeredNFTs.length + _requestedNFTs.length;
        uint256 requiredFee = totalNFTs * feePerNFT;
        require(msg.value >= requiredFee, "Insufficient fee payment");
        
        // Update fees collected
        totalFeesCollected += requiredFee;
        
        // Refund excess payment
        if (msg.value > requiredFee) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - requiredFee}("");
            require(refundSuccess, "Refund failed");
        }
        
        uint256 tradeId = nextTradeId++;
        
        // Create storage reference for the trade
        TradeProposal storage newTrade = trades[tradeId];
        newTrade.proposer = msg.sender;
        newTrade.recipient = _recipient;
        newTrade.expirationTime = _expirationTime;
        newTrade.status = TradeStatus.Active;
        newTrade.proposerDeposited = false;
        newTrade.recipientDeposited = false;
        
        // Store offered NFTs
        for (uint256 i = 0; i < _offeredNFTs.length; i++) {
            require(_offeredNFTs[i].nftContract != address(0), "Invalid NFT contract");
            require(
                IERC721(_offeredNFTs[i].nftContract).ownerOf(_offeredNFTs[i].tokenId) == msg.sender,
                "You don't own this offered NFT"
            );
            require(
                nftInEscrow[_offeredNFTs[i].nftContract][_offeredNFTs[i].tokenId] == 0,
                "Offered NFT already in another trade"
            );
            
            newTrade.offeredNFTs.push(_offeredNFTs[i]);
        }
        
        // Store requested NFTs
        for (uint256 i = 0; i < _requestedNFTs.length; i++) {
            require(_requestedNFTs[i].nftContract != address(0), "Invalid NFT contract");
            require(
                IERC721(_requestedNFTs[i].nftContract).ownerOf(_requestedNFTs[i].tokenId) == _recipient,
                "Recipient doesn't own this requested NFT"
            );
            require(
                nftInEscrow[_requestedNFTs[i].nftContract][_requestedNFTs[i].tokenId] == 0,
                "Requested NFT already in another trade"
            );
            
            newTrade.requestedNFTs.push(_requestedNFTs[i]);
        }
        
        // Add to user's active trades
        userActiveTrades[msg.sender].push(tradeId);
        userActiveTrades[_recipient].push(tradeId);
        
        emit TradeProposed(
            tradeId,
            msg.sender,
            _recipient,
            _offeredNFTs.length,
            _requestedNFTs.length,
            _expirationTime
        );
        
        return tradeId;
    }
    
    /**
     * @dev Accept a trade proposal
     * @param _tradeId ID of the trade to accept
     */
    function acceptTrade(uint256 _tradeId)
        external
        // nonReentrant
        tradeExists(_tradeId)
    {
        TradeProposal storage trade = trades[_tradeId];
        
        require(trade.recipient == msg.sender, "Not the trade recipient");
        require(trade.status == TradeStatus.Active, "Trade not active");
        require(trade.expirationTime > block.timestamp, "Trade expired");
        
        trade.status = TradeStatus.Accepted;
        
        emit TradeAccepted(_tradeId, msg.sender);
    }
    
    /**
     * @dev Deposit NFTs into escrow for an accepted trade
     * @param _tradeId ID of the trade
     */
    function depositNFTs(uint256 _tradeId)
        external
        // nonReentrant
        tradeExists(_tradeId)
        onlyTradeParticipant(_tradeId)
    {
        TradeProposal storage trade = trades[_tradeId];
        
        require(trade.status == TradeStatus.Accepted, "Trade not accepted");
        require(trade.expirationTime > block.timestamp, "Trade expired");
        
        NFTItem[] storage nftsToDeposit;
        bool isProposer = msg.sender == trade.proposer;
        
        if (isProposer) {
            require(!trade.proposerDeposited, "Already deposited");
            nftsToDeposit = trade.offeredNFTs;
        } else {
            require(!trade.recipientDeposited, "Already deposited");
            nftsToDeposit = trade.requestedNFTs;
        }
        
        // Transfer NFTs to escrow
        for (uint256 i = 0; i < nftsToDeposit.length; i++) {
            NFTItem memory nft = nftsToDeposit[i];
            
            // Verify ownership and approval
            require(
                IERC721(nft.nftContract).ownerOf(nft.tokenId) == msg.sender,
                "You don't own this NFT"
            );
            require(
                IERC721(nft.nftContract).getApproved(nft.tokenId) == address(this) ||
                IERC721(nft.nftContract).isApprovedForAll(msg.sender, address(this)),
                "Contract not approved for NFT"
            );
            
            // Mark NFT as in escrow
            nftInEscrow[nft.nftContract][nft.tokenId] = _tradeId;
            
            // Transfer NFT to contract
            IERC721(nft.nftContract).safeTransferFrom(msg.sender, address(this), nft.tokenId);
        }
        
        // Update deposit status
        if (isProposer) {
            trade.proposerDeposited = true;
        } else {
            trade.recipientDeposited = true;
        }
        
        emit NFTsDeposited(_tradeId, msg.sender, nftsToDeposit.length);
        
        // If both parties have deposited, execute the trade
        if (trade.proposerDeposited && trade.recipientDeposited) {
            _executeTrade(_tradeId);
        }
    }
    
    /**
     * @dev Internal function to execute a trade
     * @param _tradeId ID of the trade
     */
    function _executeTrade(uint256 _tradeId) internal {
        TradeProposal storage trade = trades[_tradeId];
        
        trade.status = TradeStatus.Executed;
        
        // Transfer offered NFTs to recipient
        for (uint256 i = 0; i < trade.offeredNFTs.length; i++) {
            NFTItem memory nft = trade.offeredNFTs[i];
            delete nftInEscrow[nft.nftContract][nft.tokenId];
            IERC721(nft.nftContract).safeTransferFrom(address(this), trade.recipient, nft.tokenId);
        }
        
        // Transfer requested NFTs to proposer
        for (uint256 i = 0; i < trade.requestedNFTs.length; i++) {
            NFTItem memory nft = trade.requestedNFTs[i];
            delete nftInEscrow[nft.nftContract][nft.tokenId];
            IERC721(nft.nftContract).safeTransferFrom(address(this), trade.proposer, nft.tokenId);
        }
        
        // Remove from active trades
        _removeFromActiveTrades(trade.proposer, _tradeId);
        _removeFromActiveTrades(trade.recipient, _tradeId);
        
        emit TradeExecuted(
            _tradeId,
            trade.proposer,
            trade.recipient,
            trade.offeredNFTs.length + trade.requestedNFTs.length
        );
    }
    
    /**
     * @dev Cancel a trade
     * @param _tradeId ID of the trade to cancel
     */
    function cancelTrade(uint256 _tradeId)
        external
        // nonReentrant
        tradeExists(_tradeId)
        onlyTradeParticipant(_tradeId)
    {
        TradeProposal storage trade = trades[_tradeId];
        
        require(
            trade.status == TradeStatus.Active || trade.status == TradeStatus.Accepted,
            "Trade cannot be cancelled"
        );
        
        trade.status = TradeStatus.Cancelled;
        
        // Return deposited NFTs if any
        if (trade.proposerDeposited) {
            for (uint256 i = 0; i < trade.offeredNFTs.length; i++) {
                NFTItem memory nft = trade.offeredNFTs[i];
                delete nftInEscrow[nft.nftContract][nft.tokenId];
                IERC721(nft.nftContract).safeTransferFrom(address(this), trade.proposer, nft.tokenId);
            }
        }
        
        if (trade.recipientDeposited) {
            for (uint256 i = 0; i < trade.requestedNFTs.length; i++) {
                NFTItem memory nft = trade.requestedNFTs[i];
                delete nftInEscrow[nft.nftContract][nft.tokenId];
                IERC721(nft.nftContract).safeTransferFrom(address(this), trade.recipient, nft.tokenId);
            }
        }
        
        // Remove from active trades
        _removeFromActiveTrades(trade.proposer, _tradeId);
        _removeFromActiveTrades(trade.recipient, _tradeId);
        
        emit TradeCancelled(_tradeId, msg.sender);
    }
    
    /**
     * @dev Create a counter offer for an existing trade
     * @param _originalTradeId ID of the original trade
     * @param _offeredNFTs New array of NFTs being offered
     * @param _requestedNFTs New array of NFTs being requested
     * @param _expirationTime Unix timestamp when the counter offer expires
     */
    function createCounterOffer(
        uint256 _originalTradeId,
        NFTItem[] calldata _offeredNFTs,
        NFTItem[] calldata _requestedNFTs,
        uint256 _expirationTime
    ) external payable tradeExists(_originalTradeId) returns (uint256) {
        TradeProposal storage originalTrade = trades[_originalTradeId];
        
        require(originalTrade.recipient == msg.sender, "Only recipient can counter offer");
        require(originalTrade.status == TradeStatus.Active, "Original trade not active");
        
        // Mark original trade as counter offered
        originalTrade.status = TradeStatus.CounterOffered;
        
        // Create new trade as counter offer (roles reversed)
        uint256 counterTradeId = proposeTrade(
            originalTrade.proposer,
            _offeredNFTs,
            _requestedNFTs,
            _expirationTime
        );
        
        // Link counter offer to original trade
        counterOffers[_originalTradeId] = counterTradeId;
        
        emit CounterOfferMade(_originalTradeId, counterTradeId, msg.sender);
        
        return counterTradeId;
    }
    
    /**
     * @dev Get trade details
     * @param _tradeId ID of the trade
     */
    function getTrade(uint256 _tradeId) 
        external 
        view 
        tradeExists(_tradeId) 
        returns (
            address proposer,
            address recipient,
            NFTItem[] memory offeredNFTs,
            NFTItem[] memory requestedNFTs,
            uint256 expirationTime,
            TradeStatus status,
            bool proposerDeposited,
            bool recipientDeposited
        ) 
    {
        TradeProposal storage trade = trades[_tradeId];
        return (
            trade.proposer,
            trade.recipient,
            trade.offeredNFTs,
            trade.requestedNFTs,
            trade.expirationTime,
            trade.status,
            trade.proposerDeposited,
            trade.recipientDeposited
        );
    }
    
    /**
     * @dev Get user's active trades
     * @param _user Address of the user
     */
    function getUserActiveTrades(address _user) external view returns (uint256[] memory) {
        return userActiveTrades[_user];
    }
    
    /**
     * @dev Internal function to remove trade from user's active list
     */
    function _removeFromActiveTrades(address _user, uint256 _tradeId) internal {
        uint256[] storage userTrades = userActiveTrades[_user];
        for (uint256 i = 0; i < userTrades.length; i++) {
            if (userTrades[i] == _tradeId) {
                userTrades[i] = userTrades[userTrades.length - 1];
                userTrades.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Update fee per NFT (only owner)
     * @param _newFee New fee in wei
     */
    function updateFeePerNFT(uint256 _newFee) external onlyOwner {
        uint256 oldFee = feePerNFT;
        feePerNFT = _newFee;
        emit FeeUpdated(oldFee, _newFee);
    }
    
    /**
     * @dev Withdraw accumulated fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 amount = totalFeesCollected;
        require(amount > 0, "No fees to withdraw");
        
        totalFeesCollected = 0;
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit FeesWithdrawn(owner(), amount);
    }
    
    /**
     * @dev Pause the contract (only owner)
     */
    // function pause() external onlyOwner {
    //     _pause();
    // }
    
    /**
     * @dev Unpause the contract (only owner)
     */
    // function unpause() external onlyOwner {
    //     _unpause();
    // }
    
    /**
     * @dev Required for receiving NFTs
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
    
    /**
     * @dev Fallback function to receive ETH
     */
    receive() external payable {}
}