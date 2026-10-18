import { getStore } from "@netlify/blobs";
import { HttpError, json, type Ctx } from "./http.js";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB limit

export const uploadsStore = () => getStore({ name: "uploads", consistency: "strong" });

async function saveImage(file: FormDataEntryValue | null) {
  if (!file || typeof file === "string") throw new HttpError(400, "No image file uploaded.");
  if (!file.type.startsWith("image/")) throw new HttpError(400, "Only image files are allowed.");
  if (file.size > MAX_BYTES) throw new HttpError(400, "Image must be 5MB or smaller.");

  const ext = (file.name.match(/\.[a-zA-Z0-9]+$/)?.[0] || "").toLowerCase();
  const filename = `cake-photo-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  await uploadsStore().set(filename, await file.arrayBuffer(), { metadata: { contentType: file.type } });
  return { url: `/uploads/${filename}`, filename };
}

async function readForm(req: Request) {
  try {
    return await req.formData();
  } catch {
    throw new HttpError(400, "Expected a multipart form upload.");
  }
}

// POST /api/uploads
export async function uploadPhoto({ req }: Ctx) {
  const saved = await saveImage((await readForm(req)).get("photo"));
  return json({ message: "Photo uploaded successfully.", ...saved });
}

// POST /api/uploads/multiple (up to 10)
export async function uploadPhotos({ req }: Ctx) {
  const files = (await readForm(req)).getAll("photos");
  if (!files.length) throw new HttpError(400, "No image files uploaded.");
  if (files.length > 10) throw new HttpError(400, "You can upload up to 10 photos at once.");

  const saved = await Promise.all(files.map(saveImage));
  return json({
    message: `${saved.length} photos uploaded successfully.`,
    urls: saved.map((f) => f.url),
    files: saved,
  });
}
