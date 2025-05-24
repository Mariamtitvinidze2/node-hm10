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
const { upload } = require("../../confing/cloudinary.config");

const router = Router();

router.get("/", getExpenses);
router.get("/:id", getExpenseById);
router.post("/", upload.single("image"), validateCreateFields, createExpense);

router.put("/:id", upload.single("image"), updateExpense);

router.delete("/:id", validateSecretKey, deleteExpense);

module.exports = router;
