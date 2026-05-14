import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";

const app = express();
const PORT = 3000;

// Middleware for parsing JSON with a larger limit for images
app.use(express.json({ limit: '10mb' }));

// AI Diagnosis API Handler (Using OpenRouter + Qwen VL Max)
app.post("/api/plant/diagnose", async (req, res) => {
  try {
    const { image, apiKey } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const openRouterKey = apiKey || process.env.OPENROUTER_API_KEY;

    if (!openRouterKey) {
       return res.status(400).json({ error: "API key is missing. Please check your configuration." });
    }

    const prompt = `
أنت خبير علم النبات وعالم زراعي متخصص. قم بتحليل هذه الصورة بدقة متناهية:
1. تحقق أولاً وتأكد تماماً: هل هذه الصورة تحتوي على نبات حقيقي؟ 
2. إذا كانت الصورة لشيء آخر، يجب أن تضع قيمة الحقل "isPlant" إلى false.
3. إذا كانت الصورة لنبات، قم بالتعرف على نوعه وفحص حالته.

أريد الرد حصراً بتنسيق JSON وبالمواصفات التالية:
{
  "isPlant": boolean,
  "plantName": "اسم النبات (علمي وشائع)",
  "isHealthy": boolean, 
  "diagnosis": "التشخيص باللغة العربية",
  "generalMedicine": "العلاج المقترح",
  "localAlternative": "وصفة طبيعية",
  "careTips": ["نصائح رعاية"]
}
لا تذكر أي نص خارج ملف JSON.
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "qwen/qwen-2-vl-72b-instruct",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: image
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" }
      },
      {
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          "HTTP-Referer": "https://ais-dev-svw5ykbmqk4up2f4hyeix3-740760212521.europe-west2.run.app", // Use your app URL
          "X-Title": "Zone Agribusiness App",
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data.choices[0].message.content;
    
    try {
      // Clean potential markdown or extra text from AI response
      let cleanedJson = result;
      if (result.includes('```')) {
        const match = result.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) cleanedJson = match[1];
      }
      cleanedJson = cleanedJson.trim();
      
      const diagnosisJson = JSON.parse(cleanedJson);
      res.json(diagnosisJson);
    } catch (e) {
      console.error("JSON Parse Error:", result);
      res.status(500).json({ error: "فشل في معالجة إجابة الذكاء الاصطناعي. يرجى المحاولة مرة أخرى." });
    }
  } catch (error: any) {
    console.error("OpenRouter Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error?.message || "Failed to diagnose plant" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
