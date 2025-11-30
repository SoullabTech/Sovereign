// src/services/voiceService.ts

import axios from "axios";
import fs from "fs";
import path from "path";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const BASE_URL = "https://api.elevenlabs.io/v1";

export async function synthesizeVoice({
  text,
  voiceId,
  outputPath,
}: {
  text: string;
  voiceId: string;
  outputPath: string;
}): Promise<string> {
  const url = `${BASE_URL}/text-to-speech/${voiceId}`;
  const response = await axios.post(
    url,
    { text },
    {
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      responseType: "stream",
    },
  );

  const fullPath = path.resolve(outputPath);
  const writer = fs.createWriteStream(fullPath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(fullPath));
    writer.on("error", reject);
  });
}
