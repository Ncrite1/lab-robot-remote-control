const express = require("express");
const path = require("path");
const app = express();
const Database = require("better-sqlite3");
app.use(express.json()); // для обработки JSON из fetch
app.use(express.urlencoded({ extended: true })); // для форм с enctype application/x-www-form-urlencoded


const db = new Database("database.db");

// Раздаём файлы только из папки public
app.use(express.static(path.join(__dirname, "public")));

// Главная страница — login.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Дополнительно: можно другие страницы
app.get("/main", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "main.html"));
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    try {
        const stmt = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?");
        const user = stmt.get(username, password);

        if (user) {
            res.status(200).json({ success: true, message: "Вход выполнен" });
        } else {
            res.status(401).json({ success: false, message: "Неверный логин или пароль" });
        }
    } catch (err) {
        console.error("Ошибка при проверке логина:", err);
        res.status(500).json({ success: false, message: "Ошибка сервера" });
    }
});


app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
