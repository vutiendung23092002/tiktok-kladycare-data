import fs from "fs";

export function updateEnvTokens(newValues) {
    const envPath = ".env";
    let content = "";
    try {
        content = fs.readFileSync(envPath, "utf-8");
    } catch {
        content = "";
    }
    const lines = content.split("\n");
    const upsert = (key, val) => {
        const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
        if (idx !== -1) lines[idx] = `${key}=${val}`;
        else lines.push(`${key}=${val}`);
    };
    for (const [k, v] of Object.entries(newValues)) upsert(k, v);
    fs.writeFileSync(envPath, lines.join("\n"));
    console.log("[TikTok.auth.js] .env đã cập nhật token mới");
}