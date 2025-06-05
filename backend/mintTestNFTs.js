import { createWalletClient, http, createPublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import "dotenv/config";

async function mintNFTs() {
  const chainId = parseInt(process.env.CHAIN_ID, 10);
  const rpcUrl = process.env.RPC_URL;
  const customNetwork = {
    id: chainId,
    name: 'Xsolla ZK Sepolia Testnet"',
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: { http: [rpcUrl] },
      public: { http: [rpcUrl] },
    },
  };
  const abi = [
    {
      type: "function",
      name: "mint",
      inputs: [
        { name: "to", type: "address" },
        { name: "quantity", type: "uint256" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "getTotalSupply",
      inputs: [],
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "balanceOf",
      inputs: [{ name: "owner", type: "address" }],
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getTokensOf",
      inputs: [{ name: "owner", type: "address" }],
      outputs: [{ name: "", type: "uint256[]" }],
      stateMutability: "view",
    },
  ];
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const privateKey = process.env.PRIVATE_KEY;
  const account = privateKeyToAccount(privateKey);
  const walletClient = createWalletClient({
    account,
    chain: customNetwork,
    transport: http(customNetwork.rpcUrls.default.http[0]),
  });
  const publicClient = createPublicClient({
    chain: customNetwork,
    transport: http(customNetwork.rpcUrls.default.http[0]),
  });
  const tasks = JSON.parse(process.env.TARGET_USERS);
  for (const task of tasks) {
    console.log(`Minting ${task.quantity} NFTs to ${task.to}`);
    try {
      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi,
        functionName: "mint",
        args: [task.to, task.quantity],
        account,
      });
      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(`Transaction hash: ${hash}`);
    } catch (error) {
      console.error(`Error minting to ${task.to}: ${error.message}`);
      return;
    }
  }
  const totalSupply = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "getTotalSupply",
  });
  console.log(`Total supply: ${totalSupply}`);
  for (const task of tasks) {
    const balance = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "balanceOf",
      args: [task.to],
    });
    console.log(`Balance of ${task.to}: ${balance}`);
    const tokens = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "getTokensOf",
      args: [task.to],
    });
    console.log(`Tokens of ${task.to}: ${tokens.join(", ")}`);
  }
}

mintNFTs().catch(console.error);
