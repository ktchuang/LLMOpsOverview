# LLMOps 全棧架構

Interactive overview of the LLMOps full-stack architecture — 12 layers, 60+ tools.

**Live demo:** https://ktchuang.github.io/LLMOpsOverview/

## Overview

A single-page React application that visualizes the complete LLMOps technology stack as an interactive bento grid. Click any layer to see its relationships with other layers, and click again to expand full details.

### 12 Layers

| # | Layer | Examples |
|---|-------|----------|
| 0 | 硬體與基礎設施 (Infrastructure) | NVIDIA A100/H100, Kubernetes, Docker |
| 1 | 模型訓練與微調 (Training & Fine-tuning) | Transformers, DeepSpeed, LoRA, W&B |
| 2 | 模型服務與推論 (Model Serving & Inference) | vLLM, TensorRT-LLM, Ollama, BentoML |
| 3 | LLM 閘道與路由 (API Gateway / Routing) | LiteLLM, Portkey |
| 4 | 資料與向量儲存 (Data & Vector Storage) | Pinecone, Weaviate, Milvus, Chroma |
| 5 | Agent 框架與編排 (Agent Orchestration) | LangChain, LangGraph, CrewAI, AutoGen |
| 6 | 提示工程與管理 (Prompt Management) | Langfuse Prompts, PromptLayer |
| 7 | 安全與防護欄 (Security & Guardrails) | Guardrails AI, NeMo Guardrails |
| 8 | 評估與測試 (Evaluation & Testing) | DeepEval, Ragas, Promptfoo |
| 9 | 可觀測性與監控 (Observability & Monitoring) | Langfuse, LangSmith, OpenTelemetry |
| 10 | 應用與介面 (Application & Interface) | Open WebUI, Chatbot UI |
| 11 | CI/CD 與部署 (Deployment Pipeline) | GitHub Actions, Argo CD, Terraform |

### Tool Coverage Comparison

The page also includes an expandable comparison table showing how major platforms (Pi, LangChain, Langfuse, LiteLLM, Ray, OpenClaw) cover the 12 layers.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173/LLMOpsOverview/ in your browser.

## Build

```bash
npm run build
```

Output goes to `dist/`.

## Deployment

Pushes to `main` automatically deploy to GitHub Pages via the included GitHub Actions workflow.

## Tech Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Lucide React](https://lucide.dev/) (icons)
- [GitHub Pages](https://pages.github.com/) (hosting)
