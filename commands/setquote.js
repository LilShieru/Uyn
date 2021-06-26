const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');
const request = require("request");
const Canvas = require("canvas");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports.run = async (client, message, args, language) => {
    if (message.channel.type == "text") return message.reply("This command now can only be used in a Direct Messages channel!"); 
    if (args[0]) {
        if (!client.quotes[message.author.id]) {
            var text = args.join(" ");
            if (text.length <= 200) {
                request(process.env.php_server_url + '/SetQuote.php?token=' + process.env.php_server_token + '&id=' + message.author.id + "&quote=" + encodeURIComponent(text), function(err, response, body) {
                    if (!response || response.statusCode != 200 || body.includes('Connection failed')) {
                        message.channel.send("Cannot connect to the BOT server! Please try again!");
                    } else {
                        if (body && body.includes('Success')) {
                            console.log(body);
                            request(process.env.php_server_url + '/GetAllQuotes.php', function(error, response, body) {
                                console.error('error:', error); // Print the error if one occurred
                                console.log(response.statusCode);
                                if (response && response.statusCode == 200) {
                                    client.quotes = JSON.parse(body);
                                    const embed = {
                                        color: Math.floor(Math.random() * 16777214) + 1,
                                        description: client.quotes[message.author.id],
                                        footer: {
                                            text: message.author.tag,
                                            icon_url: message.author.avatarURL({
                                                format: "png",
                                                dynamic: true,
                                                size: 2048
                                            })
                                        }
                                    };
                                    message.reply("Updated your ping-responsing message.\nRead more information about ping-responsing messages here:\nhttps://github.com/LilShieru/Uyn/blob/master/README.md#-ping-responsing", {embed: embed});
                                }
                            });

                        } else {
                            console.log(body);
                            message.reply("Update failed! Make sure that you don't type any emoji into the quote!");
                        }
                    }
                });
            } else {
                message.reply("Your quote length is higher than 200!");
            }
        } else {
            var text = args.join(" ");
            if (text.length <= 200) {
                request(process.env.php_server_url + '/SetQuote.php?token=' + process.env.php_server_token + '&id=' + message.author.id + "&quote=" + encodeURIComponent(text), function(err, response, body) {
                    if (!response || response.statusCode != 200 || body.includes('Connection failed')) {
                        message.channel.send("Cannot connect to the server! Plase try again!");
                    } else {
                        if (body && body.includes('Success')) {
                            console.log(body);
                            request(process.env.php_server_url + '/GetAllQuotes.php', function(error, response, body) {
                                console.error('error:', error); // Print the error if one occurred
                                console.log(response.statusCode);
                                if (response && response.statusCode == 200) {
                                    client.quotes = JSON.parse(body);
                                    const embed = {
                                        color: Math.floor(Math.random() * 16777214) + 1,
                                        description: client.quotes[message.author.id],
                                        footer: {
                                            text: message.author.tag,
                                            icon_url: message.author.avatarURL({
                                                format: "png",
                                                dynamic: true,
                                                size: 2048
                                            })
                                        }
                                    };
                                    message.reply("Updated your ping-responsing message.\nRead more information about ping-responsing messages here:\nhttps://github.com/LilShieru/Uyn/blob/master/README.md#-ping-responsing", {embed: embed});
                                }
                            });
                        } else {
                            console.log(body);
                            message.reply("Update failed! Make sure that you don't type any emoji into the quote!");
                        }
                    }
                });
            } else {
                message.reply("Your quote length is higher than 200!");
            }
        }
    } else {
        message.reply("You must type the quote first!");
    }
}

module.exports.config = {
    name: "setquote",
    description: "Set your ping-responsing message",
    usage: require("../config.json").prefix + "setquote (quote)",
    accessableby: "Members",
    aliases: [],
    category: "💬 Ping-responsing",
    dmAvailable: true
}
