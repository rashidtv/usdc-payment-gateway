import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
const USDC_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function transfer(address to, uint256 amount) returns (bool)'
];

async function generatePaymentPage() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
  const symbol = await usdc.symbol();
  const decimals = await usdc.decimals();
  
  // Generate HTML payment page
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>USDC Payment Page</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .payment-card {
            background: white;
            border-radius: 20px;
            padding: 40px;
            width: 400px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        
        .amount-section {
            text-align: center;
            margin: 30px 0;
        }
        
        .amount {
            font-size: 48px;
            font-weight: bold;
            color: #333;
        }
        
        .currency {
            font-size: 18px;
            color: #666;
        }
        
        .wallet-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
        }
        
        .address {
            font-family: monospace;
            word-break: break-all;
            color: #333;
            font-size: 14px;
        }
        
        .label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        
        .button {
            width: 100%;
            padding: 15px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
            margin-top: 20px;
        }
        
        .button:hover {
            background: #5a67d8;
        }
        
        .status {
            text-align: center;
            margin-top: 20px;
            padding: 10px;
            border-radius: 10px;
            display: none;
        }
        
        .success {
            background: #d4edda;
            color: #155724;
            display: block;
        }
        
        .error {
            background: #f8d7da;
            color: #721c24;
            display: block;
        }
        
        .qr-code {
            text-align: center;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="payment-card">
        <div class="header">
            <div class="logo">🔒 Secure Payment</div>
            <p>Pay with ${symbol}</p>
        </div>
        
        <div class="amount-section">
            <div class="amount">20.00</div>
            <div class="currency">${symbol}</div>
        </div>
        
        <div class="wallet-info">
            <div class="label">Merchant Address</div>
            <div class="address">${wallet.address}</div>
        </div>
        
        <div class="wallet-info">
            <div class="label">Network</div>
            <div class="address">Sepolia Testnet</div>
        </div>
        
        <button class="button" onclick="initiatePayment()">Pay Now</button>
        
        <div class="status" id="status"></div>
    </div>
    
    <script>
        const merchantAddress = '${wallet.address}';
        const amount = 20;
        const symbol = '${symbol}';
        
        async function initiatePayment() {
            const statusDiv = document.getElementById('status');
            statusDiv.className = 'status';
            statusDiv.innerHTML = 'Connecting to wallet...';
            
            try {
                // Check if MetaMask is installed
                if (typeof window.ethereum === 'undefined') {
                    throw new Error('Please install MetaMask');
                }
                
                // Connect to MetaMask
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                
                const userAddress = accounts[0];
                statusDiv.innerHTML = 'Connected! Sending transaction...';
                
                // Create transaction
                const transactionParameters = {
                    to: merchantAddress,
                    from: userAddress,
                    value: '0x0',
                    chainId: '0xaa36a7', // Sepolia chain ID (11155111 in hex)
                    data: '0x' // Empty data for ETH transfer
                };
                
                // Send transaction
                const txHash = await window.ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [transactionParameters]
                });
                
                statusDiv.className = 'status success';
                statusDiv.innerHTML = '✅ Payment successful!<br>TX: ' + txHash.substring(0, 20) + '...';
                
            } catch (error) {
                statusDiv.className = 'status error';
                statusDiv.innerHTML = '❌ Error: ' + error.message;
            }
        }
    </script>
</body>
</html>`;
    
    // Save the HTML file
    fs.writeFileSync('payment.html', html);
    console.log('✅ Payment page created: payment.html');
    console.log('Open it in your browser to test!');
    console.log('Merchant Address:', wallet.address);
    console.log('Network: Sepolia');
    console.log('Token:', symbol);
}

generatePaymentPage().catch(console.error);