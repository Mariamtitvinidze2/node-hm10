const fs = require("fs/promises");

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
  const expenses = await readExpenses();
  const lastId = expenses[expenses.length - 1]?.id || 0;
  const newExpense = {
    id: lastId + 1,
    name,
    amount,
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
