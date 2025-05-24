const fs = require("fs/promises");
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Multer storage destination reached");
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const fileName = Date.now() + path.extname(file.originalname);
    console.log("Saving file:", fileName);
    cb(null, fileName);
  },
});

const upload = multer({ storage });

const readExpenses = async () => {
  const data = await fs.readFile("expenses.json", "utf-8");
  return JSON.parse(data);
};

const writeExpenses = async (expenses) => {
  await fs.writeFile("expenses.json", JSON.stringify(expenses, null, 2));
};

exports.getExpenses = async (req, res) => {
  const expenses = await readExpenses();
  const page = Number(req.query.page) || 1;
  const take = Number(req.query.take) || 30;
  const start = (page - 1) * take;
  const paginated = expenses.slice(start, start + take);
  res.status(200).json({ total: expenses.length, page, take, data: paginated });
};

exports.getExpenseById = async (req, res) => {
  const expenses = await readExpenses();
  const expense = expenses.find((el) => el.id === Number(req.params.id));
  if (!expense) return res.status(404).json({ message: "Expense not found" });
  res.status(200).json(expense);
};

exports.createExpense = async (req, res) => {
  const { name, amount } = req.body;
  const image = req.file?.path;

  if (!name || !amount) {
    return res.status(400).json({ error: "name and amount are required" });
  }

  const expenses = await readExpenses();
  const lastId = expenses[expenses.length - 1]?.id || 0;

  const newExpense = {
    id: lastId + 1,
    name,
    amount,
    image,
    createdAt: new Date().toISOString(),
  };

  expenses.push(newExpense);
  await writeExpenses(expenses);

  res.status(201).json({ message: "Expense created", data: newExpense });
};

exports.updateExpense = async (req, res) => {
  const expenses = await readExpenses();
  const index = expenses.findIndex((el) => el.id === Number(req.params.id));
  if (index === -1)
    return res.status(404).json({ message: "Expense not found" });
  expenses[index] = { ...expenses[index], ...req.body };
  await writeExpenses(expenses);
  res.status(200).json({ message: "Expense updated", data: expenses[index] });
};

exports.deleteExpense = async (req, res) => {
  const expenses = await readExpenses();
  const index = expenses.findIndex((el) => el.id === Number(req.params.id));
  if (index === -1)
    return res.status(404).json({ message: "Expense not found" });
  const deleted = expenses.splice(index, 1);
  await writeExpenses(expenses);
  res.status(200).json({ message: "Expense deleted", data: deleted[0] });
};

exports.upload = upload;
