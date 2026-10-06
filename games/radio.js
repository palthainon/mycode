// Radio for the Maintenance Window games: lo-fi, fantasy and 8-bit stations
// generated live with the Web Audio API, plus short game sound effects.
// Nothing streams or downloads. Audio starts only after a user gesture.
//
// API (window.OWTRadio):
//   stations                 [{ id, label }]
//   setOn(bool) -> bool      start/stop the music; false if Web Audio is missing
//   isOn()
//   setStation(indexOrId)    switch station (keeps playing if on)
//   station() -> index
//   trackName()              current track title
//   setVolume(0..1)          music volume
//   onChange(fn)             called when a track or station changes
//   sfx(name)                'key' | 'miss' | 'fire' | 'thud' | 'boom' | 'bigboom' | 'hurt' | 'wave' | 'over'
//   setSfx(bool)             sound effects on/off
(function () {
    'use strict';
    const music = {
        on: false,
        ctx: null,
        master: null,
        tone: null,
        crackleGain: null,
        nextTime: 0,
        step: 0,
        bar: 0,
        track: 0,
        melody: 0,          // index into the station's scale for the melody's random walk
        timer: null,
        volume: 0.6,
        station: 0
    };

    const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
    const chance = p => Math.random() < p;

    // Melody wanders a step or two through the scale instead of jumping around
    function walk(scale) {
        music.melody = Math.max(0, Math.min(scale.length - 1, music.melody + Math.floor(Math.random() * 5) - 2));
        return scale[music.melody];
    }

    function noiseBuffer(ctx, seconds, crackle) {
        const len = Math.floor(ctx.sampleRate * seconds);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) {
            if (crackle) {
                d[i] = (Math.random() * 2 - 1) * 0.012;
                if (Math.random() < 0.0004) d[i] = (Math.random() * 2 - 1) * 0.5;
            } else {
                d[i] = Math.random() * 2 - 1;
            }
        }
        return buf;
    }

    function initAudio() {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return false;
        const ctx = new Ctx();
        music.ctx = ctx;

        // Everything runs through one tone filter; lo-fi closes it down like an old tape deck
        const tone = ctx.createBiquadFilter();
        tone.type = 'lowpass';
        const master = ctx.createGain();
        master.gain.value = music.volume * 0.5;
        master.connect(tone);
        tone.connect(ctx.destination);
        music.master = master;
        music.tone = tone;

        // Tape wow: slow pitch wobble shared by the lo-fi keys
        const wow = ctx.createOscillator();
        wow.frequency.value = 0.45;
        const wowDepth = ctx.createGain();
        wowDepth.gain.value = 9;   // cents
        wow.connect(wowDepth);
        wow.start();
        music.wow = wowDepth;

        // Flute vibrato
        const vib = ctx.createOscillator();
        vib.frequency.value = 5.2;
        const vibDepth = ctx.createGain();
        vibDepth.gain.value = 14;  // cents
        vib.connect(vibDepth);
        vib.start();
        music.vib = vibDepth;

        music.noise = noiseBuffer(ctx, 1, false);

        // Vinyl crackle bed, only audible on stations that want it
        const crackle = ctx.createBufferSource();
        crackle.buffer = noiseBuffer(ctx, 4, true);
        crackle.loop = true;
        music.crackleGain = ctx.createGain();
        crackle.connect(music.crackleGain);
        music.crackleGain.connect(master);
        crackle.start();

        applyStation();
        return true;
    }

    // ---------- Voices ----------
    function envGain(time, attack, peak, decayTo, decayTime, end) {
        const g = music.ctx.createGain();
        g.gain.setValueAtTime(0.0001, time);
        g.gain.linearRampToValueAtTime(peak, time + attack);
        if (decayTo !== null) g.gain.exponentialRampToValueAtTime(Math.max(decayTo, 0.0001), time + attack + decayTime);
        g.gain.exponentialRampToValueAtTime(0.0001, end);
        g.connect(music.master);
        return g;
    }

    function osc(type, freq, time, end, dest, detuneFrom) {
        const o = music.ctx.createOscillator();
        o.type = type;
        o.frequency.value = freq;
        if (detuneFrom) detuneFrom.connect(o.detune);
        o.connect(dest);
        o.start(time);
        o.stop(end + 0.05);
        return o;
    }

    // Soft electric piano (lo-fi)
    function keys(midi, time, dur, vel) {
        const end = time + dur;
        const out = envGain(time, 0.02, vel, vel * 0.35, 0.4, end);
        const lp = music.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 1400;
        lp.connect(out);
        osc('sine', mtof(midi), time, end, lp, music.wow);
        const overtone = music.ctx.createGain();
        overtone.gain.value = 0.18;
        overtone.connect(lp);
        osc('triangle', mtof(midi) * 2, time, end, overtone, music.wow);
    }

    // Plucked string: lute in the tavern, harp in the forest
    function pluck(midi, time, vel, bright) {
        const end = time + 0.9;
        const out = envGain(time, 0.005, vel, null, 0, end);
        const lp = music.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(bright, time);
        lp.frequency.exponentialRampToValueAtTime(500, time + 0.5);
        lp.connect(out);
        osc('triangle', mtof(midi), time, end, lp);
        const body = music.ctx.createGain();
        body.gain.value = 0.25;
        body.connect(lp);
        osc('sawtooth', mtof(midi), time, end, body);
    }

    // Breathy wooden flute
    function flute(midi, time, dur, vel) {
        const end = time + dur;
        const out = envGain(time, 0.07, vel, vel * 0.8, dur * 0.6, end);
        osc('sine', mtof(midi), time, end, out, music.vib);
        const breath = music.ctx.createBufferSource();
        breath.buffer = music.noise;
        const bp = music.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = mtof(midi) * 2;
        bp.Q.value = 8;
        const bg = music.ctx.createGain();
        bg.gain.value = 0.25;
        breath.connect(bp);
        bp.connect(bg);
        bg.connect(out);
        breath.start(time);
        breath.stop(end);
    }

    // Slow-swelling string pad
    function pad(midis, time, dur, vel) {
        const end = time + dur;
        const out = envGain(time, dur * 0.35, vel, vel * 0.7, dur * 0.4, end);
        const lp = music.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 900;
        lp.connect(out);
        midis.forEach(m => {
            osc('sawtooth', mtof(m) * 1.002, time, end, lp);
            osc('triangle', mtof(m) * 0.998, time, end, lp);
        });
    }

    // Glassy bell (two inharmonic sines)
    function bell(midi, time, vel) {
        const end = time + 1.8;
        const out = envGain(time, 0.003, vel, null, 0, end);
        osc('sine', mtof(midi), time, end, out);
        const partial = music.ctx.createGain();
        partial.gain.value = 0.3;
        partial.connect(out);
        osc('sine', mtof(midi) * 2.76, time, time + 0.5, partial);
    }

    // Game-console channels: square/triangle with a hard gate
    function chip(type, midi, time, dur, vel) {
        const end = time + dur;
        const g = music.ctx.createGain();
        g.gain.setValueAtTime(vel, time);
        g.gain.setValueAtTime(vel, end - 0.01);
        g.gain.linearRampToValueAtTime(0, end);
        g.connect(music.master);
        osc(type, mtof(midi), time, end, g);
    }

    function kick(time, vol) {
        const o = music.ctx.createOscillator();
        const g = music.ctx.createGain();
        o.frequency.setValueAtTime(110, time);
        o.frequency.exponentialRampToValueAtTime(42, time + 0.12);
        g.gain.setValueAtTime(vol, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
        o.connect(g);
        g.connect(music.master);
        o.start(time);
        o.stop(time + 0.4);
    }

    function noiseHit(time, type, freq, vol, decay) {
        const src = music.ctx.createBufferSource();
        src.buffer = music.noise;
        const f = music.ctx.createBiquadFilter();
        f.type = type;
        f.frequency.value = freq;
        const g = music.ctx.createGain();
        g.gain.setValueAtTime(vol, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + decay);
        src.connect(f);
        f.connect(g);
        g.connect(music.master);
        src.start(time);
        src.stop(time + decay + 0.02);
    }

    // ---------- Stations ----------
    // Each station: tempo, steps per bar, swing, tone, and a play(step, time, chord, stepLen) function.
    const STATIONS = [
        {
            id: 'lofi', label: 'lo-fi', bpm: 72, steps: 16, swing: 0.18, cutoff: 3200, crackle: true,
            scale: [60, 62, 64, 67, 69, 72, 74, 76],
            tracks: [
                { name: 'rollback plan (not needed)', prog: [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]] },
                { name: 'packets in the rain', prog: [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]] },
                { name: '412 days uptime', prog: [[50, 53, 57, 60], [55, 59, 62, 65], [48, 52, 55, 59], [57, 60, 64, 67]] },
                { name: 'cat on the UPS', prog: [[52, 55, 59, 62], [57, 60, 64, 67], [50, 53, 57, 60], [55, 59, 62, 65]] }
            ],
            play(s, t, chord, len) {
                // Lazy boom-bap, chords on the one and the "and" of two
                if (s === 0 || s === 10) kick(t, 0.9);
                if (s === 4 || s === 12) noiseHit(t, 'bandpass', 1800, 0.35, 0.18);
                if (s % 2 === 0) noiseHit(t, 'highpass', 7000, s % 4 === 0 ? 0.08 : 0.04, 0.05);
                if (s === 0 || s === 6) {
                    chord.forEach((m, i) => keys(m, t + i * 0.018, len * (s === 0 ? 9 : 8), 0.09));
                    if (s === 0) keys(chord[0] - 12, t, len * 14, 0.14);
                }
                if (s % 2 === 0 && s !== 0 && chance(0.22)) keys(walk(this.scale), t, len * 3, 0.07);
            }
        },
        {
            id: 'tavern', label: 'tavern', bpm: 112, steps: 12, swing: 0, cutoff: 6000, crackle: false,
            scale: [62, 64, 65, 67, 69, 71, 72, 74, 76, 77],   // D dorian
            tracks: [
                { name: 'the prancing packet', prog: [[50, 57, 62], [48, 55, 60], [50, 57, 62], [45, 52, 57]] },
                { name: 'mead & mainframes', prog: [[50, 53, 57], [48, 52, 55], [46, 50, 53], [45, 49, 52]] },
                { name: 'ballad of the on-call bard', prog: [[50, 57, 62], [53, 57, 60], [48, 55, 60], [45, 52, 57]] }
            ],
            play(s, t, chord, len) {
                // A lilting 12/8: frame drum, lute arpeggios, a wandering flute
                if (s === 0 || s === 6) kick(t, 0.45);
                if (s === 3 || s === 9 || (s % 3 === 2 && chance(0.25))) noiseHit(t, 'bandpass', 900, 0.14, 0.09);
                const pattern = [0, 1, 2, 1, 2, 1];
                pluck(chord[pattern[s % 6]] + 12, t, 0.07, 3500);
                if (s === 0 || s === 6) pluck(chord[0], t, 0.1, 1500);
                if (s % 3 === 0 && chance(0.75)) flute(walk(this.scale), t, len * (chance(0.3) ? 6 : 3), 0.09);
            }
        },
        {
            id: 'forest', label: 'enchanted', bpm: 60, steps: 16, swing: 0, cutoff: 7000, crackle: false,
            scale: [65, 67, 69, 71, 72, 74, 76, 77, 79, 81],   // F lydian
            tracks: [
                { name: 'elven fiber runs', prog: [[53, 57, 60, 64], [55, 59, 62, 67], [52, 55, 59, 64], [50, 57, 60, 65]] },
                { name: 'moonlit server grove', prog: [[53, 57, 60, 64], [50, 55, 59, 62], [48, 55, 60, 64], [55, 59, 62, 66]] },
                { name: 'the mage who never paged', prog: [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 67], [53, 57, 60, 65]] }
            ],
            play(s, t, chord, len) {
                // Swelling pads, rising harp, the odd fairy bell. No drums.
                if (s === 0) pad(chord, t, len * 16, 0.035);
                if (s % 2 === 0) {
                    const tones = chord.concat(chord.map(m => m + 12));
                    pluck(tones[(s / 2) % tones.length] + 12, t, 0.05, 2500);
                }
                if (s % 2 === 1 && chance(0.12)) bell(walk(this.scale) + 12, t, 0.05);
            }
        },
        {
            id: 'chip-quest', label: '8-bit quest', bpm: 136, steps: 16, swing: 0, cutoff: 12000, crackle: false,
            scale: [72, 74, 76, 79, 81, 84, 86, 88],
            tracks: [
                { name: 'level 1: the patch window', prog: [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]] },
                { name: 'save point (wr mem)', prog: [[53, 57, 60], [55, 59, 62], [52, 55, 60], [57, 60, 64]] },
                { name: 'extra life: 412 days up', prog: [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]] }
            ],
            play(s, t, chord, len) {
                if (s === 0 || s === 8) kick(t, 0.5);
                if (s === 4 || s === 12) noiseHit(t, 'highpass', 2000, 0.16, 0.08);
                if (s % 2 === 1) noiseHit(t, 'highpass', 8000, 0.04, 0.03);
                if (s % 2 === 0) chip('triangle', chord[0] - 12 + (s % 4 === 2 ? 12 : 0), t, len * 1.7, 0.2);
                chip('square', chord[s % chord.length] + 12, t, len * 0.9, 0.025);
                if (s % 2 === 0 && chance(0.55)) chip('square', walk(this.scale), t, len * (chance(0.3) ? 4 : 2), 0.045);
            }
        },
        {
            id: 'chip-dungeon', label: '8-bit dungeon', bpm: 100, steps: 16, swing: 0, cutoff: 9000, crackle: false,
            scale: [69, 71, 72, 74, 76, 77, 80, 81, 83],   // A harmonic minor
            tracks: [
                { name: 'dungeon of legacy code', prog: [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59]] },
                { name: 'boss fight: the core switch', prog: [[57, 60, 64], [57, 60, 64], [58, 62, 65], [56, 59, 64]] },
                { name: 'torchlight & tail -f', prog: [[57, 60, 64], [50, 53, 57], [52, 56, 59], [57, 60, 64]] }
            ],
            play(s, t, chord, len) {
                // Galloping bass, slow broken chords, an ominous lead
                if (s === 0 || s === 6 || s === 10) kick(t, 0.45);
                if (s === 4 || s === 12) noiseHit(t, 'highpass', 1500, 0.12, 0.12);
                if ([0, 3, 6, 8, 11, 14].includes(s)) chip('triangle', chord[0] - 12, t, len * 1.5, 0.22);
                if (s % 2 === 0) chip('square', chord[(s / 2) % chord.length] + 12, t, len * 1.6, 0.022);
                if (s % 4 === 0 && chance(0.6)) chip('square', walk(this.scale), t, len * (chance(0.4) ? 6 : 3), 0.04);
            }
        }
    ];
    const BARS_PER_TRACK = 16;

    function applyStation() {
        const st = STATIONS[music.station];
        if (!music.ctx) return;
        const now = music.ctx.currentTime;
        music.tone.frequency.setTargetAtTime(st.cutoff, now, 0.05);
        music.crackleGain.gain.setTargetAtTime(st.crackle ? 0.6 : 0, now, 0.05);
    }

    function scheduler() {
        const ctx = music.ctx;
        while (music.nextTime < ctx.currentTime + 0.25) {
            const st = STATIONS[music.station];
            const track = st.tracks[music.track % st.tracks.length];
            const len = 60 / st.bpm / 4;
            const swing = music.step % 2 === 1 ? len * st.swing : 0;
            st.play(music.step, music.nextTime + swing, track.prog[music.bar % track.prog.length], len);
            music.nextTime += len;
            music.step = (music.step + 1) % st.steps;
            if (music.step === 0) {
                music.bar++;
                if (music.bar % BARS_PER_TRACK === 0) {
                    music.track = (music.track + 1) % st.tracks.length;
                    notify();
                }
            }
        }
    }

    // ---------- Public API ----------
    const listeners = [];
    function notify() { listeners.forEach(fn => fn()); }

    function trackName() {
        const st = STATIONS[music.station];
        return st.tracks[music.track % st.tracks.length].name;
    }

    function setStation(which) {
        const i = typeof which === 'number' ? which : STATIONS.findIndex(st => st.id === which);
        if (i < 0 || i >= STATIONS.length) return;
        music.station = i;
        music.track = 0;
        music.bar = 0;
        music.step = 0;
        music.melody = Math.floor(STATIONS[i].scale.length / 2);
        applyStation();
        if (music.ctx) music.nextTime = music.ctx.currentTime + 0.05;
        notify();
    }

    function ensureAudio() {
        if (!music.ctx && !initAudio()) return false;
        if (music.ctx.state === 'suspended') music.ctx.resume();
        return true;
    }

    function setOn(on) {
        if (on && !ensureAudio()) return false;
        music.on = on;
        if (on) {
            music.master.gain.setTargetAtTime(music.volume * 0.5, music.ctx.currentTime, 0.1);
            music.nextTime = music.ctx.currentTime + 0.05;
            music.step = 0;
            clearInterval(music.timer);
            music.timer = setInterval(scheduler, 40);
        } else if (music.ctx) {
            clearInterval(music.timer);
            music.master.gain.setTargetAtTime(0, music.ctx.currentTime, 0.15);
        }
        notify();
        return true;
    }

    function setVolume(v) {
        music.volume = Math.max(0, Math.min(1, v));
        if (music.on && music.ctx) music.master.gain.setTargetAtTime(music.volume * 0.5, music.ctx.currentTime, 0.05);
    }

    // ---------- Sound effects ----------
    // Their own gain stage, so they play whether or not the music is on.
    let sfxOn = true;
    let sfxOut = null;
    function blip(type, from, to, dur, vol, time) {
        const ctx = music.ctx;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(from, time);
        o.frequency.exponentialRampToValueAtTime(to, time + dur);
        g.gain.setValueAtTime(vol, time);
        g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
        o.connect(g);
        g.connect(sfxOut);
        o.start(time);
        o.stop(time + dur + 0.02);
    }
    function crunch(freq, dur, vol, time) {
        const ctx = music.ctx;
        const src = ctx.createBufferSource();
        src.buffer = music.noise;
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.setValueAtTime(freq, time);
        f.frequency.exponentialRampToValueAtTime(120, time + dur);
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol, time);
        g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
        src.connect(f);
        f.connect(g);
        g.connect(sfxOut);
        src.start(time);
        src.stop(time + dur + 0.02);
    }
    // Fire: a breathy noise whoosh that sweeps up, plus a few crackles
    function whoosh(time) {
        const ctx = music.ctx;
        const src = ctx.createBufferSource();
        src.buffer = music.noise;
        src.playbackRate.value = 0.7;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.Q.value = 0.9;
        bp.frequency.setValueAtTime(350, time);
        bp.frequency.exponentialRampToValueAtTime(2600, time + 0.12);
        bp.frequency.exponentialRampToValueAtTime(700, time + 0.38);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, time);
        g.gain.exponentialRampToValueAtTime(0.55, time + 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, time + 0.4);
        src.connect(bp);
        bp.connect(g);
        g.connect(sfxOut);
        src.start(time);
        src.stop(time + 0.42);
        for (let i = 0; i < 4; i++) {
            const at = time + 0.03 + Math.random() * 0.3;
            pop(at, 3000 + Math.random() * 3000, 0.12 + Math.random() * 0.1);
        }
    }

    // A tiny high click, for fire crackle and flying debris
    function pop(time, freq, vol) {
        const ctx = music.ctx;
        const src = ctx.createBufferSource();
        src.buffer = music.noise;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol, time);
        g.gain.exponentialRampToValueAtTime(0.0001, time + 0.025);
        src.connect(hp);
        hp.connect(g);
        g.connect(sfxOut);
        src.start(time, Math.random() * 0.5);
        src.stop(time + 0.03);
    }

    // Explosion: sub thump, a distorted roar that darkens as it fades, then debris
    let shaper = null;
    function boom(time, big) {
        const ctx = music.ctx;
        if (!shaper) {
            shaper = ctx.createWaveShaper();
            const curve = new Float32Array(1024);
            for (let i = 0; i < curve.length; i++) {
                const x = i / (curve.length - 1) * 2 - 1;
                curve[i] = Math.tanh(x * 2.5) * 0.6;
            }
            shaper.curve = curve;
            shaper.connect(sfxOut);
        }
        const len = big ? 1.1 : 0.7;
        blip('sine', 140, 32, len * 0.7, big ? 0.45 : 0.32, time);
        blip('square', 90, 30, 0.12, 0.1, time);

        const src = ctx.createBufferSource();
        src.buffer = music.noise;
        src.loop = true;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(5000, time);
        lp.frequency.exponentialRampToValueAtTime(140, time + len);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, time);
        g.gain.exponentialRampToValueAtTime(0.4, time + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, time + len);
        src.connect(lp);
        lp.connect(g);
        g.connect(shaper);
        src.start(time);
        src.stop(time + len + 0.05);

        const debris = big ? 9 : 5;
        for (let i = 0; i < debris; i++) {
            pop(time + 0.08 + Math.random() * len * 0.6, 1500 + Math.random() * 3500, 0.05 + Math.random() * 0.07);
        }
    }

    function sfx(name) {
        if (!sfxOn || !ensureAudio()) return;
        if (!sfxOut) {
            sfxOut = music.ctx.createGain();
            sfxOut.gain.value = 0.5;
            sfxOut.connect(music.ctx.destination);
        }
        const t = music.ctx.currentTime + 0.005;
        switch (name) {
            case 'key':  blip('square', 1400, 1100, 0.03, 0.05, t); break;
            case 'miss': blip('square', 140, 90, 0.08, 0.08, t); break;
            case 'zap':
            case 'fire': whoosh(t); blip('triangle', 220, 520, 0.18, 0.06, t); break;
            case 'thud': crunch(2500, 0.25, 0.22, t); blip('sine', 120, 50, 0.2, 0.22, t); break;
            case 'boom': boom(t, false); break;
            case 'bigboom': boom(t, true); break;
            case 'hurt': blip('sawtooth', 300, 60, 0.4, 0.15, t); crunch(800, 0.3, 0.3, t); break;
            case 'wave': [523, 659, 784, 1047].forEach((f, i) => blip('square', f, f, 0.1, 0.06, t + i * 0.09)); break;
            case 'over': [392, 330, 262, 196].forEach((f, i) => blip('square', f, f * 0.98, 0.22, 0.07, t + i * 0.2)); break;
        }
    }

    window.OWTRadio = {
        stations: STATIONS.map(st => ({ id: st.id, label: st.label })),
        setOn,
        isOn: () => music.on,
        setStation,
        station: () => music.station,
        trackName,
        setVolume,
        onChange: fn => listeners.push(fn),
        sfx,
        setSfx: on => { sfxOn = on; }
    };
})();
