@"
# Tether Developer Grant Application

## Project: USDC Payment Gateway

### Overview
A production-ready REST API that allows merchants to accept USDC payments on Ethereum Sepolia testnet. The system provides payment request creation, automatic payment verification, and transaction management.

### Technical Stack
- Node.js (v24)
- TypeScript
- ethers.js (v6)
- Native HTTP Server (no external dependencies)
- Sepolia Testnet

### Features
1. **Wallet Management** - Secure wallet creation and management
2. **USDC Balance Checking** - Real-time balance verification
3. **Payment Request Creation** - Generate payment orders with unique IDs
4. **Payment Verification** - Automatic verification of customer payments
5. **USDC Transfer** - Send USDC for refunds or testing
6. **REST API** - Clean, documented endpoints
7. **No External Dependencies** - Uses only Node.js built-ins

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /balance | Check merchant balance |
| POST | /create-payment | Create payment request |
| GET | /verify-payment/:addr/:amt | Verify customer payment |
| POST | /send-usdc | Send USDC (testing/refunds) |
| GET | / | API information |

### Use Cases
- E-commerce checkout
- Peer-to-peer payments
- Merchant payment processing
- Subscription payments
- Freelance payments

### Code Repository
- GitHub: https://github.com/rashidtv/usdc-payment-gateway.git

### Live Demo
- API: http://localhost:3000
- Transaction: 0x4a0f43e595310c9033ee7fe608c717c15e4987113927ad4681aa5afbd0a8e4b1

### Developer
- Name: Rashid
- Email: rashid828@gmail.com
- GitHub: rashidtv

### Skills Demonstrated
- TypeScript/JavaScript
- Node.js API Development
- Blockchain Development
- Smart Contract Interaction
- REST API Design
- Error Handling

### Why Tether?
This project demonstrates practical stablecoin payment infrastructure. By integrating with Tether's WDK, we can enhance wallet functionality and provide a more seamless payment experience.

### Timeline
- Week 1: Basic payment gateway (COMPLETED)
- Week 2: WDK integration
- Week 3: Enhanced features (QR codes, invoices)
- Week 4: Production readiness

### Grant Amount Requested
- Initial grant: $1,500
- Milestone 2: $1,000
- Milestone 3: $1,500
- Total: $4,000
"@ | Out-File -FilePath GRANT_APPLICATION.md -Encoding utf8