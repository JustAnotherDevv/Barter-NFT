import { useState } from 'react';
import { Trade, TradeFilter } from '@/lib/types';
import { TradeCard } from './trade-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TradeListProps {
  trades: Trade[];
  userIsCreator?: boolean;
}

export function TradeList({ trades, userIsCreator = true }: TradeListProps) {
  const [filter, setFilter] = useState<TradeFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter trades based on status and search term
  const filteredTrades = trades.filter(trade => {
    const matchesFilter = filter === 'all' || trade.status === filter;
    
    const matchesSearch = 
      trade.creator.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trade.recipient?.username.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    return matchesFilter && matchesSearch;
  });

  // Split trades into outgoing and incoming
  const outgoingTrades = filteredTrades.filter(trade => userIsCreator);
  const incomingTrades = filteredTrades.filter(trade => !userIsCreator);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trades..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button asChild>
          <Link to="/trade/create">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Trade
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as TradeFilter)}>
        <TabsList className="grid grid-cols-4 md:w-[400px]">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6 mt-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Outgoing Trades</h2>
            {outgoingTrades.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {outgoingTrades.map((trade) => (
                  <TradeCard key={trade.id} trade={trade} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No outgoing trades found.</p>
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Incoming Trades</h2>
            {incomingTrades.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {incomingTrades.map((trade) => (
                  <TradeCard key={trade.id} trade={trade} isReceived />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No incoming trades found.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-6 mt-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Outgoing Trades</h2>
            {outgoingTrades.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {outgoingTrades.map((trade) => (
                  <TradeCard key={trade.id} trade={trade} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No pending outgoing trades found.</p>
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Incoming Trades</h2>
            {incomingTrades.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {incomingTrades.map((trade) => (
                  <TradeCard key={trade.id} trade={trade} isReceived />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No pending incoming trades found.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="accepted" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrades.length > 0 ? (
              filteredTrades.map((trade) => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  isReceived={!userIsCreator}
                />
              ))
            ) : (
              <div className="col-span-full">
                <p className="text-muted-foreground">No accepted trades found.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="declined" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrades.length > 0 ? (
              filteredTrades.map((trade) => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  isReceived={!userIsCreator}
                />
              ))
            ) : (
              <div className="col-span-full">
                <p className="text-muted-foreground">No declined trades found.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}