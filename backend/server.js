import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(express.json());


/* ── Auth routes ────────────────────────────────────── */
app.use("/auth", authRoutes);

/* ── Gemini AI setup ───────────────────────────────── */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ gemini-1.5-flash = 1500 req/day FREE  |  gemini-2.5-flash = only 20/day FREE
//const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

/* ── Simple per-IP rate limiter ────────────────────── */
const rateLimitMap = new Map();
function rateLimit(req, res, next) {
  const ip       = req.ip || "unknown";
  const now      = Date.now();
  const windowMs = 60_000;
  const maxReqs  = 15;

  if (!rateLimitMap.has(ip)) rateLimitMap.set(ip, []);
  const timestamps = rateLimitMap.get(ip).filter((t) => now - t < windowMs);
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);

  if (timestamps.length > maxReqs) {
    return res.status(429).json({ error: "Too many requests — please wait a moment! 😊" });
  }
  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, times] of rateLimitMap) {
    const fresh = times.filter((t) => now - t < 60_000);
    if (fresh.length === 0) rateLimitMap.delete(ip);
    else rateLimitMap.set(ip, fresh);
  }
}, 300_000);

app.get("/", (req, res) => {
  res.send("🚀 Backend running. Use /story /quiz /words /translate /math");
});

/* ================================================================
   STORY ENDPOINT
   ================================================================ */

const STORY_FALLBACKS = [
  `Once upon a time, a little girl named Priya found a magic pencil in her garden. Anything she drew came to life! She drew a butterfly and it flew out of the paper. She drew a bowl of her favourite kheer and it appeared on the table. But Priya was a kind child. Instead of drawing things for herself, she drew food for hungry animals and flowers to make her village beautiful. The pencil smiled and granted her one special wish — to always have a happy heart. And so Priya lived joyfully, knowing that kindness is the greatest magic of all.`,
  `Arjun loved going to his grandmother's house in the village every summer. One morning he woke up early and saw a tiny elephant near the pond. The elephant was lost and crying. Arjun gave it some bananas and water. Together they followed the sound of the river and found the elephant's family waiting. The big mama elephant thanked Arjun with a gentle trunk pat. That evening Arjun told his grandmother the whole story. She smiled and said, "A kind heart always finds its way." Arjun never forgot that summer.`,
  `Deep in the jungle lived a young tiger cub named Kanu who was afraid of the dark. Every night he hid under a big leaf and shivered. One day a wise old owl named Moti said, "Kanu, the dark is just the sky resting its eyes." Kanu thought about this. That night he looked up and saw thousands of stars twinkling just for him. He was not afraid anymore. He roared softly at the moon. The moon glowed brighter. From that night on, Kanu became the bravest cub in the jungle and watched over all the sleeping animals.`,
];

let story = "";

app.post("/story", rateLimit, async (req, res) => {
  const { age, topic } = req.body;

  const prompt = `
Write a short story (max 200 words) for a ${age}-year-old Indian child about ${topic}.

Rules:
- Simple English
- No markdown
- No *
- No formatting
`;

  try {
    const result = await model.generateContent(prompt);
    story = result.response.text().replace(/\*/g, "").trim();
    res.json({ story });
  } catch (err) {
    console.error("❌ Story error:", err);
    const fallback = STORY_FALLBACKS[Math.floor(Math.random() * STORY_FALLBACKS.length)];
    res.json({ story: fallback, fallback: true });
  }
});

/* ================================================================
   AVATAR NAME ENDPOINT
   ================================================================ */

app.post("/avatar-name", rateLimit, async (req, res) => {
  const { childName, favoriteAnimal, favoriteColor } = req.body;

  const prompt = `
Create a fun superhero identity for a child named ${childName} whose favorite animal is ${favoriteAnimal} and favorite color is ${favoriteColor}.

Return ONLY valid JSON (no markdown, no backticks):
{
  "heroName": "...",
  "superpower": "...",
  "catchphrase": "..."
}
`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error("❌ Avatar error:", err);
    res.json({
      heroName: `Super ${childName}`,
      superpower: "Infinite curiosity",
      catchphrase: "Learning is my superpower!",
    });
  }
});

/* ================================================================
   QUIZ ENDPOINT
   ================================================================ */

app.post("/quiz", rateLimit, async (req, res) => {
  const { type, age } = req.body;

  let prompt = "";

  if (type === "spelling") {
    prompt = `
Create 5 spelling quiz questions for a ${age}-year-old child.
Each question asks which spelling is correct.
Return STRICT JSON only, no markdown, no extra text:
{"questions":[{"question":"Which spelling is correct?","options":["Applle","Apple","Aple","Apel"],"answer":"Apple"}]}
`;
  } else {
    prompt = `
Create 5 general knowledge questions for a ${age}-year-old child.
Topics may include animals, fruits, colors, planets, school, and India.
Return STRICT JSON only, no markdown, no extra text:
{"questions":[{"question":"What planet do we live on?","options":["Mars","Earth","Venus","Jupiter"],"answer":"Earth"}]}
`;
  }

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error("❌ Quiz error:", err);
    res.json({
      questions: [
        { question: "Which animal is called king of jungle?", options: ["Tiger", "Lion", "Elephant", "Dog"], answer: "Lion" },
        { question: "Which fruit is yellow?", options: ["Apple", "Banana", "Grapes", "Orange"], answer: "Banana" },
        { question: "How many legs does a dog have?", options: ["2", "3", "4", "5"], answer: "4" },
        { question: "Which planet do we live on?", options: ["Mars", "Earth", "Jupiter", "Venus"], answer: "Earth" },
        { question: "What color is the sky?", options: ["Blue", "Green", "Red", "Yellow"], answer: "Blue" },
      ],
    });
  }
});

/* ================================================================
   ROUTINE WORDS ENDPOINT
   ================================================================ */

app.post("/words", rateLimit, async (req, res) => {
  const { age } = req.body;

  const prompt = `
Pretend you are a ${age}-year-old Indian child.
Describe your daily routine from morning to night.
Rules:
- 10 to 12 short sentences
- One activity per line
- Use modern activities (school, homework, cricket, cartoons)
- Use Indian food (idli, dosa, rice, milk)
- Simple English
- NO markdown
- NO *
- NO bullet points
`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/\*/g, "").replace(/•/g, "").trim();
    res.json({ words: text });
  } catch (err) {
    console.error("❌ Words error:", err);
    res.json({
      words: `I wake up early in the morning.
I brush my teeth and drink a glass of milk.
I go to school and learn new things.
In the afternoon I eat rice and curry for lunch.
In the evening I play cricket with my friends.
At night I watch cartoons and eat dinner.
Then I go to sleep happily.`,
    });
  }
});

/* ================================================================
   TRANSLATE ENDPOINT
   ================================================================ */

app.post("/translate", rateLimit, async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length < 2) {
    return res.status(400).json({ error: "No text provided to translate." });
  }

  const prompt = `
Translate the following text into Telugu.
Use simple words suitable for kids.
Return ONLY the Telugu translation, no explanation, no English, no markdown.

${text}
`;

  try {
    const result = await model.generateContent(prompt);
    const translated = result.response.text().replace(/\*/g, "").trim();
    res.json({ translated });
  } catch (err) {
    console.error("❌ Translation error:", err);
    // Return a friendly fallback so the UI doesn't break
    res.json({ translated: text, fallback: true });
  }
});

/* ================================================================
   MATH ENDPOINT
   ================================================================ */

app.post("/math", rateLimit, async (req, res) => {
  const { age, operation, topic } = req.body;
  const selectedTopicKey = operation || "addition";
  const selectedTopic = topic || selectedTopicKey;
  const prompt = `
Create 5 multiple-choice maths questions for a ${age}-year-old child on the topic "${selectedTopic}".

Rules:
- Keep language simple and child-friendly
- Return STRICT JSON only, no markdown, no extra text
- Each question must have 4 options
- Exactly one option must be correct
- Use numbers as strings when helpful

Return this shape exactly:
{"problems":[{"question":"5 + 3 = ?","options":["6","7","8","9"],"answer":"8","hint":"Add 5 and 3"}]}
`;

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const problems = Array.isArray(parsed) ? parsed : parsed.problems;
    res.json({ problems });
  } catch (err) {
    console.error("Math error:", err);

    const fallbackMap = {
      addition: [
        { question: "27 + 15 = ?", options: ["32", "42", "41", "52"], answer: "42", hint: "Add tens and ones carefully." },
        { question: "9 + 8 = ?", options: ["15", "16", "17", "18"], answer: "17", hint: "Think of 9 as 10 - 1." },
        { question: "45 + 20 = ?", options: ["55", "65", "75", "60"], answer: "65", hint: "Add 2 tens to 45." },
        { question: "13 + 19 = ?", options: ["31", "32", "33", "34"], answer: "32", hint: "13 plus 20 is 33, then subtract 1." },
        { question: "60 + 14 = ?", options: ["64", "74", "84", "70"], answer: "74", hint: "Add ones after the tens." },
      ],
      subtraction: [
        { question: "54 - 21 = ?", options: ["23", "33", "43", "34"], answer: "33", hint: "Take away 2 tens and 1 one." },
        { question: "40 - 17 = ?", options: ["23", "24", "22", "21"], answer: "23", hint: "Subtract 10, then 7." },
        { question: "92 - 30 = ?", options: ["52", "62", "72", "82"], answer: "62", hint: "Remove 3 tens." },
        { question: "18 - 9 = ?", options: ["7", "8", "9", "10"], answer: "9", hint: "Half of 18 is 9." },
        { question: "71 - 15 = ?", options: ["56", "66", "46", "55"], answer: "56", hint: "Subtract 10, then 5." },
      ],
      multiplication: [
        { question: "6 � 4 = ?", options: ["20", "24", "26", "28"], answer: "24", hint: "6 groups of 4." },
        { question: "7 � 3 = ?", options: ["18", "20", "21", "24"], answer: "21", hint: "Add 7 three times." },
        { question: "9 � 5 = ?", options: ["40", "45", "50", "35"], answer: "45", hint: "Half of 90." },
        { question: "8 � 2 = ?", options: ["14", "16", "18", "12"], answer: "16", hint: "Double 8." },
        { question: "4 � 11 = ?", options: ["42", "44", "46", "48"], answer: "44", hint: "11 four times." },
      ],
      division: [
        { question: "24 � 6 = ?", options: ["3", "4", "5", "6"], answer: "4", hint: "What times 6 gives 24?" },
        { question: "35 � 5 = ?", options: ["5", "6", "7", "8"], answer: "7", hint: "35 split into 5 equal groups." },
        { question: "42 � 7 = ?", options: ["5", "6", "7", "8"], answer: "6", hint: "Use the 7 times table." },
        { question: "18 � 3 = ?", options: ["5", "6", "7", "8"], answer: "6", hint: "18 into 3 equal parts." },
        { question: "63 � 9 = ?", options: ["6", "7", "8", "9"], answer: "7", hint: "What times 9 is 63?" },
      ],
      lcm_hcf: [
        { question: "What is the LCM of 4 and 6?", options: ["8", "10", "12", "14"], answer: "12", hint: "Find the smallest common multiple." },
        { question: "What is the HCF of 12 and 18?", options: ["3", "6", "9", "12"], answer: "6", hint: "Find the greatest common factor." },
        { question: "The LCM of 3 and 5 is", options: ["8", "10", "15", "20"], answer: "15", hint: "List multiples of both numbers." },
        { question: "The HCF of 8 and 20 is", options: ["2", "4", "6", "8"], answer: "4", hint: "Which biggest number divides both?" },
        { question: "Which pair has HCF 1?", options: ["6 and 8", "9 and 12", "8 and 15", "10 and 20"], answer: "8 and 15", hint: "Co-prime numbers have HCF 1." },
      ],
      number_system: [
        { question: "Which is the smallest whole number?", options: ["0", "1", "-1", "10"], answer: "0", hint: "Whole numbers begin from zero." },
        { question: "Which number is an even number?", options: ["13", "17", "22", "29"], answer: "22", hint: "Even numbers are divisible by 2." },
        { question: "Roman numeral for 10 is", options: ["V", "X", "L", "C"], answer: "X", hint: "Think of the symbol for ten." },
        { question: "Place value of 5 in 4,582 is", options: ["5", "50", "500", "5000"], answer: "500", hint: "Look at the hundreds place." },
        { question: "Which is the greatest number?", options: ["399", "930", "903", "390"], answer: "930", hint: "Compare hundreds, then tens." },
      ],
      approximation: [
        { question: "Round 47 to the nearest 10", options: ["40", "45", "50", "60"], answer: "50", hint: "7 in ones place rounds up." },
        { question: "Estimate 98 + 23", options: ["100", "110", "120", "130"], answer: "120", hint: "Round to nearest tens first." },
        { question: "Round 364 to the nearest 100", options: ["300", "350", "400", "500"], answer: "400", hint: "64 is more than 50." },
        { question: "The nearest ten of 81 is", options: ["70", "80", "90", "100"], answer: "80", hint: "1 in ones place rounds down." },
        { question: "Estimate 51 - 19", options: ["20", "30", "40", "50"], answer: "30", hint: "50 minus 20 is close." },
      ],
      fractions_decimals: [
        { question: "0.5 as a fraction is", options: ["1/5", "1/2", "2/5", "5/10"], answer: "1/2", hint: "Half is 0.5." },
        { question: "3/4 as a decimal is", options: ["0.25", "0.5", "0.75", "1.25"], answer: "0.75", hint: "75 hundredths means 3 fourths." },
        { question: "0.25 as a fraction is", options: ["1/2", "1/3", "1/4", "3/4"], answer: "1/4", hint: "25 out of 100 can be simplified." },
        { question: "1/10 as a decimal is", options: ["0.01", "0.1", "1.0", "10.0"], answer: "0.1", hint: "One part out of ten." },
        { question: "Which decimal equals 2/5?", options: ["0.2", "0.4", "0.5", "0.8"], answer: "0.4", hint: "2 divided by 5." },
      ],
      percentage: [
        { question: "25% of 200 is", options: ["25", "40", "50", "75"], answer: "50", hint: "25% means one fourth." },
        { question: "50% of 80 is", options: ["20", "30", "40", "50"], answer: "40", hint: "50% means half." },
        { question: "10% of 90 is", options: ["9", "10", "18", "19"], answer: "9", hint: "10% means divide by 10." },
        { question: "75% of 40 is", options: ["20", "25", "30", "35"], answer: "30", hint: "75% is three fourths." },
        { question: "100% of 63 is", options: ["6.3", "63", "630", "36"], answer: "63", hint: "100% means the whole amount." },
      ],
      decimals_operations: [
        { question: "2.5 + 1.2 =", options: ["3.7", "3.5", "2.7", "4.7"], answer: "3.7", hint: "Line up decimal points." },
        { question: "5.0 - 2.3 =", options: ["2.7", "3.7", "2.3", "7.3"], answer: "2.7", hint: "Subtract carefully after the decimal." },
        { question: "0.4 + 0.4 =", options: ["0.8", "0.44", "0.6", "1.4"], answer: "0.8", hint: "Four tenths plus four tenths." },
        { question: "3.6 � 2 =", options: ["1.6", "1.8", "2.8", "3.8"], answer: "1.8", hint: "Half of 3.6." },
        { question: "1.5 � 2 =", options: ["2.5", "3.0", "3.5", "1.7"], answer: "3.0", hint: "Double 1.5." },
      ],
      whole_numbers_operations: [
        { question: "145 + 32 =", options: ["167", "177", "187", "197"], answer: "177", hint: "Add ones and tens carefully." },
        { question: "300 - 125 =", options: ["165", "175", "185", "195"], answer: "175", hint: "Subtract 100, then 25." },
        { question: "23 � 4 =", options: ["72", "82", "92", "96"], answer: "92", hint: "20 � 4 and 3 � 4." },
        { question: "84 � 7 =", options: ["11", "12", "13", "14"], answer: "12", hint: "Use multiplication facts." },
        { question: "999 + 1 =", options: ["100", "1000", "1099", "9991"], answer: "1000", hint: "Next number after 999." },
      ],
      fractions_operations: [
        { question: "1/2 + 1/2 =", options: ["1/2", "1", "2", "1/4"], answer: "1", hint: "Two halves make one whole." },
        { question: "3/4 - 1/4 =", options: ["1/2", "2/4", "1/4", "3/4"], answer: "1/2", hint: "Subtract the numerators." },
        { question: "1/3 + 1/3 =", options: ["1/3", "2/3", "3/3", "1/6"], answer: "2/3", hint: "Same denominator, add numerators." },
        { question: "2/5 of 10 =", options: ["2", "4", "5", "8"], answer: "4", hint: "Divide by 5 then multiply by 2." },
        { question: "Which is bigger?", options: ["1/4", "1/3", "Both same", "Cannot say"], answer: "1/3", hint: "Compare equal wholes." },
      ],
      simplification: [
        { question: "2 + 3 � 4 =", options: ["20", "14", "24", "10"], answer: "14", hint: "Multiply before adding." },
        { question: "18 � 3 + 2 =", options: ["6", "8", "10", "12"], answer: "8", hint: "Divide first." },
        { question: "(5 + 3) � 2 =", options: ["11", "13", "16", "18"], answer: "16", hint: "Solve brackets first." },
        { question: "20 - 4 � 2 =", options: ["12", "16", "32", "8"], answer: "12", hint: "Multiply before subtracting." },
        { question: "30 � (3 � 2) =", options: ["5", "6", "10", "15"], answer: "5", hint: "Solve the bracket in the denominator." },
      ],
      distance_time_speed: [
        { question: "Speed =", options: ["distance + time", "distance � time", "time � distance", "distance � time"], answer: "distance � time", hint: "How fast something moves." },
        { question: "If a car travels 60 km in 2 hours, its speed is", options: ["20 km/h", "30 km/h", "40 km/h", "60 km/h"], answer: "30 km/h", hint: "Divide distance by time." },
        { question: "Distance =", options: ["speed � time", "speed � time", "time � speed", "speed + time"], answer: "speed � time", hint: "Use the triangle formula." },
        { question: "Time =", options: ["distance � speed", "distance � speed", "speed � distance", "distance + speed"], answer: "distance � speed", hint: "Rearrange the speed formula." },
        { question: "A child walks 12 km in 3 hours. Speed is", options: ["3 km/h", "4 km/h", "5 km/h", "6 km/h"], answer: "4 km/h", hint: "12 divided by 3." },
      ],
      measures: [
        { question: "1000 g =", options: ["1 kg", "10 kg", "100 kg", "100 mg"], answer: "1 kg", hint: "Grams and kilograms." },
        { question: "100 cm =", options: ["1 m", "10 m", "100 m", "1000 m"], answer: "1 m", hint: "Centimetres make metres." },
        { question: "Rs 5 + Rs 7 =", options: ["Rs 10", "Rs 11", "Rs 12", "Rs 13"], answer: "Rs 12", hint: "Add the amounts." },
        { question: "1000 mL =", options: ["1 L", "10 L", "100 L", "100 mL"], answer: "1 L", hint: "Millilitres make litres." },
        { question: "Half kilogram means", options: ["50 g", "500 g", "5000 g", "250 g"], answer: "500 g", hint: "Half of 1000 g." },
      ],
      factors_multiples: [
        { question: "Which is a factor of 24?", options: ["5", "7", "8", "11"], answer: "8", hint: "24 divided by 8 is exact." },
        { question: "Which is a multiple of 9?", options: ["17", "18", "19", "20"], answer: "18", hint: "9 times 2." },
        { question: "Prime number among these is", options: ["9", "15", "17", "21"], answer: "17", hint: "A prime has only two factors." },
        { question: "Factors of 12 include", options: ["5", "6", "7", "11"], answer: "6", hint: "12 � 6 = 2." },
        { question: "Smallest multiple of any number is the number itself except", options: ["1", "0", "2", "10"], answer: "0", hint: "Zero is a multiple of every number." },
      ],
      profit_loss: [
        { question: "Bought for Rs 50 and sold for Rs 60 means", options: ["Loss of Rs 10", "Profit of Rs 10", "Profit of Rs 5", "No profit no loss"], answer: "Profit of Rs 10", hint: "Selling price is more." },
        { question: "Bought for Rs 80 and sold for Rs 65 means", options: ["Profit of Rs 15", "Loss of Rs 15", "Loss of Rs 10", "No loss"], answer: "Loss of Rs 15", hint: "Cost price is more than selling price." },
        { question: "Profit =", options: ["CP - SP", "SP - CP", "CP + SP", "SP � CP"], answer: "SP - CP", hint: "Selling price minus cost price." },
        { question: "Loss =", options: ["SP - CP", "CP - SP", "CP + SP", "SP � CP"], answer: "CP - SP", hint: "Cost price minus selling price." },
        { question: "If CP = Rs 30 and SP = Rs 30, then", options: ["profit", "loss", "no profit no loss", "cannot say"], answer: "no profit no loss", hint: "The prices are equal." },
      ],
      mensuration: [
        { question: "Perimeter of a square with side 4 cm is", options: ["8 cm", "12 cm", "16 cm", "20 cm"], answer: "16 cm", hint: "Add all 4 sides." },
        { question: "Area of a rectangle =", options: ["length + breadth", "2 � length", "length � breadth", "4 � side"], answer: "length � breadth", hint: "Multiply the two sides." },
        { question: "Volume of a cube with side 3 cm is", options: ["6 cm3", "9 cm3", "18 cm3", "27 cm3"], answer: "27 cm3", hint: "Side � side � side." },
        { question: "Area of a square with side 5 cm is", options: ["10 cm2", "20 cm2", "25 cm2", "30 cm2"], answer: "25 cm2", hint: "Side squared." },
        { question: "Perimeter of a rectangle 6 cm by 2 cm is", options: ["8 cm", "12 cm", "16 cm", "24 cm"], answer: "16 cm", hint: "2 � (length + breadth)." },
      ],
      simple_interest: [
        { question: "Simple interest depends on", options: ["only time", "only amount", "principal, rate and time", "profit and loss"], answer: "principal, rate and time", hint: "Three values are needed." },
        { question: "If SI = Rs 20, Principal = Rs 100, Amount =", options: ["Rs 80", "Rs 100", "Rs 120", "Rs 200"], answer: "Rs 120", hint: "Amount = Principal + SI." },
        { question: "Simple interest formula is", options: ["P � R � T / 100", "P + R + T", "P � T", "R � T"], answer: "P � R � T / 100", hint: "Multiply then divide by 100." },
        { question: "If principal is Rs 200 and SI is Rs 40, amount is", options: ["Rs 220", "Rs 230", "Rs 240", "Rs 250"], answer: "Rs 240", hint: "Add principal and interest." },
        { question: "Rate in simple interest is written in", options: ["rupees", "metres", "percent", "litres"], answer: "percent", hint: "It is per hundred." },
      ],
    };

    res.json({
      problems: fallbackMap[selectedTopicKey] || fallbackMap.addition,
    });
    res.json({
      problems: fallbackMap[selectedTopicKey] || genericFallback,
    });
  }
});

/* ================================================================
   BUDDY MESSAGE ENDPOINT  (context-aware, called on page load)
   ================================================================ */

app.post("/buddy-message", rateLimit, async (req, res) => {
  const { context, heroName, avatar, age, extra } = req.body;

  const contextGuide = {
    story:       "They're about to read a story. Be enthusiastic about imagination.",
    quiz:        "They're about to take a quiz. Be encouraging and hype them up.",
    math:        "They're doing math. Be motivating, math is their superpower.",
    memory:      "They're playing memory match. Challenge them playfully.",
    routine:     "They're exploring their daily routine. Be warm and curious.",
    leaderboard: "They're checking the leaderboard. Encourage them to keep earning points.",
    win:         "They just WON something! Celebrate wildly! Use lots of emojis!",
    fail:        "They struggled with something. Be kind, encouraging, build them back up.",
    dashboard:   "They just opened the home screen. Welcome them warmly.",
    idle:        "They've been inactive. Gently nudge them to explore something fun.",
    welcome:     "Brand new user! Make them feel amazing and excited to start!",
  };

  const prompt = `
You are Buddy, a magical animated guide character for a kids learning app.
You are talking to ${heroName} (age ${age}) who has the avatar: ${avatar}.

Context: ${contextGuide[context] || "Greet and guide the child."}
${extra ? `Extra info: ${extra}` : ""}

Rules:
- Write EXACTLY 1-2 short sentences (max 25 words total)
- Use the child's name (${heroName}) naturally
- Be warm, playful, energetic — like a best friend
- Use 1-2 emojis maximum
- NO markdown, NO asterisks, NO lists
- Speak directly to the child
- Age-appropriate for a ${age}-year-old

Reply with ONLY the message, nothing else.
`;

  try {
    const result  = await model.generateContent(prompt);
    const message = result.response.text().replace(/\*/g, "").replace(/```/g, "").trim();
    res.json({ message });
  } catch (err) {
    console.error("❌ Buddy message error:", err);
    const fallbacks = {
      story:       `Hey ${heroName}! 📖 What amazing story world shall we explore?`,
      quiz:        `Ready to crush this quiz, ${heroName}? 🎲 I believe in you!`,
      math:        `Numbers are your superpower, ${heroName}! 🧮 Let's solve!`,
      memory:      `Train that amazing brain, ${heroName}! 🧠 Flip those cards!`,
      routine:     `Let's hear about your awesome day, ${heroName}! 📅`,
      leaderboard: `You're climbing the ranks, ${heroName}! 🏆`,
      win:         `YES!!! You absolutely crushed it, ${heroName}! 🎉 So proud!`,
      fail:        `Every champion stumbles, ${heroName}! 💪 Try again!`,
      dashboard:   `Welcome back, ${heroName}! ✨ What adventure calls to you?`,
      idle:        `Psst ${heroName}... something exciting is waiting! 👀`,
    };
    res.json({ message: fallbacks[context] || `Hey ${heroName}! Ready for an adventure? 🌟` });
  }
});

/* ================================================================
   BUDDY ASK ENDPOINT  (voice questions from the child)
   ================================================================ */

app.post("/buddy-ask", rateLimit, async (req, res) => {
  const { question, heroName, age } = req.body;

  if (!question || question.trim().length < 2) {
    return res.json({ message: `Ask me anything, ${heroName}! 🌟` });
  }

  const prompt = `
You are Buddy, a friendly educational guide in a children's learning app.
You are talking to ${heroName}, who is ${age} years old.

The child asked: "${question}"

Answer rules:
- Answer the question DIRECTLY and ACCURATELY
- Keep it to 2-3 short sentences (max 45 words total)
- Use simple words a ${age}-year-old will understand
- Be warm and enthusiastic — like a knowledgeable best friend
- Use 1-2 fun emojis
- If it's a maths question, show the calculation clearly
- If it's about animals/science/geography — give a real fact
- NO markdown, NO asterisks, NO bullet points

Reply with ONLY your answer, nothing else.
`;

  try {
    const result  = await model.generateContent(prompt);
    const message = result.response.text().replace(/\*/g, "").replace(/```/g, "").trim();
    res.json({ message });
  } catch (err) {
    console.error("❌ Buddy ask error:", err.status || err.message);
    const q = question.toLowerCase();
    let fallback;
    if (/\d+\s*[+\-*\/x]\s*\d+/.test(q)) {
      try {
        const expr = q.match(/\d+\s*[+\-*\/]\s*\d+/)?.[0];
        if (expr) {
          const val = Function(`"use strict"; return (${expr})`)();
          fallback = `${expr} = ${val}! 🔢 Great maths question, ${heroName}!`;
        }
      } catch {}
    }
    if (!fallback) {
      fallback = `That's a brilliant question, ${heroName}! 🌟 Ask a teacher or parent — they'll know the answer!`;
    }
    res.json({ message: fallback });
  }
});

/* ================================================================
   STORY QUIZ ENDPOINT  (comprehension quiz from the generated story)
   ================================================================ */

app.post("/story-quiz", rateLimit, async (req, res) => {
  const { story, age } = req.body;

  if (!story || story.trim().length < 20) {
    return res.status(400).json({ error: "No story provided" });
  }

  const prompt = `
Based on this story for a ${age || 7}-year-old child, create 4 multiple-choice comprehension questions.

STORY:
${story}

Rules:
- Questions must be ONLY about events, characters, or facts IN the story above
- Do NOT ask general knowledge questions
- Each question must have 4 options
- One correct answer

Return STRICT JSON only, no markdown, no extra text:
{"questions":[{"question":"...","options":["A","B","C","D"],"answer":"A"}]}
`;

  try {
    const result = await model.generateContent(prompt);
    let text     = result.response.text().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error("❌ Story quiz error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================================================================
   MEMORY GAME ENDPOINT
   ================================================================ */

const MEMORY_FALLBACKS = {
  animals: [
    { emoji: "🐶", word: "Dog" },       { emoji: "🐱", word: "Cat" },
    { emoji: "🐘", word: "Elephant" },  { emoji: "🦁", word: "Lion" },
    { emoji: "🐸", word: "Frog" },      { emoji: "🦋", word: "Butterfly" },
    { emoji: "🐢", word: "Turtle" },    { emoji: "🦒", word: "Giraffe" },
    { emoji: "🐧", word: "Penguin" },   { emoji: "🦊", word: "Fox" },
    { emoji: "🐼", word: "Panda" },     { emoji: "🦜", word: "Parrot" },
  ],
  food: [
    { emoji: "🍕", word: "Pizza" },     { emoji: "🍎", word: "Apple" },
    { emoji: "🍌", word: "Banana" },    { emoji: "🍓", word: "Strawberry" },
    { emoji: "🥕", word: "Carrot" },    { emoji: "🍦", word: "Ice Cream" },
    { emoji: "🍩", word: "Donut" },     { emoji: "🥑", word: "Avocado" },
    { emoji: "🍇", word: "Grapes" },    { emoji: "🌽", word: "Corn" },
    { emoji: "🥐", word: "Croissant" }, { emoji: "🧁", word: "Cupcake" },
  ],
  flowers: [
    { emoji: "🌸", word: "Cherry Blossom" }, { emoji: "🌺", word: "Hibiscus" },
    { emoji: "🌻", word: "Sunflower" },      { emoji: "🌹", word: "Rose" },
    { emoji: "🌷", word: "Tulip" },          { emoji: "💐", word: "Bouquet" },
    { emoji: "🌼", word: "Daisy" },          { emoji: "🪷", word: "Lotus" },
    { emoji: "🌿", word: "Fern" },           { emoji: "🍀", word: "Clover" },
    { emoji: "🌱", word: "Seedling" },       { emoji: "🌾", word: "Wheat" },
  ],
  transport: [
    { emoji: "🚗", word: "Car" },       { emoji: "✈️", word: "Airplane" },
    { emoji: "🚂", word: "Train" },     { emoji: "🚢", word: "Ship" },
    { emoji: "🚁", word: "Helicopter" },{ emoji: "🛵", word: "Scooter" },
    { emoji: "🚌", word: "Bus" },       { emoji: "🚲", word: "Bicycle" },
    { emoji: "🛸", word: "UFO" },       { emoji: "🚀", word: "Rocket" },
    { emoji: "⛵", word: "Sailboat" },  { emoji: "🏍️", word: "Motorbike" },
  ],
  sports: [
    { emoji: "⚽", word: "Football" },      { emoji: "🏀", word: "Basketball" },
    { emoji: "🎾", word: "Tennis" },        { emoji: "🏏", word: "Cricket" },
    { emoji: "🏊", word: "Swimming" },      { emoji: "🎯", word: "Archery" },
    { emoji: "🏐", word: "Volleyball" },    { emoji: "🥊", word: "Boxing" },
    { emoji: "⛳", word: "Golf" },          { emoji: "🏋️", word: "Weightlifting" },
    { emoji: "🤸", word: "Gymnastics" },    { emoji: "🎿", word: "Skiing" },
  ],
  music: [
    { emoji: "🎵", word: "Music Note" }, { emoji: "🎸", word: "Guitar" },
    { emoji: "🥁", word: "Drums" },      { emoji: "🎹", word: "Piano" },
    { emoji: "🎺", word: "Trumpet" },    { emoji: "🎻", word: "Violin" },
    { emoji: "🎷", word: "Saxophone" },  { emoji: "🪘", word: "Bongo" },
    { emoji: "🎤", word: "Microphone" }, { emoji: "🪗", word: "Accordion" },
    { emoji: "🔔", word: "Bell" },       { emoji: "🎶", word: "Notes" },
  ],
};

app.post("/memory-game", async (req, res) => {
  const { theme, count } = req.body;
  const pairCount = Math.min(Math.max(Number(count) || 8, 4), 12);
  const safeTheme = theme || "animals";
  const pool      = MEMORY_FALLBACKS[safeTheme] || MEMORY_FALLBACKS.animals;
  const shuffled  = [...pool].sort(() => Math.random() - 0.5).slice(0, pairCount);
  shuffled.forEach((p, i) => (p.id = i));
  res.json({ pairs: shuffled });
});

/* ================================================================
   START SERVER
   ================================================================ */

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});



