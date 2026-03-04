import { NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

function buildPublicUrl(key: string, bucket: string, region: string): string {
  const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;
  if (publicBaseUrl) {
    const base = publicBaseUrl.replace(/\/$/, "");
    return `${base}/${key}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export async function POST(request: Request) {
  const bucket = process.env.S3_BUCKET;
  const region = process.env.AWS_REGION ?? "us-east-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  const missing: string[] = [];
  if (!bucket) missing.push("S3_BUCKET");
  if (!accessKeyId) missing.push("AWS_ACCESS_KEY_ID");
  if (!secretAccessKey) missing.push("AWS_SECRET_ACCESS_KEY");
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing env: ${missing.join(", ")}. Restart the dev server after changing .env.local` },
      { status: 500 }
    );
  }
  const verifiedBucket = bucket ?? "";
  const verifiedAccessKeyId = accessKeyId ?? "";
  const verifiedSecretAccessKey = secretAccessKey ?? "";

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing or invalid file" },
      { status: 400 }
    );
  }

  const ext = file.name.replace(/^.*\./, "") || "bin";
  const key = `uploads/${crypto.randomUUID()}.${ext}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const body = new Uint8Array(arrayBuffer);

    const client = new S3Client({
      region,
      credentials: {
        accessKeyId: verifiedAccessKeyId,
        secretAccessKey: verifiedSecretAccessKey,
      },
    });
    await client.send(
      new PutObjectCommand({
        Bucket: verifiedBucket,
        Key: key,
        Body: body,
        ContentType: file.type || "application/octet-stream",
      })
    );
    const url = buildPublicUrl(key, verifiedBucket, region);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("S3 upload failed:", err);
    const message =
      err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
