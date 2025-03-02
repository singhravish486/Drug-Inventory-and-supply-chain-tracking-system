import Web3 from 'web3';

export class DrugBlockchain {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.initialize();
  }

  async initialize() {
    try {
      // Connect to blockchain network
      if (window.ethereum) {
        this.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
      } else {
        this.web3 = new Web3('http://localhost:8545');
      }

      // Smart contract ABI and address
      const contractABI = [/* Your contract ABI */];
      const contractAddress = '0x...'; // Your deployed contract address
      
      this.contract = new this.web3.eth.Contract(contractABI, contractAddress);
    } catch (error) {
      console.error('Blockchain initialization error:', error);
      throw error;
    }
  }

  async addDrugBatch(batchData) {
    try {
      const accounts = await this.web3.eth.getAccounts();
      const {
        batchId,
        drugName,
        manufacturer,
        manufacturingDate,
        expiryDate,
        quantity,
        temperature,
        humidity
      } = batchData;

      // Add batch to blockchain
      return await this.contract.methods.addDrugBatch(
        this.web3.utils.asciiToHex(batchId),
        drugName,
        manufacturer,
        manufacturingDate,
        expiryDate,
        quantity,
        temperature,
        humidity
      ).send({ from: accounts[0] });
    } catch (error) {
      console.error('Error adding batch to blockchain:', error);
      throw error;
    }
  }

  async updateDrugLocation(batchId, location, handler, conditions) {
    try {
      const accounts = await this.web3.eth.getAccounts();
      
      return await this.contract.methods.updateDrugLocation(
        this.web3.utils.asciiToHex(batchId),
        location,
        handler,
        conditions.temperature,
        conditions.humidity
      ).send({ from: accounts[0] });
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  async getDrugHistory(batchId) {
    try {
      const history = await this.contract.methods.getDrugHistory(
        this.web3.utils.asciiToHex(batchId)
      ).call();

      return this.formatDrugHistory(history);
    } catch (error) {
      console.error('Error fetching drug history:', error);
      throw error;
    }
  }

  async verifyDrug(batchId) {
    try {
      const verification = await this.contract.methods.verifyDrug(
        this.web3.utils.asciiToHex(batchId)
      ).call();

      return {
        isAuthentic: verification.isAuthentic,
        manufacturer: verification.manufacturer,
        manufacturingDate: verification.manufacturingDate,
        currentLocation: verification.currentLocation,
        temperature: verification.temperature,
        humidity: verification.humidity
      };
    } catch (error) {
      console.error('Error verifying drug:', error);
      throw error;
    }
  }

  formatDrugHistory(history) {
    return history.map(record => ({
      timestamp: new Date(record.timestamp * 1000),
      location: record.location,
      handler: record.handler,
      temperature: record.temperature,
      humidity: record.humidity,
      action: record.action
    }));
  }
} 