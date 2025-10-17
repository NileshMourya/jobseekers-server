import { Router } from "express";
import { protect } from "../util/middleware.js";
import { handlePdfUpload, upload } from "../Auth/uploads.js";

const route = Router();

route.post("/resume-upload", upload.single("resume"), protect, handlePdfUpload);

export default route;
