import dotenv from "dotenv";
dotenv.config();

export interface AgentConfig {
  agentName: string;
  version: string;
  network: "mainnet-beta" | "devnet";
  rpcEndpoint: string;
  agentTreasuryWallet: string;
  maxCapitalAllocationUsd: number;
  maxSlippageBps: number;
  minProfitThresholdUsd: number;
  jitoTipLamports: number;
  circuitBreakerMaxDrawdownBps: number;
  rebalanceIntervalMs: number;
}

export const CONFIG: AgentConfig = {
  agentName: "Titan Quantum Capital Agent",
  version: "1.0.0",
  network: (process.env.SOLANA_NETWORK as "mainnet-beta" | "devnet") || "devnet",
  rpcEndpoint: process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
  agentTreasuryWallet: process.env.AGENT_TREASURY_WALLET || "FoUCkodXsbK1T7AhCp2wcvCWmVEEgk8Q7nAByboiZNiC",
  maxCapitalAllocationUsd: 25000,
  maxSlippageBps: 25, // 0.25% max slippage
  minProfitThresholdUsd: 15.0,
  jitoTipLamports: 100000, // 0.0001 SOL Jito MEV Tip
  circuitBreakerMaxDrawdownBps: 150, // 1.5% max drawdown circuit breaker
  rebalanceIntervalMs: 5000,
};
