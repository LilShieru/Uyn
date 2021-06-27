const Discord = require("discord.js");
const fs = require('fs');
const request = require("request");
const {encrypt, decrypt} = require("../utils/crypto.js");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports.run = async (client, message, args, language) => {
    if (!client.economyManager[message.author.id].waifus) client.economyManager[message.author.id].waifus = [];
    try {
        if (!args[0]) return message.reply(language.missingWaifuName);
        var name = args.join(" ").toLowerCase();
        var desc = "", length = 0;
        for (var i = 0; i < client.waifus.normal.length; i++) if (client.waifus.normal[i].name.toLowerCase().includes(name) && length < 20) {  desc += "`wn." + (i + 1) + "` **" + client.waifus.normal[i].name + "**\n"; length++ }
        for (var i = 0; i < client.waifus.rare.length; i++) if (client.waifus.rare[i].name.toLowerCase().includes(name) && length < 20) {  desc += "`wr." + (i + 1) + "` **" + client.waifus.rare[i].name + "**\n"; length++ }
        for (var i = 0; i < client.waifus.srare.length; i++) if (client.waifus.srare[i].name.toLowerCase().includes(name) && length < 20) {  desc += "`wsr." + (i + 1) + "` **" + client.waifus.srare[i].name + "**\n"; length++ }
        for (var i = 0; i < client.waifus.ssrare.length; i++) if (client.waifus.ssrare[i].name.toLowerCase().includes(name) && length < 20) {  desc += "`wssr." + (i + 1) + "` **" + client.waifus.ssrare[i].name + "**\n"; length++ }
        for (var i = 0; i < client.waifus.urare.length; i++) if (client.waifus.urare[i].name.toLowerCase().includes(name) && length < 20) {  desc += "`wur." + (i + 1) + "` **" + client.waifus.urare[i].name + "**\n"; length++ }
        for (var i = 0; i < client.husbandos.normal.length; i++) if (client.husbandos.normal[i].name.toLowerCase().includes(name) && length < 20) {  desc += "`hn." + (i + 1) + "` **" + client.husbandos.normal[i].name + "**\n"; length++ }
        for (var i = 0; i < client.husbandos.rare.length; i++) if (client.husbandos.rare[i].name.toLowerCase().includes(name) && length < 20) {  desc += "`hr." + (i + 1) + "` **" + client.husbandos.rare[i].name + "**\n"; length++ }
        for (var i = 0; i < client.husbandos.srare.length; i++) if (client.husbandos.srare[i].name.toLowerCase().includes(name) && length < 20) {  desc += "`hsr." + (i + 1) + "` **" + client.husbandos.srare[i].name + "**\n"; length++ }
        for (var i = 0; i < client.husbandos.ssrare.length; i++) if (client.husbandos.ssrare[i].name.toLowerCase().includes(name) && length < 20) {  desc += "`hssr." + (i + 1) + "` **" + client.husbandos.ssrare[i].name + "**\n"; length++ }
        for (var i = 0; i < client.husbandos.urare.length; i++) if (client.husbandos.urare[i].name.toLowerCase().includes(name) && length < 20) {  desc += "`hur." + (i + 1) + "` **" + client.husbandos.urare[i].name + "**\n"; length++ }
        desc += language.searchDesc;
        message.channel.send(new Discord.MessageEmbed()
        .setAuthor(language.searchTitle.replace("$name", name), client.user.avatarURL({size: 128}))
        .setDescription(desc)
        .setColor(Math.floor(Math.random * 16777215))
        .setTimestamp());
    }
    catch (err) {
        console.error(err);
        return message.reply(language.unexpectedErrorOccurred);
    }
}

module.exports.config = {
    name: "search",
    description: "Search for waifus/husbandos in the database",
    usage: require("../config.json").prefix + "search <name>",
    accessableby: "Members",
    aliases: [],
    category: "👧 Waifu/Husbando Collection",
    dmAvailable: true
}