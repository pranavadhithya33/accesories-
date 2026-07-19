import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: `File ${file.name} is not an image` }, { status: 400 });
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: `File ${file.name} exceeds 5MB limit` }, { status: 400 });
      }

      // Convert file to base64 buffer for Cloudinary upload
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64String = `data:${file.type};base64,${buffer.toString("base64")}`;

      const uploadResponse = await cloudinary.uploader.upload(base64String, {
        folder: "accessories_store",
        transformation: [
          { width: 800, crop: "limit" }, // Resize if larger than 800px width
          { fetch_format: "auto", quality: "auto" } // Auto WebP and optimization
        ],
      });

      uploadedUrls.push(uploadResponse.secure_url);
    }

    return NextResponse.json({ success: true, urls: uploadedUrls });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ error: "Failed to upload images" }, { status: 500 });
  }
}
