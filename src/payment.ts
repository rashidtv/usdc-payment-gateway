import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

// Your wallet (merchant address)
const MERCHANT_ADDRESS = '0x03E8a124d332c0808Dd20377843777429037E61d';

// USDC Contract (from your transaction)
const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

const USDC_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)'
];

async function main() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('=== PAYMENT SYSTEM STATUS ===');
    console.log('Merchant Wallet:', MERCHANT_ADDRESS);
    console.log('Network: Sepolia');
    console.log('');
    
    // Check merchant balances
    const ethBalance = await provider.getBalance(MERCHANT_ADDRESS);
    const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
    const usdcBalance = await usdcContract.balanceOf(MERCHANT_ADDRESS);
    const usdcSymbol = await usdcContract.symbol();
    const usdcDecimals = await usdcContract.decimals();
    
    console.log('💰 Merchant ETH:', ethers.formatEther(ethBalance), 'ETH');
    console.log(`💰 Merchant ${usdcSymbol}:`, ethers.formatUnits(usdcBalance, usdcDecimals), usdcSymbol);
    console.log('');
    
    // Test: Send 1 USDC to a test address
    console.log('=== TESTING USDC TRANSFER ===');
    console.log('Sending 1 USDC to a test address...');
    
    // Connect with signer
    const usdcWithSigner = usdcContract.connect(wallet);
    
    // Send 1 USDC to any address (let's use the same wallet for testing)
    const testAddress = '0x03E8a124d332c0808Dd20377843777429037E61d'; // Send to self
    const amount = ethers.parseUnits('1', usdcDecimals);
    
    console.log('From:', wallet.address);
    console.log('To:', testAddress);
    console.log('Amount:', ethers.formatUnits(amount, usdcDecimals), usdcSymbol);
    
    // Send transaction
    const tx = await usdcWithSigner.transfer(testAddress, amount);
    console.log('Transaction sent! Hash:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Transaction confirmed!');
    console.log('Status:', receipt.status === 1 ? 'Success ✅' : 'Failed ❌');
    console.log('Gas Used:', receipt.gasUsed.toString());
    
    console.log('');
    console.log('✅ Payment system test complete!');
    
    // Show updated balance
    const newBalance = await usdcContract.balanceOf(MERCHANT_ADDRESS);
    console.log(`Updated ${usdcSymbol} Balance:`, ethers.formatUnits(newBalance, usdcDecimals), usdcSymbol);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('insufficient funds')) {
      console.log('⚠️ You need more ETH for gas. Get from: https://cryptochief.com/faucet');
    }
  }
}

main();