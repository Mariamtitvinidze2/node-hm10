exports.validateSecretKey = (req, res, next) => {
  const secret = req.headers.secret;
  if (!secret) return res.status(401).json({ error: "Secret key required" });
  if (secret !== "random123")
    return res.status(403).json({ error: "Invalid secret key" });
  next();
};

exports.validateCreateFields = (req, res, next) => {
  const { name, amount } = req.body;
  if (!name || !amount)
    return res.status(400).json({ error: "name and amount are required" });
  next();
};
