// hooks/useNFTBartering.ts
import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { formatEther, type Address } from "viem";

// Types
export interface NFTItem {
  nftContract: Address;
  tokenId: string;
}

export interface Trade {
  id: string;
  proposer: Address;
  recipient: Address;
  offeredNFTs: NFTItem[];
  requestedNFTs: NFTItem[];
  expirationTime: Date;
  status:
    | "Active"
    | "Accepted"
    | "Executed"
    | "Cancelled"
    | "Expired"
    | "CounterOffered";
  proposerDeposited: boolean;
  recipientDeposited: boolean;
}

// Contract configuration
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as Address;

// Contract ABI
export const NFT_BARTERING_ABI = [
  {
    name: "proposeTrade",
    type: "function",
    stateMutability: "payable",
    inputs: [
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
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "acceptTrade",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "tradeId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "depositNFTs",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "tradeId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "cancelTrade",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "tradeId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getTrade",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tradeId", type: "uint256" }],
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
    name: "feePerNFT",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getUserActiveTrades",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
] as const;

export function useNFTBartering() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [trades, setTrades] = useState<Trade[]>([]);
  const [loadingTrades, setLoadingTrades] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Read fee per NFT
  const { data: feePerNFT } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFT_BARTERING_ABI,
    functionName: "feePerNFT",
  });

  // Read user's active trades
  const { data: userTradeIds, refetch: refetchTradeIds } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFT_BARTERING_ABI,
    functionName: "getUserActiveTrades",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Contract write functions
  const {
    writeContract: proposeTrade,
    data: proposeData,
    isPending: isProposing,
    error: proposeError,
  } = useWriteContract({
    mutation: {
      onError: (error) => setError(error.message),
    },
  });

  const {
    writeContract: acceptTrade,
    data: acceptData,
    isPending: isAccepting,
  } = useWriteContract({
    mutation: {
      onError: (error) => setError(error.message),
    },
  });

  const {
    writeContract: depositNFTs,
    data: depositData,
    isPending: isDepositing,
  } = useWriteContract({
    mutation: {
      onError: (error) => setError(error.message),
    },
  });

  const {
    writeContract: cancelTrade,
    data: cancelData,
    isPending: isCancelling,
  } = useWriteContract({
    mutation: {
      onError: (error) => setError(error.message),
    },
  });

  // Wait for transactions
  const { isLoading: isProposeLoading } = useWaitForTransactionReceipt({
    hash: proposeData,
    query: {
      enabled: !!proposeData,
    },
  });

  const { isLoading: isAcceptLoading } = useWaitForTransactionReceipt({
    hash: acceptData,
    query: {
      enabled: !!acceptData,
    },
  });

  const { isLoading: isDepositLoading } = useWaitForTransactionReceipt({
    hash: depositData,
    query: {
      enabled: !!depositData,
    },
  });

  const { isLoading: isCancelLoading } = useWaitForTransactionReceipt({
    hash: cancelData,
    query: {
      enabled: !!cancelData,
    },
  });

  // Load trade details
  useEffect(() => {
    const loadTrades = async () => {
      if (!userTradeIds || !publicClient) return;

      setLoadingTrades(true);
      try {
        const tradesData: Trade[] = [];

        for (const tradeId of userTradeIds) {
          const tradeData = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: NFT_BARTERING_ABI,
            functionName: "getTrade",
            args: [tradeId],
          });

          tradesData.push({
            id: tradeId.toString(),
            proposer: tradeData[0],
            recipient: tradeData[1],
            offeredNFTs: tradeData[2].map((nft: any) => ({
              nftContract: nft.nftContract,
              tokenId: nft.tokenId.toString(),
            })),
            requestedNFTs: tradeData[3].map((nft: any) => ({
              nftContract: nft.nftContract,
              tokenId: nft.tokenId.toString(),
            })),
            expirationTime: new Date(Number(tradeData[4]) * 1000),
            status: getStatusName(Number(tradeData[5])),
            proposerDeposited: tradeData[6],
            recipientDeposited: tradeData[7],
          });
        }

        setTrades(tradesData);
      } catch (err: any) {
        console.error("Error loading trades:", err);
        setError("Failed to load trades");
      } finally {
        setLoadingTrades(false);
      }
    };

    loadTrades();
  }, [userTradeIds, publicClient]);

  // Helper functions
  const getStatusName = (status: number): Trade["status"] => {
    const statuses: Trade["status"][] = [
      "Active",
      "Accepted",
      "Executed",
      "Cancelled",
      "Expired",
      "CounterOffered",
    ];
    return statuses[status] || "Active";
  };

  const calculateTradeFee = (
    offeredCount: number,
    requestedCount: number
  ): bigint => {
    if (!feePerNFT) return BigInt(0);
    return feePerNFT * BigInt(offeredCount + requestedCount);
  };

  const formatFee = (offeredCount: number, requestedCount: number): string => {
    const fee = calculateTradeFee(offeredCount, requestedCount);
    return formatEther(fee);
  };

  // Helper functions to call writeContract with proper arguments
  const handleProposeTrade = (
    recipient: Address,
    offeredNFTs: NFTItem[],
    requestedNFTs: NFTItem[],
    expirationTime: bigint,
    value?: bigint
  ) => {
    proposeTrade({
      address: CONTRACT_ADDRESS,
      abi: NFT_BARTERING_ABI,
      functionName: "proposeTrade",
      args: [recipient, offeredNFTs, requestedNFTs, expirationTime],
      value,
    });
  };

  const handleAcceptTrade = (tradeId: bigint) => {
    acceptTrade({
      address: CONTRACT_ADDRESS,
      abi: NFT_BARTERING_ABI,
      functionName: "acceptTrade",
      args: [tradeId],
    });
  };

  const handleDepositNFTs = (tradeId: bigint) => {
    depositNFTs({
      address: CONTRACT_ADDRESS,
      abi: NFT_BARTERING_ABI,
      functionName: "depositNFTs",
      args: [tradeId],
    });
  };

  const handleCancelTrade = (tradeId: bigint) => {
    cancelTrade({
      address: CONTRACT_ADDRESS,
      abi: NFT_BARTERING_ABI,
      functionName: "cancelTrade",
      args: [tradeId],
    });
  };

  // Loading state
  const isLoading =
    isProposing ||
    isProposeLoading ||
    isAccepting ||
    isAcceptLoading ||
    isDepositing ||
    isDepositLoading ||
    isCancelling ||
    isCancelLoading;

  return {
    // State
    address,
    isConnected,
    trades,
    loadingTrades,
    error,
    success,
    feePerNFT: feePerNFT ? formatEther(feePerNFT) : "0",
    isLoading,

    // Contract functions
    proposeTrade: handleProposeTrade,
    acceptTrade: handleAcceptTrade,
    depositNFTs: handleDepositNFTs,
    cancelTrade: handleCancelTrade,

    // Utilities
    setError,
    setSuccess,
    calculateTradeFee,
    formatFee,
    refetchTrades: refetchTradeIds,
  };
}
