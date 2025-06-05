import { NFT, Trade, User } from './types';

// Mock users data
export const users: User[] = [
  {
    id: '1',
    username: 'cryptotrader',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
    walletAddress: '0x1234...5678',
  },
  {
    id: '2',
    username: 'nftcollector',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    walletAddress: '0xabcd...efgh',
  },
];

// Current user (for demo purposes)
export const currentUser = users[0];

// Mock NFT data
export const nfts: NFT[] = [
  {
    id: '1',
    name: 'Cosmic Voyager',
    description: 'A space traveler journeying through the cosmos',
    image: 'https://images.pexels.com/photos/3059745/pexels-photo-3059745.jpeg?auto=compress&cs=tinysrgb&w=500',
    owner: '1',
    collection: 'Space Explorers',
    rarity: 'epic',
    created: '2023-09-15',
  },
  {
    id: '2',
    name: 'Digital Nebula',
    description: 'Abstract digital art representing a colorful nebula',
    image: 'https://images.pexels.com/photos/3109807/pexels-photo-3109807.jpeg?auto=compress&cs=tinysrgb&w=500',
    owner: '1',
    collection: 'Cosmic Art',
    rarity: 'rare',
    created: '2023-10-01',
  },
  {
    id: '3',
    name: 'Cyber Wolf',
    description: 'A cyberpunk-themed wolf with neon accents',
    image: 'https://images.pexels.com/photos/2474014/pexels-photo-2474014.jpeg?auto=compress&cs=tinysrgb&w=500',
    owner: '1',
    collection: 'Digital Beasts',
    rarity: 'legendary',
    created: '2023-08-20',
  },
  {
    id: '4',
    name: 'Ocean Dreams',
    description: 'Serene underwater scene with vibrant coral',
    image: 'https://images.pexels.com/photos/3804841/pexels-photo-3804841.jpeg?auto=compress&cs=tinysrgb&w=500',
    owner: '2',
    collection: 'Aquatic Wonders',
    rarity: 'uncommon',
    created: '2023-11-05',
  },
  {
    id: '5',
    name: 'Neon City',
    description: 'Futuristic cityscape with neon lights',
    image: 'https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg?auto=compress&cs=tinysrgb&w=500',
    owner: '2',
    collection: 'Urban Future',
    rarity: 'rare',
    created: '2023-10-15',
  },
  {
    id: '6',
    name: 'Golden Phoenix',
    description: 'Mythical phoenix rising from digital flames',
    image: 'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg?auto=compress&cs=tinysrgb&w=500',
    owner: '2',
    collection: 'Mythical Creatures',
    rarity: 'legendary',
    created: '2023-09-30',
  },
];

// Mock trades data
export const trades: Trade[] = [
  {
    id: '1',
    creator: users[0],
    offeredItems: [nfts[0], nfts[1]],
    requestedItems: [nfts[5]],
    status: 'pending',
    recipient: users[1],
    createdAt: '2023-12-01T10:30:00Z',
    updatedAt: '2023-12-01T10:30:00Z',
  },
  {
    id: '2',
    creator: users[1],
    offeredItems: [nfts[4]],
    requestedItems: [nfts[2]],
    status: 'accepted',
    recipient: users[0],
    createdAt: '2023-11-28T14:15:00Z',
    updatedAt: '2023-11-29T09:45:00Z',
  },
  {
    id: '3',
    creator: users[0],
    offeredItems: [nfts[1]],
    requestedItems: [nfts[3]],
    status: 'declined',
    recipient: users[1],
    createdAt: '2023-11-20T16:20:00Z',
    updatedAt: '2023-11-21T11:05:00Z',
  },
];

// Helper function to get user by ID
export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

// Helper function to get NFTs by owner ID
export const getNFTsByOwner = (ownerId: string): NFT[] => {
  return nfts.filter(nft => nft.owner === ownerId);
};

// Helper function to get NFTs by IDs
export const getNFTsByIds = (ids: string[]): NFT[] => {
  return nfts.filter(nft => ids.includes(nft.id));
};

// Helper function to get trades by user ID
export const getTradesByUser = (userId: string): Trade[] => {
  return trades.filter(
    trade => trade.creator.id === userId || trade.recipient?.id === userId
  );
};

// Helper function to get trades by status
export const getTradesByStatus = (status: Trade['status']): Trade[] => {
  return trades.filter(trade => trade.status === status);
};