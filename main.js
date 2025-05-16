const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 4000;
app.use(express.json());

const DATA_PATH = path.join(__dirname, "expenses.json");
const SECRET_KEY = "ubralod12345";
function readExpenses() {
  const data = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(data);
}
function writeExpenses(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}
app.get("/", (req, res) => {
  res.send("Expense API with Pagination, Secret Key & File Storage");
});
app.post("/expenses", (req, res) => {
  const { title, amount } = req.body;

  if (!title || typeof amount !== "number") {
    return res
      .status(400)
      .json({ error: "Title and numeric amount are required" });
  }

  const expenses = readExpenses();
  const newExpense = {
    id: Date.now(),
    title,
    amount,
  };

  expenses.push(newExpense);
  writeExpenses(expenses);
  res.status(201).json(newExpense);
});
app.get("/expenses", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const take = parseInt(req.query.take) || 30;

  const expenses = readExpenses();
  const startIndex = (page - 1) * take;
  const endIndex = page * take;
  const paginated = expenses.slice(startIndex, endIndex);

  res.json({
    page,
    take,
    total: expenses.length,
    data: paginated,
  });
});
app.get("/expenses/:id", (req, res) => {
  const expenses = readExpenses();
  const expense = expenses.find((e) => e.id === parseInt(req.params.id));

  if (!expense) {
    return res.status(404).json({ error: "Expense not found" });
  }

  res.json(expense);
});
app.put("/expenses/:id", (req, res) => {
  const { title, amount } = req.body;
  const expenses = readExpenses();
  const index = expenses.findIndex((e) => e.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: "Expense not found" });
  }

  if (title) expenses[index].title = title;
  if (amount !== undefined) expenses[index].amount = amount;

  writeExpenses(expenses);
  res.json(expenses[index]);
});
app.delete("/expenses/:id", (req, res) => {
  const secret = req.headers.secret;
  if (secret !== SECRET_KEY) {
    return res
      .status(403)
      .json({ error: "Forbidden: Invalid or missing secret key" });
  }

  const expenses = readExpenses();
  const index = expenses.findIndex((e) => e.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: "Expense not found" });
  }

  const deleted = expenses.splice(index, 1)[0];
  writeExpenses(expenses);
  res.json({ message: "Expense deleted", deleted });
});
app.listen(port, () => {
  console.log(` Server running at http://localhost:${port}`);
});
