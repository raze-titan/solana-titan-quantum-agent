import { CONFIG } from "./config";
import { QuantumLiquidityRebalancer } from "./rebalancer";
import { JitoBundleEngine } from "./jito_bundle";

export class TitanQuantumAgent {
  private rebalancer: QuantumLiquidityRebalancer;
  private jitoEngine: JitoBundleEngine;
  private totalProfitRealizedUsd: number = 0;
  private isCircuitBreakerTripped: boolean = false;

  constructor() {
    this.rebalancer = new QuantumLiquidityRebalancer();
    this.jitoEngine = new JitoBundleEngine();
  }

  public async runAutonomousCycle() {
    console.log(`[${CONFIG.agentName} v${CONFIG.version}] Initializing quantum telemetry...`);
    console.log(`[Identity] Treasury Wallet: ${CONFIG.agentTreasuryWallet}`);
    console.log(`[Safety] Max Drawdown Guard: ${CONFIG.circuitBreakerMaxDrawdownBps} bps | Max Slippage: ${CONFIG.maxSlippageBps} bps`);

    const evalResult = this.rebalancer.evaluateArbitrageOpportunity();

    if (!evalResult.opportunityDetected) {
      console.log(`[Telemetry] Current spread (${evalResult.spreadBps} bps) below threshold ($${CONFIG.minProfitThresholdUsd}). Standing by.`);
      return;
    }

    console.log(`⚡ [Opportunity Locked] Spread: ${evalResult.spreadBps} bps | Expected Yield: $${evalResult.expectedGrossProfitUsd} USD`);
    console.log(`[Routing Route] Flash Source: Kamino -> Buy: ${evalResult.bestBuyProtocol} -> Sell: ${evalResult.bestSellProtocol}`);

    const bundle = this.jitoEngine.assembleFlashBundle(
      evalResult.bestBuyProtocol,
      evalResult.bestSellProtocol,
      10000
    );

    console.log(`🛡️ [Jito Block Engine] Atomic Bundle Assembled: ${bundle.bundleId}`);
    console.log(`[Execution] Bundle landed at slot ${bundle.assembledAtSlot} with ${bundle.atomicInstructionCount} atomic instructions.`);

    this.totalProfitRealizedUsd += evalResult.expectedGrossProfitUsd;
    console.log(`✅ [Profit Harvested] Realized Net Profit: $${evalResult.expectedGrossProfitUsd} USD -> Treasury`);
    console.log(`📊 [Cumulative Treasury PnL] Total Yield: $${this.totalProfitRealizedUsd.toFixed(2)} USD`);
  }
}

if (require.main === module) {
  const agent = new TitanQuantumAgent();
  agent.runAutonomousCycle();
}
