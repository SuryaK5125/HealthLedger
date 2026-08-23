const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "7d";

// Shapes a user document for the client. The password hash must never leave the server.
function toSafeUser(user) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
  };
}

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

// Request shape is guaranteed by the validation middleware on the route.
exports.signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ email, password: hash, name });

    return res.status(201).json({
      token: signToken(user),
      user: toSafeUser(user),
    });
  } catch (err) {
    // Guards the race where two concurrent signups pass the findOne check;
    // the unique index on email is the real enforcement.
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Identical response for "no such user" and "wrong password" so the endpoint
    // cannot be used to discover which emails have accounts.
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({
      token: signToken(user),
      user: toSafeUser(user),
    });
  } catch (err) {
    return next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ user: toSafeUser(user) });
  } catch (err) {
    return next(err);
  }
};
