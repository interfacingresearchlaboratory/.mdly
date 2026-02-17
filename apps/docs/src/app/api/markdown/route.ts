import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slugParam = searchParams.get("slug");

  if (!slugParam) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  try {
    // Handle slug as array (e.g., "getting-started" or "overview")
    const slugParts = slugParam.split("/").filter(Boolean);
    
    // Try different file path patterns
    let filePaths: string[] = [];
    
    if (slugParts.length === 0) {
      // Root page
      filePaths = [join(process.cwd(), "content/docs", "index.mdx")];
    } else {
      // Try both patterns: slug/index.mdx and slug.mdx (for last part)
      const indexPath = join(process.cwd(), "content/docs", ...slugParts, "index.mdx");
      const directPath = join(process.cwd(), "content/docs", ...slugParts.slice(0, -1), `${slugParts[slugParts.length - 1]}.mdx`);
      filePaths = [indexPath, directPath];
    }
    
    // Try each path until one works
    for (const filePath of filePaths) {
      try {
        const content = await readFile(filePath, "utf-8");
        return NextResponse.json({ content });
      } catch {
        // Try next path
        continue;
      }
    }
    
    // If none worked, throw error
    throw new Error("File not found");
  } catch (error) {
    console.error("Error reading markdown file:", error);
    return NextResponse.json(
      { error: "Failed to read markdown file" },
      { status: 500 }
    );
  }
}
