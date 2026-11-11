import { Router } from "express";
import multer from "multer";
import { supabase } from "../supabase";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileName = `${Date.now()}-${req.file.originalname}`;

    const { error } = await supabase.storage
      .from("products")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const { data } = supabase.storage.from("products").getPublicUrl(fileName);

    res.json({ imageUrl: data.publicUrl });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
