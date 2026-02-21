# 0G Developer Course

> Build production applications on 0G — the decentralized AI operating system — with deep dives into Storage SDK, Compute Network, smart contracts, and advanced patterns like ERC-7857 and Goldsky indexing.

**Source**: Official 0G Documentation (docs.0g.ai)
**Format**: AI-tutored interactive course
**Time**: ~4 hours to complete all 5 modules
**Prerequisites**: Basic JavaScript/TypeScript, familiarity with APIs. Blockchain experience helpful but not required.

---

## Quick Start (5 minutes)

```bash
# 1. Install dependencies
npm install @0glabs/0g-ts-sdk ethers openai dotenv

# 2. Set up environment
cp .env.example .env
# Edit .env with your PRIVATE_KEY (without 0x prefix)

# 3. Get testnet tokens
# Visit https://faucet.0g.ai and paste your wallet address

# 4. Run the full-stack demo
npx ts-node examples/05-full-stack.ts
```

---

## Course Overview

| Module | Topic | Concepts | Level |
|---|---|---|---|
| 1 | 0G Foundations | 5 concepts | Foundational |
| 2 | 0G Storage SDK | 6 concepts | Intermediate |
| 3 | 0G Compute Network | 5 concepts | Intermediate |
| 4 | 0G Chain & Smart Contracts | 5 concepts | Advanced |
| 5 | Advanced 0G Patterns | 4 concepts | Frontier |

**25 concepts total** — from architecture deep-dive to ERC-7857 INFTs and full-stack capstone.

---

## Module 1: 0G Foundations

**What you'll learn**: Architecture, data flow, tokenomics, security model, and developer tooling overview.

**Key concepts**:
- `architecture_deep_dive` — How Chain, Storage, Compute, and DA interconnect
- `data_flow_model` — Content-addressing, rootHash lifecycle, Merkle proofs
- `tokenomics_and_gas` — Gas fees, storage pricing, compute escrow mechanics
- `security_model` — Proof of Random Access, TEE verification, ZK proofs
- `developer_tooling` — SDK, CLI, explorers, and Builder Hub

---

## Module 2: 0G Storage SDK

**What you'll learn**: Both storage layers — immutable Log and mutable KV — with production patterns.

**Key concepts**:
- `storage_architecture` — Log layer vs KV layer, erasure coding, data sharding
- `log_storage_upload` — ZgFile, Merkle tree computation, indexer upload flow
- `log_storage_download` — Download by rootHash, Merkle proof verification
- `kv_storage_write` — Batcher API, stream IDs, key-value write patterns
- `kv_storage_read` — KvClient, getValue, iteration, consistency model
- `storage_production_patterns` — Error handling, retry logic, large file chunking

**Core pattern for Log storage**:
```typescript
import { ZgFile, Indexer } from '@0glabs/0g-ts-sdk';

const file = await ZgFile.fromFilePath('./dataset.csv');
const [tree] = await file.merkleTree();
const rootHash = tree!.rootHash();  // ← Save this immediately

await indexer.upload(file, RPC_URL, signer);
await file.close();
```

**Core pattern for KV storage**:
```typescript
import { Batcher, KvClient } from '@0glabs/0g-ts-sdk';

const STREAM_ID = '0x' + '0'.repeat(63) + '1';
batcher.streamDataBuilder.set(STREAM_ID, key, value);
await batcher.exec();
```

---

## Module 3: 0G Compute Network

**What you'll learn**: GPU marketplace, OpenAI-compatible inference, provider management, and fine-tuning.

**Key concepts**:
- `compute_architecture` — Provider marketplace, Compute Ledger, escrow model
- `openai_migration` — 2-line migration from OpenAI to 0G Compute
- `provider_management` — Discovery, funding, acknowledgement, secret retrieval
- `inference_advanced` — Streaming, multi-turn, model selection, TEE verification
- `fine_tuning` — Custom model training on decentralized GPUs

**The 2-line migration**:
```typescript
const client = new OpenAI({
  apiKey: process.env.ZG_API_KEY,                        // ← Line 1
  baseURL: process.env.ZG_PROVIDER_URL + '/v1/proxy',   // ← Line 2
});
```

---

## Module 4: 0G Chain & Smart Contracts

**What you'll learn**: EVM deployment on 0G, critical configuration, DA integration, and rollup patterns.

**Key concepts**:
- `evm_deployment` — Hardhat/Foundry setup, the critical `evmVersion: 'cancun'` config
- `provenance_contracts` — Recording rootHashes on-chain, event-driven audit trails
- `da_layer_integration` — DASigners precompile, data availability for rollups
- `rollup_patterns` — OP Stack and Arbitrum Nitro integration with 0G DA
- `precompile_contracts` — DASigners (0x1000), WrappedOGBase (0x1001)

**Critical Hardhat config**:
```javascript
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: { evmVersion: "cancun" }  // ← REQUIRED for 0G Chain
  }
};
```

---

## Module 5: Advanced 0G Patterns

**What you'll learn**: Frontier topics — tokenized AI agents, indexing, and a full-stack capstone project.

**Key concepts**:
- `erc7857_infts` — Intelligent NFTs: tokenize AI models with encrypted weights
- `ai_agent_storage_pattern` — Store weights on Storage, infer on Compute, record on Chain
- `goldsky_indexing` — GraphQL API and database streaming over 0G contract events
- `full_stack_capstone` — End-to-end project: Storage + Compute + Chain pipeline

---

## Contract Addresses Reference

### Testnet (Galileo, chainId: 16602)

| Contract | Address |
|---|---|
| Flow (Storage) | `0x22E03a6A89B950F1c82ec5e74F8eCa321a105296` |
| Mine (Mining) | `0x00A9E9604b0538e06b268Fb297Df333337f9593b` |
| Reward | `0xA97B57b4BdFEA2D0a25e535bd849ad4e6C440A69` |
| DAEntrance | `0xE75A073dA5bb7b0eC622170Fd268f35E675a957B` |
| Compute Ledger | `0xE70830508dAc0A97e6c087c75f402f9Be669E406` |
| Compute Inference | `0xa79F4c8311FF93C06b8CfB403690cc987c93F91E` |
| DASigners (precompile) | `0x0000000000000000000000000000000000001000` |
| WrappedOGBase (precompile) | `0x0000000000000000000000000000000000001001` |

### Mainnet (Aristotle, chainId: 16661)

| Contract | Address |
|---|---|
| Flow | `0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526` |
| Compute Ledger | `0x2dE54c845Cd948B72D2e32e39586fe89607074E3` |

---

## Course Files

```
0g-developer-course/
├── CLAUDE.md             ← AI tutor instructions (developer persona)
├── README.md             ← This file
├── knowledge/
│   ├── graph.json        ← Knowledge graph (25 nodes, 32 typed edges)
│   └── courses.json      ← Full curriculum (5 modules, 25 lessons)
```

---

## Resources

- **Documentation**: https://docs.0g.ai
- **Builder Hub**: https://build.0g.ai
- **SDKs & Tools**: https://build.0g.ai/sdks
- **Faucet**: https://faucet.0g.ai
- **Explorer (Testnet)**: https://chainscan-galileo.0g.ai
- **Explorer (Mainnet)**: https://chainscan.0g.ai
- **Storage Explorer**: https://storagescan.0g.ai

---

## Using the AI Tutor

This course includes a CLAUDE.md that configures an AI tutor with developer-first teaching style. To use it:

```bash
cd 0g-developer-course
claude  # Opens Claude Code with CLAUDE.md tutor instructions loaded
```

Then ask the AI:
- "Walk me through Module 2 — Storage SDK"
- "What's the difference between Log storage and KV storage?"
- "Help me deploy a smart contract on 0G — why does Hardhat fail?"
- "Show me how to set up 0G Compute inference with streaming"
- "Explain ERC-7857 INFTs and how they tokenize AI models"

---

*Generated by Papers with Claude Code — 0G Developer Education*
*Source: 0G Labs, 2024 — 0G Developer Documentation (docs.0g.ai)*
