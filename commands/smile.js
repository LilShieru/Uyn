const Discord = require("discord.js");
const fs = require('fs');
const {
    inspect
} = require('util');
const request = require("request");

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports.run = async (client, message, args, language) => {
    message.delete({
        timeout: 10000
    });
    var gif = "";
    var text = "";
    for (var i = 0; i < args.length; i++) {
        text += args[i] + " ";
    }
    text = text.substr(0, text.length - 1);
    request(
        "https://api.tenor.com/v1/search?q=anime smile&key=" + process.env.tenor_api_key + "&limit=40",
        function(error, response, body) {
            console.error("error:", error); // Print the error if one occurred
            console.log(response.statusCode);
            if (response && response.statusCode == 200) {
                var gifs = JSON.parse(body);
                var rand = parseInt(random(0, 39));
                gif = gifs.results[rand].media[0].gif.url;
                console.log(gif);
                const image = {
                    color: Math.floor(Math.random() * 16777214) + 1,
                    author: {
                        name: message.author.username + " is smiling~\n" + text,
                        icon_url: message.author.avatarURL({
                            format: "png",
                            dynamic: true,
                            size: 2048
                        })
                    },
                    image: {
                        url: gif,
                    },
                };
                message.channel.send({
                    embed: image
                });
            }
        });
}

module.exports.config = {
    name: "smile",
    description: "Smile",
    usage: require("../config.json").prefix + "smile",
    accessableby: "Members",
    aliases: ["cười"],
    category: "👋 Interactions",
    dmAvailable: false
}