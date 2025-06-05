import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  currentUser, 
  getNFTsByOwner,
  getUserById,
  users, 
} from '@/lib/data';
import { NFT, User } from '@/lib/types';
import { NFTGrid } from '@/components/nft/nft-grid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function CreateTradePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserNFTs, setSelectedUserNFTs] = useState<NFT[]>([]);
  const [selectedOwnNFTs, setSelectedOwnNFTs] = useState<NFT[]>([]);
  const [selectedRequestedNFTs, setSelectedRequestedNFTs] = useState<NFT[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Get NFTs owned by the current user
  const ownNFTs = getNFTsByOwner(currentUser.id);
  
  // Filter out other users (not the current user)
  const otherUsers = users.filter(user => user.id !== currentUser.id);

  // Handle user selection
  const handleUserSelect = (userId: string) => {
    const user = getUserById(userId);
    setSelectedUser(user || null);
    if (user) {
      const userNFTs = getNFTsByOwner(user.id);
      setSelectedUserNFTs(userNFTs);
    } else {
      setSelectedUserNFTs([]);
    }
    setSelectedRequestedNFTs([]);
  };

  // Handle NFT selection (own collection)
  const handleOwnNFTSelect = (nft: NFT) => {
    if (selectedOwnNFTs.some(item => item.id === nft.id)) {
      setSelectedOwnNFTs(selectedOwnNFTs.filter(item => item.id !== nft.id));
    } else {
      setSelectedOwnNFTs([...selectedOwnNFTs, nft]);
    }
  };

  // Handle NFT selection (other user's collection)
  const handleRequestedNFTSelect = (nft: NFT) => {
    if (selectedRequestedNFTs.some(item => item.id === nft.id)) {
      setSelectedRequestedNFTs(selectedRequestedNFTs.filter(item => item.id !== nft.id));
    } else {
      setSelectedRequestedNFTs([...selectedRequestedNFTs, nft]);
    }
  };

  // Handle trade creation
  const createTrade = () => {
    // In a real app, this would make an API call to create the trade
    toast({
      title: "Trade created!",
      description: "Your trade proposal has been sent successfully.",
    });
    navigate('/trades');
  };

  return (
    <div className="container py-10 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4"
      >
        <Button variant="ghost" size="icon" asChild>
          <Link to="/trades">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Trade</h1>
          <p className="text-muted-foreground mt-1">
            Propose a trade for digital assets
          </p>
        </div>
      </motion.div>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <div 
            className={`rounded-full h-8 w-8 flex items-center justify-center ${
              step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            1
          </div>
          <div 
            className={`h-0.5 w-10 self-center ${
              step >= 2 ? 'bg-primary' : 'bg-muted'
            }`}
          />
          <div 
            className={`rounded-full h-8 w-8 flex items-center justify-center ${
              step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            2
          </div>
          <div 
            className={`h-0.5 w-10 self-center ${
              step >= 3 ? 'bg-primary' : 'bg-muted'
            }`}
          />
          <div 
            className={`rounded-full h-8 w-8 flex items-center justify-center ${
              step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            3
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {step === 1 && "Select trading partner"}
          {step === 2 && "Choose assets to trade"}
          {step === 3 && "Review and confirm"}
        </div>
      </div>
      
      {/* Step 1: Select User */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Trading Partner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Select onValueChange={handleUserSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user to trade with" />
              </SelectTrigger>
              <SelectContent>
                {otherUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex justify-end">
              <Button 
                onClick={() => setStep(2)} 
                disabled={!selectedUser}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 2: Select NFTs */}
      {step === 2 && (
        <Tabs defaultValue="your-nfts">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="your-nfts">Your NFTs to Offer</TabsTrigger>
            <TabsTrigger value="their-nfts">Their NFTs to Request</TabsTrigger>
          </TabsList>
          
          <TabsContent value="your-nfts" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Select NFTs to Offer</CardTitle>
              </CardHeader>
              <CardContent>
                {ownNFTs.length > 0 ? (
                  <NFTGrid 
                    nfts={ownNFTs} 
                    selectable={true}
                    selectedNFTs={selectedOwnNFTs}
                    onSelectNFT={handleOwnNFTSelect}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You don't have any NFTs to offer.</p>
                    <Button asChild className="mt-4">
                      <Link to="/explore">Explore Marketplace</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              
              <Button 
                onClick={() => setStep(3)} 
                disabled={selectedOwnNFTs.length === 0 || selectedRequestedNFTs.length === 0}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="their-nfts" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedUser ? `Select NFTs from ${selectedUser.username}'s Collection` : "Select NFTs to Request"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedUserNFTs.length > 0 ? (
                  <NFTGrid 
                    nfts={selectedUserNFTs}
                    selectable={true}
                    selectedNFTs={selectedRequestedNFTs}
                    onSelectNFT={handleRequestedNFTSelect}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">This user doesn't have any NFTs available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              
              <Button 
                onClick={() => setStep(3)} 
                disabled={selectedOwnNFTs.length === 0 || selectedRequestedNFTs.length === 0}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      {/* Step 3: Review and Confirm */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review Trade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">You're Offering</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedOwnNFTs.map(nft => (
                    <div key={nft.id} className="relative rounded-lg overflow-hidden border">
                      <img 
                        src={nft.image} 
                        alt={nft.name} 
                        className="w-full aspect-square object-cover"
                      />
                      <div className="p-2 text-xs font-medium truncate">
                        {nft.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">You're Requesting</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedRequestedNFTs.map(nft => (
                    <div key={nft.id} className="relative rounded-lg overflow-hidden border">
                      <img 
                        src={nft.image} 
                        alt={nft.name} 
                        className="w-full aspect-square object-cover"
                      />
                      <div className="p-2 text-xs font-medium truncate">
                        {nft.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                <strong>Trading Partner:</strong> {selectedUser?.username}
              </p>
              <p className="text-sm mt-2">
                <strong>You're offering:</strong> {selectedOwnNFTs.length} NFT{selectedOwnNFTs.length !== 1 ? 's' : ''}
              </p>
              <p className="text-sm mt-2">
                <strong>You're requesting:</strong> {selectedRequestedNFTs.length} NFT{selectedRequestedNFTs.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              
              <Button 
                onClick={() => setConfirmDialogOpen(true)}
              >
                Create Trade Proposal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Trade Proposal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to create this trade proposal? Once sent, the recipient will be able to accept or decline your offer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={createTrade}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}