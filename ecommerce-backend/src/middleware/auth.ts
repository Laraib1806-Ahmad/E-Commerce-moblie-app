import { NextFunction, Request, Response } from "express";
import { supabase } from "../supabase";

export interface AuthedRequest extends Request {
  user?: { id: string; email: string; role: "admin" | "user" };
}


export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    res.status(401).json({ message: "Missing token" });
    return;
  }
  

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }

  (req as AuthedRequest).user = {
    id: data.user.id,
    email: data.user.email ?? "",
    role: data.user.app_metadata?.role === "admin" ? "admin" : "user",
  };
  next();
}