# 0xBarter

## Overview

Platform for trading gaming collectibles & e-commerce NFTs. Current features include:

- User portfolio
- Public directory of trades
- Public directory of users with option of making offers
- Accepting, Declining, Deposits and management of barter offers
- Cross-chain compatibility for easier access to liquidity

### deployments

**Xsolla ZK Sepolia Testnet**

- **NFTBarteringPlatform:** `0xF320422365B52bB109564aD0A2c6ceEb0d2eC3CF`
- **FakeNFTCollection:** `0x302bBdCAE2037301d183Ab1917863b41a3c499da`

**Paseo Polkadot Testnet**

- **NFTBarteringPlatform:** ``
- **FakeNFTCollection:** ``

**Neon EVM**

- **NFTBarteringPlatform:** ``
- **FakeNFTCollection:** ``

## Features

## Setup

### Solidity

- `cd smart-contract`
- set private key in `.env` file
- compile `npm run compile`
- deploy to xSolla testnet `npx hardhat run scripts/deploy-fakenftcollection.ts --network xSollaZKSepolia `

### Dapp

- `cd dapp`
- `pnpm i`
- `pnpm run dev`

### Backend

- `cd backend`
- `pnpm i`
- `touch .env` then fill out env vars

- Metadata - ToDo
- Mint NFTs from testing collection to your testing accounts `node mintTestNFTs.js`
-
