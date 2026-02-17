/* ==================================================
   ОБЩИЕ ПЕРЕМЕННЫЕ
================================================== */

// Переменная состояния робота
let isRobotOn = false;

// Данные мониторинга (пока фиксированные)
let temperature = 25.0;  // температура по умолчанию
let battery = 100;       // заряд по умолчанию


/* ==================================================
   БЛОК УПРАВЛЕНИЯ РОБОТОМ (main.html)
================================================== */

const robotStatus = document.getElementById("robotStatus");
const powerOnBtn = document.getElementById("powerOnBtn");
const powerOffBtn = document.getElementById("powerOffBtn");

const temperatureEl = document.getElementById("temperature");
const batteryEl = document.getElementById("battery");
const systemStatusEl = document.getElementById("systemStatus");

const programButtons = document.querySelectorAll(".program-btn");
const programOutput = document.getElementById("programOutput");


/* ==================================================
   ОТПРАВКА СОСТОЯНИЯ ПИТАНИЯ НА СЕРВЕР
================================================== */

async function sendPowerState(state) {

    // Строгая проверка допустимых значений
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

        await sendPowerState("on"); // отправка POST

        isRobotOn = true;

        robotStatus.textContent = "Включен";
        robotStatus.classList.remove("off");
        robotStatus.classList.add("on");

        if (systemStatusEl) {
            systemStatusEl.textContent = "Система активна";
        }

        updateMonitoring();
    });

    powerOffBtn.addEventListener("click", async () => {

        await sendPowerState("off"); // отправка POST

        isRobotOn = false;

        robotStatus.textContent = "Выключен";
        robotStatus.classList.remove("on");
        robotStatus.classList.add("off");

        if (systemStatusEl) {
            systemStatusEl.textContent = "Система отключена";
        }

        updateMonitoring();
    });
}


/* ==================================================
   МОНИТОРИНГ (main.html)
================================================== */

function updateMonitoring() {

    if (!temperatureEl || !batteryEl) return;

    if (!isRobotOn) {
        temperatureEl.textContent = "--";
        batteryEl.textContent = "--";
        return;
    }

    temperatureEl.textContent = temperature.toFixed(1) + " ";
    batteryEl.textContent = battery + " ";
}

// Авто-обновление каждые 2.5 секунды
setInterval(updateMonitoring, 2500);


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

        // Проверка пустых полей
        if (!username || !password) {
            loginMessage.textContent = "Ошибка: заполните все поля";
            loginMessage.style.color = "red";
            return;
        }

        const loginData = {
            username: username,
            password: password
        };

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
