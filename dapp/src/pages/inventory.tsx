import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount, useReadContract, useConnect } from "wagmi";

import { Button } from "@/components/ui/button";
import { PlusCircle, Wallet, AlertCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

// Your contract ABI
const CONTRACT_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getTokensOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "ownerOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    name: "getTotalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x302bBdCAE2037301d183Ab1917863b41a3c499da" as const;

export function InventoryPage() {
  const [userNFTs, setUserNFTs] = useState([]);
  const [isProcessingNFTs, setIsProcessingNFTs] = useState(false);

  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  // Read user's token balance
  const {
    data: balance,
    isError: balanceError,
    isLoading: balanceLoading,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  // Read user's token IDs
  const {
    data: tokenIds,
    isError: tokenIdsError,
    isLoading: tokenIdsLoading,
    refetch: refetchTokenIds,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getTokensOf",
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  // Process token IDs into NFT objects
  useEffect(() => {
    const processNFTs = async () => {
      if (!tokenIds || !Array.isArray(tokenIds)) {
        setUserNFTs([]);
        return;
      }

      setIsProcessingNFTs(true);

      try {
        // Convert token IDs to NFT objects
        const nfts = tokenIds.map((tokenId) => {
          const tokenIdString = tokenId.toString();

          return {
            id: tokenIdString,
            tokenId: tokenIdString,
            name: `NFT #${tokenIdString}`,
            collection: "FakeNFTCollection",
            owner: address,
            contractAddress: CONTRACT_ADDRESS,
          };
        });

        setUserNFTs(nfts);
      } catch (error) {
        console.error("Error processing NFTs:", error);
        setUserNFTs([]);
      } finally {
        setIsProcessingNFTs(false);
      }
    };

    processNFTs();
  }, [tokenIds, address]);

  // Handle refresh
  const handleRefresh = () => {
    refetchTokenIds();
  };

  // If wallet not connected, show connect button
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
            Connect your wallet to view and manage your NFT collection
          </p>

          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            {connectors.map((connector) => (
              <Button
                key={connector.uid}
                onClick={() => connect({ connector })}
                variant="outline"
                size="lg"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect with {connector.name}
              </Button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const isLoading = balanceLoading || tokenIdsLoading || isProcessingNFTs;
  const hasError = balanceError || tokenIdsError;

  return (
    <div className="container py-10 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row gap-4 md:items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">My NFT Collection</h1>
          <p className="text-muted-foreground mt-1">
            Manage and trade your digital assets
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
          {balance !== undefined && (
            <p className="text-xs text-muted-foreground">
              Balance: {balance.toString()} NFTs
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="outline" asChild>
            <Link to="/trades">View My Trades</Link>
          </Button>
        </div>
      </motion.div>

      {hasError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              Failed to load NFTs. Please check your connection and try again.
            </span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your NFTs...</p>
          </div>
        </div>
      ) : userNFTs.length > 0 ? (
        <div>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Found {userNFTs.length} NFT{userNFTs.length !== 1 ? "s" : ""} in
              your collection
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {userNFTs.map((nft) => (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-card border rounded-lg overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer group"
                onClick={() => {
                  // Handle NFT click - could open modal or navigate to detail page
                  console.log("Clicked NFT:", nft);
                }}
              >
                <div className="aspect-square bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center group-hover:from-primary/10 group-hover:to-primary/15 transition-colors duration-200">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                      <span className="text-2xl font-bold text-primary">
                        #{nft.tokenId}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      Token ID
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors duration-200">
                    {nft.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {nft.collection}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-xs flex-1">
                      <span className="text-muted-foreground block mb-1">
                        Owner:
                      </span>
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded text-center block">
                        {nft.owner?.slice(0, 6)}...{nft.owner?.slice(-4)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                      >
                        Transfer
                      </Button>
                      <Button size="sm" className="flex-1 text-xs">
                        Trade
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-6">
            <PlusCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">No NFTs Found</h2>
          <p className="text-muted-foreground mb-2">
            Your wallet doesn't contain any NFTs from this collection yet.
          </p>
          <p className="text-xs text-muted-foreground mb-8">
            Contract: {CONTRACT_ADDRESS.slice(0, 6)}...
            {CONTRACT_ADDRESS.slice(-4)}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </Button>
            <Button size="lg" asChild>
              <Link to="/explore">Explore Marketplace</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
