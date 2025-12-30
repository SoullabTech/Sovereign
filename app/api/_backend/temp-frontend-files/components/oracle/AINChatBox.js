"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AINChatBox;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const input_1 = require("@/components/ui/input");
const button_1 = require("@/components/ui/button");
const SoulCompass_1 = __importDefault(require("./SoulCompass"));
function AINChatBox() {
  const [input, setInput] = (0, react_1.useState)("");
  const [response, setResponse] = (0, react_1.useState)("");
  const [metadata, setMetadata] = (0, react_1.useState)(null);
  const [loading, setLoading] = (0, react_1.useState)(false);
  const sendToOracle = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/oracle/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, userId: "demo-user-001" }),
      });
      const data = await res.json();
      setResponse(data.content);
      setMetadata(data.metadata);
    } catch (err) {
      setResponse("🌀 Oracle connection unstable. Try again.");
      setMetadata(null);
    } finally {
      setLoading(false);
    }
  };
  return (0, jsx_runtime_1.jsxs)("div", {
    className: "space-y-6 max-w-xl mx-auto",
    children: [
      (0, jsx_runtime_1.jsxs)("div", {
        className: "flex gap-2 items-center",
        children: [
          (0, jsx_runtime_1.jsx)(input_1.Input, {
            value: input,
            onChange: (e) => setInput(e.target.value),
            placeholder: "Ask the Oracle anything...",
            onKeyDown: (e) => e.key === "Enter" && sendToOracle(),
          }),
          (0, jsx_runtime_1.jsx)(button_1.Button, {
            onClick: sendToOracle,
            disabled: loading,
            children: loading ? "Listening..." : "Ask",
          }),
        ],
      }),
      response &&
        (0, jsx_runtime_1.jsx)(SoulCompass_1.default, {
          response: response,
          metadata: metadata,
        }),
    ],
  });
}
