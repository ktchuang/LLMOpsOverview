import { useState, useEffect, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Cpu, Brain, Server, Route, Database, Bot, FileText,
  Shield, TestTube, Eye, Layout, Rocket, Layers, X,
  ArrowRight, Check, Minus, ChevronDown
} from "lucide-react";

/* ── colour tokens ── */
const A: Record<string, string> = {
  blue: "#007AFF", green: "#34C759", orange: "#FF9500", purple: "#AF52DE",
  pink: "#FF2D55", teal: "#5AC8FA", indigo: "#5856D6", red: "#FF3B30",
  mint: "#00C7BE", cyan: "#32ADE6", lime: "#6ABF40", amber: "#FFCC02",
};

type CoverageLevel = "full" | "partial";
interface CoverageEntry { level: CoverageLevel; pkg: string; note: string }
interface Layer {
  id: number; title: string; subtitle: string; icon: LucideIcon; accent: string;
  tools: string[]; desc: string; related: number[];
  relatedReason: Record<number, string>;
}
interface ToolProfile {
  key: string; name: string; color: string; logo: string; desc: string;
  coverage: (CoverageEntry | null)[];
}

/* ── layer data ── */
const layers: Layer[] = [
  { id:0, title:"硬體與基礎設施", subtitle:"Infrastructure", icon:Cpu, accent:"blue",
    tools:["NVIDIA A100/H100","Kubernetes","Docker","GPU Operator","KubeRay","Ray Autoscaler"],
    desc:"提供算力與基礎運算環境，GPU 排程與虛擬化，叢集管理與資源排程",
    related:[1,2,11], relatedReason:{1:"提供訓練算力",2:"提供推論算力",11:"部署目標環境"} },
  { id:1, title:"模型訓練與微調", subtitle:"Training & Fine-tuning", icon:Brain, accent:"purple",
    tools:["Transformers","DeepSpeed","LoRA / QLoRA","Unsloth","Ray Train","W&B","MLflow"],
    desc:"從基礎模型產出適合場景的微調模型，分散式訓練與實驗追蹤",
    related:[0,2,8], relatedReason:{0:"消耗 GPU 算力",2:"產出模型供部署",8:"評估模型品質"} },
  { id:2, title:"模型服務與推論", subtitle:"Model Serving & Inference", icon:Server, accent:"green",
    tools:["vLLM","TensorRT-LLM","TGI","llama.cpp","Ollama","Ray Serve","Triton","BentoML"],
    desc:"把模型部署為可擴展的推論服務，支援動態 batching 與自動擴縮",
    related:[0,1,3], relatedReason:{0:"依賴基礎設施",1:"接收訓練模型",3:"供閘道層路由"} },
  { id:3, title:"LLM 閘道與路由", subtitle:"API Gateway / Routing", icon:Route, accent:"orange",
    tools:["LiteLLM","Portkey","pi-ai","Martian"],
    desc:"統一 API 介面、多供應商路由、負載平衡、費用追蹤、虛擬金鑰管理",
    related:[2,5,7,9], relatedReason:{2:"路由到推論服務",5:"供 Agent 呼叫",7:"套用安全規則",9:"匯出觀測資料"} },
  { id:4, title:"資料與向量儲存", subtitle:"Data & Vector Storage", icon:Database, accent:"teal",
    tools:["Pinecone","Weaviate","Milvus","Qdrant","Chroma","pgvector"],
    desc:"RAG 知識庫、Embedding 模型、文件處理、Chunking 策略",
    related:[5,8], relatedReason:{5:"為 Agent 提供上下文",8:"評估 RAG 品質"} },
  { id:5, title:"Agent 框架與編排", subtitle:"Agent Orchestration", icon:Bot, accent:"indigo",
    tools:["Pi","LangChain","LangGraph","CrewAI","AutoGen","OpenAI Agents SDK"],
    desc:"工具呼叫、多步驟推理、狀態管理、Agent 迴圈、Context 壓縮",
    related:[3,4,6,7,10], relatedReason:{3:"透過閘道呼叫 LLM",4:"檢索向量資料",6:"載入 Prompt 範本",7:"受防護欄約束",10:"驅動應用介面"} },
  { id:6, title:"提示工程與管理", subtitle:"Prompt Management", icon:FileText, accent:"amber",
    tools:["Langfuse Prompts","PromptLayer","Humanloop","Pi Templates"],
    desc:"Prompt 版本控制、A/B 測試、範本系統與協作迭代",
    related:[5,8,9], relatedReason:{5:"供 Agent 使用",8:"評估 Prompt 效果",9:"追蹤 Prompt 表現"} },
  { id:7, title:"安全與防護欄", subtitle:"Security & Guardrails", icon:Shield, accent:"red",
    tools:["Guardrails AI","NeMo Guardrails","LLM Guard","Presidio","Rebuff"],
    desc:"輸入/輸出過濾、PII 偵測與遮罩、Prompt Injection 防護",
    related:[3,5,10], relatedReason:{3:"在閘道層攔截",5:"約束 Agent 行為",10:"保護使用者介面"} },
  { id:8, title:"評估與測試", subtitle:"Evaluation & Testing", icon:TestTube, accent:"mint",
    tools:["Langfuse Evals","DeepEval","Ragas","Promptfoo","Garak"],
    desc:"LLM-as-Judge、人工標註、基準測試、Red Teaming",
    related:[1,4,6,9], relatedReason:{1:"評估微調品質",4:"測試 RAG 效果",6:"測試 Prompt",9:"結果送入監控"} },
  { id:9, title:"可觀測性與監控", subtitle:"Observability & Monitoring", icon:Eye, accent:"pink",
    tools:["Langfuse","LangSmith","Phoenix","Helicone","Datadog","OpenTelemetry","Ray Dashboard"],
    desc:"Trace 追蹤、Token 與費用分析、延遲監控、除錯",
    related:[3,5,6,8,11], relatedReason:{3:"監控 API 呼叫",5:"追蹤 Agent 行為",6:"分析 Prompt 表現",8:"接收評估結果",11:"觸發部署決策"} },
  { id:10, title:"應用與介面", subtitle:"Application & Interface", icon:Layout, accent:"cyan",
    tools:["Pi TUI","pi-web-ui","OpenClaw","Open WebUI","Chatbot UI"],
    desc:"聊天介面、通訊平台整合、IDE 整合、API 端點",
    related:[5,7,9], relatedReason:{5:"由 Agent 驅動",7:"受安全層保護",9:"產生觀測資料"} },
  { id:11, title:"CI/CD 與部署", subtitle:"Deployment Pipeline", icon:Rocket, accent:"lime",
    tools:["GitHub Actions","Argo CD","Terraform","Helm","KubeRay Helm"],
    desc:"模型部署、Prompt 版本切換、漸進式 Rollout、基礎設施即程式碼",
    related:[0,2,9], relatedReason:{0:"管理基礎設施",2:"部署模型服務",9:"依據監控數據決策"} },
];

/* ── tool coverage data ── */
// "full" = core coverage, "partial" = touches but not primary, null = no coverage
const toolProfiles: ToolProfile[] = [
  {
    key: "pi",
    name: "Pi (pi-mono)",
    color: "#5856D6",
    logo: "🥧",
    desc: "極簡 coding agent 引擎 + 多供應商 LLM API",
    coverage: [
      null,
      null,
      { level:"partial", pkg:"pi-pods", note:"管理 vLLM GPU pod 部署" },
      { level:"full",    pkg:"pi-ai", note:"統一多供應商 LLM API，串流工具呼叫解析" },
      null,
      { level:"full",    pkg:"pi-agent-core + pi-coding-agent", note:"Agent 迴圈、工具呼叫編排、Session 管理" },
      { level:"partial", pkg:"Prompt Templates", note:"Markdown 檔案範本系統，但無版本管理 UI" },
      { level:"partial", pkg:"Extensions", note:"可透過 Extension 實作權限控制，非內建" },
      null,
      { level:"partial", pkg:"TUI Footer + JSON mode", note:"Token/費用顯示、事件串流輸出，無專用平台" },
      { level:"full",    pkg:"pi-tui + pi-web-ui + pi-mom", note:"終端 TUI、Web UI 元件、Slack Bot" },
      null,
    ],
  },
  {
    key: "langchain",
    name: "LangChain 生態系",
    color: "#1C3C3C",
    logo: "🦜",
    desc: "全方位 LLM 應用開發框架",
    coverage: [
      null,
      null,
      null,
      { level:"partial", pkg:"ChatModel Abstraction", note:"統一模型介面，但非閘道/代理架構" },
      { level:"full",    pkg:"Retrievers + DocumentLoaders", note:"RAG 工具鏈：向量資料庫整合、文件載入、Chunking" },
      { level:"full",    pkg:"LangChain + LangGraph", note:"Chain 編排、Agent 框架、狀態圖、持久化" },
      { level:"full",    pkg:"PromptTemplate + Hub", note:"Prompt 範本系統、LangChain Hub 共享" },
      { level:"partial", pkg:"Output Parsers + Callbacks", note:"輸出驗證，需搭配第三方 Guardrails" },
      { level:"partial", pkg:"LangSmith Datasets", note:"透過 LangSmith 提供測試 Dataset 管理" },
      { level:"full",    pkg:"LangSmith", note:"完整追蹤、評估、Playground、費用分析" },
      null,
      { level:"partial", pkg:"LangServe", note:"一鍵部署 Chain 為 REST API" },
    ],
  },
  {
    key: "langfuse",
    name: "Langfuse",
    color: "#FF2D55",
    logo: "🔍",
    desc: "開源 LLM 可觀測性與評估平台",
    coverage: [
      null,
      null,
      null,
      { level:"partial", pkg:"Proxy 整合", note:"透過 LiteLLM/Gateway callback 接入" },
      null,
      { level:"partial", pkg:"SDK Decorators", note:"透過 @observe 裝飾器追蹤 Agent 行為" },
      { level:"full",    pkg:"Prompt Management", note:"版本控制、A/B 測試、Playground" },
      null,
      { level:"full",    pkg:"Evaluations + Datasets", note:"LLM-as-Judge、人工標註、自訂評估管線" },
      { level:"full",    pkg:"Tracing + Analytics", note:"完整 Trace、Session、費用/延遲/Token 分析" },
      null,
      null,
    ],
  },
  {
    key: "litellm",
    name: "LiteLLM",
    color: "#FF9500",
    logo: "🔀",
    desc: "LLM API 閘道與代理伺服器",
    coverage: [
      null,
      null,
      { level:"partial", pkg:"Provider Routing", note:"可路由到自建推論端點" },
      { level:"full",    pkg:"Proxy Server + SDK", note:"100+ LLM 統一 API、負載平衡、虛擬金鑰、預算管理" },
      null,
      null,
      null,
      { level:"partial", pkg:"Guardrails 整合", note:"支援 Guardrails callback" },
      null,
      { level:"partial", pkg:"Cost Tracking + Callbacks", note:"費用追蹤、可匯出到 Langfuse/Datadog" },
      null,
      null,
    ],
  },
  {
    key: "ray",
    name: "Ray / KubeRay",
    color: "#007AFF",
    logo: "⚡",
    desc: "分散式運算框架，橫跨多層",
    coverage: [
      { level:"full",    pkg:"KubeRay Operator", note:"K8s 叢集管理、自動擴縮、資源排程" },
      { level:"full",    pkg:"Ray Train + Ray Data", note:"分散式訓練、資料前處理流水線" },
      { level:"full",    pkg:"Ray Serve", note:"模型服務、動態 batching、自動擴縮" },
      null,
      null,
      { level:"partial", pkg:"Ray Actors", note:"平行 Agent 執行、跨節點水平擴展" },
      null,
      null,
      null,
      { level:"partial", pkg:"Ray Dashboard", note:"叢集資源、任務排程、Actor 狀態監控" },
      null,
      null,
    ],
  },
  {
    key: "openclaw",
    name: "OpenClaw",
    color: "#FF3B30",
    logo: "🦞",
    desc: "個人 AI 助理，使用 Pi SDK",
    coverage: [
      null,
      null,
      null,
      { level:"partial", pkg:"Model Config", note:"模型選擇與 failover 設定" },
      null,
      { level:"full",    pkg:"Pi SDK + Skills", note:"以 Pi 為引擎，加上 Skills 平台與自動化工作流" },
      null,
      { level:"partial", pkg:"ACP + Tool Gating", note:"工具權限控制、安全過濾" },
      null,
      null,
      { level:"full",    pkg:"Gateway + Channels", note:"WhatsApp/Telegram/Discord/Slack 等 10+ 通道" },
      null,
    ],
  },
];

/* ── bento grid layout: [colStart, colEnd, rowStart, rowEnd] ── */
const grid: [number,number,number,number][] = [
  [1,4,1,2],[4,7,1,2],[1,4,2,3],[4,7,2,3],
  [1,3,3,4],[3,7,3,4],[1,3,4,5],[3,5,4,5],
  [5,7,4,5],[1,4,5,6],[4,7,5,6],[1,7,6,7],
];

/* ── tiny components ── */
function Chip({label,accent,dimmed}:{label:string;accent:string;dimmed?:boolean}){
  return <span style={{
    display:"inline-block",padding:"3px 10px",borderRadius:20,
    fontSize:11,fontWeight:500,marginRight:5,marginBottom:5,whiteSpace:"nowrap",
    background:dimmed?"rgba(0,0,0,0.03)":`${A[accent]}14`,
    color:dimmed?"#C0C5CF":A[accent],transition:"all .35s ease",
  }}>{label}</span>;
}

function CoverageIcon({level}:{level?:CoverageLevel}){
  if(level==="full") return <div style={{width:22,height:22,borderRadius:7,background:"#34C75918",display:"flex",alignItems:"center",justifyContent:"center"}}><Check size={13} color="#34C759" strokeWidth={2.5}/></div>;
  if(level==="partial") return <div style={{width:22,height:22,borderRadius:7,background:"#FF950018",display:"flex",alignItems:"center",justifyContent:"center"}}><Minus size={13} color="#FF9500" strokeWidth={2.5}/></div>;
  return <div style={{width:22,height:22,borderRadius:7,background:"#F2F4F7",display:"flex",alignItems:"center",justifyContent:"center"}}><Minus size={11} color="#D0D5DD" strokeWidth={2}/></div>;
}

/* ── detail panel ── */
function DetailPanel({layer,onClose}:{layer:Layer;onClose:()=>void}){
  const [show,setShow]=useState(false);
  useEffect(()=>{requestAnimationFrame(()=>setShow(true));},[]);
  const Icon=layer.icon;
  const close=()=>{setShow(false);setTimeout(onClose,250);};
  return <div onClick={close} style={{position:"fixed",inset:0,zIndex:100,background:show?"rgba(0,0,0,.22)":"rgba(0,0,0,0)",backdropFilter:show?"blur(8px)":"blur(0)",WebkitBackdropFilter:show?"blur(8px)":"blur(0)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s ease",padding:20}}>
    <div onClick={e=>e.stopPropagation()} style={{background:"#FFF",borderRadius:24,padding:"32px 36px 28px",maxWidth:540,width:"100%",boxShadow:"0 24px 80px rgba(0,0,0,.14),0 0 0 1px rgba(0,0,0,.04)",opacity:show?1:0,transform:show?"scale(1)":"scale(.96) translateY(10px)",transition:"all .3s cubic-bezier(.16,1,.3,1)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
          <div style={{width:52,height:52,borderRadius:16,background:`${A[layer.accent]}14`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon size={26} color={A[layer.accent]} strokeWidth={1.8}/></div>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:A[layer.accent],letterSpacing:".08em",textTransform:"uppercase",marginBottom:4}}>Layer {layer.id}</div>
            <div style={{fontSize:22,fontWeight:800,color:"#1A1A1A",letterSpacing:"-.02em",lineHeight:1.2}}>{layer.title}</div>
            <div style={{fontSize:13,color:"#475467",fontWeight:500,marginTop:2}}>{layer.subtitle}</div>
          </div>
        </div>
        <button onClick={close} style={{width:36,height:36,borderRadius:12,border:"1px solid #E4E7EC",background:"#F9FAFB",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}><X size={16} color="#475467"/></button>
      </div>
      <p style={{fontSize:14.5,color:"#475467",lineHeight:1.65,margin:"0 0 20px 0"}}>{layer.desc}</p>
      <div style={{marginBottom:22}}>
        <div style={{fontSize:11,fontWeight:700,color:"#98A2B3",letterSpacing:".06em",textTransform:"uppercase",marginBottom:8}}>核心工具</div>
        <div style={{display:"flex",flexWrap:"wrap"}}>{layer.tools.map(t=><Chip key={t} label={t} accent={layer.accent}/>)}</div>
      </div>
      <div>
        <div style={{fontSize:11,fontWeight:700,color:"#98A2B3",letterSpacing:".06em",textTransform:"uppercase",marginBottom:10}}>關聯層級</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {layer.related.map(rid=>{const rl=layers[rid];const RI=rl.icon;return <div key={rid} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:14,background:`${A[rl.accent]}08`,border:`1px solid ${A[rl.accent]}15`}}>
            <div style={{width:30,height:30,borderRadius:10,background:`${A[rl.accent]}14`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><RI size={15} color={A[rl.accent]} strokeWidth={2}/></div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:650,color:"#1A1A1A"}}><span style={{color:A[rl.accent],fontSize:10,fontWeight:700,marginRight:6}}>L{rid}</span>{rl.title}</div><div style={{fontSize:12,color:"#475467",marginTop:1}}>{layer.relatedReason[rid]}</div></div>
            <ArrowRight size={14} color="#C0C5CF" style={{flexShrink:0}}/>
          </div>;})}
        </div>
      </div>
    </div>
  </div>;
}

/* ── bento card ── */
function Card({layer,pos,selectedId,onClick}:{layer:Layer;pos:[number,number,number,number];selectedId:number|null;onClick:(id:number)=>void}){
  const [mounted,setMounted]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setMounted(true),60+layer.id*50);return()=>clearTimeout(t);},[layer.id]);
  const Icon=layer.icon;
  const isSel=selectedId===layer.id;
  const isRel=selectedId!==null&&layers[selectedId]?.related?.includes(layer.id);
  const isDim=selectedId!==null&&!isSel&&!isRel;
  const isHero=(pos[1]-pos[0])>=4;
  const isFull=(pos[1]-pos[0])>=6;
  let border="1.5px solid rgba(0,0,0,.05)",shadow="0 1px 3px rgba(0,0,0,.04),0 8px 24px rgba(0,0,0,.03)",sc=1;
  if(isSel){border=`2px solid ${A[layer.accent]}`;shadow=`0 4px 20px ${A[layer.accent]}18,0 0 0 4px ${A[layer.accent]}12`;sc=1.015;}
  else if(isRel){border=`1.5px solid ${A[layer.accent]}50`;shadow=`0 2px 12px ${A[layer.accent]}10,0 0 0 2px ${A[layer.accent]}10`;sc=1.005;}
  else if(isDim){border="1.5px solid rgba(0,0,0,.03)";shadow="none";}

  return <div onClick={e=>{e.stopPropagation();onClick(layer.id);}} style={{
    gridColumn:`${pos[0]}/${pos[1]}`,gridRow:`${pos[2]}/${pos[3]}`,
    background:isDim?"#FAFBFC":"#FFF",borderRadius:20,border,boxShadow:shadow,
    padding:isFull?"22px 28px 18px":isHero?"24px 26px 20px":"20px 22px 18px",
    cursor:"pointer",position:"relative",overflow:"hidden",
    display:"flex",flexDirection:isFull?"row":"column",gap:isFull?28:0,alignItems:isFull?"center":"stretch",
    opacity:mounted?(isDim?.38:1):0,transform:mounted?`scale(${sc})`:"scale(.97) translateY(12px)",
    transition:"all .4s cubic-bezier(.16,1,.3,1)",filter:isDim?"grayscale(.5)":"none",
  }}>
    {!isFull&&<div style={{position:"absolute",top:0,left:20,right:20,height:3,borderRadius:"0 0 3px 3px",background:A[layer.accent],opacity:isDim?.12:isSel?1:.45,transition:"opacity .35s ease"}}/>}
    {isFull&&<div style={{position:"absolute",top:16,bottom:16,left:0,width:4,borderRadius:"0 4px 4px 0",background:A[layer.accent],opacity:isDim?.12:isSel?1:.5,transition:"opacity .35s ease"}}/>}
    {(isSel||isRel)&&<div style={{position:"absolute",top:-50,right:-50,width:isSel?160:100,height:isSel?160:100,borderRadius:"50%",background:`radial-gradient(circle,${A[layer.accent]}${isSel?"18":"0c"},transparent 70%)`,pointerEvents:"none"}}/>}

    <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:isFull?0:8,flexShrink:0,position:"relative"}}>
      <div style={{width:40,height:40,borderRadius:12,background:isDim?"#F2F4F7":`${A[layer.accent]}12`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background .35s ease"}}><Icon size={20} color={isDim?"#B0B8C4":A[layer.accent]} strokeWidth={1.8} style={{transition:"color .35s ease"}}/></div>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:isDim?"#B0B8C4":A[layer.accent],letterSpacing:".08em",textTransform:"uppercase",marginBottom:2,transition:"color .35s ease"}}>Layer {layer.id}</div>
        <div style={{fontSize:isHero||isFull?17:15.5,fontWeight:750,color:isDim?"#B0B8C4":"#1A1A1A",lineHeight:1.25,transition:"color .35s ease"}}>{layer.title}</div>
        <div style={{fontSize:11.5,fontWeight:500,marginTop:1,color:isDim?"#CCD0D8":"#475467",transition:"color .35s ease"}}>{layer.subtitle}</div>
      </div>
    </div>

    <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
      <p style={{fontSize:12.5,lineHeight:1.5,margin:"0 0 10px 0",color:isDim?"#CCD0D8":"#475467",flex:isFull?undefined:1,transition:"color .35s ease"}}>{layer.desc}</p>
      <div style={{display:"flex",flexWrap:"wrap"}}>
        {layer.tools.slice(0,isFull?10:isHero?7:5).map(t=><Chip key={t} label={t} accent={layer.accent} dimmed={isDim}/>)}
        {layer.tools.length>(isFull?10:isHero?7:5)&&<span style={{fontSize:11,color:isDim?"#CCD0D8":"#98A2B3",fontWeight:500,padding:"3px 6px"}}>+{layer.tools.length-(isFull?10:isHero?7:5)}</span>}
      </div>
    </div>

    {(isSel||isRel)&&<div style={{position:"absolute",top:isFull?10:12,right:14,padding:"3px 10px",borderRadius:8,background:isSel?A[layer.accent]:`${A[layer.accent]}18`,color:isSel?"#fff":A[layer.accent],fontSize:10,fontWeight:700,transition:"all .3s ease"}}>{isSel?`${layer.related.length} 關聯`:"關聯中"}</div>}
  </div>;
}

/* ── coverage table ── */
function CoverageTable({profile,expanded,onToggle}:{profile:ToolProfile;expanded:boolean;onToggle:()=>void}){
  const coveredLayers = profile.coverage.reduce((c,v)=>c+(v?1:0),0);
  const fullLayers = profile.coverage.reduce((c,v)=>c+(v?.level==="full"?1:0),0);

  return <div style={{
    background:"#FFF",borderRadius:20,overflow:"hidden",
    border:"1px solid rgba(0,0,0,.05)",
    boxShadow:"0 1px 3px rgba(0,0,0,.04),0 8px 24px rgba(0,0,0,.03)",
    transition:"all .3s ease",
  }}>
    {/* Header — always visible */}
    <div onClick={onToggle} style={{
      padding:"20px 24px",cursor:"pointer",display:"flex",alignItems:"center",gap:16,
      borderBottom:expanded?"1px solid #F2F4F7":"1px solid transparent",
      transition:"border .3s ease",
    }}>
      <div style={{fontSize:28,lineHeight:1,flexShrink:0,width:44,textAlign:"center"}}>{profile.logo}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:16,fontWeight:750,color:"#1A1A1A",letterSpacing:"-.01em"}}>{profile.name}</div>
        <div style={{fontSize:12.5,color:"#475467",marginTop:2}}>{profile.desc}</div>
      </div>
      {/* Mini coverage bar */}
      <div style={{display:"flex",gap:3,flexShrink:0,marginRight:8}}>
        {profile.coverage.map((c,i)=><div key={i} style={{
          width:8,height:24,borderRadius:4,
          background:c?.level==="full"?A[layers[i].accent]:c?.level==="partial"?`${A[layers[i].accent]}40`:"#F2F4F7",
          transition:"background .3s ease",
        }}/>)}
      </div>
      <div style={{textAlign:"right",flexShrink:0,marginRight:4}}>
        <div style={{fontSize:22,fontWeight:800,color:profile.color,lineHeight:1}}>{coveredLayers}</div>
        <div style={{fontSize:10,fontWeight:600,color:"#98A2B3",marginTop:2}}>/ 12 層</div>
      </div>
      <ChevronDown size={18} color="#98A2B3" style={{flexShrink:0,transition:"transform .3s ease",transform:expanded?"rotate(180deg)":"rotate(0)"}}/>
    </div>

    {/* Expanded table */}
    {expanded && <div style={{padding:"4px 8px 12px"}}>
      {profile.coverage.map((c,i)=>{
        const l=layers[i]; const LI=l.icon;
        return <div key={i} style={{
          display:"flex",alignItems:"center",gap:12,
          padding:"10px 16px",borderRadius:12,
          background:c?`${A[l.accent]}05`:"transparent",
          margin:"2px 0",
        }}>
          <CoverageIcon level={c?.level}/>
          <div style={{width:28,height:28,borderRadius:8,background:c?`${A[l.accent]}10`:"#F2F4F7",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <LI size={14} color={c?A[l.accent]:"#C0C5CF"} strokeWidth={1.8}/>
          </div>
          <div style={{width:36,flexShrink:0}}>
            <span style={{fontSize:10,fontWeight:700,color:c?A[l.accent]:"#C0C5CF"}}>L{i}</span>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:650,color:c?"#1A1A1A":"#C0C5CF"}}>{l.title}</div>
            {c && <div style={{fontSize:11.5,color:"#475467",marginTop:1}}>
              <span style={{fontWeight:600,color:profile.color}}>{c.pkg}</span>
              <span style={{color:"#98A2B3"}}>{" — "}</span>{c.note}
            </div>}
          </div>
          {c && <span style={{
            fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:6,flexShrink:0,
            background:c.level==="full"?"#34C75914":"#FF950014",
            color:c.level==="full"?"#34C759":"#FF9500",
          }}>{c.level==="full"?"完整":"部分"}</span>}
        </div>;
      })}
    </div>}
  </div>;
}

/* ── main app ── */
export default function LLMOpsBento(){
  const [selectedId,setSelectedId]=useState<number|null>(null);
  const [detailLayer,setDetailLayer]=useState<Layer|null>(null);
  const [headerVisible,setHeaderVisible]=useState(false);
  const [expandedProfile,setExpandedProfile]=useState<string|null>("pi");

  useEffect(()=>{setHeaderVisible(true);},[]);
  const handleCard=useCallback((id:number)=>{if(selectedId===id)setDetailLayer(layers[id]);else setSelectedId(id);},[selectedId]);

  return <div onClick={()=>setSelectedId(null)} style={{
    minHeight:"100vh",background:"#F2F4F7",
    fontFamily:"'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,sans-serif",
    WebkitFontSmoothing:"antialiased",
  }}>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>

    <div style={{maxWidth:1100,margin:"0 auto",padding:"44px 20px 60px"}}>
      {/* Header */}
      <div style={{textAlign:"center",marginBottom:32,opacity:headerVisible?1:0,transform:headerVisible?"translateY(0)":"translateY(-10px)",transition:"all .6s ease"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"#FFF",borderRadius:100,padding:"6px 18px 6px 12px",border:"1px solid rgba(0,0,0,.06)",boxShadow:"0 2px 8px rgba(0,0,0,.04)",marginBottom:18,fontSize:13,fontWeight:600,color:"#475467"}}>
          <Layers size={15} color="#007AFF"/>12 Layers · 60+ Tools
        </div>
        <h1 style={{fontSize:40,fontWeight:800,color:"#1A1A1A",letterSpacing:"-.03em",lineHeight:1.15,margin:"0 0 10px 0"}}>
          LLMOps<span style={{color:"#007AFF"}}> 全棧架構</span>
        </h1>
        <p style={{fontSize:15,color:"#475467",fontWeight:500,maxWidth:460,margin:"0 auto",lineHeight:1.6}}>
          點選任一層級查看關聯架構，再次點選展開詳情
        </p>
      </div>

      {/* Hint */}
      <div style={{height:48,display:"flex",justifyContent:"center",marginBottom:14}}>
        {selectedId!==null&&<div key={selectedId} style={{display:"inline-flex",alignItems:"center",gap:10,background:"#FFF",borderRadius:14,padding:"10px 20px",border:`1.5px solid ${A[layers[selectedId].accent]}25`,boxShadow:`0 4px 16px ${A[layers[selectedId].accent]}08`,fontSize:13,fontWeight:600,animation:"hintIn .3s ease"}}>
          <div style={{width:8,height:8,borderRadius:4,background:A[layers[selectedId].accent]}}/>
          <span style={{color:A[layers[selectedId].accent]}}>Layer {selectedId} · {layers[selectedId].title}</span>
          <span style={{color:"#98A2B3",fontWeight:500,fontSize:12}}>— 關聯 {layers[selectedId].related.length} 個層級</span>
        </div>}
      </div>

      {/* Bento */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gridTemplateRows:"repeat(6,auto)",gap:14}}>
        {layers.map(l=><Card key={l.id} layer={l} pos={grid[l.id]} selectedId={selectedId} onClick={handleCard}/>)}
      </div>

      {/* Divider */}
      <div style={{display:"flex",alignItems:"center",gap:16,margin:"48px 0 28px"}}>
        <div style={{flex:1,height:1,background:"#E4E7EC"}}/>
        <span style={{fontSize:13,fontWeight:700,color:"#475467",letterSpacing:".04em",textTransform:"uppercase",whiteSpace:"nowrap"}}>工具覆蓋對照</span>
        <div style={{flex:1,height:1,background:"#E4E7EC"}}/>
      </div>

      <p style={{textAlign:"center",fontSize:14,color:"#475467",marginBottom:24,lineHeight:1.6}}>
        各主流工具在 12 層架構中的覆蓋範圍，<span style={{fontWeight:700,color:"#34C759"}}>綠色</span> 為完整覆蓋，<span style={{fontWeight:700,color:"#FF9500"}}>橙色</span> 為部分觸及
      </p>

      {/* Coverage tables */}
      <div style={{display:"flex",flexDirection:"column",gap:12}} onClick={e=>e.stopPropagation()}>
        {toolProfiles.map(p=>(
          <CoverageTable
            key={p.key}
            profile={p}
            expanded={expandedProfile===p.key}
            onToggle={()=>setExpandedProfile(expandedProfile===p.key?null:p.key)}
          />
        ))}
      </div>

      {/* Footer */}
      <div style={{textAlign:"center",marginTop:32,fontSize:12,color:"#98A2B3",fontWeight:500}}>
        Pi · LangChain · LiteLLM · Langfuse · Ray · OpenClaw
      </div>
    </div>

    {detailLayer&&<DetailPanel layer={detailLayer} onClose={()=>setDetailLayer(null)}/>}
    <style>{`@keyframes hintIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
  </div>;
}