const { Router } = require("express");
const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} = require("./expenses.service");
const {
  validateSecretKey,
  validateCreateFields,
} = require("./expenses.middleware");

const router = Router();

router.get("/", getExpenses);
router.get("/:id", getExpenseById);
router.post("/", validateCreateFields, createExpense);
router.put("/:id", updateExpense);
router.delete("/:id", validateSecretKey, deleteExpense);

module.exports = router;
