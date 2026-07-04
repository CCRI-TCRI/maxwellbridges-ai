import React from "react";
import ReactDOM from "react-dom/client";
import { StudioShell } from "@/components/studio/studio-shell";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <StudioShell />
  </React.StrictMode>
);
