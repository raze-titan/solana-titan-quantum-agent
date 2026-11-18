import { Decimal } from "decimal.js";
import { CONFIG } from "./config";

export interface PoolState {
  protocol: "Meteora-DLMM" | "Kamino-Lend" | "Orca-Whirlpools";
  pair: string;
  activeBinPrice: number;
  currentApy: number;
  availableLiquidityUsd: number;
}

export class QuantumLiquidityRebalancer {
  private activePools: PoolState[] = [
    {
      protocol: "Meteora-DLMM",
      pair: "SOL-USDC",
      activeBinPrice: 218.45,
      currentApy: 34.8,
      availableLiquidityUsd: 1250000,
    },
    {
      protocol: "Kamino-Lend",
      pair: "JitoSOL-SOL",
      activeBinPrice: 1.092,
      currentApy: 16.2,
      availableLiquidityUsd: 4800000,
    },
    {
      protocol: "Orca-Whirlpools",
      pair: "SOL-USDC",
      activeBinPrice: 218.42,
      currentApy: 28.5,
      availableLiquidityUsd: 2100000,
    },
  ];

  public evaluateArbitrageOpportunity(): {
    opportunityDetected: boolean;
    spreadBps: number;
    expectedGrossProfitUsd: number;
    bestBuyProtocol: string;
    bestSellProtocol: string;
  } {
    const meteoraPrice = this.activePools[0].activeBinPrice;
    const orcaPrice = this.activePools[2].activeBinPrice;

    const priceDiff = Math.abs(meteoraPrice - orcaPrice);
    const spreadBps = new Decimal(priceDiff)
      .dividedBy(meteoraPrice)
      .multipliedBy(10000)
      .toNumber();

    // Calculate profit on standard $10,000 flash route
    const tradeSize = 10000;
    const grossProfit = (spreadBps / 10000) * tradeSize;

    const isProfitable =
      grossProfit >= CONFIG.minProfitThresholdUsd &&
      spreadBps > CONFIG.maxSlippageBps;

    return {
      opportunityDetected: isProfitable,
      spreadBps: parseFloat(spreadBps.toFixed(2)),
      expectedGrossProfitUsd: parseFloat(grossProfit.toFixed(2)),
      bestBuyProtocol: meteoraPrice < orcaPrice ? "Meteora-DLMM" : "Orca-Whirlpools",
      bestSellProtocol: meteoraPrice < orcaPrice ? "Orca-Whirlpools" : "Meteora-DLMM",
    };
  }
}
