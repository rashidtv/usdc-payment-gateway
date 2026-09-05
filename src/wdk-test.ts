import WDK from '@tetherto/wdk';
import WalletManagerEvm from '@tetherto/wdk-wallet-evm';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('=== WDK INTEGRATION TEST ===');
    console.log('');
    
    // 1. Generate or use existing seed phrase
    const seedPhrase = WDK.getRandomSeedPhrase();
    console.log('Seed Phrase:', seedPhrase);
    console.log('⚠️ SAVE THIS SEED PHRASE!');
    
    // 2. Initialize WDK with EVM wallet manager
    const wdk = new WDK(seedPhrase)
      .registerWallet('ethereum', WalletManagerEvm, {
        provider: 'https://ethereum-sepolia-rpc.publicnode.com',
      });
    
    // 3. Get the first account
    const account = await wdk.getAccount('ethereum', 0);
    const address = await account.getAddress();
    console.log('✅ WDK Wallet Address:', address);
    
    // 4. Check ETH balance
    const ethBalance = await account.getBalance();
    console.log('💰 ETH Balance:', ethers.formatEther(ethBalance), 'ETH');
    
    // 5. Check USDC balance (using your existing contract)
    const usdcAddress = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
    const usdcBalance = await account.getTokenBalance(usdcAddress);
    console.log('💰 USDC Balance:', ethers.formatUnits(usdcBalance, 6), 'USDC');
    
    // 6. Clean up
    wdk.dispose();
    
    console.log('');
    console.log('✅ WDK Integration Successful!');
    console.log('Ready to refactor your payment API.');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

main();