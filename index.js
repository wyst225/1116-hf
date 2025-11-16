import express from "express";
import { db } from "./db.js";

const app = express();
const PORT = 3000;

// Middleware a JSON kérés testek feldolgozásához
app.use(express.json());

// Middleware a kérések naplózásához
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// GET /fruits – az összes gyümölcs lekérése
app.get('/fruits', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM fruits");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Oops... Something went wrong :)" });
  }
});

// GET /fruits/:id – egy gyümölcs lekérése ID alapján
app.get('/fruits/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const [rows] = await db.query("SELECT * FROM fruits WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Fruit not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Oops... Something went wrong :)" });
  }
});

// POST /fruits – új gyümölcs hozzáadása
app.post('/fruits', async (req, res) => {
  const { name, color, price } = req.body;

  if (!name || !color || price == null || price < 0) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO fruits (name, color, price) VALUES (?, ?, ?)",
      [name, color, price]
    );

    res.status(201).json({ id: result.insertId, name, color, price });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Oops... Something went wrong :)" });
  }
});

// PUT /fruits/:id – gyümölcs adatainak frissítése
app.put('/fruits/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { name, color, price } = req.body;

  if (!name || !color || price == null || price < 0) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const [rows] = await db.query("SELECT * FROM fruits WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Fruit not found" });
    }

    await db.query(
      "UPDATE fruits SET name = ?, color = ?, price = ? WHERE id = ?",
      [name, color, price, id]
    );

    res.json({ id, name, color, price });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Oops... Something went wrong :)" });
  }
});

// DELETE /fruits/:id – gyümölcs törlése
app.delete('/fruits/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const [rows] = await db.query("SELECT * FROM fruits WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Fruit not found" });
    }

    await db.query("DELETE FROM fruits WHERE id = ?", [id]);

    res.json({ message: `Fruit with id ${id} has been deleted.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Oops... Something went wrong :)" });
  }
});

// szerver indítása
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});