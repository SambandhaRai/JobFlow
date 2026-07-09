import fs from "fs";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";

const uploadDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedResumeMimeTypes = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const allowedResumeExtensions = new Set([".pdf", ".doc", ".docx"]);

const allowedImageMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

const allowedImageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const safeFieldName = file.fieldname.replace(/[^a-z0-9_-]/gi, "-");
        cb(null, `${safeFieldName}-${randomUUID()}${extension}`);
    },
});

const resumeFileFilter = (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const isAllowedMimeType = allowedResumeMimeTypes.has(file.mimetype);
    const isAllowedExtension = allowedResumeExtensions.has(extension);

    if (!isAllowedMimeType || !isAllowedExtension) {
        return cb(new Error("Only PDF, DOC, and DOCX resume files are allowed"));
    }

    cb(null, true);
};

const imageFileFilter = (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const isAllowedMimeType = allowedImageMimeTypes.has(file.mimetype);
    const isAllowedExtension = allowedImageExtensions.has(extension);

    if (!isAllowedMimeType || !isAllowedExtension) {
        return cb(new Error("Only JPG, PNG, WEBP, and GIF image files are allowed"));
    }

    cb(null, true);
};

const resumeUpload = multer({
    storage,
    fileFilter: resumeFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

const imageUpload = multer({
    storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

export const uploads = {
    single: (fieldName: string) => resumeUpload.single(fieldName),
    array: (fieldName: string, maxCount: number) => resumeUpload.array(fieldName, maxCount),
    fields: (fieldsArray: { name: string; maxCount?: number }[]) => resumeUpload.fields(fieldsArray),
};

export const imageUploads = {
    single: (fieldName: string) => imageUpload.single(fieldName),
    array: (fieldName: string, maxCount: number) => imageUpload.array(fieldName, maxCount),
    fields: (fieldsArray: { name: string; maxCount?: number }[]) => imageUpload.fields(fieldsArray),
};

export { uploadDir, resumeUpload, imageUpload };
