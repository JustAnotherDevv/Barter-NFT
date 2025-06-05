export interface User {
  id: string;
  username: string;
  avatar: string;
  walletAddress: string;
}

export interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  owner: string;
  collection: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  created: string;
}

export interface Trade {
  id: string;
  creator: User;
  offeredItems: NFT[];
  requestedItems: NFT[];
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  recipient?: User;
  createdAt: string;
  updatedAt: string;
}

export type TradeFilter = 'all' | 'pending' | 'accepted' | 'declined' | 'cancelled';