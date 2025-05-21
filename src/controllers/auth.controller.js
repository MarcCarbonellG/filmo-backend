import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  findUserByUsername,
} from "../services/user.service.js";

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email and password are required" });
    }

    if (await findUserByEmail(email)) {
      return res.status(400).json({
        message: "The email provided is already associated with an account",
      });
    }

    if (await findUserByUsername(username)) {
      return res.status(400).json({ message: "Username not available" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(username, email, hashedPassword);

    res
      .status(201)
      .json({ message: "User successfully registered", data: user });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const user = await findUserByUsername(username);
    if (!user || !(await bcrypt.compare(password, user?.password))) {
      return res
        .status(401)
        .json({ message: "Nombre o contraseña incorrectos" });
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Session successfully started", token, user });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { loginUser, registerUser };
