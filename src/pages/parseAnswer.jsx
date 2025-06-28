import React from 'react';

export function parseAnswer(answerText) {
  const elements = [];
  const parts = answerText.split(/\[(.*?)\]/); // split using [TAGS]

  let currentType = null;

  parts.forEach((part) => {
    if (!part.trim()) return;

    if (["PARAGRAPH", "HEADING", "BULLET POINT TABLE", "FLOWCHART", "DIAGRAM"].includes(part.trim())) {
      currentType = part.trim();
    } else if (currentType) {
      if (currentType === "PARAGRAPH") {
        elements.push(<p key={elements.length}>{part.trim()}</p>);
      } else if (currentType === "HEADING") {
        elements.push(<h3 key={elements.length}>{part.trim()}</h3>);
      } else if (currentType === "BULLET POINT TABLE") {
        const bullets = part.split('•').map(b => b.trim()).filter(b => b);
        elements.push(
          <ul key={elements.length}>
            {bullets.map((bullet, idx) => (
              <li key={idx}>{bullet}</li>
            ))}
          </ul>
        );
      } else if (currentType === "FLOWCHART" || currentType === "DIAGRAM") {
        elements.push(<p key={elements.length}><strong>{currentType}:</strong> {part.trim()}</p>);
      }
      currentType = null;
    }
  });

  return elements;
}
