import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { MoreHorizontal, ArrowRight, Share2, HeartIcon } from 'lucide-react';
import { NFT } from '@/lib/types';
import { cn } from '@/lib/utils';

interface NFTCardProps {
  nft: NFT;
  showOwner?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (nft: NFT) => void;
  onClick?: () => void;
}

export function NFTCard({
  nft,
  showOwner = false,
  selectable = false,
  selected = false,
  onSelect,
  onClick,
}: NFTCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(false);

  const rarityColors = {
    common: 'bg-slate-500',
    uncommon: 'bg-green-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-amber-500',
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSelect) {
      onSelect(nft);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      onClick={handleClick}
    >
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-300 hover:shadow-lg",
          selected && "ring-2 ring-primary",
          selectable && "cursor-pointer"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="p-0 relative">
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            <Badge variant="secondary" className={cn("text-white", rarityColors[nft.rarity])}>
              {nft.rarity.charAt(0).toUpperCase() + nft.rarity.slice(1)}
            </Badge>
            
            {selectable && (
              <Button 
                variant={selected ? "default" : "outline"} 
                size="icon" 
                className="h-6 w-6 rounded-full"
                onClick={handleSelect}
              >
                <div className={cn(
                  "h-3 w-3 rounded-full", 
                  selected ? "bg-primary-foreground" : "bg-transparent"
                )}/>
              </Button>
            )}
          </div>
          
          <AspectRatio ratio={1}>
            <img 
              src={nft.image} 
              alt={nft.name}
              className="object-cover w-full h-full transition-transform duration-700 ease-in-out"
              style={{
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              }}
            />
          </AspectRatio>

          {isHovered && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-center p-4">
              <Link to={`/nft/${nft.id}`} className="w-full">
                <Button className="w-full gap-2">
                  View Details <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg line-clamp-1">{nft.name}</CardTitle>
              <CardDescription className="line-clamp-2 mt-1">
                {nft.description}
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLiked(!liked);
                      }}
                    >
                      <HeartIcon 
                        className={cn(
                          "h-4 w-4", 
                          liked ? "fill-red-500 text-red-500" : ""
                        )} 
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{liked ? 'Unlike' : 'Like'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Share functionality here
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" /> Share
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link to={`/trade/create?nft=${nft.id}`}>
                      Create Trade
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Collection: <span className="font-medium">{nft.collection}</span>
          </div>
          {showOwner && (
            <div className="text-sm text-muted-foreground">
              Owner: <Link to={`/profile/${nft.owner}`} className="font-medium text-primary hover:underline">
                {nft.owner}
              </Link>
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}