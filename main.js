const express = require("express");
const app = express();

const expensesRoutes = require("./api/posts/expenses.route");

app.use(express.json());
app.use("/expenses", expensesRoutes);
app.use(express.static("uploads"));

app.listen(4001, () => {
  console.log("Server running on http://localhost:4001");
});
