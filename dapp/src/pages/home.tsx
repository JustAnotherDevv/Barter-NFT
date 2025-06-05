import { useState } from "react";
import { motion } from "framer-motion";
import { useAccount, useConnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Users,
  Shield,
  ArrowLeftRight,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

export function HomePage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-gray-100 leading-tight">
            Trade NFTs with
            <span className="text-blue-600"> confidence</span>
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Discover collectors, browse portfolios, and trade NFTs securely with
            our smart contract escrow system.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            {isConnected ? (
              <>
                <Button size="lg" className="h-12 px-8" asChild>
                  <Link to="/marketplace">
                    Explore Marketplace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8"
                  asChild
                >
                  <Link to="/trades">View Trades</Link>
                </Button>
              </>
            ) : (
              <>
                {connectors.map((connector) => (
                  <Button
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                    size="lg"
                    className="h-12 px-8"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                ))}
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8"
                  asChild
                >
                  <Link to="/marketplace">Preview Platform</Link>
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="container mx-auto px-4 pb-20"
      >
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="flex items-center justify-center">
              <img src="/explore.png" alt="" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <div className=" py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-100 mb-6">
              Simple. Secure. Seamless.
            </h2>
            <p className="text-xl text-gray-300">
              Everything you need to trade NFTs safely and efficiently.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="border-0 shadow-none bg-black h-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">
                    Browse Collectors
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Discover other collectors and explore their unique NFT
                    portfolios to find the perfect trading partner.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card className="border-0 shadow-none bg-black h-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Secure Escrow</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Smart contract protection ensures safe and trustless
                    transactions with automated escrow handling.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Card className="border-0 shadow-none bg-black h-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <ArrowLeftRight className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">
                    Seamless Trading
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Create offers, negotiate with counter-offers, and complete
                    trades with our intuitive interface.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Feature Image Section */}
      <div className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <h2 className="text-4xl font-bold text-gray-100 mb-6">
                Trade with confidence
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Our platform provides a secure environment for NFT trading with
                smart contract escrow, real-time portfolio browsing, and
                seamless transaction management.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                  <span className="text-gray-300">Smart contract security</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                  <span className="text-gray-300">
                    Real-time portfolio browsing
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                  <span className="text-gray-300">
                    Counter-offer negotiations
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="lg:order-first"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-gray-50 to-gray-100">
                <div className=" flex items-center justify-center">
                  <img src="/profile.png" alt="" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to start trading?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join the future of NFT trading with secure, trustless
              transactions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isConnected ? (
                <Button
                  size="lg"
                  className="h-12 px-8 bg-white text-gray-900 hover:bg-gray-100"
                  asChild
                >
                  <Link to="/marketplace">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                connectors.map((connector) => (
                  <Button
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                    size="lg"
                    className="h-12 px-8 bg-white text-gray-900 hover:bg-gray-100"
                  >
                    Connect Wallet to Start
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
