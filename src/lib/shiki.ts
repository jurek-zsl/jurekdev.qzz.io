import { codeToHtml } from "shiki";

export async function highlightCode(code: string, lang = "typescript"): Promise<string> {
  const normalizedLang = lang.trim().toLowerCase();
  const supportedLangs: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    tsx: "tsx",
    jsx: "jsx",
    go: "go",
    golang: "go",
    c: "c",
    cpp: "cpp",
    rust: "rust",
    rs: "rust",
    py: "python",
    python: "python",
    bash: "bash",
    sh: "bash",
    zsh: "bash",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    markdown: "markdown",
    md: "markdown",
    sql: "sql",
    dockerfile: "dockerfile",
  };

  const finalLang = supportedLangs[normalizedLang] || "text";

  try {
    return await codeToHtml(code.trim(), {
      lang: finalLang,
      theme: "vitesse-black",
    });
  } catch (err) {
    console.warn(`Failed to highlight code with lang ${lang}, falling back to plain text:`, err);
    return `<pre><code>${code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")}</code></pre>`;
  }
}
