const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");
const svgCaptcha = require("svg-captcha");
const {svg2png} = require("svg-png-converter");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

async function daily(client, message, args) {
    if (!client.economyManager[message.author.id].coins) return message.reply("Cannot get the coins information.");
        try {
            if (!client.economyManager[message.author.id].dailyCountdown || client.economyManager[message.author.id].dailyCountdown < (new Date()).getTime()) {
                if (args[0] == "refresh") client.captchas.daily[message.author.id] = undefined;
                if (!client.captchas.daily[message.author.id]) {
                    var captcha = svgCaptcha.create({
                        size: 6,
                        noise: 5,
                        color: true,
                        background: "#404040",
                        width: 200,
                        height: 67
                    });
                    client.captchas.daily[message.author.id] = captcha.text;
                    var data = await svg2png({ 
                        input: captcha.data, 
                        encoding: 'buffer', 
                        format: 'png'
                    });
                    return message.channel.send("Please type the command `daily (captcha code)` to claim the reward:\nUse the `daily refresh` command to generate a new captcha code.", {files: [
                        {attachment: data, name: "captcha.png"}
                    ]});
                }
                else if (!args[0]) return message.reply("Please enter the captcha code!");
                else if (args[0] != client.captchas.daily[message.author.id]) return message.reply("Incorrect captcha code!");
                client.captchas.daily[message.author.id] = undefined;
                var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                var dailyCoins = random(1000, 5000);
                coins += dailyCoins;
                client.economyManager[message.author.id].coins = encrypt(coins.toString());
                client.economyManager[message.author.id].dailyCountdown = (new Date()).getTime() + 86400000;
                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                    type: "update",
                    token: process.env.php_server_token,
                    id: message.author.id,
                    data: JSON.stringify(client.economyManager[message.author.id])
                }}, function(error, response, body) {
                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                        console.log(message.author.tag + " has just been rewarded " + dailyCoins.toString() + " Uyncoins!");
                        message.channel.send("Here is your daily reward: **" + dailyCoins.toString() + " " + client.config.currency + "**!");
                    }
                    else {
                        client.economyManager[message.author.id].dailyCountdown = undefined;
                        coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                        coins -= dailyCoins;
                        client.economyManager[message.author.id].coins = encrypt(coins.toString());
                        console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                        return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                    }
                });
            }
            else {
                var totalSeconds = (client.economyManager[message.author.id].dailyCountdown - (new Date()).getTime()) / 1000;
                var days = parseInt(totalSeconds / 86400);
                var hours = parseInt((totalSeconds - days * 86400) / 3600);
                var minutes = parseInt((totalSeconds - days * 86400 - hours * 3600) / 60);
                var seconds = parseInt(totalSeconds - days * 86400 - hours * 3600 - minutes * 60);
                var timeText = "";
                if (days > 0) timeText += days + "d ";
                if (hours > 0) timeText += hours + "h ";
                if (minutes > 0) timeText += minutes + "m ";
                if (seconds > 0) timeText += seconds + "s ";
                return message.reply("You have to wait **" + timeText + "**to get your next reward!");
            }
        }
        catch (err) {
            console.log(err);
            return message.reply("An unexpected error occurred.");
        }
}

module.exports.run = async (client, message, args) => {
    if (client.economyManager[message.author.id]) {
        daily(client, message, args);
        return;
    }
    else {
        request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
            if (!error && response.statusCode == 200 && !body.includes("Error")) {
                try {
                    client.economyManager = JSON.parse(body);
                    if (client.economyManager[message.author.id] != undefined) {
                        daily(client, message, args);
                        return;
                    }
                    else {
                            client.economyManager[message.author.id] = {
                                coins: encrypt("500")
                            };
                            request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                type: "add",
                                token: process.env.php_server_token,
                                id: message.author.id,
                                data: JSON.stringify(client.economyManager[message.author.id])
                            }}, function(error, response, body) {
                                if (!error && response.statusCode == 200 && body.includes("Success")) {
                                    daily(client, message, args);
                                    return;
                                }
                                else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                            });
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
    name: "daily",
    description: "Receive a daily amount.",
    usage: require("../config.json").prefix + "daily",
    accessableby: "Members",
    aliases: [],
    category: "💰 Economy",
    dmAvailable: true
}