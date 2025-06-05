import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trades, currentUser } from '@/lib/data';
import { cn } from '@/lib/utils';
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
import { toast } from '@/hooks/use-toast';

export function TradeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [confirmAcceptOpen, setConfirmAcceptOpen] = useState(false);
  const [confirmDeclineOpen, setConfirmDeclineOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  
  // Find the trade by ID
  const trade = trades.find(t => t.id === id);
  
  if (!trade) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Trade Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The trade you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/trades">Back to Trades</Link>
        </Button>
      </div>
    );
  }
  
  const isCreator = trade.creator.id === currentUser.id;
  const canAcceptOrDecline = !isCreator && trade.status === 'pending';
  const canCancel = isCreator && trade.status === 'pending';

  const statusConfig = {
    pending: {
      color: 'bg-amber-500 text-white',
      text: 'Pending',
    },
    accepted: {
      color: 'bg-green-500 text-white',
      text: 'Accepted',
    },
    declined: {
      color: 'bg-red-500 text-white',
      text: 'Declined',
    },
    cancelled: {
      color: 'bg-gray-500 text-white',
      text: 'Cancelled',
    },
  };

  const handleAccept = () => {
    // In a real app, this would make an API call to accept the trade
    toast({
      title: "Trade accepted!",
      description: "The assets have been exchanged successfully.",
    });
    setConfirmAcceptOpen(false);
  };

  const handleDecline = () => {
    // In a real app, this would make an API call to decline the trade
    toast({
      title: "Trade declined",
      description: "You have declined this trade offer.",
    });
    setConfirmDeclineOpen(false);
  };

  const handleCancel = () => {
    // In a real app, this would make an API call to cancel the trade
    toast({
      title: "Trade cancelled",
      description: "Your trade offer has been cancelled.",
    });
    setConfirmCancelOpen(false);
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
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Trade Details</h1>
            <Badge className={cn(statusConfig[trade.status].color)}>
              {statusConfig[trade.status].text}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Proposed on {format(new Date(trade.createdAt), 'MMMM d, yyyy')}
          </p>
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Offered Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <UserCircle2 className="h-4 w-4" />
              <span>From: <span className="font-medium text-foreground">{trade.creator.username}</span></span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {trade.offeredItems.map(item => (
                <div key={item.id} className="border rounded-lg overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-medium truncate">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Requested Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <UserCircle2 className="h-4 w-4" />
              <span>From: <span className="font-medium text-foreground">{trade.recipient?.username}</span></span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {trade.requestedItems.map(item => (
                <div key={item.id} className="border rounded-lg overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-medium truncate">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="mt-0.5">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Trade Created</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(trade.createdAt), 'MMMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
            
            {trade.status !== 'pending' && (
              <div className="flex items-start gap-4">
                <div className="mt-0.5">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">
                    Trade {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(trade.updatedAt), 'MMMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {trade.status === 'pending' && (
        <div className="flex justify-center gap-4">
          {canAcceptOrDecline && (
            <>
              <Button variant="outline\" onClick={() => setConfirmDeclineOpen(true)}>
                Decline Trade
              </Button>
              <Button onClick={() => setConfirmAcceptOpen(true)}>
                Accept Trade
              </Button>
            </>
          )}
          
          {canCancel && (
            <Button variant="destructive" onClick={() => setConfirmCancelOpen(true)}>
              Cancel Trade
            </Button>
          )}
        </div>
      )}
      
      {/* Accept Confirmation Dialog */}
      <AlertDialog open={confirmAcceptOpen} onOpenChange={setConfirmAcceptOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Trade</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to accept this trade? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAccept}>
              Accept Trade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Decline Confirmation Dialog */}
      <AlertDialog open={confirmDeclineOpen} onOpenChange={setConfirmDeclineOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline Trade</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to decline this trade? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDecline}>
              Decline Trade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Trade</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this trade? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel}>
              Cancel Trade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}