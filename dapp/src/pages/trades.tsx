import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeftRight,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  AlertCircle,
  Zap,
  Users,
  TrendingUp,
  Search,
  Wallet,
  RefreshCw,
} from "lucide-react";

const TRADING_CONTRACT_ADDRESS = "0xF320422365B52bB109564aD0A2c6ceEb0d2eC3CF";
const NFT_CONTRACT_ADDRESS = "0x302bBdCAE2037301d183Ab1917863b41a3c499da";

const TRADING_ABI = [
  {
    name: "proposeTrade",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "_recipient", type: "address" },
      {
        name: "_offeredNFTs",
        type: "tuple[]",
        components: [
          { name: "nftContract", type: "address" },
          { name: "tokenId", type: "uint256" },
        ],
      },
      {
        name: "_requestedNFTs",
        type: "tuple[]",
        components: [
          { name: "nftContract", type: "address" },
          { name: "tokenId", type: "uint256" },
        ],
      },
      { name: "_expirationTime", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "createCounterOffer",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "_originalTradeId", type: "uint256" },
      {
        name: "_offeredNFTs",
        type: "tuple[]",
        components: [
          { name: "nftContract", type: "address" },
          { name: "tokenId", type: "uint256" },
        ],
      },
      {
        name: "_requestedNFTs",
        type: "tuple[]",
        components: [
          { name: "nftContract", type: "address" },
          { name: "tokenId", type: "uint256" },
        ],
      },
      { name: "_expirationTime", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "acceptTrade",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_tradeId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "cancelTrade",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_tradeId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "depositNFTs",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_tradeId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getTrade",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_tradeId", type: "uint256" }],
    outputs: [
      { name: "proposer", type: "address" },
      { name: "recipient", type: "address" },
      {
        name: "offeredNFTs",
        type: "tuple[]",
        components: [
          { name: "nftContract", type: "address" },
          { name: "tokenId", type: "uint256" },
        ],
      },
      {
        name: "requestedNFTs",
        type: "tuple[]",
        components: [
          { name: "nftContract", type: "address" },
          { name: "tokenId", type: "uint256" },
        ],
      },
      { name: "expirationTime", type: "uint256" },
      { name: "status", type: "uint8" },
      { name: "proposerDeposited", type: "bool" },
      { name: "recipientDeposited", type: "bool" },
    ],
  },
  {
    name: "getUserActiveTrades",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_user", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "nextTradeId",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "feePerNFT",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "counterOffers",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const NFT_ABI = [
  {
    name: "getTokensOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "setApprovalForAll",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "operator", type: "address" },
      { name: "approved", type: "bool" },
    ],
    outputs: [],
  },
] as const;

const TradeStatus = {
  0: "Active",
  1: "Accepted",
  2: "Executed",
  3: "Cancelled",
  4: "Expired",
  5: "CounterOffered",
};

const StatusColors = {
  0: "bg-blue-500",
  1: "bg-yellow-500",
  2: "bg-green-500",
  3: "bg-red-500",
  4: "bg-gray-500",
  5: "bg-purple-500",
};

export function TradingPage() {
  const { address, isConnected } = useAccount();
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [requestedNFTs, setRequestedNFTs] = useState([]);
  const [recipient, setRecipient] = useState("");
  const [expirationDays, setExpirationDays] = useState(7);
  const [showCreateTrade, setShowCreateTrade] = useState(false);
  const [selectedTradeId, setSelectedTradeId] = useState(null);
  const [activeTab, setActiveTab] = useState("browse");
  const [targetUserAddress, setTargetUserAddress] = useState("");
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [createTradeStep, setCreateTradeStep] = useState(1);
  const [showCounterOffer, setShowCounterOffer] = useState(false);
  const [counterOfferTradeId, setCounterOfferTradeId] = useState(null);

  const {
    writeContract: writeTradingContract,
    data: tradingHash,
    isPending: isTradingPending,
  } = useWriteContract();
  const {
    writeContract: writeNFTContract,
    data: nftHash,
    isPending: isNFTPending,
  } = useWriteContract();

  const { data: userNFTs, refetch: refetchUserNFTs } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: NFT_ABI,
    functionName: "getTokensOf",
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  const { data: targetUserNFTs, refetch: refetchTargetNFTs } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: NFT_ABI,
    functionName: "getTokensOf",
    args: isValidAddress ? [targetUserAddress] : undefined,
    enabled: isValidAddress,
  });

  const { data: userTrades, refetch: refetchUserTrades } = useReadContract({
    address: TRADING_CONTRACT_ADDRESS,
    abi: TRADING_ABI,
    functionName: "getUserActiveTrades",
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  const { data: nextTradeId } = useReadContract({
    address: TRADING_CONTRACT_ADDRESS,
    abi: TRADING_ABI,
    functionName: "nextTradeId",
  });

  const { data: feePerNFT } = useReadContract({
    address: TRADING_CONTRACT_ADDRESS,
    abi: TRADING_ABI,
    functionName: "feePerNFT",
  });

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: tradingHash,
  });

  const validateAddress = (addr) => {
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    return addressRegex.test(addr);
  };

  useEffect(() => {
    if (targetUserAddress && validateAddress(targetUserAddress)) {
      setIsValidAddress(true);
      setRecipient(targetUserAddress);
    } else {
      setIsValidAddress(false);
      if (targetUserAddress === "") setRecipient("");
    }
  }, [targetUserAddress]);

  useEffect(() => {
    if (!showCreateTrade && !showCounterOffer) {
      setSelectedNFTs([]);
      setRequestedNFTs([]);
      setRecipient("");
      setTargetUserAddress("");
      setCreateTradeStep(1);
      setIsValidAddress(false);
      setCounterOfferTradeId(null);
    }
  }, [showCreateTrade, showCounterOffer]);

  const tradeIds = nextTradeId
    ? Array.from({ length: Number(nextTradeId) - 1 }, (_, i) => i + 1)
    : [];

  const handleCreateTrade = async () => {
    if (!selectedNFTs.length || !requestedNFTs.length || !recipient) return;

    const offeredNFTs = selectedNFTs.map((tokenId) => ({
      nftContract: NFT_CONTRACT_ADDRESS,
      tokenId: BigInt(tokenId),
    }));

    const requestedNFTsFormatted = requestedNFTs.map((tokenId) => ({
      nftContract: NFT_CONTRACT_ADDRESS,
      tokenId: BigInt(tokenId),
    }));

    const expirationTime = BigInt(
      Math.floor(Date.now() / 1000) + expirationDays * 24 * 60 * 60
    );
    const totalNFTs = selectedNFTs.length + requestedNFTs.length;
    const fee = feePerNFT ? BigInt(feePerNFT) * BigInt(totalNFTs) : BigInt(0);

    try {
      writeTradingContract({
        address: TRADING_CONTRACT_ADDRESS,
        abi: TRADING_ABI,
        functionName: "proposeTrade",
        args: [recipient, offeredNFTs, requestedNFTsFormatted, expirationTime],
        value: fee,
      });
    } catch (error) {
      console.error("Error creating trade:", error);
    }
  };

  const handleApproveAll = async () => {
    try {
      writeNFTContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: "setApprovalForAll",
        args: [TRADING_CONTRACT_ADDRESS, true],
      });
    } catch (error) {
      console.error("Error approving:", error);
    }
  };

  const handleAcceptTrade = async (tradeId) => {
    try {
      writeTradingContract({
        address: TRADING_CONTRACT_ADDRESS,
        abi: TRADING_ABI,
        functionName: "acceptTrade",
        args: [BigInt(tradeId)],
      });
    } catch (error) {
      console.error("Error accepting trade:", error);
    }
  };

  const handleDepositNFTs = async (tradeId) => {
    try {
      writeTradingContract({
        address: TRADING_CONTRACT_ADDRESS,
        abi: TRADING_ABI,
        functionName: "depositNFTs",
        args: [BigInt(tradeId)],
      });
    } catch (error) {
      console.error("Error depositing NFTs:", error);
    }
  };

  const handleCancelTrade = async (tradeId) => {
    try {
      writeTradingContract({
        address: TRADING_CONTRACT_ADDRESS,
        abi: TRADING_ABI,
        functionName: "cancelTrade",
        args: [BigInt(tradeId)],
      });
    } catch (error) {
      console.error("Error cancelling trade:", error);
    }
  };

  const handleCreateCounterOffer = async (originalTradeId) => {
    if (!selectedNFTs.length || !requestedNFTs.length) return;

    const offeredNFTs = selectedNFTs.map((tokenId) => ({
      nftContract: NFT_CONTRACT_ADDRESS,
      tokenId: BigInt(tokenId),
    }));

    const requestedNFTsFormatted = requestedNFTs.map((tokenId) => ({
      nftContract: NFT_CONTRACT_ADDRESS,
      tokenId: BigInt(tokenId),
    }));

    const expirationTime = BigInt(
      Math.floor(Date.now() / 1000) + expirationDays * 24 * 60 * 60
    );
    const totalNFTs = selectedNFTs.length + requestedNFTs.length;
    const fee = feePerNFT ? BigInt(feePerNFT) * BigInt(totalNFTs) : BigInt(0);

    try {
      writeTradingContract({
        address: TRADING_CONTRACT_ADDRESS,
        abi: TRADING_ABI,
        functionName: "createCounterOffer",
        args: [
          BigInt(originalTradeId),
          offeredNFTs,
          requestedNFTsFormatted,
          expirationTime,
        ],
        value: fee,
      });
    } catch (error) {
      console.error("Error creating counter offer:", error);
    }
  };

  if (!isConnected) {
    return (
      <div className="container py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-16"
        >
          <Wallet className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Connect your wallet to access the NFT trading marketplace
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row gap-4 md:items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ArrowLeftRight className="h-8 w-8 text-primary" />
            NFT Trading Marketplace
          </h1>
          <p className="text-muted-foreground mt-1">
            Trade your NFTs with other collectors
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        <Dialog open={showCreateTrade} onOpenChange={setShowCreateTrade}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create Trade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Create New Trade
                <Badge variant="outline">Step {createTradeStep} of 2</Badge>
              </DialogTitle>
            </DialogHeader>

            {createTradeStep === 1 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Label>Target User Address</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="0x... (user you want to trade with)"
                        value={targetUserAddress}
                        onChange={(e) => setTargetUserAddress(e.target.value)}
                        className={
                          isValidAddress
                            ? "border-green-500"
                            : targetUserAddress
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {isValidAddress && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={refetchTargetNFTs}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {targetUserAddress && !isValidAddress && (
                      <p className="text-sm text-red-500 mt-1">
                        Invalid Ethereum address
                      </p>
                    )}
                    {isValidAddress && (
                      <p className="text-sm text-green-500 mt-1 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Valid address
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Trade Expiration</Label>
                    <Input
                      type="number"
                      value={expirationDays}
                      onChange={(e) =>
                        setExpirationDays(Number(e.target.value))
                      }
                      min="1"
                      max="30"
                      placeholder="Days until expiration"
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-lg">Select Your NFTs to Offer</Label>
                    <Badge variant="secondary">
                      {selectedNFTs.length} selected
                    </Badge>
                  </div>

                  {userNFTs && userNFTs.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-60 overflow-y-auto bg-muted/50 p-4 rounded-lg">
                      {userNFTs.map((tokenId) => (
                        <Card
                          key={tokenId.toString()}
                          className={`cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
                            selectedNFTs.includes(tokenId.toString())
                              ? "ring-2 ring-primary bg-primary/5"
                              : "hover:bg-accent"
                          }`}
                          onClick={() => {
                            const tokenIdStr = tokenId.toString();
                            if (selectedNFTs.includes(tokenIdStr)) {
                              setSelectedNFTs(
                                selectedNFTs.filter((id) => id !== tokenIdStr)
                              );
                            } else {
                              setSelectedNFTs([...selectedNFTs, tokenIdStr]);
                            }
                          }}
                        >
                          <CardContent className="p-3 text-center">
                            <div className="w-full aspect-square bg-gradient-to-br from-primary/20 to-primary/30 rounded-lg flex items-center justify-center mb-2">
                              <span className="font-bold text-sm">
                                #{tokenId.toString()}
                              </span>
                            </div>
                            <p className="text-xs font-medium">
                              NFT #{tokenId.toString()}
                            </p>
                            {selectedNFTs.includes(tokenId.toString()) && (
                              <CheckCircle className="h-3 w-3 text-primary mx-auto mt-1" />
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Wallet className="h-8 w-8 mx-auto mb-2" />
                      <p>No NFTs found in your wallet</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateTrade(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setCreateTradeStep(2)}
                    disabled={!isValidAddress || selectedNFTs.length === 0}
                  >
                    Next: Browse Target User's NFTs
                    <ArrowLeftRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Trading with:</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCreateTradeStep(1)}
                    >
                      Back to Step 1
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">
                    {targetUserAddress}
                  </p>
                  <p className="text-sm mt-1">
                    You're offering{" "}
                    <Badge variant="secondary">{selectedNFTs.length}</Badge> NFT
                    {selectedNFTs.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-lg">Select NFTs You Want</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {requestedNFTs.length} selected
                      </Badge>
                      {isValidAddress && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={refetchTargetNFTs}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {targetUserNFTs && targetUserNFTs.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-60 overflow-y-auto bg-muted/50 p-4 rounded-lg">
                      {targetUserNFTs.map((tokenId) => (
                        <Card
                          key={tokenId.toString()}
                          className={`cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
                            requestedNFTs.includes(tokenId.toString())
                              ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950"
                              : "hover:bg-accent"
                          }`}
                          onClick={() => {
                            const tokenIdStr = tokenId.toString();
                            if (requestedNFTs.includes(tokenIdStr)) {
                              setRequestedNFTs(
                                requestedNFTs.filter((id) => id !== tokenIdStr)
                              );
                            } else {
                              setRequestedNFTs([...requestedNFTs, tokenIdStr]);
                            }
                          }}
                        >
                          <CardContent className="p-3 text-center">
                            <div className="w-full aspect-square bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-lg flex items-center justify-center mb-2">
                              <span className="font-bold text-sm">
                                #{tokenId.toString()}
                              </span>
                            </div>
                            <p className="text-xs font-medium">
                              NFT #{tokenId.toString()}
                            </p>
                            {requestedNFTs.includes(tokenId.toString()) && (
                              <CheckCircle className="h-3 w-3 text-purple-500 mx-auto mt-1" />
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : isValidAddress ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2" />
                      <p>This user has no NFTs</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>Enter a valid address to browse NFTs</p>
                    </div>
                  )}
                </div>

                {feePerNFT &&
                  (selectedNFTs.length > 0 || requestedNFTs.length > 0) && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-primary">
                        <Zap className="h-4 w-4" />
                        <span className="font-medium">Trading Fee</span>
                      </div>
                      <p className="text-sm text-primary/80 mt-1">
                        {(
                          (Number(feePerNFT) *
                            (selectedNFTs.length + requestedNFTs.length)) /
                          1e18
                        ).toFixed(4)}{" "}
                        ETH
                        <span className="text-xs ml-1">
                          ({selectedNFTs.length + requestedNFTs.length} NFTs ×{" "}
                          {(Number(feePerNFT) / 1e18).toFixed(4)} ETH)
                        </span>
                      </p>
                    </div>
                  )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleApproveAll}
                    variant="outline"
                    disabled={isNFTPending}
                    className="flex-1"
                  >
                    {isNFTPending ? "Approving..." : "Approve All NFTs"}
                  </Button>

                  <Button
                    onClick={handleCreateTrade}
                    disabled={
                      isTradingPending ||
                      !selectedNFTs.length ||
                      !requestedNFTs.length ||
                      !isValidAddress
                    }
                    className="flex-1"
                  >
                    {isTradingPending ? "Creating Trade..." : "Create Trade"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showCounterOffer} onOpenChange={setShowCounterOffer}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Create Counter Offer
                <Badge variant="outline">Trade #{counterOfferTradeId}</Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">
                  Creating counter offer for Trade #{counterOfferTradeId}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Select your NFTs to offer and the NFTs you want in return
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-lg">Your NFTs to Offer</Label>
                    <Badge variant="secondary">
                      {selectedNFTs.length} selected
                    </Badge>
                  </div>

                  {userNFTs && userNFTs.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto bg-muted/50 p-4 rounded-lg">
                      {userNFTs.map((tokenId) => (
                        <Card
                          key={tokenId.toString()}
                          className={`cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
                            selectedNFTs.includes(tokenId.toString())
                              ? "ring-2 ring-primary bg-primary/5"
                              : "hover:bg-accent"
                          }`}
                          onClick={() => {
                            const tokenIdStr = tokenId.toString();
                            if (selectedNFTs.includes(tokenIdStr)) {
                              setSelectedNFTs(
                                selectedNFTs.filter((id) => id !== tokenIdStr)
                              );
                            } else {
                              setSelectedNFTs([...selectedNFTs, tokenIdStr]);
                            }
                          }}
                        >
                          <CardContent className="p-3 text-center">
                            <div className="w-full aspect-square bg-gradient-to-br from-primary/20 to-primary/30 rounded-lg flex items-center justify-center mb-2">
                              <span className="font-bold text-sm">
                                #{tokenId.toString()}
                              </span>
                            </div>
                            <p className="text-xs font-medium">
                              #{tokenId.toString()}
                            </p>
                            {selectedNFTs.includes(tokenId.toString()) && (
                              <CheckCircle className="h-3 w-3 text-primary mx-auto mt-1" />
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Wallet className="h-8 w-8 mx-auto mb-2" />
                      <p>No NFTs found</p>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-lg">NFTs You Want</Label>
                    <Badge variant="secondary">
                      {requestedNFTs.length} selected
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto bg-muted/50 p-4 rounded-lg">
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">
                        Add NFT selection for counter offers
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCounterOffer(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleCreateCounterOffer(counterOfferTradeId)}
                  disabled={isTradingPending || !selectedNFTs.length}
                  className="flex-1"
                >
                  {isTradingPending
                    ? "Creating Counter Offer..."
                    : "Create Counter Offer"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 lg:w-96">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Browse Trades
          </TabsTrigger>
          <TabsTrigger value="my-trades" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            My Trades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tradeIds.map((tradeId) => (
              <TradeCard
                key={tradeId}
                tradeId={tradeId}
                currentUser={address}
                onAccept={handleAcceptTrade}
                onDeposit={handleDepositNFTs}
                onCancel={handleCancelTrade}
                onCounterOffer={(tradeId) => {
                  setCounterOfferTradeId(tradeId);
                  setShowCounterOffer(true);
                }}
                writeNFTContract={writeNFTContract}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-trades" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userTrades?.map((tradeId) => (
              <TradeCard
                key={tradeId.toString()}
                tradeId={Number(tradeId)}
                currentUser={address}
                onAccept={handleAcceptTrade}
                onDeposit={handleDepositNFTs}
                onCancel={handleCancelTrade}
                onCounterOffer={(tradeId) => {
                  setCounterOfferTradeId(tradeId);
                  setShowCounterOffer(true);
                }}
                showActions={true}
                writeNFTContract={writeNFTContract}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TradeCard({
  tradeId,
  currentUser,
  onAccept,
  onDeposit,
  onCancel,
  onCounterOffer,
  showActions = false,
  writeNFTContract,
}) {
  const { data: tradeData } = useReadContract({
    address: TRADING_CONTRACT_ADDRESS,
    abi: TRADING_ABI,
    functionName: "getTrade",
    args: [BigInt(tradeId)],
  });

  if (!tradeData) return null;

  const [
    proposer,
    recipient,
    offeredNFTs,
    requestedNFTs,
    expirationTime,
    status,
    proposerDeposited,
    recipientDeposited,
  ] = tradeData;
  const isExpired = Number(expirationTime) * 1000 < Date.now();
  const isProposer = proposer.toLowerCase() === currentUser?.toLowerCase();
  const isRecipient = recipient.toLowerCase() === currentUser?.toLowerCase();
  const canAccept = isRecipient && status === 0 && !isExpired;
  const canDeposit = (isProposer || isRecipient) && status === 1 && !isExpired;
  const canCancel =
    (isProposer || isRecipient) && (status === 0 || status === 1) && !isExpired;
  const canCounterOffer = isRecipient && status === 0 && !isExpired;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg hover:border-primary/50 transition-all duration-200 group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Trade #{tradeId}</h3>
            <Badge className={`${StatusColors[status]} text-white`}>
              {TradeStatus[status]}
            </Badge>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <div>
              From: {proposer.slice(0, 6)}...{proposer.slice(-4)}
            </div>
            <div>
              To: {recipient.slice(0, 6)}...{recipient.slice(-4)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Expires:{" "}
              {new Date(Number(expirationTime) * 1000).toLocaleDateString()}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-primary mb-2">
                Offering ({offeredNFTs.length})
              </h4>
              <div className="space-y-1">
                {offeredNFTs.slice(0, 3).map((nft, idx) => (
                  <div key={idx} className="text-xs bg-muted rounded px-2 py-1">
                    #{nft.tokenId.toString()}
                  </div>
                ))}
                {offeredNFTs.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{offeredNFTs.length - 3} more
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-purple-600 mb-2">
                Requesting ({requestedNFTs.length})
              </h4>
              <div className="space-y-1">
                {requestedNFTs.slice(0, 3).map((nft, idx) => (
                  <div key={idx} className="text-xs bg-muted rounded px-2 py-1">
                    #{nft.tokenId.toString()}
                  </div>
                ))}
                {requestedNFTs.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{requestedNFTs.length - 3} more
                  </div>
                )}
              </div>
            </div>
          </div>

          {status === 1 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
              <div className="text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span>Proposer deposited:</span>
                  {proposerDeposited ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Recipient deposited:</span>
                  {recipientDeposited ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          )}

          {(showActions ||
            canAccept ||
            canDeposit ||
            canCancel ||
            canCounterOffer) && (
            <div className="space-y-2">
              {canDeposit && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
                  <p className="text-xs mb-2">
                    Before depositing, make sure your NFTs are approved:
                  </p>
                  <Button
                    onClick={() => {
                      writeNFTContract({
                        address: NFT_CONTRACT_ADDRESS,
                        abi: NFT_ABI,
                        functionName: "setApprovalForAll",
                        args: [TRADING_CONTRACT_ADDRESS, true],
                      });
                    }}
                    size="sm"
                    variant="outline"
                    className="w-full mb-2"
                  >
                    Approve All NFTs
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                {canAccept && (
                  <Button
                    onClick={() => onAccept(tradeId)}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Accept
                  </Button>
                )}

                {canCounterOffer && (
                  <Button
                    onClick={() => onCounterOffer(tradeId)}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <ArrowLeftRight className="h-3 w-3 mr-1" />
                    Counter
                  </Button>
                )}

                {canDeposit && (
                  <Button
                    onClick={() => onDeposit(tradeId)}
                    size="sm"
                    className="flex-1"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Deposit
                  </Button>
                )}

                {canCancel && (
                  <Button
                    onClick={() => onCancel(tradeId)}
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
