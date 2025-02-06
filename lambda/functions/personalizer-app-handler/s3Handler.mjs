import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { buildResponse } from "/opt/nodejs/helper.mjs";

const s3Client = new S3Client({});
const BUCKET_NAME = process.env.IMAGE_BUCKET;

export const generatePresignedUrl = async (fileName, contentType) => {
  try {
    if (!fileName) {
      return buildResponse(400, { message: "fileName is required" });
    }

    // Generate unique file path
    const key = `previews/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType || "image/jpeg",
    });

    // Generate presigned URL valid for 5 minutes
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });

    return buildResponse(200, {
      message: "Presigned URL generated successfully",
      data: {
        presignedUrl,
        key,
        url: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`,
      },
    });
  } catch (error) {
    console.error("❌ Error generating presigned URL:", error);
    return buildResponse(500, { message: error.message });
  }
};
