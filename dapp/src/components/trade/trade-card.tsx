import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Clock, CheckCircle2, XCircle, HelpCircle, AlertCircle } from 'lucide-react';
import { Trade } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TradeCardProps {
  trade: Trade;
  isReceived?: boolean;
}

export function TradeCard({ trade, isReceived = false }: TradeCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = {
    pending: {
      icon: <HelpCircle className="h-4 w-4" />,
      color: 'bg-amber-500 text-white',
      text: 'Pending',
    },
    accepted: {
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: 'bg-green-500 text-white',
      text: 'Accepted',
    },
    declined: {
      icon: <XCircle className="h-4 w-4" />,
      color: 'bg-red-500 text-white',
      text: 'Declined',
    },
    cancelled: {
      icon: <AlertCircle className="h-4 w-4" />,
      color: 'bg-gray-500 text-white',
      text: 'Cancelled',
    },
  };

  const { icon, color, text } = statusConfig[trade.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card 
        className="overflow-hidden transition-all duration-300 hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={trade.creator.avatar} alt={trade.creator.username} />
                <AvatarFallback>{trade.creator.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-base">
                {isReceived ? "Received from " : "Offered to "}
                <Link 
                  to={`/profile/${isReceived ? trade.creator.id : trade.recipient?.id}`}
                  className="text-primary hover:underline"
                >
                  {isReceived ? trade.creator.username : trade.recipient?.username}
                </Link>
              </CardTitle>
            </div>
            <Badge className={cn("flex items-center gap-1", color)}>
              {icon} {text}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pb-3">
          <div className="flex items-center gap-2 justify-between mb-3">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {format(new Date(trade.createdAt), 'MMM d, yyyy')}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium mb-2">Offering</h3>
              <div className="flex overflow-x-auto gap-2 pb-2">
                {trade.offeredItems.map((item, index) => (
                  <div key={index} className="relative min-w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center">
              <ArrowRight className="w-8 h-8 text-muted-foreground" />
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium mb-2">Requesting</h3>
              <div className="flex overflow-x-auto gap-2 pb-2">
                {trade.requestedItems.map((item, index) => (
                  <div key={index} className="relative min-w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        
        <Separator />
        
        <CardFooter className="pt-3 flex justify-between">
          {isReceived && trade.status === 'pending' ? (
            <div className="flex gap-2">
              <Button variant="outline\" size="sm">
                Decline
              </Button>
              <Button size="sm">
                Accept
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/trade/${trade.id}`}>View Details</Link>
            </Button>
          )}
          
          {trade.status === 'pending' && !isReceived && (
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}