import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { Readable } from "stream";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || "";

export type AllowedContainer = "facfiles" | "payments" | "blogs";

/**
 * Get or create a ContainerClient for the given container name.
 */
export function getContainerClient(containerName: AllowedContainer): ContainerClient {
  if (!connectionString) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING is not defined in environment variables.");
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  return blobServiceClient.getContainerClient(containerName);
}

/**
 * Upload a file buffer, stream, or Uint8Array to Azure Blob Storage.
 */
export async function uploadToAzure(
  containerName: AllowedContainer,
  blobName: string,
  data: Buffer | Readable | Uint8Array,
  contentType?: string
): Promise<string> {
  const containerClient = getContainerClient(containerName);
  
  // Ensure container exists
  await containerClient.createIfNotExists();

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
  const uploadOptions = contentType
    ? { blobHTTPHeaders: { blobContentType: contentType } }
    : undefined;

  if (Buffer.isBuffer(data) || data instanceof Uint8Array) {
    await blockBlobClient.upload(data, data.length, uploadOptions);
  } else {
    // For Node.js Readable stream
    await blockBlobClient.uploadStream(data, undefined, undefined, uploadOptions);
  }

  return blockBlobClient.url;
}

/**
 * List all blobs in the specified container.
 */
export async function listAzureBlobs(containerName: AllowedContainer): Promise<string[]> {
  const containerClient = getContainerClient(containerName);
  const blobs: string[] = [];

  for await (const blob of containerClient.listBlobsFlat()) {
    blobs.push(blob.name);
  }

  return blobs;
}

/**
 * Generate a direct or public URL for a blob.
 */
export function getAzureBlobUrl(containerName: AllowedContainer, blobName: string): string {
  const containerClient = getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  return blockBlobClient.url;
}

