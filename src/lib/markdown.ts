import { highlightCode } from "./shiki";

export interface ParsedBlock {
  type: "html" | "code" | "callout";
  content: string;
  lang?: string;
  calloutType?: "tip" | "info" | "warning" | "note";
  title?: string;
  rawCode?: string;
}

export async function parseMarkdownToBlocks(markdown: string): Promise<ParsedBlock[]> {
  const blocks: ParsedBlock[] = [];
  const lines = markdown.split("\n");
  let currentHtmlLines: string[] = [];
  let inCodeBlock = false;
  let codeLang = "";
  let codeLines: string[] = [];

  const flushHtml = () => {
    if (currentHtmlLines.length > 0) {
      const rawText = currentHtmlLines.join("\n");
      const html = renderBasicMarkdown(rawText);
      if (html.trim()) {
        blocks.push({ type: "html", content: html });
      }
      currentHtmlLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect code fence
    if (line.trim().startsWith("```")) {
      if (!inCodeBlock) {
        // Start code block
        flushHtml();
        inCodeBlock = true;
        codeLang = line.trim().replace(/^```/, "").trim() || "text";
        codeLines = [];
      } else {
        // End code block
        inCodeBlock = false;
        const rawCode = codeLines.join("\n");
        const highlighted = await highlightCode(rawCode, codeLang);
        blocks.push({
          type: "code",
          content: highlighted,
          lang: codeLang,
          rawCode,
        });
        codeLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Callout detection: e.g. > [!NOTE], > [!TIP], > [!WARNING]
    if (line.trim().startsWith("> [!")) {
      flushHtml();
      const match = line.trim().match(/> \[!(NOTE|TIP|WARNING|INFO|IMPORTANT)\]\s*(.*)/i);
      const rawType = match ? match[1].toLowerCase() : "info";
      const calloutType: "tip" | "info" | "warning" | "note" =
        rawType === "important" || rawType === "warning"
          ? "warning"
          : rawType === "tip"
          ? "tip"
          : rawType === "note"
          ? "note"
          : "info";
      const title = match && match[2] ? match[2] : calloutType.toUpperCase();

      const calloutBodyLines: string[] = [];
      while (i + 1 < lines.length && (lines[i + 1].trim().startsWith(">") || lines[i + 1].trim() === "")) {
        i++;
        const nextLine = lines[i].trim().replace(/^>\s?/, "");
        calloutBodyLines.push(nextLine);
      }

      blocks.push({
        type: "callout",
        calloutType,
        title,
        content: renderBasicMarkdown(calloutBodyLines.join("\n")),
      });
      continue;
    }

    currentHtmlLines.push(line);
  }

  flushHtml();
  return blocks;
}

function renderBasicMarkdown(text: string): string {
  // Convert markdown to clean HTML
  let out = text;

  // Horizontal rules
  out = out.replace(/^---$/gm, '<hr class="my-6 border-[#e5e5e5]" />');

  // Headings with IDs
  out = out.replace(/^### (.*$)/gim, (m, title) => {
    const id = title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    return `<h3 id="${id}" class="text-sm font-bold text-[#e5e5e5] mt-6 mb-2 scroll-mt-20 flex items-center gap-2"><span class="text-[#38bdf8]">###</span> <span>${title}</span></h3>`;
  });
  out = out.replace(/^## (.*$)/gim, (m, title) => {
    const id = title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    return `<h2 id="${id}" class="text-base font-bold text-[#e5e5e5] mt-8 mb-3 scroll-mt-20 pb-1 border-b border-[#e5e5e5] flex items-center gap-2"><span class="text-[#38bdf8]">##</span> <span>${title}</span></h2>`;
  });
  out = out.replace(/^# (.*$)/gim, (m, title) => {
    const id = title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    return `<h1 id="${id}" class="text-lg font-bold text-[#e5e5e5] mt-8 mb-4 scroll-mt-20 pb-1 border-b border-[#e5e5e5]"><span class="text-[#38bdf8]">#</span> ${title}</h1>`;
  });

  // Blockquotes
  out = out.replace(/^\> (.*$)/gim, '<blockquote class="border-l-2 border-[#38bdf8] pl-3 py-1 my-3 text-[#e5e5e5] bg-[#000000]">&gt; $1</blockquote>');

  // Tables
  out = out.replace(/\|(.+)\|[\r\n]+\|([-:| ]+)\|[\r\n]+((?:\|.*\|[\r\n]*)+)/g, (match, header, divider, rows) => {
    const headers = header.split("|").map((h: string) => h.trim()).filter(Boolean);
    const rowLines = rows.trim().split("\n");
    const parsedRows = rowLines.map((row: string) =>
      row.split("|").map((c: string) => c.trim()).filter(Boolean)
    );

    let tableHtml = '<div class="overflow-x-auto my-4 border border-[#e5e5e5]"><table class="w-full text-left text-xs text-[#e5e5e5] font-mono">';
    tableHtml += '<thead class="bg-[#000000] text-[#38bdf8] font-bold border-b border-[#e5e5e5]"><tr>';
    headers.forEach((h: string) => {
      tableHtml += `<th class="px-3 py-2 border-r border-[#e5e5e5] last:border-r-0">${h}</th>`;
    });
    tableHtml += "</tr></thead><tbody>";
    parsedRows.forEach((r: string[]) => {
      tableHtml += '<tr class="border-b border-[#e5e5e5] last:border-b-0 hover:bg-[#38bdf8] hover:text-[#000000]">';
      r.forEach((cell: string) => {
        tableHtml += `<td class="px-3 py-2 border-r border-[#e5e5e5] last:border-r-0">${cell}</td>`;
      });
      tableHtml += "</tr>";
    });
    tableHtml += "</tbody></table></div>";
    return tableHtml;
  });

  // Bold & Italic
  out = out.replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold text-[#38bdf8]"><em>$1</em></strong>');
  out = out.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#e5e5e5]">$1</strong>');
  out = out.replace(/\*(.*?)\*/g, '<em class="italic text-[#e5e5e5]">$1</em>');

  // Inline code
  out = out.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 text-xs font-mono bg-[#000000] text-[#38bdf8] border border-[#e5e5e5]">$1</code>');

  // Links
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#38bdf8] underline underline-offset-2 hover:bg-[#38bdf8] hover:text-[#000000]">$1 ↗</a>');

  // Lists
  out = out.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-none text-[#e5e5e5] my-1 font-mono">- $1</li>');
  out = out.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="ml-4 list-none text-[#e5e5e5] my-1 font-mono">&gt; $1</li>');

  // Paragraphs
  const paragraphs = out.split(/\n\n+/);
  out = paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<div") ||
        trimmed.startsWith("<table") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<li")
      ) {
        return trimmed;
      }
      return `<p class="my-3 leading-relaxed text-[#e5e5e5] text-xs sm:text-sm font-mono">${trimmed}</p>`;
    })
    .join("\n");

  return out;
}
