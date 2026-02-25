/* ==================================================
   ОБЩИЕ ПЕРЕМЕННЫЕ
================================================== */

// Переменная состояния робота
let isRobotOn = false;


/* ==================================================
   БЛОК УПРАВЛЕНИЯ РОБОТОМ (main.html)
================================================== */

const robotStatus = document.getElementById("robotStatus");
const powerOnBtn = document.getElementById("powerOnBtn");
const powerOffBtn = document.getElementById("powerOffBtn");

const programButtons = document.querySelectorAll(".program-btn");
const programOutput = document.getElementById("programOutput");


/* ==================================================
   ОТПРАВКА СОСТОЯНИЯ ПИТАНИЯ НА СЕРВЕР
================================================== */

async function sendPowerState(state) {

    if (state !== "on" && state !== "off") {
        console.error("Недопустимое значение state:", state);
        return;
    }

    try {

        const response = await fetch("http://localhost:3000/power", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ state: state })
        });

        if (!response.ok) {
            throw new Error("Ошибка запроса: " + response.status);
        }

        console.log("Состояние отправлено на сервер:", state);

    } catch (error) {
        console.error("Ошибка отправки состояния питания:", error);
    }
}


/* ---- Управление включением ---- */

if (powerOnBtn && powerOffBtn && robotStatus) {

    powerOnBtn.addEventListener("click", async () => {

        await sendPowerState("on");

        isRobotOn = true;

        robotStatus.textContent = "Включен";
        robotStatus.classList.remove("off");
        robotStatus.classList.add("on");
    });

    powerOffBtn.addEventListener("click", async () => {

        await sendPowerState("off");

        isRobotOn = false;

        robotStatus.textContent = "Выключен";
        robotStatus.classList.remove("on");
        robotStatus.classList.add("off");
    });
}


/* ==================================================
   УПРАВЛЕНИЕ ДВИЖЕНИЕМ РОБОТА
================================================== */

const moveRightBtn = document.getElementById("moveRightBtn");
const moveLeftBtn = document.getElementById("moveLeftBtn");
const moveHomeBtn = document.getElementById("moveHomeBtn");

async function sendMoveCommand(direction) {

    const allowedMoves = ["right", "left", "home"];

    if (!allowedMoves.includes(direction)) {
        console.error("Недопустимое направление движения:", direction);
        return;
    }

    try {

        const response = await fetch("http://localhost:3000/move", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ move: direction })
        });

        const result = await response.text();

        if (!response.ok) {
            throw new Error("Ошибка запроса: " + response.status);
        }

        console.log("Ответ сервера:", result);

    } catch (error) {
        console.error("Ошибка отправки команды движения:", error);
    }
}


/* ---- Обработчики кнопок движения ---- */

if (moveRightBtn) {
    moveRightBtn.addEventListener("click", async () => {
        await sendMoveCommand("right");
    });
}

if (moveLeftBtn) {
    moveLeftBtn.addEventListener("click", async () => {
        await sendMoveCommand("left");
    });
}

if (moveHomeBtn) {
    moveHomeBtn.addEventListener("click", async () => {
        await sendMoveCommand("home");
    });
}


/* ==================================================
   ДЕМОНСТРАЦИОННЫЕ ПРОГРАММЫ (main.html)
================================================== */

if (programButtons.length > 0 && programOutput) {

    programButtons.forEach(button => {
        button.addEventListener("click", () => {

            if (!isRobotOn) {
                programOutput.textContent = "Ошибка: робот выключен";
                return;
            }

            const programName = button.dataset.program;

            programOutput.textContent = `Запущена программа: ${programName}`;
            console.log(`Запуск программы: ${programName}`);
        });
    });
}


/* ==================================================
   АВТОРИЗАЦИЯ (login.html)
================================================== */

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const loginMessage = document.getElementById("loginMessage");

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            loginMessage.textContent = "Ошибка: заполните все поля";
            loginMessage.style.color = "red";
            return;
        }

        const loginData = { username, password };

        try {

            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData)
            });

            if (response.status === 200) {
                console.log("Авторизация успешна");
                window.location.href = "/main";
            } else {
                loginMessage.textContent = "Ошибка авторизации";
                loginMessage.style.color = "red";
                console.warn("Ошибка авторизации. Статус:", response.status);
            }

        } catch (error) {

            console.error("Ошибка соединения:", error);

            loginMessage.textContent = "Ошибка соединения с сервером";
            loginMessage.style.color = "red";
        }

    });
}