import { NextRequest, NextResponse } from "next/server";
import { uploadToAzure, AllowedContainer } from "@/lib/azure";

// Uploads are always handled on demand because they read the multipart request body.
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const containerName = formData.get("containerName") as AllowedContainer | null;
    const customBlobName = formData.get("blobName") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!containerName || !["facfiles", "payments", "blogs"].includes(containerName)) {
      return NextResponse.json(
        { error: "Invalid or missing containerName. Must be facfiles, payments, or blogs." },
        { status: 400 }
      );
    }

    const blobName = customBlobName || `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const url = await uploadToAzure(containerName, blobName, buffer, file.type);

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully to Azure Blob Storage",
      containerName,
      blobName,
      url,
    });
  } catch (error: unknown) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error during upload" },
      { status: 500 }
    );
  }
}
