import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { INITIAL_PRODUCTS, DEFAULT_SETTINGS } from "./src/utils/constants";
import { Product } from "./src/types/product";
import { Sale } from "./src/types/sale";
import { Offer } from "./src/types/offer";
import { Settings } from "./src/types/settings";

const app = express();
//const PORT = 3000;
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Persistent simulated Google Sheets / JSON Database file path
const DB_PATH = path.join(process.cwd(), "data_sheets.json");

interface DatabaseSchema {
  products: Product[];
  sales: Sale[];
  offers: Offer[];
  settings: Settings;
}

// Ensure database exists with initial values
function readDB(): DatabaseSchema {
  if (!fs.existsSync(DB_PATH)) {
    const initialDB: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      sales: [],
      offers: [
        {
          id: "o1",
          productId: "p23",
          productName: "Cerveza Pilsen Callao 630ml (Botella)",
          discountPrice: 5.80,
          description: "¡Promoción de fin de semana! Pilsen heladita a solo S/. 5.80 (Precio regular: S/. 6.50).",
          active: true
        },
        {
          id: "o2",
          productId: "p6",
          productName: "Leche Gloria Azul Lata 400g",
          discountPrice: 3.90,
          description: "Llévate 3 latas de Leche Gloria Azul por S/. 11.50.",
          active: true
        }
      ],
      settings: DEFAULT_SETTINGS,
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2), "utf8");
    return initialDB;
  }
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading simulated database, resetting:", err);
    const initialDB: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      sales: [],
      offers: [],
      settings: DEFAULT_SETTINGS,
    };
    return initialDB;
  }
}

function writeDB(db: DatabaseSchema) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

function getNextProductId(existingProducts: Product[]): string {
  const numericIds = existingProducts
    .map(p => {
      const match = p.id.match(/^p(\d+)$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((n): n is number => n !== null);
    
  const maxNum = numericIds.length > 0 ? Math.max(...numericIds) : 0;
  const nextNum = maxNum + 1;
  return `p${nextNum.toString().padStart(2, "0")}`;
}

// REST API Endpoints

// Products Endpoints
app.get("/api/products", (req, res) => {
  const db = readDB();
  res.json(db.products);
});

app.post("/api/products", (req, res) => {
  const db = readDB();
  const nextId = getNextProductId(db.products);
  const newProduct: Product = {
    ...req.body,
    id: req.body.id || nextId,
    price: Number(req.body.price),
    costPrice: req.body.costPrice ? Number(req.body.costPrice) : undefined,
    stock: Number(req.body.stock),
    minStock: Number(req.body.minStock),
  };
  db.products.push(newProduct);
  writeDB(db);
  res.status(201).json(newProduct);
});

app.put("/api/products/:id", (req, res) => {
  const db = readDB();
  const index = db.products.findIndex((p) => p.id === req.params.id);
  if (index !== -1) {
    db.products[index] = {
      ...db.products[index],
      ...req.body,
      price: Number(req.body.price),
      costPrice: req.body.costPrice !== undefined ? Number(req.body.costPrice) : db.products[index].costPrice,
      stock: Number(req.body.stock),
      minStock: Number(req.body.minStock),
    };
    writeDB(db);
    res.json(db.products[index]);
  } else {
    res.status(404).json({ error: "Producto no encontrado" });
  }
});

app.delete("/api/products/:id", (req, res) => {
  const db = readDB();
  db.products = db.products.filter((p) => p.id !== req.params.id);
  db.offers = db.offers.filter((o) => o.productId !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// Sales Endpoints (Registers sales and decrements stock in real-time)
app.get("/api/sales", (req, res) => {
  const db = readDB();
  res.json(db.sales);
});

app.post("/api/sales", (req, res) => {
  const db = readDB();
  const sale: Sale = {
    ...req.body,
    id: `v_${Date.now()}`,
    date: new Date().toISOString(),
    status: req.body.status || "completado"
  };

  // Decrement stock for completed sales
  if (sale.status === "completado") {
    sale.items.forEach((item) => {
      const product = db.products.find((p) => p.id === item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
      }
    });
  }

  db.sales.push(sale);
  writeDB(db);
  res.status(201).json(sale);
});

// Complete a pending (WhatsApp) sale
app.post("/api/sales/:id/complete", (req, res) => {
  const db = readDB();
  const saleIndex = db.sales.findIndex((s) => s.id === req.params.id);
  if (saleIndex !== -1) {
    const sale = db.sales[saleIndex];
    if (sale.status === "pendiente") {
      sale.status = "completado";
      // Decrement stock
      sale.items.forEach((item) => {
        const product = db.products.find((p) => p.id === item.productId);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
        }
      });
      writeDB(db);
      res.json(sale);
    } else {
      res.status(400).json({ error: "La venta ya está completada" });
    }
  } else {
    res.status(404).json({ error: "Venta no encontrada" });
  }
});

// Cancel a pending sale
app.delete("/api/sales/:id", (req, res) => {
  const db = readDB();
  const initialCount = db.sales.length;
  db.sales = db.sales.filter((s) => s.id !== req.params.id);
  if (db.sales.length < initialCount) {
    writeDB(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Venta no encontrada" });
  }
});

// Offers Endpoints
app.get("/api/offers", (req, res) => {
  const db = readDB();
  res.json(db.offers);
});

app.post("/api/offers", (req, res) => {
  const db = readDB();
  const newOffer: Offer = {
    ...req.body,
    id: `o_${Date.now()}`,
    discountPrice: Number(req.body.discountPrice),
    active: req.body.active !== undefined ? req.body.active : true,
  };
  db.offers.push(newOffer);
  writeDB(db);
  res.status(201).json(newOffer);
});

app.put("/api/offers/:id", (req, res) => {
  const db = readDB();
  const index = db.offers.findIndex((o) => o.id === req.params.id);
  if (index !== -1) {
    db.offers[index] = {
      ...db.offers[index],
      ...req.body,
      discountPrice: Number(req.body.discountPrice),
    };
    writeDB(db);
    res.json(db.offers[index]);
  } else {
    res.status(404).json({ error: "Oferta no encontrada" });
  }
});

app.delete("/api/offers/:id", (req, res) => {
  const db = readDB();
  db.offers = db.offers.filter((o) => o.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// Settings Endpoints
app.get("/api/settings", (req, res) => {
  const db = readDB();
  res.json(db.settings);
});

app.post("/api/settings", (req, res) => {
  const db = readDB();
  db.settings = {
    ...db.settings,
    ...req.body
  };
  writeDB(db);
  res.json(db.settings);
});

// Simulated Google Sheets Import/Export endpoints
app.get("/api/sheets/export", (req, res) => {
  const db = readDB();
  // We format products as a clean CSV string representing a Google Sheet
  let csv = "ID,Nombre,Categoria,Precio de Venta (S/.),Precio de Costo (S/.),Stock Actual,Stock Minimo,Unidad de Medida\n";
  db.products.forEach((p) => {
    csv += `"${p.id}","${p.name}","${p.category}",${p.price},${p.costPrice || 0},${p.stock},${p.minStock},"${p.unit}"\n`;
  });
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=inventario_bodega.csv");
  res.send(csv);
});

app.post("/api/sheets/import", (req, res) => {
  try {
    const { csvContent } = req.body;
    if (!csvContent || typeof csvContent !== "string") {
      return res.status(400).json({ error: "El contenido CSV es requerido y debe ser texto" });
    }

    const lines = csvContent.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length < 1) {
      return res.status(400).json({ error: "El formato CSV no es válido o está vacío" });
    }

    const db = readDB();
    const importedProducts: Product[] = [];

    const cleanVal = (val: string) => val.replace(/^"|"$/g, "").trim();

    // Determine if the first line is a header row
    let startIndex = 0;
    const firstLine = lines[0];
    const firstLineMatches = firstLine.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || firstLine.split(",");
    
    if (firstLineMatches.length > 0) {
      const col0 = cleanVal(firstLineMatches[0]).toLowerCase();
      const col1 = cleanVal(firstLineMatches[1] || "").toLowerCase();
      const col2 = cleanVal(firstLineMatches[2] || "").toLowerCase();
      const col3 = cleanVal(firstLineMatches[3] || "").toLowerCase();
      
      const isHeader = 
        col0 === "id" || 
        col1 === "nombre" || 
        col1 === "name" || 
        col2.includes("categor") || 
        col3.includes("precio") || 
        col3.includes("price") ||
        (firstLineMatches.length >= 4 && isNaN(parseFloat(col3)));

      if (isHeader) {
        startIndex = 1;
      }
    }

    // Simple CSV parser
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      // Regex to parse comma-separated values respecting quotes
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(",");
      if (matches.length < 5) continue;

      const parsedId = cleanVal(matches[0]);
      const id = parsedId || getNextProductId([...db.products, ...importedProducts]);
      const name = cleanVal(matches[1]);
      const category = cleanVal(matches[2]) || "Abarrotes";
      const price = parseFloat(cleanVal(matches[3])) || 0;
      const costPrice = parseFloat(cleanVal(matches[4])) || undefined;
      const stock = parseInt(cleanVal(matches[5])) || 0;
      const minStock = parseInt(cleanVal(matches[6])) || 0;
      const unit = matches[7] ? cleanVal(matches[7]) : "unidad";

      if (name) {
        importedProducts.push({
          id,
          name,
          category,
          price,
          costPrice,
          stock,
          minStock,
          unit
        });
      }
    }

    if (importedProducts.length > 0) {
      db.products = importedProducts;
      writeDB(db);
      return res.json({ success: true, count: importedProducts.length, products: importedProducts });
    } else {
      return res.status(400).json({ error: "No se pudieron extraer productos válidos del CSV" });
    }
  } catch (error: any) {
    return res.status(500).json({ error: "Error procesando el CSV: " + error.message });
  }
});

// Gemini Chat Endpoint
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;

  try {
    const db = readDB();

    // Lazy initialization of Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // If the API key is not configured, we simulate a helpful chatbot using local catalog search
      // which is perfect for offline/local-only or initial review!
      const reply = simulateLocalResponse(message, db.products, db.offers, db.settings);
      return res.json({ text: reply });
    }

    let openAIKey = process.env.OPENAI_API_KEY;
    let aiProvider: "openai" | "gemini" = openAIKey ? "openai" : "gemini";

    let resultText: string;

    // Create system instructions including the current real-time inventory and offers
    const catalogContext = db.products.map(p => 
      `- ${p.name} (${p.category}): S/. ${p.price.toFixed(2)} por ${p.unit}. Stock disponible: ${p.stock}`
    ).join("\n");

    const offersContext = db.offers.filter(o => o.active).map(o =>
      `- Oferta en ${o.productName}: S/. ${o.discountPrice.toFixed(2)}. Detalle: ${o.description}`
    ).join("\n");

    const systemInstruction = `
Eres el Asistente Inteligente de la "${db.settings.bodegaName}" (propietarios: ${db.settings.ownerName}) ubicada en Chorrillos, Lima, Perú.
Tu objetivo principal es ayudar a los clientes a encontrar productos, recomendar compras útiles y mejorar su experiencia de compra.
Siempre atiendes con amabilidad, rapidez, cariño y lenguaje sencillo.

--------------------------------------------------
INFORMACIÓN DE LA TIENDA EN TIEMPO REAL:
BODEGA: ${db.settings.bodegaName}
DUEÑOS: ${db.settings.ownerName}
YAPE: ${db.settings.phoneYape}
PLIN: ${db.settings.phonePlin}
WHATSAPP DE PEDIDOS: ${db.settings.whatsappNumber}

CATÁLOGO DE PRODUCTOS DISPONIBLES (No inventes otros productos, precios, ni stock que no estén aquí):
${catalogContext}

PROMOCIONES Y OFERTAS VIGENTES:
${offersContext}
--------------------------------------------------

REGLAS DE COMPORTAMIENTO:
1. Siempre responde en español peruano de barrio (amable, cercano, usando términos como "casero", "casera", "vecino", "vecina", "hola, ¿cómo estás?", etc.).
2. Sé breve y conciso para que se lea fácilmente desde un celular.
3. No inventes información. Si no encuentras un producto en el catálogo o no hay stock, dilo con amabilidad ("Uy caserito, por ahora no tengo eso, pero te puedo ofrecer...")
4. Si un producto solicitado tiene stock 0, indícalo amablemente ("Casero, te cuento que se nos acabó ese producto por hoy, pero llegará pronto").
5. Realiza venta cruzada natural y sugerente según estas reglas:
   - Si piden Pan -> sugiere mantequilla, queso o jamón.
   - Si piden Leche -> sugiere cereal, avena o pan.
   - Si piden Cerveza -> sugiere hielo, maní o papitas.
   - Si piden Arroz -> sugiere aceite o fideos.
   - Si el cliente te pide preparar un plato (ej: un Arroz con Pollo, Tallarines, Lomo Saltado), dale una receta brevísima, identifica los ingredientes que tienes en el catálogo y recomiéndale comprarlos.
6. Invita a pagar con Yape o Plin indicando los números.
7. Despídete siempre agradeciendo la visita e invitando a regresar.
8. Mantente en el rol. Si te preguntan cosas que no son de la bodega (ej. código de software, política, física cuántica), responde con humor que eres el Asistente de la ${db.settings.bodegaName} (propietarios: ${db.settings.ownerName}) y que solo sabes de abarrotes, y redirecciona la atención al catálogo.
`;

    const openAI = openAIKey ? new OpenAI({ apiKey: openAIKey }) : undefined;

    let prompt = message;
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
    if (history && history.length > 0) {
      history.forEach((h: any) => {
        if (h.role === "user" || h.role === "assistant") {
          messages.push({
            role: h.role,
            content: h.text,
          });
        }
      });
    }

    const systemMessage = {
      role: "system" as const,
      content: systemInstruction,
    };

    if (aiProvider === "openai" && openAI) {
      const chatMessages = [...messages];
      if (!chatMessages.some((m) => m.role === "system")) {
        chatMessages.unshift(systemMessage);
      }
      chatMessages.push({ role: "user", content: prompt });

      const response = await openAI.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: chatMessages as any,
        temperature: 0.7,
      });

      resultText = response.choices?.[0]?.message?.content ?? "";
    } else {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      const formattedHistory = messages.length > 0
        ? messages.map((m) => `${m.role === "user" ? "Cliente" : "Asistente"}: ${m.content}`).join("\n")
        : "";
      const promptText = formattedHistory ? `${formattedHistory}\nCliente: ${prompt}` : prompt;

      const result = await chat.sendMessage({ message: promptText });
      resultText = result.text;
    }

    res.json({ text: resultText });

  } catch (error: any) {
    console.error("Gemini API Error:", error);

    // Fallback local response cuando Gemini no está disponible o da errores temporales.
    const db = readDB();
    const fallbackText = simulateLocalResponse(message, db.products, db.offers, db.settings);
    res.json({
      text: fallbackText,
      warning: "Gemini no está disponible temporalmente. Respuesta local generada para mantener la demo funcionando."
    });
  }
});

// A fallback simulator for offline development / missing API key
function simulateLocalResponse(message: string, products: Product[], offers: Offer[], settings: Settings): string {
  const query = message.toLowerCase();
  
  // Check if they want to pay
  if (query.includes("pagar") || query.includes("yape") || query.includes("plin") || query.includes("precio") || query.includes("comprar")) {
    const activeOffers = offers.filter(o => o.active);
    let response = `¡Hola casero! Claro que sí, puedes pagar con Yape al ${settings.phoneYape} o Plin al ${settings.phonePlin}.\n\n`;
    if (activeOffers.length > 0) {
      response += `¡Ah! Y no te olvides de nuestras ofertas de hoy:\n${activeOffers.map(o => `- ${o.productName} a solo S/. ${o.discountPrice.toFixed(2)}`).join("\n")}\n\n`;
    }
    response += "¿Qué más te gustaría llevar hoy? ¡Gracias por tu visita!";
    return response;
  }

  // Check recipes
  if (query.includes("receta") || query.includes("cocinar") || query.includes("almorzar") || query.includes("arroz con pollo") || query.includes("lomo saltado")) {
    return `¡Hola vecino! Qué rico que vayas a cocinar. Si vas a preparar un Arroz con Pollo o un Lomo Saltado, aquí en la bodega tenemos de todo:\n- Pollo Entero Limpio (S/. 10.50/kg)\n- Arroz Extra Costeño (S/. 4.80/kg)\n- Cebolla Roja (S/. 3.20/kg)\n- Aceite Primor (S/. 9.50/L)\n\n¿Te los voy agregando al carrito de compras para que solo pases a recogerlos? ¡Cuéntame!`;
  }

  // Search products
  const matchedProducts = products.filter(p => 
    p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
  );

  if (matchedProducts.length > 0) {
    let response = `¡Hola caserito! Sí, tenemos lo que buscas:\n`;
    matchedProducts.slice(0, 4).forEach(p => {
      response += `- *${p.name}*: S/. ${p.price.toFixed(2)} por ${p.unit}. (Stock: ${p.stock > 0 ? `${p.stock} disp.` : "Agotado"})\n`;
    });
    
    // Cross selling simulation
    if (query.includes("pan")) {
      response += `\n💡 *Sugerencia*: Casero, el pancito sale riquísimo con un poco de Queso Fresco o Mantequilla Gloria. ¿Te agrego alguno?`;
    } else if (query.includes("leche")) {
      response += `\n💡 *Sugerencia*: Vecino, ¿llevas leche? No te olvides de la avena o cereal para el desayuno de los chicos.`;
    } else if (query.includes("cerveza") || query.includes("pilsen")) {
      response += `\n💡 *Sugerencia*: ¡Para refrescarse! No te olvides de llevar hielo, maní o unas papitas de snack.`;
    } else if (query.includes("arroz")) {
      response += `\n💡 *Sugerencia*: Casera, ¿tienes aceite en casa? El arroz Costeño queda granadito con Aceite Primor.`;
    } else {
      response += "\n¿Te gustaría que te lo agregue al carrito de compras?";
    }
    return response;
  }

  // General fallback
  return `¡Hola, caserito! Bienvenido a la ${settings.bodegaName} de ${settings.ownerName}. ¿En qué te puedo ayudar hoy? Te ofrezco abarrotes frescos, pollo, carnes, ricas verduras y licores heladitos. ¡Dime qué necesitas y te lo busco al toque!`;
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
