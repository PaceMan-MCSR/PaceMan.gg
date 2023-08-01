import { isValidAuth } from "@/public/functions/backendAuth";
import { banUser } from "@/public/functions/bannedUsers";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(!isValidAuth(req, res)) return;

  const { uuid, reason } = req.body
  if (!reason || !uuid)
    return res.send(400);

  await banUser(uuid, reason);
  
  res.send(200);
}