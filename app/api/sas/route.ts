import { NextRequest, NextResponse, connection } from "next/server";
import { getContainerClient, AllowedContainer } from "@/lib/azure";
import { 
  BlobSASPermissions, 
  generateBlobSASQueryParameters, 
  StorageSharedKeyCredential 
} from "@azure/storage-blob";

export async function GET(req: NextRequest) {
  // Always run on demand: this route reads query params and signs requests per-invocation.
  // `connection()` opts out of prerendering so the build never tries to sign a request.
  await connection();

  try {
    const { searchParams } = req.nextUrl;
    const containerName = searchParams.get("containerName") as AllowedContainer | null;
    const blobName = searchParams.get("blobName");

    if (!containerName || !["facfiles", "payments", "blogs"].includes(containerName)) {
      return NextResponse.json(
        { error: "Invalid or missing containerName. Must be facfiles, payments, or blogs." },
        { status: 400 }
      );
    }

    if (!blobName) {
      return NextResponse.json({ error: "Missing blobName query parameter" }, { status: 400 });
    }

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || "";
    if (!connectionString) {
      return NextResponse.json({ error: "Azure connection string is not configured" }, { status: 500 });
    }

    // Extract Account Name and Account Key from connection string
    const matchAccountName = connectionString.match(/AccountName=([^;]+)/);
    const matchAccountKey = connectionString.match(/AccountKey=([^;]+)/);

    if (!matchAccountName || !matchAccountKey) {
      return NextResponse.json({ error: "Invalid Azure connection string format" }, { status: 500 });
    }

    const accountName = matchAccountName[1];
    const accountKey = matchAccountKey[1];

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const containerClient = getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    // Set SAS expiry to 1 hour from now
    const startsOn = new Date();
    const expiresOn = new Date(new Date().valueOf() + 60 * 60 * 1000);

    const sasOptions = {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"), // read-only
      startsOn,
      expiresOn,
    };

    const sasQueryParameters = generateBlobSASQueryParameters(
      sasOptions,
      sharedKeyCredential
    );

    const sasUrl = `${blobClient.url}?${sasQueryParameters.toString()}`;

    return NextResponse.json({
      success: true,
      sasUrl,
      expiresOn: expiresOn.toISOString(),
    });
  } catch (error: unknown) {
    console.error("SAS API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate SAS URL" },
      { status: 500 }
    );
  }
}
