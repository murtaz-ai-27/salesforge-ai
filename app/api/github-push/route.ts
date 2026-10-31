import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { filePath, content, commitMessage } = await req.json();

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;
    const branch = process.env.GITHUB_BRANCH || "main";

    if (!token || !owner || !repo) {
      return NextResponse.json(
        { error: "GitHub environment variables missing in .env.local" },
        { status: 500 }
      );
    }

    // 1. Get current file SHA if file already exists
    const getFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
    const fileRes = await fetch(getFileUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    let sha = "";
    if (fileRes.ok) {
      const fileData = await fileRes.json();
      sha = fileData.sha;
    }

    // 2. Encode content to Base64
    const encodedContent = Buffer.from(content).toString("base64");

    // 3. Push commit to GitHub
    const pushRes = await fetch(getFileUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        message: commitMessage || `Auto update ${filePath}`,
        content: encodedContent,
        branch: branch,
        ...(sha ? { sha } : {}),
      }),
    });

    const pushData = await pushRes.json();

    if (!pushRes.ok) {
      return NextResponse.json({ error: pushData.message }, { status: pushRes.status });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully pushed to GitHub! Vercel build triggered automatically.`,
      commitSha: pushData.commit.sha,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}