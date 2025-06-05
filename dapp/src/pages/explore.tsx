import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount, useReadContract, useConnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PlusCircle,
  Wallet,
  AlertCircle,
  RefreshCw,
  Users,
  Search,
  ArrowRight,
  Eye,
  UserPlus,
  Copy,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";

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

const CONTRACT_ADDRESS = "0x302bBdCAE2037301d183Ab1917863b41a3c499da" as const;

const NFT_ICONS = [
  "🎨",
  "🎭",
  "🎪",
  "🎯",
  "🎲",
  "🎸",
  "🎺",
  "🎻",
  "🎹",
  "🥁",
  "🎮",
  "🕹️",
  "🎳",
  "🏆",
  "🏅",
  "🥇",
  "🥈",
  "🥉",
  "⭐",
  "🌟",
  "💎",
  "💍",
  "👑",
  "🔮",
  "🧿",
  "🎊",
  "🎉",
  "🎈",
  "🎁",
  "🏮",
  "🌸",
  "🌺",
  "🌻",
  "🌷",
  "🌹",
  "🌼",
  "🌵",
  "🍄",
  "🦋",
  "🐝",
  "🦄",
  "🐉",
  "🦅",
  "🦚",
  "🦜",
  "🐠",
  "🐙",
  "🦭",
  "🐯",
  "🦁",
];

const TRACKED_USERS = [
  {
    address: "0x90138150A4cF51Ae2CB7Fc6376771a7A858dd07c",
    name: "Alice.eth",
    avatar: "🦄",
  },
  {
    address: "0x6825211e79b0a5A220DF1Ab1872FcACecB82B886",
    name: "Bob.nft",
    avatar: "🎨",
  },
  {
    address: "0xEeFB62B3fB4EeC9fF307831b1dB788542cADb2CD",
    name: "Carol.crypto",
    avatar: "🌟",
  },
  {
    address: "0x9876543210987654321098765432109876543210",
    name: "Dave.dao",
    avatar: "🚀",
  },
  {
    address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    name: "Emma.defi",
    avatar: "💎",
  },
  {
    address: "0xfedcbafedcbafedcbafedcbafedcbafedcbafedcba",
    name: "Frank.nft",
    avatar: "🎭",
  },
];

export function ExplorePage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [showUserNFTs, setShowUserNFTs] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState("");

  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  const copyToClipboard = async (text, identifier) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(identifier);
      setTimeout(() => setCopiedAddress(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getRandomIcon = (tokenId) => {
    const index = parseInt(tokenId.toString()) % NFT_ICONS.length;
    return NFT_ICONS[index];
  };

  const filteredUsers = TRACKED_USERS.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            Connect your wallet to browse the NFT marketplace and create trades
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
            <Users className="h-8 w-8 text-primary" />
            NFT Marketplace
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse user portfolios and create trades
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/inventory">My Collection</Link>
          </Button>
          <Button asChild>
            <Link to="/trades">
              <PlusCircle className="h-4 w-4 mr-2" />
              View Trades
            </Link>
          </Button>
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users by name or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-1 lg:w-96">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Browse Users ({filteredUsers.length})
          </TabsTrigger>
          {/* <TabsTrigger value="my-nfts" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            My NFTs
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.address}
                user={user}
                currentUserAddress={address}
                onViewPortfolio={(user) => {
                  setSelectedUser(user);
                  setShowUserNFTs(true);
                }}
                onCopyAddress={copyToClipboard}
                copiedAddress={copiedAddress}
              />
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-16">
              <Search className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
              <h2 className="text-2xl font-semibold mb-4">No Users Found</h2>
              <p className="text-muted-foreground">
                No users match your search criteria.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-nfts" className="space-y-4">
          <MyNFTCollection
            userAddress={address}
            getRandomIcon={getRandomIcon}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={showUserNFTs} onOpenChange={setShowUserNFTs}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedUser?.avatar} {selectedUser?.name}'s Portfolio
              <Badge variant="outline">
                {selectedUser?.address.slice(0, 6)}...
                {selectedUser?.address.slice(-4)}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <UserPortfolio
              user={selectedUser}
              currentUserAddress={address}
              onCreateTrade={() => setShowUserNFTs(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserCard({
  user,
  currentUserAddress,
  onViewPortfolio,
  onCopyAddress,
  copiedAddress,
}) {
  const { data: balance, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "balanceOf",
    args: [user.address],
  });

  const { data: tokenIds } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getTokensOf",
    args: [user.address],
  });

  const nftCount = balance ? Number(balance) : 0;
  const isCurrentUser =
    user.address.toLowerCase() === currentUserAddress?.toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg hover:border-primary/50 transition-all duration-200 group">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
              {user.avatar}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{user.name}</h3>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground font-mono">
                  {user.address.slice(0, 8)}...{user.address.slice(-6)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onCopyAddress(user.address, `card-${user.address}`)
                  }
                  className="h-6 w-6 p-0"
                >
                  {copiedAddress === `card-${user.address}` ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            {isCurrentUser && <Badge variant="secondary">You</Badge>}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">NFTs Owned</p>
              <p className="text-2xl font-bold text-primary">
                {isLoading ? "..." : nftCount}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Collection</p>
              <p className="text-sm font-medium">FakeNFTCollection</p>
            </div>
          </div>

          {nftCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Recent NFTs:</span>
              <div className="flex gap-1">
                {tokenIds?.slice(0, 3).map((tokenId, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    #{tokenId.toString()}
                  </Badge>
                ))}
                {tokenIds?.length > 3 && (
                  <span className="text-muted-foreground">
                    +{tokenIds.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => onViewPortfolio(user)}
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={nftCount === 0}
            >
              <Eye className="h-3 w-3 mr-1" />
              View Portfolio
            </Button>

            {!isCurrentUser && nftCount > 0 && (
              <Button size="sm" className="flex-1" asChild>
                <Link to={`/trades?recipient=${user.address}`}>
                  <UserPlus className="h-3 w-3 mr-1" />
                  Create Trade
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function UserPortfolio({ user, currentUserAddress, onCreateTrade }) {
  const { data: tokenIds, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getTokensOf",
    args: [user.address],
  });

  const isCurrentUser =
    user.address.toLowerCase() === currentUserAddress?.toLowerCase();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading NFTs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Total NFTs: {tokenIds?.length || 0}
          </p>
        </div>
        {!isCurrentUser && tokenIds?.length > 0 && (
          <Button asChild onClick={onCreateTrade}>
            <Link to={`/trades?recipient=${user.address}`}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Trade with {user.name}
            </Link>
          </Button>
        )}
      </div>

      {tokenIds && tokenIds.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tokenIds.map((tokenId) => (
            <Card
              key={tokenId.toString()}
              className="hover:shadow-lg hover:border-primary/50 transition-all duration-200 group"
            >
              <CardContent className="p-3 text-center">
                <div className="w-full aspect-square bg-gradient-to-br from-primary/20 to-primary/30 rounded-lg flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
                  <span className="text-lg font-bold">
                    #{tokenId.toString()}
                  </span>
                </div>
                <p className="text-xs font-medium">NFT #{tokenId.toString()}</p>
                <p className="text-xs text-muted-foreground">
                  FakeNFTCollection
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No NFTs found in this user's portfolio
          </p>
        </div>
      )}
    </div>
  );
}

function MyNFTCollection({ userAddress }) {
  const {
    data: balance,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "balanceOf",
    args: [userAddress],
  });

  const {
    data: tokenIds,
    isLoading: tokenIdsLoading,
    refetch: refetchTokenIds,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getTokensOf",
    args: [userAddress],
  });

  const handleRefresh = () => {
    refetchBalance();
    refetchTokenIds();
  };

  const isLoading = balanceLoading || tokenIdsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">My Collection</h3>
          <p className="text-sm text-muted-foreground">
            {balance !== undefined
              ? `${balance.toString()} NFTs owned`
              : "Loading..."}
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your NFTs...</p>
          </div>
        </div>
      ) : tokenIds && tokenIds.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {tokenIds.map((tokenId) => (
            <Card
              key={tokenId.toString()}
              className="hover:shadow-lg hover:border-primary/50 transition-all duration-200 group cursor-pointer"
            >
              <CardContent className="p-4 text-center">
                <div className="w-full aspect-square bg-gradient-to-br from-primary/20 to-primary/30 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
                  <span className="text-xl font-bold">
                    #{tokenId.toString()}
                  </span>
                </div>
                <h4 className="font-semibold text-sm mb-1">
                  NFT #{tokenId.toString()}
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  FakeNFTCollection
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                  >
                    View
                  </Button>
                  <Button size="sm" className="flex-1 text-xs" asChild>
                    <Link to="/trades">Trade</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Wallet className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h3 className="text-xl font-semibold mb-4">No NFTs Found</h3>
          <p className="text-muted-foreground mb-2">
            You don't own any NFTs from this collection yet.
          </p>
          <p className="text-xs text-muted-foreground mb-8">
            Contract: {CONTRACT_ADDRESS.slice(0, 6)}...
            {CONTRACT_ADDRESS.slice(-4)}
          </p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Again
          </Button>
        </div>
      )}
    </div>
  );
}
