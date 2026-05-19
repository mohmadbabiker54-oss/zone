import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import cors from "cors";
import multer from "multer";

const app = express();
const PORT = 3000;

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 15 * 1024 * 1024, // 15MB limit for files
    fieldSize: 15 * 1024 * 1024 // 15MB limit for text fields (Base64 strings)
  }
});

// Enable CORS for mobile apps
app.use(cors());

// Middleware for parsing JSON with a larger limit for images
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Request Logger for debugging mobile issues
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API REQUEST] ${req.method} ${req.path} - UA: ${req.headers['user-agent']}`);
  }
  next();
});

// AI Diagnosis API Handler (Handing both JSON and Multipart)
app.post("/api/plant/diagnose", (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).json({ error: `خطأ في تحميل الصورة: ${err.message}` });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(500).json({ error: `حدث خطأ غير متوقع: ${err.message}` });
    }
    // Everything went fine.
    next();
  });
}, async (req, res) => {
  try {
    let image = req.body.image;
    const apiKey = req.body.apiKey;

    // If file was uploaded via FormData
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype || 'image/jpeg';
      image = `data:${mimeType};base64,${base64}`;
    }

    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const openRouterKey = apiKey || process.env.OPENROUTER_API_KEY;

    if (!openRouterKey) {
       return res.status(400).json({ error: "API key is missing. Please check your configuration." });
    }

    const prompt = `
أنت خبير زراعي عالمي ومستشار مختص في تشخيص أمراض النباتات. 
مهمتك هي تحليل الصورة المرفقة وتقديم تقرير مفصل جداً بأسلوب "بشري" ودود ومهني، وكأنك تتحدث مباشرة مع المزارع لتنصحه.

التعليمات الهامة جداً لضمان الجودة:
1. الشخصية والأسلوب: تحدث كبشر، استخدم عبارات تشجيعية متنوعة. لا تكرر نفس الجمل الافتتاحية في كل تشخيص. إذا كان النبات سليماً، عبر عن سعادتك بأساليب مختلفة ومبتكرة في كل مرة.
2. الطول والتفصيل: يجب أن يكون حقل "diagnosis" وحقل "careTips" مفصلين وشاملين جداً. يجب ألا يقل النص الخاص بالتشخيص أو النصائح الإرشادية عن 5 أسطر كاملة من المعلومات المفيدة والدقيقة والوصف المستفيض في كل تقرير لتغطية الحالة الصحية بدقة عالية.
3. المرونة التامة: إذا كانت الصورة تحتوي على أي جزء من نبات (حتى لو كانت الجودة ضعيفة أو الصورة بعيدة أو مشوشة أو الخلفية مزدحمة)، فيجب أن تعتبره نباتاً وتجتهد في التشخيص. لا ترفض الصورة إلا إذا كانت خالية تماماً من أي مظهر نباتي.
4. اللغة: يجب أن يكون الرد باللغة العربية الفصحى البسيطة والودودة. يمنع منعاً باتاً استخدام أي لغات أخرى (مثل الصينية أو الإنجليزية) داخل الحقول النصية.
5. الري: لا تحدد عدداً ثابتاً للأيام، بل اربط الري دائماً بحس جفاف التربة (مثلاً: "تلمس التربة بإصبعك، إذا وجدت أول 2-3 سم جافة، فهذا هو الوقت المثالي للري").

يجب أن يكون الرد حصراً بتنسيق JSON كما يلي:
{
  "isPlant": boolean,
  "plantName": "اسم النبات الشائع والعلمي باللغة العربية",
  "isHealthy": boolean,
  "diagnosis": "تقرير مفصل وشامل جداً (لا يقل بأي حال من الأحوال عن 5 أسطر طويلة ومستفيضة ومفصلة برسم الأفكار بدقة) يصف الحالة الصحية بأسلوب بشري مستفيض وغير مكرر",
  "generalMedicine": "اسم العلاج الكيماوي أو المبيد المقترح أو وسيلة الوقاية بدقة",
  "localAlternative": "علاج طبيعي أو وصفة بلدية (مثل الرماد أو الصابون أو الثوم)",
  "careTips": ["نصيحة لرعاية النبات تفصيلية للغاية 1 (مفصلة جداً)", "نصيحة لرعاية النبات تفصيلية للغاية 2 (مفصلة جداً)", "نصيحة لرعاية النبات تفصيلية للغاية 3 (مفصلة جداً)"]
}
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "qwen/qwen-2.5-vl-72b-instruct", 
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
        temperature: 0.1,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          "HTTP-Referer": "https://ais-dev-svw5ykbmqk4up2f4hyeix3-740760212521.europe-west2.run.app",
          "X-Title": "Zone Agribusiness App",
          "Content-Type": "application/json",
        },
        timeout: 60000 // 60 seconds timeout for downstream API call to avoid gateway timeout
      }
    );

    if (!response.data || !response.data.choices || response.data.choices.length === 0) {
      console.error("OpenRouter Empty Response:", response.data);
      throw new Error("لم يتم استلام رد من خادم الذكاء الاصطناعي.");
    }

    const result = response.data.choices[0].message.content;
    
    try {
      const diagnosisJson = JSON.parse(result);
      res.json(diagnosisJson);
    } catch (e) {
      console.error("JSON Parse Error. Result was:", result);
      res.status(500).json({ error: "فشل في معالجة إجابة الذكاء الاصطناعي. يرجى المحاولة مرة أخرى." });
    }
  } catch (error: any) {
    const errorData = error.response?.data;
    console.error("OpenRouter Error Details:", JSON.stringify(errorData || error.message));
    
    let errorMessage = "فشل في تشخيص النبات. يرجى المحاولة لاحقاً.";
    if (errorData?.error?.message) {
      errorMessage = `خطأ من الخادم: ${errorData.error.message}`;
    } else if (error.message) {
      errorMessage = `خطأ في الاتصال: ${error.message}`;
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

// Final Error Handler to catch any unexpected errors and return JSON
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[GLOBAL ERROR]', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: err.message || "حدث خطأ غير متوقع في الخادم"
  });
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

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Set response, keep-alive, and header request timeouts to 120 seconds (120000ms) to prevent early socket closure
  server.timeout = 120000;
  server.keepAliveTimeout = 120000;
  server.headersTimeout = 125000;
}

startServer();
