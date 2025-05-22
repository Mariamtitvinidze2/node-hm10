const express = require("express");
const fs = require("fs/promises");

const app = express();
app.use(express.json());

app.get("/expenses", async (req, res) => {
  const rawData = await fs.readFile("expenses.json", "utf-8");
  const expenses = JSON.parse(rawData);

  const page = Number(req.query.page) || 1;
  const take = Number(req.query.take) || 30;

  const startIndex = (page - 1) * take;
  const paginatedExpenses = expenses.slice(startIndex, startIndex + take);

  res.status(200).json({
    total: expenses.length,
    page,
    take,
    data: paginatedExpenses,
  });
});

app.get("/expenses/:id", async (req, res) => {
  const rawData = await fs.readFile("expenses.json", "utf-8");
  const expenses = JSON.parse(rawData);

  const expense = expenses.find((el) => el.id === Number(req.params.id));
  if (!expense) {
    return res.status(404).json({ message: "expenses not found" });
  }

  res.status(201).json(expense);
});

app.post("/expenses", async (req, res) => {
  const { name, amount } = req.body;

  if (!name || !amount) {
    return res.status(404).json({ error: "name and amount are required " });
  }

  const rawData = await fs.readFile("expenses.json", "utf-8");
  const expenses = JSON.parse(rawData);

  const lastId = expenses[expenses.length - 1]?.id || 0;
  const newExpense = {
    id: lastId + 1,
    name,
    amount,
    createdAt: new Date().toISOString(),
  };

  expenses.push(newExpense);
  await fs.writeFile("expenses.json", JSON.stringify(expenses));
  res.status(201).json({ message: "expenses created", data: newExpense });
});

app.put("/expenses/:id", async (req, res) => {
  const rawData = await fs.readFile("expenses.json", "utf-8");
  const expenses = JSON.parse(rawData);

  const index = expenses.findIndex((el) => el.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: "expenses not found " });
  }
  const updateExpenses = {
    ...expenses[index],
    ...req.body,
  };
  expenses[index] = updateExpenses;

  await fs.writeFile("expenses.json", JSON.stringify(expenses));

  res.status(200).json({ message: "Expense updated", data: updateExpenses });
});

app.delete("/expenses/:id", async (req, res) => {
  try {
    const secret = req.headers.secret;
    if (!secret) {
      return res.status(401).json({ error: "Secret key is required" });
    }
    if (secret !== "random123") {
      return res.status(401).json({ error: "Invalid secret key" });
    }
    const rawData = await fs.readFile("expenses.json", "utf-8");
    let expenses = JSON.parse(rawData);
    const index = expenses.findIndex((el) => el.id === Number(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: "Expense not found" });
    }
    const deleted = expenses.splice(index, 1);
    await fs.writeFile("expenses.json", JSON.stringify(expenses, null, 2));

    res.status(200).json({ message: "Expense deleted", data: deleted[0] });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(4000, () => {
  console.log("server running on http://localhost:4000");
});
