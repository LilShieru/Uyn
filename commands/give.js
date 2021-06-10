const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

module.exports.run = async (client, message, args) => {
    request(process.env.php_server_url + "/EconomyManager.php?type=get&token=" + process.env.php_server_token, function(error, response, body) {
        if (!error && response.statusCode == 200 && !body.includes("Error")) {
            client.economyManager = JSON.parse(body);
            if (!message.mentions.users.size) return message.reply("You must mention an user!");
            if (message.mentions.users.size && !args[1]) return message.reply("You must type an amount!");
            if (isNaN(args[1])) return message.reply("The amount must be a number!");
            if (message.mentions.users.first().id == message.author.id) return message.reply("You can't give coins to yourself!");
            if (message.mentions.users.first().bot) return message.reply("You can't give coins to a BOT!");
            if (!client.economyManager[message.author.id]) {
                try {
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
                            if (parseInt(decrypt(client.economyManager[message.author.id].coins)) < parseInt(args[1])) return message.reply("Insufficent balance!");
                            if (!client.economyManager[message.mentions.users.first().id]) {
                                try {
                                    client.economyManager[message.mentions.users.first().id] = {
                                        coins: encrypt("500")
                                    };
                                    request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                        type: "add",
                                        token: process.env.php_server_token,
                                        id: message.mentions.users.first().id,
                                        data: JSON.stringify(client.economyManager[message.mentions.users.first().id])
                                    }}, function(error, response, body) {
                                        if (!error && response.statusCode == 200 && body.includes("Success")) {
                                            try {
                                                var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                                coins -= parseInt(args[1]);
                                                client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                                    type: "update",
                                                    token: process.env.php_server_token,
                                                    id: message.author.id,
                                                    data: JSON.stringify(client.economyManager[message.author.id])
                                                }}, function(error, response, body) {
                                                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                                                        coins = parseInt(decrypt(client.economyManager[message.mentions.users.first().id].coins));
                                                        coins += parseInt(args[1]);
                                                        client.economyManager[message.mentions.users.first().id].coins = encrypt(coins.toString());
                                                        request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                                            type: "update",
                                                            token: process.env.php_server_token,
                                                            id: message.mentions.users.first().id,
                                                            data: JSON.stringify(client.economyManager[message.mentions.users.first().id])
                                                        }}, function(error2, response2, body2) {
                                                            if (!error2 && response2.statusCode == 200 && body2.includes("Success")) {
                                                                console.log(message.author.tag + " sent " + message.mentions.users.first().tag + " " + args[1] + " Uyncoins!");
                                                                message.channel.send("**" + message.author.username + "** have just sent **" + args[1] + " " + client.config.currency + "** to **" + message.mentions.users.first().username + "**!");
                                                            }
                                                            else {
                                                                var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                                                coins += parseInt(args[1]);
                                                                client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                                                coins = parseInt(decrypt(client.economyManager[message.mentions.users.first().id].coins));
                                                                coins -= parseInt(args[1]);
                                                                client.economyManager[message.mentions.users.first().id].coins = encrypt(coins.toString());
                                                                console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                                                return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                                        var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                                        coins += parseInt(args[1]);
                                                        client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                                        return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                                                    }
                                                });
                                            }
                                            catch (err) {
                                                console.error(err);
                                                return message.reply("An unexpected error occurred.");
                                            }
                                        }
                                        else {
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
                            else {
                                try {
                                    var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                    coins -= parseInt(args[1]);
                                    client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                    request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                        type: "update",
                                        token: process.env.php_server_token,
                                        id: message.author.id,
                                        data: JSON.stringify(client.economyManager[message.author.id])
                                    }}, function(error, response, body) {
                                        if (!error && response.statusCode == 200 && body.includes("Success")) {
                                            coins = parseInt(decrypt(client.economyManager[message.mentions.users.first().id].coins));
                                            coins += parseInt(args[1]);
                                            client.economyManager[message.mentions.users.first().id].coins = encrypt(coins.toString());
                                            request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                                type: "update",
                                                token: process.env.php_server_token,
                                                id: message.mentions.users.first().id,
                                                data: JSON.stringify(client.economyManager[message.mentions.users.first().id])
                                            }}, function(error2, response2, body2) {
                                                if (!error2 && response2.statusCode == 200 && body2.includes("Success")) {
                                                    console.log(message.author.tag + " sent " + message.mentions.users.first().tag + " " + args[1] + " Uyncoins!");
                                                    message.channel.send("**" + message.author.username + "** have just sent **" + args[1] + " " + client.config.currency + "** to **" + message.mentions.users.first().username + "**!");
                                                }
                                                else {
                                                    var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                                    coins += parseInt(args[1]);
                                                    client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                                    coins = parseInt(decrypt(client.economyManager[message.mentions.users.first().id].coins));
                                                    coins -= parseInt(args[1]);
                                                    client.economyManager[message.mentions.users.first().id].coins = encrypt(coins.toString());
                                                    console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                                    return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                                                }
                                            });
                                        }
                                        else {
                                            console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                            var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                            coins += parseInt(args[1]);
                                            client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                            return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                                        }
                                    });
                                }
                                catch (err) {
                                    console.error(err);
                                    return message.reply("An unexpected error occurred.");
                                }
                            }
                        }
                        else {
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
            else {
                try {
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
                            if (parseInt(decrypt(client.economyManager[message.author.id].coins)) < parseInt(args[1])) return message.reply("Insufficent balance!");
                            if (!client.economyManager[message.mentions.users.first().id]) {
                                try {
                                    client.economyManager[message.mentions.users.first().id] = {
                                        coins: encrypt("500")
                                    };
                                    request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                        type: "add",
                                        token: process.env.php_server_token,
                                        id: message.mentions.users.first().id,
                                        data: JSON.stringify(client.economyManager[message.mentions.users.first().id])
                                    }}, function(error, response, body) {
                                        if (!error && response.statusCode == 200 && body.includes("Success")) {
                                            try {
                                                var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                                coins -= parseInt(args[1]);
                                                client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                                request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                                    type: "update",
                                                    token: process.env.php_server_token,
                                                    id: message.author.id,
                                                    data: JSON.stringify(client.economyManager[message.author.id])
                                                }}, function(error, response, body) {
                                                    if (!error && response.statusCode == 200 && body.includes("Success")) {
                                                        coins = parseInt(decrypt(client.economyManager[message.mentions.users.first().id].coins));
                                                        coins += parseInt(args[1]);
                                                        client.economyManager[message.mentions.users.first().id].coins = encrypt(coins.toString());
                                                        request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                                            type: "update",
                                                            token: process.env.php_server_token,
                                                            id: message.mentions.users.first().id,
                                                            data: JSON.stringify(client.economyManager[message.mentions.users.first().id])
                                                        }}, function(error2, response2, body2) {
                                                            if (!error2 && response2.statusCode == 200 && body2.includes("Success")) {
                                                                console.log(message.author.tag + " sent " + message.mentions.users.first().tag + " " + args[1] + " Uyncoins!");
                                                                message.channel.send("**" + message.author.username + "** have just sent **" + args[1] + " " + client.config.currency + "** to **" + message.mentions.users.first().username + "**!");
                                                            }
                                                            else {
                                                                var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                                                coins += parseInt(args[1]);
                                                                client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                                                coins = parseInt(decrypt(client.economyManager[message.mentions.users.first().id].coins));
                                                                coins -= parseInt(args[1]);
                                                                client.economyManager[message.mentions.users.first().id].coins = encrypt(coins.toString());
                                                                console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                                                return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                                                            }
                                                        });
                                                    }
                                                    else {
                                                        console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                                        var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                                        coins += parseInt(args[1]);
                                                        client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                                        return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                                                    }
                                                });
                                            }
                                            catch (err) {
                                                console.error(err);
                                                return message.reply("An unexpected error occurred.");
                                            }
                                        }
                                        else {
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
                            else {
                                try {
                                    var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                    coins -= parseInt(args[1]);
                                    client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                    request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                        type: "update",
                                        token: process.env.php_server_token,
                                        id: message.author.id,
                                        data: JSON.stringify(client.economyManager[message.author.id])
                                    }}, function(error, response, body) {
                                        if (!error && response.statusCode == 200 && body.includes("Success")) {
                                            coins = parseInt(decrypt(client.economyManager[message.mentions.users.first().id].coins));
                                            coins += parseInt(args[1]);
                                            client.economyManager[message.mentions.users.first().id].coins = encrypt(coins.toString());
                                            request.post({url: process.env.php_server_url + "/EconomyManager.php", formData: {
                                                type: "update",
                                                token: process.env.php_server_token,
                                                id: message.mentions.users.first().id,
                                                data: JSON.stringify(client.economyManager[message.mentions.users.first().id])
                                            }}, function(error2, response2, body2) {
                                                if (!error2 && response2.statusCode == 200 && body2.includes("Success")) {
                                                    console.log(message.author.tag + " sent " + message.mentions.users.first().tag + " " + args[1] + " Uyncoins!");
                                                    message.channel.send("**" + message.author.username + "** have just sent **" + args[1] + " " + client.config.currency + "** to **" + message.mentions.users.first().username + "**!");
                                                }
                                                else {
                                                    var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                                    coins += parseInt(args[1]);
                                                    client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                                    coins = parseInt(decrypt(client.economyManager[message.mentions.users.first().id].coins));
                                                    coins -= parseInt(args[1]);
                                                    client.economyManager[message.mentions.users.first().id].coins = encrypt(coins.toString());
                                                    console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                                    return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                                                }
                                            });
                                        }
                                        else {
                                            console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
                                            var coins = parseInt(decrypt(client.economyManager[message.author.id].coins));
                                            coins += parseInt(args[1]);
                                            client.economyManager[message.author.id].coins = encrypt(coins.toString());
                                            return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
                                        }
                                    });
                                }
                                catch (err) {
                                    console.error(err);
                                    return message.reply("An unexpected error occurred.");
                                }
                            }
                        }
                        else {
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
        }
        else {
            console.error("EconomyManagerError: Cannot connect to the server.\nError Information: " + error + "\nResponse Information: " + body);
            return message.reply("Something wrong happened with the BOT server! Can you contact the developer to fix it?");
        }
    });
}

module.exports.config = {
    name: "give",
    description: "Give someone some Uyncoins",
    usage: require("../config.json").prefix + "give @mention amount",
    accessableby: "Members",
    aliases: [],
    category: "💰 Economy",
    dmAvailable: true
}