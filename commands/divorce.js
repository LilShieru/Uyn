const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function info(client, message, args) {
    if (client.trades[message.author.id]) return message.reply("You are currently in a trade, please end or complete it first!");
    if (client.sell[message.author.id]) return message.reply("You are currently selling a waifu, please end or complete it first!");
    if (!client.economyManager[message.author.id].waifus) client.economyManager[message.author.id].waifus = [];
    try {
        if (!client.divorce[message.author.id]) {
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
            client.divorce[message.author.id] = args[0];
            message.reply("You are going to delete your **" + waifu.name + "**.\n\nNotice that this action is **IRREVERSIBLE**!\nUse the `divorce` command again to confirm the deletion or use the `divorce cancel` command to cancel the deletion.");
        }
        else {
            switch (args[0]) {
                case "cancel": {
                    client.divorce[message.author.id] = undefined;
                    message.reply("Successfully cancelled the current deletion.");
                    break;
                }
                default: {
                    var waifu;
                    for (var i = 0; i < client.economyManager[message.author.id].waifus.length; i++) {
                        if (client.economyManager[message.author.id].waifus[i].id == client.divorce[message.author.id]) {
                            waifu = client.economyManager[message.author.id].waifus[i];
                            break;
                        }
                    }
                    if (!waifu) return message.reply("Cannot find the waifu with this ID! What have you done before?");
                    var rarityValue = 0, level = waifu.level, name = waifu.name;
                    switch (waifu.rarity) {
                        case "Normal": {rarityValue = 1; break}
                        case "Rare": {rarityValue = 1.5; break}
                        case "Super Rare": {rarityValue = 2.5; break}
                        case "Specially Super Rare": {rarityValue = 3.75; break}
                        case "Super Super Rare": {rarityValue = 4.5; break}
                        case "Ultra Rare": {rarityValue = 6; break}
                        default: {return message.reply("Cannot identify the Waifu rarity!")}
                    }
                    for (var i = 0; i < client.economyManager[message.author.id].waifus.length; i++) {
                        if (client.economyManager[message.author.id].waifus[i].id == client.divorce[message.author.id]) {
                            client.economyManager[message.author.id].waifus.splice(i, 1);
                            break;
                        }
                    }
                    client.divorce[message.author.id] = undefined;
                    var divorceValue = parseInt(1000 * rarityValue * (1 + (0.075 * level)));
                    var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                    coins += divorceValue;
                    client.economyManager[message.author.id].coins = encrypt(coins.toString());
                    request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                        type: "update",
                        token: process.env.php_server_token,
                        id: message.author.id,
                        data: JSON.stringify(client.economyManager[message.author.id])
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
                                .setAuthor(message.author.username + " has just divorced a waifu and got " + divorceValue + " " + client.config.currency + ".", message.author.avatarURL({size: 128}))
                                .setTimestamp()
                            );
                            message.channel.send(new Discord.MessageEmbed()
                            .setAuthor(message.author.tag, message.author.avatarURL({size: 128, dynamic: true}))
                            .setDescription("Successfully divorced **" + waifu.name + "** and got " + divorceValue.toLocaleString() + " " + client.config.currency + " as a compensation gift.")
                            .setTimestamp());
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
                info(client, message, args);
                return;
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
                        info(client, message, args);
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
    name: "divorce",
    description: "Delete a waifu and get a compensation amount",
    usage: require("../config.json").prefix + "divorce <waifu ID>",
    accessableby: "Members",
    aliases: [],
    category: "👧 Waifu/Husbando Collection",
    dmAvailable: true
}