🏥 Drug Inventory and Supply Chain Tracking System
A blockchain-powered solution designed to ensure secure, transparent, and efficient tracking of drug inventory and supply chain management.

🚀 Features
Blockchain Integration: Ensures data integrity and transparency using Ethereum and Web3.js.
Real-time Inventory Management: Tracks drug stock levels, consumption trends, and alerts for shortages.
Vendor & Procurement Tracking: Monitors vendor performance, deliveries, and order fulfillment.
Secure Authentication: Role-based access for administrators, vendors, and medical institutions.
Dashboard & Analytics: Provides insights into drug movement, stock levels, and consumption patterns.
🛠️ Tech Stack
Frontend
React.js (Vite)
Material-UI
Three.js
Backend
Node.js (Express.js)
MongoDB (Database)
Blockchain
Ethereum Smart Contracts
Web3.js
📌 Installation & Setup
1️⃣ Clone the Repository
sh
Copy
Edit
git clone https://github.com/singhravish486/Drug-Inventory-and-supplychain-tracking-system-using-blockchain.git
cd Drug-Traceability-in-supplychain-using-blockchain-java
2️⃣ Backend Setup
Navigate to the backend folder:
sh
Copy
Edit
cd backend
Install dependencies:
sh
Copy
Edit
npm install
Set up environment variables (.env file):
sh
Copy
Edit
MONGO_URI=mongodb://localhost:27017/drug-inventory
PORT=5000
ETHEREUM_NODE_URL=<Your Infura/Alchemy URL>
Start the backend server:
sh
Copy
Edit
npm start
3️⃣ Frontend Setup
Navigate to the frontend folder:
sh
Copy
Edit
cd ../frontend
Install dependencies:
sh
Copy
Edit
npm install
Start the development server:
sh
Copy
Edit
npm run dev
⚡ Blockchain Deployment
To deploy the smart contract:

Navigate to the blockchain directory:
sh
Copy
Edit
cd blockchain
Install dependencies:
sh
Copy
Edit
npm install
Compile and deploy the smart contract:
sh
Copy
Edit
npx hardhat run scripts/deploy.js --network goerli
✅ Usage
Admin Panel: Manage drugs, vendors, and hospitals.
Vendor Dashboard: Track orders and shipments.
Hospital Dashboard: Monitor drug inventory and procurement.
🎯 Future Enhancements
AI-powered demand forecasting for drugs.
IoT integration for real-time shipment tracking.
Cross-chain compatibility for enhanced security.
💡 Contributing
Fork the repository.
Create a feature branch (git checkout -b feature-name).
Commit changes (git commit -m "Added new feature").
Push to the branch (git push origin feature-name).
Submit a pull request.
📜 License
This project is licensed under the MIT License.
