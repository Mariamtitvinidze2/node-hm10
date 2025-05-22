const express = require("express");
const app = express();

const expensesRoutes = require("./api/posts/expenses.route");

app.use(express.json());
app.use("/expenses", expensesRoutes);

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
