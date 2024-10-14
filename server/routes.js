// routes.js
const express = require("express");
const router = express.Router();
const { loginUser } = require("./services/authService");
const { createClient } = require("@supabase/supabase-js");
const jwt = require("jsonwebtoken");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const SECRET_KEY = process.env.SECRET_KEY;

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Example route
router.get("/api/data", (req, res) => {
  res.json({ message: "Data from the API" });
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const resp = await loginUser(email, password);
  if (resp.ok) {
    res.json({ ...resp });
  } else {
    res.json({
      ok: false,
      status: 401,

      message: "Login failed",
    });
  }
});

router.get("/api/privileges", authenticateJWT, async (req, res) => {
  console.log(req.query);
  const uuid = req.query.uuid;
  //Fetch user privileges from database
  const { data, error } = await supabase
    .from("users")
    .select("privileges")
    .eq("user_id", uuid)
    .single();

  if (error) {
    return res.status(200).json({ error: error.message });
  }

  res.json({ privileges: data.privileges });
});

module.exports = router;
