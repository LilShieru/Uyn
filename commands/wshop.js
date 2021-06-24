const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function waifu(client, message, args) {
    if (!client.economyManager["6746"].waifus) client.economyManager["6746"].waifus = [];
    if (!args[0] || !isNaN(args[0])) {
        if (client.economyManager["6746"].waifus.length == 0) return message.reply("There aren't any waifus/husbandos in the BOT's public shop!");
        try {
            var n = 0;
            if (args[0]) n = parseInt(args[0]) - 1;
            var descText = "`-----------------------------------------------------------\n| ID     | Waifu/husbando name           | Price          |\n-----------------------------------------------------------";
            if (n * 10 > client.economyManager["6746"].waifus.length - 1) return message.reply("There aren't have any more waifus/husbandos in the shop!");
            for (var i = n * 10; i < n * 10 + 10; i++) {
                if (client.economyManager["6746"].waifus[i]) {
                    var waifu = client.economyManager["6746"].waifus[i];
                    var name = "[Lv." + waifu.level + "] [" + waifu.rarity.replace("Super Super Rare", "Specially Super Rare") + "] " + waifu.name + " (" + waifu.anime + ")";
                    descText += "\n| " + waifu.id.toString();
                    for (var k = 0; k < 6 - waifu.id.toString().length; k++) descText += " ";
                    if (name.length <= 29) {
                        descText += " | " + name;
                        for (var k = 0; k < 29 - name.length; k++) descText += " ";
                    }
                    else descText += " | " + name.substr(0, 26) + "...";
                    var price = waifu.price + " " + client.config.currency;
                    if (price.length <= 14) {
                        descText += " | " + price;
                        for (var k = 0; k < 14 - price.length; k++) descText += " ";
                    }
                    else descText += " | " + price.substr(0, 11) + "...";
                    descText += " |\n|       ";
                    var seller = "Seller: " + (client.users.cache.get(waifu.seller) ? client.users.cache.get(waifu.seller).tag : "Unknown");
                    if (seller.length <= 29) {
                        descText += " | " + seller;
                        for (var k = 0; k < 29 - seller.length; k++) descText += " ";
                    }
                    else descText += " | " + seller.substr(0, 26) + "...";
                    descText += " |                |\n-----------------------------------------------------------";
                } else break;
            }
            descText += "`\n\nUse the `wbuy <id>` command to buy a waifu/husbando.\nUse the `wshop <name>` command to search for waifus/husbando that have a specific name.";
            if ((n + 1) * 10 <= client.economyManager["6746"].waifus.length - 1) descText += "\nUse the `wshop " + (n + 2) + "` command to get to the next page.";
            const embed = {
                color: Math.floor(Math.random() * 16777214) + 1,
                author: {
                    name: client.user.username + " BOT's public shop",
                    icon_url: client.user.avatarURL({
                        size: 128
                    })
                },
                description: descText,
                timestamp: new Date()
            };
            message.channel.send({
                embed: embed
            });
        }
        catch (err) {
            console.error(err);
            return message.reply("An unexpected error occurred.");
        }
    }
    else {
        try {
            var length = 0, descText = "`-----------------------------------------------------------\n| ID     | Waifu/husbando name           | Price          |\n-----------------------------------------------------------";
            for (var i = 0; i < client.economyManager["6746"].waifus.length; i++) {
                if (client.economyManager["6746"].waifus[i].name.toLowerCase().includes(args.join(" ").toLowerCase()) && length < 10) {
                    length++;
                    var waifu = client.economyManager["6746"].waifus[i];
                    var name = "[Lv." + waifu.level + "] [" + waifu.rarity.replace("Super Super Rare", "Specially Super Rare") + "] " + waifu.name + " (" + waifu.anime + ")";
                    descText += "\n| " + waifu.id.toString();
                    for (var k = 0; k < 6 - waifu.id.toString().length; k++) descText += " ";
                    if (name.length <= 29) {
                        descText += " | " + name;
                        for (var k = 0; k < 29 - name.length; k++) descText += " ";
                    }
                    else descText += " | " + name.substr(0, 26) + "...";
                    var price = waifu.price + " " + client.config.currency;
                    if (price.length <= 14) {
                        descText += " | " + price;
                        for (var k = 0; k < 14 - price.length; k++) descText += " ";
                    }
                    else descText += " | " + price.substr(0, 11) + "...";
                    descText += " |\n|       ";
                    var seller = "Seller: " + (client.users.cache.get(waifu.seller) ? client.users.cache.get(waifu.seller).tag : "Unknown");
                    if (seller.length <= 29) {
                        descText += " | " + seller;
                        for (var k = 0; k < 29 - seller.length; k++) descText += " ";
                    }
                    else descText += " | " + seller.substr(0, 26) + "...";
                    descText += " |                |\n-----------------------------------------------------------";
                }
            }
            descText += "`\n\nThis message only shows 10 first results. To reduce the search results please search using the full name.\nUse the `wbuy <id>` command to buy a waifu/husbando.";
            const embed = {
                color: Math.floor(Math.random() * 16777214) + 1,
                author: {
                    name: message.author.username + "'s waifus/husbandos that contain the " + args.join(" ") + " name",
                    icon_url: message.author.avatarURL({
                        size: 128
                    })
                },
                description: descText,
                timestamp: new Date()
            };
            message.channel.send({
                embed: embed
            });
        }
        catch (err) {
            console.error(err);
            return message.reply("An unexpected error occurred.");
        }
    }
}

module.exports.run = async (client, message, args) => {
    request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
        if (!error && response.statusCode == 200 && !body.includes("Error")) {
            client.economyManager = JSON.parse(body);
            if (client.economyManager[message.author.id]) {
                waifu(client, message, args);
                return;
            }
            else {
                client.economyManager[message.author.id] = {
                    coins: encrypt("500"),
                    waifus: []
                };
                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                    type: "add",
                    token: process.env.php_server_token,
                    id: message.author.id,
                    data: JSON.stringify(client.economyManager[message.author.id])
                }}, function(error, response, body) {
                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                        if (client.economyManager["6746"]) {
                            waifu(client, message, args);
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
                                    waifu(client, message, args);
                                    return;
                                }
                                else console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                            });
                        }
                        return;
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
    name: "wshop",
    description: "Visit the BOT's public waifu shop",
    usage: require("../config.json").prefix + "wshop <page>",
    accessableby: "Members",
    aliases: [],
    category: "👧 Waifu/Husbando Collection",
    dmAvailable: true
}