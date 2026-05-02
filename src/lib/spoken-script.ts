const spokenHeadingPattern =
  /^(?:spoken\s*)?(?:script|voice\s*over|voiceover|dialogue|dialog|what\s+(?:the\s+)?(?:creator|character)\s+says)\s*:\s*(.*)$/i;

const sectionHeadingPattern =
  /^(?:performance\s+direction|opening\s+hook|video\s+style|voice\s+style|cta|direction|instructions|visual\s+direction|camera\s+direction|style|on)\s*:/i;

export function extractPromptParts(input: string): {
  script: string;
  direction: string;
  extracted: boolean;
} {
  const normalized = input.replace(/\r\n/g, "\n").trim();
  if (!normalized) return { script: "", direction: "", extracted: false };

  const lines = normalized.split("\n");
  const headingIndex = lines.findIndex((line) => spokenHeadingPattern.test(line.trim()));

  if (headingIndex === -1) {
    return { script: normalized, direction: "", extracted: false };
  }

  const headingMatch = lines[headingIndex].trim().match(spokenHeadingPattern);
  const scriptLines: string[] = [];
  const inlineScript = headingMatch?.[1]?.trim();
  if (inlineScript) scriptLines.push(inlineScript);

  let directionStartIndex = lines.length;
  for (let i = headingIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed && sectionHeadingPattern.test(trimmed)) {
      directionStartIndex = i;
      break;
    }
    scriptLines.push(line);
  }

  const beforeScript = lines.slice(0, headingIndex).join("\n").trim();
  const afterScript = lines.slice(directionStartIndex).join("\n").trim();
  const direction = [beforeScript, afterScript].filter(Boolean).join("\n\n");
  const script = stripWrappingQuotes(scriptLines.join("\n").trim());
  return { script: script || normalized, direction, extracted: !!script };
}

export function extractSpokenScript(input: string): { script: string; extracted: boolean } {
  const { script, extracted } = extractPromptParts(input);
  return { script, extracted };
}

function stripWrappingQuotes(value: string): string {
  const quotePairs: Array<[string, string]> = [
    ['"', '"'],
    ["'", "'"],
    ["“", "”"],
    ["‘", "’"],
  ];

  let result = value.trim();
  for (const [open, close] of quotePairs) {
    if (result.startsWith(open) && result.endsWith(close)) {
      result = result.slice(open.length, -close.length).trim();
    }
  }
  return result;
}
