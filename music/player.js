const ytdl = require("ytdl-core");
const AudioTrack = require("./audioTrack");

module.exports = class Player {
    playingTrack = null;
    voiceChannel = null;
    queue = [];
    stream = null;

    constructor(voiceChannel) {
        this.voiceChannel = voiceChannel;
    }

    async play(url) {
        const broadcaster = await this.#connect();
        const info = await ytdl.getBasicInfo(url);
        const track = new AudioTrack();

        track.name = info.videoDetails.title;
        track.uri = info.videoDetails.video_url;
        track.length = info.videoDetails.lengthSeconds;

        this.queue.push(track);

        if (!this.queue.length) this.playingTrack = track;
        else {
            this.playingTrack = this.queue[0];
            return;
        }

        this.stream = broadcaster.play(await ytdl(url), {type: "opus"});
    }

    async skip() {
        if (!this.queue) return;
        this.queue.shift();
        if (!this.queue.length) return;
        await this.play(this.queue[0].uri);
    }

    async destroy() {
        await this.voiceChannel.leave();
        this.clear();
    }

    async #connect() {
        return await this.voiceChannel.join();
    }

    pause() {
        this.stream.pause(true);
    }

    resume() {
        this.stream.pause(false);
    }

    setVolume(vol) {
        this.stream.setVolume(vol);
    }

    on(event, callback) {
        this.stream.on(event, (...args) => callback(args));
    }

    clear() {
        this.stream.destroy();
        this.queue = null;
        this.playingTrack = null;
        this.voiceChannel = null;
    }
}