// routes.js
const express = require("express");
const router = express.Router();
const { loginUser } = require("./services/authService");
const { createClient } = require("@supabase/supabase-js");
const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");

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
      if (err?.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Refresh token expired" });
      } else if (err?.name === "JsonWebTokenError") {
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

//Refresh token route
router.post("/refresh-token", (req, res) => {
  console.log("generating new token");
  const refreshToken = req.cookies.refreshToken; // Refresh token from HTTPOnly cookie
  if (!refreshToken) {
    return (
      res.clearCookie("accessToken"),
      res.clearCookie("refreshToken"),
      res.status(403).json({ message: "No refresh token found" })
    );
  }

  // Verify the refresh token
  jwt.verify(refreshToken, SECRET_KEY, async (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Refresh token expired" });
      } else {
        return res.status(403).json({ message: "Invalid refresh token" });
      }
    }

    const userId = decoded.userId;

    // Fetch user data from database using the userId from the decoded token
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(`*, departments(id, name)`)
      .eq("user_id", userId)
      .single(); // Example: Replace with actual DB query

    // Generate a new accessToken
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      SECRET_KEY,
      { expiresIn: "3s" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      expires: dayjs().add(15, "minute").toDate(),
    });

    // Send the new accessToken and user data to the frontend
    res.json({
      accessToken: newAccessToken,
      userData: {
        id: userData.user_id,
        email: userData.email,
        full_name: `${userData.first_name} ${userData.last_name}`,
        department: userData.departments.name,
        department_id: userData.departments.id,
        role: userData.role,
        privileges: userData.privileges,
      },
    });
  });
});

//Login route
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError) {
    res.status(401).json({
      error: authError.message,
      ok: false,
    });
  }

  if (authData) {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(`*, departments(id, name)`)
      .eq("user_id", authData.user.id)
      .single();

    if (userError) {
      res.status(401).json({
        ok: false,
      });
    }

    const tokenPayload = {
      userId: authData.user.id,
      email: authData.user.email,
    };
    const accessToken = jwt.sign(tokenPayload, SECRET_KEY, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(tokenPayload, SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      expires: dayjs().add(7, "day").toDate(),
      sameSite: "None", // Use 'None' when your front-end and back-end are on different domains
      domain: "https://mdnevaluacionexpress.com", // Set this to your production domain
      path: "/", // This is optional, depends on your use case
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      expires: dayjs().add(15, "minute").toDate(),
      sameSite: "None", // Use 'None' when your front-end and back-end are on different domains
      domain: "https://mdnevaluacionexpress.com", // Set this to your production domain
      path: "/", // This is optional, depends on your use case
    });

    res.status(200).json({
      accessToken,
      userData: {
        id: userData.user_id,
        email: userData.email,
        full_name: `${userData.first_name} ${userData.last_name}`,
        department: userData.departments.name,
        department_id: userData.departments.id,
        role: userData.role,
        privileges: userData.privileges,
      },
    });
  }
  // const resp = await loginUser(email, password);
  // if (resp.ok) {
  //   res
  //     .status(200)
  //     .json({ ok: true, token: resp.token, userData: resp.userData });
  // } else {
  //   res.status(401).json({
  //     ok: false,

  //     message: "Login failed",
  //   });
  // }
});

router.post("/auth/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out" });
});

//Check user privileges route
router.get("/api/privileges", authenticateJWT, async (req, res) => {
  //decode the authorization token
  const { userId } = req.user;
  //Fetch user privileges from database
  const { data, error } = await supabase
    .from("users")
    .select("privileges")
    .eq("user_id", userId)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // res.json(data.privileges);
  //Return just a 200 status
  res.status(200).json({ privilege: data.privileges });
});

module.exports = router;
