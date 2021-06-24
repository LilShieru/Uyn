const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {
    encrypt,
    decrypt
} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function wbuy(client, message, args) {
    if (!args[0]) return message.reply("Please type a waifu ID!");
    if (!client.economyManager[message.author.id].waifus) client.economyManager[message.author.id].waifus = [];
    var waifu;
    for (var i = 0; i < client.economyManager["6746"].waifus.length; i++) {
        if (client.economyManager["6746"].waifus[i].id == args[0]) {
            waifu = client.economyManager["6746"].waifus[i];
            break;
        }
    }
    if (!waifu) return message.reply("Invalid waifu ID!");
    if (parseInt(decrypt(client.economyManager[message.author.id].coins)) < waifu.price) return message.reply("Insufficent balance!");
    var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
    coins -= waifu.price;
    client.economyManager[message.author.id].coins = encrypt(coins.toString());
    var length = client.economyManager[message.author.id].waifus.length, name = waifu.name, price = waifu.price.toLocaleString();
    client.economyManager[message.author.id].waifus.push({
        id: (client.economyManager[message.author.id].waifus[length - 1] && client.economyManager[message.author.id].waifus[length - 1].id) ? client.economyManager[message.author.id].waifus[length - 1].id + 1 : 1,
        name: waifu.name,
        anime: waifu.anime,
        image_url: waifu.image_url,
        level: waifu.level,
        base_hp: waifu.base_hp,
        base_atk: waifu.base_atk,
        base_def: waifu.base_def,
        base_exp: waifu.base_exp,
        exp: waifu.exp,
        max_exp: waifu.max_exp,
        rarity: waifu.rarity
    });
    for (var i = 0; i < client.economyManager["6746"].waifus.length; i++) {
        if (client.economyManager["6746"].waifus[i].id == args[0]) {
            client.economyManager["6746"].waifus.splice(i, 1);
            break;
        }
    }
    request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
        type: "update",
        token: process.env.php_server_token,
        id: message.author.id,
        data: JSON.stringify(client.economyManager[message.author.id])
    }}, function(error, response, body) {
        if (!error && response.statusCode == 200 && body.includes("Success")) {
            request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                type: "update",
                token: process.env.php_server_token,
                id: "6746",
                data: JSON.stringify(client.economyManager["6746"])
            }}, function(error, response, body) {
                if (!error && response.statusCode == 200 && body.includes("Success")) {
                    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                    let result = "";
                    for (let i = 0; i < 32; i++) {
                        result += characters.charAt(Math.floor(Math.random() * characters.length));
                    }
                    if (client.channels.cache.get(client.config.logChannel)) client.channels.cache.get(client.config.logChannel).send("**Transaction ID:** " + result, new Discord.MessageEmbed()
                        .setColor(Math.floor(Math.random() * 16777215))
                        .setAuthor(message.author.username + " has just bought \"" + name + "\" item from the BOT's public shop for " + price + " " + client.config.currency + ".", message.author.avatarURL({size: 128}))
                        .setTimestamp()
                    );
                    else console.log("Cannot get the log channel.");
                    const embed = {
                        color: Math.floor(Math.random() * 16777215),
                        author: {
                            name: "Succesfully bought \"" + name + "\" from the server shop.",
                            icon_url: message.author.avatarURL({size: 128})
                        },
                        description: "The transaction ID is " + result + ".\nYou should remember this ID and send this to the BOT developer if something wrong happened.",
                        timestamp: new Date()
                    };
                    message.channel.send({
                        embed: embed
                    });
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

module.exports.run = async (client, message, args) => {
    try {
        request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
            if (!error && response.statusCode == 200 && !body.includes("Error")) {
                client.economyManager = JSON.parse(body);
                if (client.economyManager[message.author.id]) {
                    wbuy(client, message, args);
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
                                wbuy(client, message, args);
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
                                        wbuy(client, message, args);
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
    catch (err) {
        console.error(err);
        return message.reply("An unexpected error occurred.");
    }
}

module.exports.config = {
    name: "wbuy",
    description: "Buy a waifu/husbando in the BOT's public waifu shop",
    usage: require("../config.json").prefix + "wbuy <id>",
    accessableby: "Members",
    aliases: [],
    category: "👧 Waifu/Husbando Collection",
    dmAvailable: true
}