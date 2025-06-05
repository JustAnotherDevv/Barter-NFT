# 0xBarter

## Overview

### deployments

**Xsolla ZK Sepolia Testnet**

- **NFTBarteringPlatform:** `0xF320422365B52bB109564aD0A2c6ceEb0d2eC3CF`
- **FakeNFTCollection:** `0xF337fB85Fb936E4Ec5075d970C6608cb80344d97`

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

- Mint NFTs from testing collection to your testing accounts `node mintTestNFTs.js`
-
