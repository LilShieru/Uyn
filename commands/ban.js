const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');

module.exports.run = async (client, message, args) => {
    if (!message.member.permissions.has("BAN_MEMBERS")) return message.reply("You don't have the rights to do this!");
    if (!message.mentions.members.size) return message.reply("You must mention an user!");
    if (message.mentions.members.first().user.id == message.author.id) return message.reply("You cannot ban yourself!");
    if (message.mentions.members.first().roles.highest.rawPosition >= message.member.roles.highest.rawPosition) return message.reply("The mentioned member's highest role is higher than yours!");
    if (message.mentions.members.first().roles.highest.rawPosition >= message.guild.member(client.user).roles.highest.rawPosition) return message.reply("The mentioned member's highest role is higher than this BOT's role!");
    if (message.mentions.members.first().user.id == client.user.id) return message.reply("You cannot ban this BOT!");
    if (!message.guild.member(client.user).permissions.has("KICK_MEMBERS")) return message.reply("This BOT doesn't have the Ban Members permission on this server!");
    var reason = "Unspecified";
    args.splice(0, 1);
    if (args[0]) reason = args.join(" ");
    message.mentions.members.first().ban({
        reason: message.author.tag + " - " + reason
    });
    message.channel.send({
        embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            author: {
                name: message.author.tag + " has just banned " + message.mentions.members.first().user.tag,
                icon_url: message.author.avatarURL({
                    format: "png",
                    dynamic: true,
                    size: 2048
                })
            },
            description: "**Reason:** " + reason,
            footer: {
                text: "Sender's ID: " + message.author.id + " | Mentioned member's ID: " + message.mentions.members.first().user.id,
                timestamp: message.timestamp
            }
        }
    });
    message.mentions.members.first().user.send({
        embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            author: {
                name: "You have just been banned in the " + message.guild.name + " server",
                icon_url: message.guild.iconURL({
                    format: "png",
                    dynamic: true,
                    size: 2048
                })
            },
            description: "**Being banned by:** " + message.author.toString() + "\n**Reason:** " + reason,
            footer: {
                text: "Sender's ID: " + message.author.id + " | Mentioned member's ID: " + message.mentions.members.first().user.id,
                timestamp: message.timestamp
            }
        }
    });
}

module.exports.config = {
    name: "ban",
    description: "Ban someone",
    usage: require("../config.json").prefix + "ban @mention (reason)",
    accessableby: "Members",
    aliases: [],
    category: "⚙️ Moderations",
    dmAvailable: false
}