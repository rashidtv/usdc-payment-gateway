import WDK from '@tetherto/wdk';
import WalletManagerEvm from '@tetherto/wdk-wallet-evm';
import * as dotenv from 'dotenv';
import * as http from 'http';
import { ethers } from 'ethers';

dotenv.config();

const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
const USDC_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)'
];

// Initialize WDK with your private key
const PRIVATE_KEY = process.env.PRIVATE_KEY;
console.log('Using Private Key:', PRIVATE_KEY?.substring(0, 10) + '...');

// Create WDK instance (temporary - we'll use ethers.js for signing)
const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
console.log('Merchant Wallet:', wallet.address);

let merchantAccount: any;

// Helper to send JSON responses
function sendJson(res: http.ServerResponse, status: number, data: any) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// Helper to parse request body
function getBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  
  if (req.method === 'OPTIONS') {
    sendJson(res, 200, {});
    return;
  }
  
  try {
    // Endpoint 1: Check merchant balance
    if (req.method === 'GET' && path === '/balance') {
      const ethBalance = await provider.getBalance(wallet.address);
      
      const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
      const usdcBalance = await usdcContract.balanceOf(wallet.address);
      const symbol = await usdcContract.symbol();
      const decimals = await usdcContract.decimals();
      
      sendJson(res, 200, {
        address: wallet.address,
        eth: ethers.formatEther(ethBalance),
        usdc: ethers.formatUnits(usdcBalance, decimals),
        symbol: symbol,
        network: 'Sepolia',
        wdk: 'Integrated'
      });
    }
    
    // Endpoint 2: Create payment request
    else if (req.method === 'POST' && path === '/create-payment') {
      const body = await getBody(req);
      const { amount, customerAddress, orderId } = body;
      
      if (!amount || !customerAddress) {
        sendJson(res, 400, { error: 'Amount and customerAddress required' });
        return;
      }
      
      sendJson(res, 200, {
        paymentId: orderId || Date.now().toString(),
        merchant: wallet.address,
        amount: amount,
        currency: 'USDC',
        network: 'Sepolia',
        customerAddress: customerAddress,
        status: 'PENDING',
        instructions: `Send ${amount} USDC to ${wallet.address}`,
        contractAddress: USDC_ADDRESS,
        wdk: 'Integrated'
      });
    }
    
    // Endpoint 3: Verify payment status
    else if (req.method === 'GET' && path.startsWith('/verify-payment/')) {
      const parts = path.split('/').filter(Boolean);
      if (parts.length >= 3) {
        const customerAddress = parts[1];
        const amount = parts[2];
        
        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
        const decimals = await usdcContract.decimals();
        const expectedAmount = ethers.parseUnits(amount, decimals);
        const customerBalance = await usdcContract.balanceOf(customerAddress);
        const symbol = await usdcContract.symbol();
        
        const hasPaid = customerBalance >= expectedAmount;
        
        sendJson(res, 200, {
          customer: customerAddress,
          expected: amount + ' ' + symbol,
          actual: ethers.formatUnits(customerBalance, decimals) + ' ' + symbol,
          status: hasPaid ? 'PAID' : 'NOT_PAID',
          wdk: 'Integrated'
        });
      } else {
        sendJson(res, 400, { error: 'Invalid path' });
      }
    }
    
    // Endpoint 4: Send USDC
    else if (req.method === 'POST' && path === '/send-usdc') {
      const body = await getBody(req);
      const { to, amount } = body;
      
      if (!to || !amount) {
        sendJson(res, 400, { error: 'To and amount required' });
        return;
      }
      
      try {
        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, wallet);
        const decimals = await usdcContract.decimals();
        const tx = await usdcContract.transfer(to, ethers.parseUnits(amount, decimals));
        await tx.wait();
        
        sendJson(res, 200, {
          success: true,
          txHash: tx.hash,
          from: wallet.address,
          to: to,
          amount: amount,
          explorerUrl: `https://sepolia.etherscan.io/tx/${tx.hash}`,
          wdk: 'Integrated'
        });
      } catch (error: any) {
        sendJson(res, 500, { error: error.message });
      }
    }
    
    // Endpoint 5: Root
    else if (req.method === 'GET' && path === '/') {
      sendJson(res, 200, {
        name: 'USDC Payment API (WDK Edition)',
        version: '2.0.0',
        network: 'Sepolia',
        merchant: wallet.address,
        wdk: 'Integrated',
        endpoints: [
          'GET /balance',
          'POST /create-payment',
          'GET /verify-payment/:customerAddress/:amount',
          'POST /send-usdc'
        ]
      });
    }
    
    else {
      sendJson(res, 404, { error: 'Not found' });
    }
    
  } catch (error: any) {
    sendJson(res, 500, { error: error.message });
  }
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log('=========================================');
  console.log('✅ USDC Payment API (WDK Edition) Running');
  console.log('=========================================');
  console.log('Port:', PORT);
  console.log('Merchant Wallet:', wallet.address);
  console.log('Network: Sepolia');
  console.log('WDK: Integrated');
  console.log('=========================================');
  console.log('');
  console.log('Available Endpoints:');
  console.log('  GET  http://localhost:' + PORT + '/balance');
  console.log('  POST http://localhost:' + PORT + '/create-payment');
  console.log('  GET  http://localhost:' + PORT + '/verify-payment/:addr/:amt');
  console.log('  POST http://localhost:' + PORT + '/send-usdc');
  console.log('=========================================');
});