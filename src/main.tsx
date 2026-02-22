import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import LLMOpsBento from "./LLMOps_overview";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LLMOpsBento />
  </StrictMode>
);
