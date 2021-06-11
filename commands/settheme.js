const { profile } = require("console");
const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");
const Canvas = require("canvas");

async function settheme(client, message, args) {
    try {
        var theme = "dark";
        if (client.economyManager[message.author.id].theme) theme = client.economyManager[message.author.id].theme;
        if (!args[0]) return message.reply("Please type a theme name: \"light\" or \"dark\"!");
        if (args[0] != "light" && args[0] != "dark") return message.reply("Please type a theme name: \"light\" or \"dark\"!");
        if (args[0] == theme) return message.reply("You have already set the " + args[0] + " theme for your profile!");
        client.economyManager[message.author.id].theme = args[0];
        request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
            type: "update",
            token: process.env.php_server_token,
            id: message.author.id,
            data: JSON.stringify(client.economyManager[message.author.id])
        }}, function(error, response, body) {
            if (!error && response.statusCode == 200 && body.includes("Success")) {
                message.channel.send("Successfully set the " + args[0] + " theme for your profile.");
            }
            else {
                client.economyManager[message.author.id].theme = theme;
                console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
            }
        });
    }
    catch (err) {
        console.error(err);
        return message.reply("An unexpected error occurred.");
    }
}

module.exports.run = async (client, message, args) => {
        if (client.economyManager[message.author.id]) {
            try {
                settheme(client, message, args);
                return;
            }
            catch (err) {
                console.log(err);
                return message.reply("An unexpected error occurred.");
            }
        }
        else {
            request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
                if (!error && response.statusCode == 200 && !body.includes("Error")) {
                    try {
                        client.economyManager = JSON.parse(body);
                        if (client.economyManager[message.author.id] != undefined) {
                            try {
                                settheme(client, message, args);
                                return;
                            }
                            catch (err) {
                                console.log(err);
                                return message.reply("An unexpected error occurred.");
                            }
                        }
                        else {
                            try {
                                client.economyManager[message.author.id] = {
                                    coins: encrypt("500"),
                                    background: "background_default",
                                    theme: "dark",
                                    bio: ""
                                };
                                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                    type: "add",
                                    token: process.env.php_server_token,
                                    id: message.author.id,
                                    data: JSON.stringify(client.economyManager[message.author.id])
                                }}, function(error, response, body) {
                                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                                        try {
                                            settheme(client, message, args);
                                            return;
                                        }
                                        catch (err) {
                                            console.log(err);
                                            return message.reply("An unexpected error occurred.");
                                        }
                                        return;
                                    }
                                    else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                    return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                                });
                            }
                            catch (err) {
                                console.error(err);
                                return message.reply("An unexpected error occurred.");
                            }
                        }
                    }
                    catch (err) {
                        console.error(err);
                        return message.reply("An unexpected error occurred.");
                    }
                }
                else return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
            });
        }
}

module.exports.config = {
    name: "settheme",
    description: "Set the light/dark theme for your profile",
    usage: require("../config.json").prefix + "settheme",
    accessableby: "Members",
    aliases: [],
    category: "👥 User information",
    dmAvailable: true
}