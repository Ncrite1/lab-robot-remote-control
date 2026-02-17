const mqtt = require("mqtt");

const client = mqtt.connect("mqtt://localhost:1883");

client.on("connect", () => {
    console.log("✅ MQTT connected");
    client.subscribe("robot/status");
});

client.on("message", (topic, message) => {
    console.log("MQTT:", topic, message.toString());
});

module.exports = client;
