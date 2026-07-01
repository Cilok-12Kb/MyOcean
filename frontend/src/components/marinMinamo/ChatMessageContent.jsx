// src/components/marinMinamo/ChatMessageContent.jsx
import { parseMessageBlocks } from "../../utils/chatMessageHelpers";
import ComparisonTable from "./ComparisonTable";

export default function ChatMessageContent({ text }) {
  const blocks = parseMessageBlocks(text);

  return (
    <>
      {blocks.map((block, idx) =>
        block.type === "table" ? (
          <ComparisonTable key={idx} table={block.table} />
        ) : (
          <span key={idx} style={{ whiteSpace: "pre-line", display: "block" }}>
            {block.content}
          </span>
        )
      )}
    </>
  );
}