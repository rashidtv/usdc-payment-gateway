import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

// ✅ Correct USDT Contract Address from your transaction
const USDT_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

const USDT_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

async function main() {
  try {
    // Connect to Sepolia
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('✅ Wallet:', wallet.address);
    
    // Check ETH balance (for gas)
    const ethBalance = await provider.getBalance(wallet.address);
    console.log('💰 ETH Balance:', ethers.formatEther(ethBalance), 'ETH');
    
    // Check USDT balance
    const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, wallet);
    const usdtBalance = await usdtContract.balanceOf(wallet.address);
    const usdtSymbol = await usdtContract.symbol();
    const usdtDecimals = await usdtContract.decimals();
    
    console.log(`💰 USDT Balance: ${ethers.formatUnits(usdtBalance, usdtDecimals)} ${usdtSymbol}`);
    
    // Show network info
    const network = await provider.getNetwork();
    console.log('🌐 Network:', network.name);
    
    console.log('\n✅ Balance check complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();