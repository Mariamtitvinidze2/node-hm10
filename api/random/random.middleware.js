module.exports = (req, res, next) => {
  const random = Math.random();
  if (random < 0.5) {
    return res.status(403).json({ error: "Blocked by random middleware" });
  }
  next();
};
