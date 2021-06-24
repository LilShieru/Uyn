const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function sell(client, message, args) {
    if (client.trades[message.author.id]) return message.reply("You are currently in a trade, please end or complete it first!");
    if (client.divorce[message.author.id]) return message.reply("You are currently in a divorce, please end or complete it first!");
    if (!client.economyManager[message.author.id].waifus) client.economyManager[message.author.id].waifus = [];
    try {
        if (!client.sell[message.author.id]) {
            if (!args[0]) return message.reply("Please type a waifu ID!");
            if (isNaN(args[0])) return message.reply("The waifu ID must be a number!");
            if (client.economyManager[message.author.id].team && client.economyManager[message.author.id].team.members.length) {
                for (var i = 0; i < client.economyManager[message.author.id].team.members.length; i++) {
                    if (client.economyManager[message.author.id].team.members[i] == args[0]) return message.reply("This waifu is currently in your team! Please remove his/her from your team first!");
                }
            }
            var waifu;
            for (var i = 0; i < client.economyManager[message.author.id].waifus.length; i++) {
                if (client.economyManager[message.author.id].waifus[i].id == args[0]) {
                    waifu = client.economyManager[message.author.id].waifus[i];
                    break;
                }
            }
            if (!waifu) return message.reply("Invalid waifu ID!");
            client.sell[message.author.id] = args[0];
            message.reply("You are going to sell your **" + waifu.name + "**.\n\nNotice that this action is **IRREVERSIBLE**!\nUse the `sell <coins>` command again to confirm selling with <coins> as your waifu's price in " + client.config.currency + " or use the `sell cancel` command to cancel selling.");
        }
        else {
            switch (args[0]) {
                case "cancel": {
                    client.sell[message.author.id] = undefined;
                    message.reply("Successfully cancelled the current selling.");
                    break;
                }
                default: {
                    var waifu;
                    if (!args[0]) return message.reply("Please type your price in " + client.config.currency + "!");
                    if (isNaN(args[0])) return message.reply("The price must be a number!");
                    for (var i = 0; i < client.economyManager[message.author.id].waifus.length; i++) {
                        if (client.economyManager[message.author.id].waifus[i].id == client.sell[message.author.id]) {
                            waifu = client.economyManager[message.author.id].waifus[i];
                            break;
                        }
                    }
                    if (!waifu) return message.reply("Cannot find the waifu with this ID! What have you done before?");
                    if (!client.economyManager["6746"].waifus) client.economyManager["6746"].waifus = [];
                    var length = client.economyManager["6746"].waifus.length;
                    client.economyManager["6746"].waifus.push({
                        id: (client.economyManager["6746"].waifus[length - 1] && client.economyManager["6746"].waifus[length - 1].id) ? client.economyManager["6746"].waifus[length - 1].id + 1 : 1,
                        name: waifu.name,
                        anime: waifu.anime,
                        image_url: waifu.image_url,
                        level: waifu.level,
                        base_exp: waifu.base_exp,
                        base_atk: waifu.base_atk,
                        base_def: waifu.base_def,
                        base_hp: waifu.base_hp,
                        rarity: waifu.rarity,
                        exp: waifu.exp,
                        max_exp: waifu.max_exp,
                        price: parseInt(args[0]),
                        seller: message.author.id
                    });
                    for (var i = 0; i < client.economyManager[message.author.id].waifus.length; i++) {
                        if (client.economyManager[message.author.id].waifus[i].id == client.sell[message.author.id]) {
                            client.economyManager[message.author.id].waifus.splice(i, 1);
                            break;
                        }
                    }
                    client.sell[message.author.id] = undefined;
                    request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                        type: "update",
                        token: process.env.php_server_token,
                        id: message.author.id,
                        data: JSON.stringify(client.economyManager[message.author.id])
                    }}, function(error, response, body) {
                        client.countdown[message.author.id] = (new Date()).getTime() + 15000;
                        if (!error && response.statusCode == 200 && body.includes("Success")) {
                            request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                type: "update",
                                token: process.env.php_server_token,
                                id: "6746",
                                data: JSON.stringify(client.economyManager["6746"])
                            }}, function(error, response, body) {
                                client.countdown[message.author.id] = (new Date()).getTime() + 15000;
                                if (!error && response.statusCode == 200 && body.includes("Success")) {
                                    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                                    let result = "";
                                    for (let i = 0; i < 32; i++) {
                                        result += characters.charAt(Math.floor(Math.random() * characters.length));
                                    }
                                    if (client.channels.cache.get(client.config.logChannel)) client.channels.cache.get(client.config.logChannel).send("**Transaction ID:** " + result, new Discord.MessageEmbed()
                                        .setColor(Math.floor(Math.random() * 16777215))
                                        .setAuthor(message.author.username + " has just sold a waifu in the BOT's public shop.", message.author.avatarURL({size: 128}))
                                        .setTimestamp()
                                    );
                                    message.channel.send(new Discord.MessageEmbed()
                                    .setAuthor(message.author.tag, message.author.avatarURL({size: 128, dynamic: true}))
                                    .setDescription("Successfully sold **" + waifu.name + "** in the BOT's public shop.")
                                    .setTimestamp());
                                }
                                else {
                                    console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                    return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                                }
                            });
                        }
                        else {
                            console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                            return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                        }
                    });
                }
            }
        }
    }
    catch (err) {
        console.error(err);
        return message.reply("An unexpected error occurred.");
    }
}

module.exports.run = async (client, message, args) => {
    request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
        if (!error && response.statusCode == 200 && !body.includes("Error")) {
            client.economyManager = JSON.parse(body);
            if (client.economyManager[message.author.id]) {
                if (client.economyManager["6746"]) {
                    sell(client, message, args);
                    return;
                }
                else {
                    client.economyManager["6746"] = {
                        waifus: []
                    };
                    request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                        type: "add",
                        token: process.env.php_server_token,
                        id: "6746",
                        data: JSON.stringify(client.economyManager["6746"])
                    }}, function(error, response, body) {
                        if (!error && response.statusCode == 200 && body.includes("Success")) {
                            sell(client, message, args);
                            return;
                        }
                        else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                        return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                    });
                }
            }
            else {
                client.economyManager[message.author.id] = {
                    coins: encrypt("500"),
                    waifus: [],
                };
                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                    type: "add",
                    token: process.env.php_server_token,
                    id: message.author.id,
                    data: JSON.stringify(client.economyManager[message.author.id])
                }}, function(error, response, body) {
                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                        if (client.economyManager["6746"]) {
                            sell(client, message, args);
                            return;
                        }
                        else {
                            client.economyManager["6746"] = {
                                waifus: []
                            };
                            request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                type: "add",
                                token: process.env.php_server_token,
                                id: "6746",
                                data: JSON.stringify(client.economyManager["6746"])
                            }}, function(error, response, body) {
                                if (!error && response.statusCode == 200 && body.includes("Success")) {
                                    sell(client, message, args);
                                    return;
                                }
                                else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                            });
                        }
                    }
                    else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                    return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                });
            }
        }
        else return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
    });
}

module.exports.config = {
    name: "sell",
    description: "Delete a waifu and get a compensation amount",
    usage: require("../config.json").prefix + "sell <waifu ID>",
    accessableby: "Members",
    aliases: [],
    category: "👧 Waifu/Husbando Collection",
    dmAvailable: true
}