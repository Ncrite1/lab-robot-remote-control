# Lab-robot-remote-control (AM-521)

## Описание проекта

Этот проект реализует взаимодействие между серверром и PLC с помощью шлюза между MQTT и PLC AM-521 через Modbus TCP.

Архитектура:

```text
MQTT (Mosquitto)
        ↓
Node-RED
        ↓
Modbus TCP Server
        ↓
PLC AM-521 (Modbus TCP Master)
```

PLC не поддерживает MQTT напрямую, поэтому Node-RED используется как промежуточный сервер:

* получает MQTT сообщения
* преобразует их
* записывает значения в Modbus регистры
* PLC считывает эти регистры

---

# Как работает система

MQTT отправляет:

```text
left
right
home
```

Node-RED преобразует:

```text
left  → 1
right → 2
home  → 3
```

Значение записывается в:

```text
Holding Register 0
```

PLC читает:

```text
Holding Register 0
```

и получает:

```text
1 / 2 / 3
```

---

# Требования

## Linux

Проект тестировался на:

* Ubuntu 22.04
* Debian 12

---

# Установка зависимостей

## 1. Установка Node.js и npm

```bash
sudo apt update
sudo apt install nodejs npm
```

Проверка:

```bash
node -v
npm -v
```

---

## 2. Установка Node-RED

```bash
sudo npm install -g --unsafe-perm node-red
```

Запуск:

```bash
node-red
```

Node-RED будет доступен:

```text
http://localhost:1880
```

---

## 3. Установка Mosquitto MQTT broker

```bash
sudo apt install mosquitto mosquitto-clients
```

Автозапуск:

```bash
sudo systemctl enable mosquitto
sudo systemctl start mosquitto
```

Проверка:

```bash
systemctl status mosquitto
```

---

## 4. Установка Modbus nodes для Node-RED

Перейти в директорию Node-RED:

```bash
cd ~/.node-red
```

Установить:

```bash
npm install node-red-contrib-modbus
```

Перезапустить Node-RED:

```bash
node-red
```

---

# Настройка Node-RED

## Используемые nodes

Проект использует:

* MQTT in
* Function
* Modbus Server
* Modbus Flex Write
* Modbus Read
* Debug

---

# Настройка MQTT IN

## Broker

```text
localhost:1883
```

## Topic

Пример:

```text
plc/control
```

---

# Function: преобразование MQTT значений

```javascript
let map = {
    "left": 1,
    "right": 2,
    "home": 3
};

msg.payload = map[msg.payload] || 0;

return msg;
```

---

# Function: запись в Modbus register

```javascript
msg.payload = {
    value: msg.payload,
    fc: 6,
    unitid: 1,
    address: 0,
    quantity: 1
};

return msg;
```

---

# Настройка Modbus Server

## Host

```text
0.0.0.0
```

## Port

```text
502
```

Если Linux запрещает использование 502:

используйте:

```text
1502
```

## Holding Registers

```text
10
```

---

# Настройка Modbus Flex Write

## Host

```text
127.0.0.1
```

## Port

```text
502
```

или:

```text
1502
```

---

# Проверка через Node-RED

Схема:

```text
Inject
   ↓
Modbus Read
   ↓
Debug
```

## Настройки Modbus Read

### Host

```text
127.0.0.1
```

### Port

```text
502
```

### Function Code

```text
FC3 Read Holding Registers
```

### Address

```text
0
```

### Quantity

```text
1
```

---

# Проверка MQTT

Отправить тестовое сообщение:

```bash
mosquitto_pub -h localhost -t plc/control -m "left"
```

Ожидаемый результат:

```text
Holding Register 0 = 1
```

---

# Настройка PLC AM-521

## PLC должен работать как:

```text
Modbus TCP Master
```

---

# Настройка Slave в InoProShop

## Slave IP

IP Linux сервера.

Пример:

```text
192.168.10.2
```

## Port

```text
502
```

или:

```text
1502
```

## Unit ID

```text
1
```

---

# Настройка Channel

## Access Type

```text
Read Holding Registers
```

## Function Code

```text
03
```

## Address

```text
0
```

## Length

```text
1
```

## Trigger

```text
Cyclic
```

## Cycle Time

```text
100 ms
```

---

# Привязка к PLC переменной

Пример:

```text
MW10
```

Результат:

```text
Holding Register 0 → MW10
```

---

# Проверка сети

## Проверка IP

```bash
ip a
```

## Проверка соединения с PLC

```bash
ping 192.168.10.10
```

---

# Проверка открытого порта Modbus

```bash
sudo ss -tulpn | grep 502
```

---

# Firewall

Если используется UFW:

```bash
sudo ufw allow 502/tcp
```

или:

```bash
sudo ufw allow 1502/tcp
```

---

# Итоговая схема

```text
MQTT (Mosquitto)
        ↓
Node-RED
        ↓
Modbus TCP Server
        ↓
PLC AM-521
```

---

# Пример полного процесса

MQTT:

```text
right
```

Node-RED:

```text
right → 2
```

Modbus:

```text
Holding Register 0 = 2
```

PLC:

```text
MW10 = 2
```

---

## Запуск Node-RED

```bash
node-red
```

## Остановка Node-RED

```bash
CTRL + C
```

## Проверка MQTT

```bash
mosquitto_sub -h localhost -t plc/control
```

## Отправка MQTT

```bash
mosquitto_pub -h localhost -t plc/control -m "home"
```

Node-RED работает как мост между MQTT и PLC.

---

##Пример работы проекта


https://github.com/user-attachments/assets/de8ab48a-00eb-482d-b912-af754412e9b8




