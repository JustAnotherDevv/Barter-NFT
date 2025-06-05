import { useState } from 'react';
import { NFT } from '@/lib/types';
import { NFTCard } from './nft-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface NFTGridProps {
  nfts: NFT[];
  showOwner?: boolean;
  selectable?: boolean;
  selectedNFTs?: NFT[];
  onSelectNFT?: (nft: NFT) => void;
}

export function NFTGrid({
  nfts,
  showOwner = false,
  selectable = false,
  selectedNFTs = [],
  onSelectNFT,
}: NFTGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('');
  const [collectionFilter, setCollectionFilter] = useState<string>('');

  // Get unique collections for filter dropdown
  const collections = Array.from(new Set(nfts.map(nft => nft.collection)));

  // Filter NFTs based on search term and filters
  const filteredNFTs = nfts.filter(nft => {
    const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        nft.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = rarityFilter ? nft.rarity === rarityFilter : true;
    const matchesCollection = collectionFilter ? nft.collection === collectionFilter : true;
    
    return matchesSearch && matchesRarity && matchesCollection;
  });

  // Check if an NFT is selected
  const isSelected = (nft: NFT) => {
    return selectedNFTs.some(selected => selected.id === nft.id);
  };

  // Handle rarity filter change
  const handleRarityChange = (value: string) => {
    setRarityFilter(value === 'all' ? '' : value);
  };

  // Handle collection filter change
  const handleCollectionChange = (value: string) => {
    setCollectionFilter(value === 'all' ? '' : value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or description..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={rarityFilter || 'all'} onValueChange={handleRarityChange}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Rarity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rarities</SelectItem>
              <SelectItem value="common">Common</SelectItem>
              <SelectItem value="uncommon">Uncommon</SelectItem>
              <SelectItem value="rare">Rare</SelectItem>
              <SelectItem value="epic">Epic</SelectItem>
              <SelectItem value="legendary">Legendary</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={collectionFilter || 'all'} onValueChange={handleCollectionChange}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Collection" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Collections</SelectItem>
              {collections.map(collection => (
                <SelectItem key={collection} value={collection}>
                  {collection}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {(rarityFilter || collectionFilter || searchTerm) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setRarityFilter('');
                setCollectionFilter('');
                setSearchTerm('');
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredNFTs.length > 0 ? (
          filteredNFTs.map((nft) => (
            <NFTCard
              key={nft.id}
              nft={nft}
              showOwner={showOwner}
              selectable={selectable}
              selected={isSelected(nft)}
              onSelect={onSelectNFT}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-lg text-muted-foreground">No NFTs found matching your criteria.</p>
            <Button 
              variant="link" 
              onClick={() => {
                setRarityFilter('');
                setCollectionFilter('');
                setSearchTerm('');
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}