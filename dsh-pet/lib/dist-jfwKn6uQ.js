import { __commonJS, __require } from "./chunk-BI7llAj_.js";

//#region node_modules/.pnpm/@andresaya+edge-tts@1.9.1/node_modules/@andresaya/edge-tts/dist/core/crypto.js
var require_crypto = __commonJS({ "node_modules/.pnpm/@andresaya+edge-tts@1.9.1/node_modules/@andresaya/edge-tts/dist/core/crypto.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.setWebCrypto = setWebCrypto;
	exports.webCrypto = webCrypto;
	let impl;
	function setWebCrypto(crypto) {
		impl = crypto;
	}
	function webCrypto() {
		const crypto = impl ?? globalThis.crypto;
		if (!crypto) throw new Error("Web Crypto is not available in this environment");
		return crypto;
	}
} });

//#endregion
//#region node_modules/.pnpm/@andresaya+edge-tts@1.9.1/node_modules/@andresaya/edge-tts/dist/config/constants.js
var require_constants = __commonJS({ "node_modules/.pnpm/@andresaya+edge-tts@1.9.1/node_modules/@andresaya/edge-tts/dist/config/constants.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Constants = void 0;
	const crypto_1$2 = require_crypto();
	exports.Constants = {
		TRUSTED_CLIENT_TOKEN: "6A5AA1D4EAFF4E9FB37E23D68491D6F4",
		BASE_URL: "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud",
		WSS_URL: "wss://api.msedgeservices.com/tts/cognitiveservices/websocket/v1",
		VOICES_URL: "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list",
		CHROMIUM_FULL_VERSION: "155.0.0.0",
		CHROMIUM_MAJOR_VERSION: "155",
		VERSION_MS_GEC: "1-155.0.4283.45",
		token32() {
			const bytes = new Uint8Array(16);
			(0, crypto_1$2.webCrypto)().getRandomValues(bytes);
			return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
		},
		getBaseHeaders() {
			return {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0",
				"Accept-Encoding": "gzip, deflate, br, zstd",
				"Accept-Language": "en-US,en;q=0.9",
				"Cookie": "MUID=" + this.token32()
			};
		},
		WSS_HEADERS: {
			"Pragma": "no-cache",
			"Cache-Control": "no-cache",
			"Origin": "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0"
		},
		VOICE_HEADERS: {
			"Sec-CH-UA": "\"Microsoft Edge\";v=\"155\", \"Chromium\";v=\"155\", \"Not(A:Brand\";v=\"24\"",
			"Sec-CH-UA-Mobile": "?0",
			"Sec-CH-UA-Platform": "\"Windows\"",
			"Accept": "*/*",
			"Sec-Fetch-Site": "none",
			"Sec-Fetch-Mode": "cors",
			"Sec-Fetch-Dest": "empty"
		},
		OUTPUT_FORMAT: {
			"AUDIO_24KHZ_48KBITRATE_MONO_MP3": "audio-24khz-48kbitrate-mono-mp3",
			"AUDIO_24KHZ_96KBITRATE_MONO_MP3": "audio-24khz-96kbitrate-mono-mp3",
			"WEBM_24KHZ_16BIT_MONO_OPUS": "webm-24khz-16bit-mono-opus"
		}
	};
} });

//#endregion
//#region node_modules/.pnpm/@andresaya+edge-tts@1.9.1/node_modules/@andresaya/edge-tts/dist/core/clock.js
var require_clock = __commonJS({ "node_modules/.pnpm/@andresaya+edge-tts@1.9.1/node_modules/@andresaya/edge-tts/dist/core/clock.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.now = now;
	exports.adjustClock = adjustClock;
	exports.resetClock = resetClock;
	let skewMs = 0;
	function now() {
		return Date.now() + skewMs;
	}
	function adjustClock(serverTimeMs) {
		const delta = serverTimeMs - now();
		if (!Number.isFinite(delta) || Math.abs(delta) < 2e3) return false;
		skewMs += delta;
		return true;
	}
	function resetClock() {
		skewMs = 0;
	}
} });

//#endregion
//#region node_modules/.pnpm/@andresaya+edge-tts@1.9.1/node_modules/@andresaya/edge-tts/dist/core/errors.js
var require_errors = __commonJS({ "node_modules/.pnpm/@andresaya+edge-tts@1.9.1/node_modules/@andresaya/edge-tts/dist/core/errors.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.EdgeTTSError = void 0;
	var EdgeTTSError = class extends Error {
		code;
		status;
		constructor(message, code, options = {}) {
			super(message, options.cause === void 0 ? void 0 : { cause: options.cause });
			this.name = "EdgeTTSError";
			this.code = code;
			if (options.status !== void 0) this.status = options.status;
		}
	};
	exports.EdgeTTSError = EdgeTTSError;
} });

//#endregion
//#region node_modules/.pnpm/@andresaya+edge-tts@1.9.1/node_modules/@andresaya/edge-tts/dist/core/protocol.js
var require_protocol = __commonJS({ "node_modules/.pnpm/@andresaya+edge-tts@1.9.1/node_modules/@andresaya/edge-tts/dist/core/protocol.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DEFAULT_OUTPUT_FORMAT = void 0;
	exports.buildSynthesisUrl = buildSynthesisUrl;
	exports.buildConfigMessage = buildConfigMessage;
	exports.buildSSMLMessage = buildSSMLMessage;
	exports.escapeXML = escapeXML;
	exports.buildSSML = buildSSML;
	exports.parseTextFrame = parseTextFrame;
	exports.parseBinaryFrame = parseBinaryFrame;
	exports.parseMetadata = parseMetadata;
	exports.sentenceTextRestorer = sentenceTextRestorer;
	exports.generateSecMsGec = generateSecMsGec;
	exports.generateUUID = generateUUID;
	exports.fileExtension = fileExtension;
	exports.estimateDuration = estimateDuration;
	exports.concatChunks = concatChunks;
	exports.normalizeVoices = normalizeVoices;
	const crypto_1$1 = require_crypto();
	exports.DEFAULT_OUTPUT_FORMAT = "audio-24khz-48kbitrate-mono-mp3";
	const decoder = new TextDecoder();
	function buildSynthesisUrl(base, token, secMsGec, version, connectionId) {
		return `${base}?Ocp-Apim-Subscription-Key=${token}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=${version}&ConnectionId=${connectionId}`;
	}
	function buildConfigMessage(timestamp$1, outputFormat) {
		return `X-Timestamp:${timestamp$1}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":true,"wordBoundaryEnabled":true},"outputFormat":"${outputFormat}"}}}}`;
	}
	function buildSSMLMessage(requestId, timestamp$1, ssml) {
		return `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${timestamp$1}\r\nPath:ssml\r\n\r\n${ssml}`;
	}
	function escapeXML(text) {
		return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
	}
	function buildSSML(text, voice, pitch, rate, volume) {
		return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
                    <voice name="${voice}">
                        <prosody pitch="${pitch}" rate="${rate}" volume="${volume}">
                            ${escapeXML(text)}
                        </prosody>
                    </voice>
                </speak>`;
	}
	function headerPath(head) {
		return /Path:([^\r\n]*)/i.exec(head)?.[1]?.trim() ?? "";
	}
	function parseTextFrame(text) {
		const split = text.indexOf("\r\n\r\n");
		if (split === -1) return {
			path: headerPath(text),
			body: ""
		};
		return {
			path: headerPath(text.slice(0, split)),
			body: text.slice(split + 4)
		};
	}
	function parseBinaryFrame(data) {
		if (data.length < 2) return {
			path: "",
			body: new Uint8Array(0)
		};
		const headerLength = data[0] << 8 | data[1];
		return {
			path: headerPath(decoder.decode(data.subarray(2, 2 + headerLength))),
			body: data.slice(2 + headerLength)
		};
	}
	function parseMetadata(body) {
		let metadata;
		try {
			metadata = JSON.parse(body);
		} catch {
			return [];
		}
		if (!Array.isArray(metadata?.Metadata)) return [];
		const boundaries = [];
		for (const item of metadata.Metadata) {
			if (item?.Type !== "WordBoundary" && item?.Type !== "SentenceBoundary") continue;
			boundaries.push({
				type: item.Type,
				offset: item.Data.Offset,
				duration: item.Data.Duration,
				text: item.Data.text?.Text
			});
		}
		return boundaries;
	}
	const OPENING_PUNCTUATION = "¿¡«\"'“‘([";
	function sentenceTextRestorer(source) {
		let cursor = 0;
		return (text) => {
			const index = text ? source.indexOf(text, cursor) : -1;
			if (index === -1) return text;
			let start = index;
			while (start > cursor && OPENING_PUNCTUATION.includes(source[start - 1])) start--;
			cursor = index + text.length;
			return source.slice(start, cursor);
		};
	}
	async function generateSecMsGec(trustedClientToken, nowMs) {
		const ticks = Math.floor(nowMs / 1e3) + 11644473600;
		const rounded = ticks - ticks % 300;
		const windowsTicks = rounded * 1e7;
		const data = new TextEncoder().encode(`${windowsTicks}${trustedClientToken}`);
		const hashBuffer = await (0, crypto_1$1.webCrypto)().subtle.digest("SHA-256", data);
		return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
	}
	function generateUUID() {
		return "xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
			const r = Math.random() * 16 | 0;
			const v = c === "x" ? r : r & 3 | 8;
			return v.toString(16);
		});
	}
	function fileExtension(format) {
		if (format.includes("mp3")) return "mp3";
		if (format.includes("opus") && format.includes("webm")) return "webm";
		if (format.includes("opus") && format.includes("ogg")) return "ogg";
		if (format.includes("wav") || format.includes("riff")) return "wav";
		if (format.includes("pcm") && format.includes("raw")) return "pcm";
		if (format.includes("alaw")) return "alaw";
		if (format.includes("mulaw")) return "mulaw";
		if (format.includes("truesilk")) return "silk";
		if (format.includes("g722")) return "g722";
		if (format.includes("amr")) return "amr";
		return "audio";
	}
	function estimateDuration(bytes, outputFormat) {
		const kbps = Number(/(\d+)kbitrate/.exec(outputFormat)?.[1] ?? 48);
		return bytes * 8 / (kbps * 1e3);
	}
	function concatChunks(chunks) {
		const result = new Uint8Array(chunks.reduce((total, chunk) => total + chunk.length, 0));
		let offset = 0;
		for (const chunk of chunks) {
			result.set(chunk, offset);
			offset += chunk.length;
		}
		return result;
	}
	function normalizeVoices(data) {
		const out = [];
		for (const v of data || []) {
			const short = v?.ShortName || "";
			const locale = v?.Locale || "";
			let base = short.replace(/^[a-z]{2}-[A-Z]{2}-/, "");
			base = base.replace(/NeuralHD$/, "").replace(/Neural$/, "").trim();
			const mix = `${v?.Name || ""} ${short}`;
			const voiceType = v?.VoiceType || (/NeuralHD/i.test(mix) ? "NeuralHD" : "Neural");
			const localeName = v?.LocaleName || locale || null;
			let display = v?.DisplayName || v?.FriendlyName || base || short;
			display = display.replace(/^Microsoft\s+/i, "");
			display = display.split(" - ")[0].trim();
			display = display.replace(/\s*Online\s*\(Natural\)\s*/i, " ");
			display = display.replace(/\s*Online\s*/i, " ");
			display = display.replace(/\s+/g, " ").trim();
			const tag = v?.VoiceTag && typeof v.VoiceTag === "object" ? v.VoiceTag : {};
			const tailored = Array.isArray(tag.TailoredScenarios) ? tag.TailoredScenarios : Array.isArray(tag.ContentCategories) ? tag.ContentCategories : [];
			const personalities = Array.isArray(tag.VoicePersonalities) ? tag.VoicePersonalities : [];
			out.push({
				Name: short || v?.Name || "",
				DisplayName: display,
				LocalName: display,
				ShortName: short || v?.Name || "",
				Gender: v?.Gender ?? null,
				Locale: locale || null,
				LocaleName: localeName,
				SecondaryLocaleList: Array.isArray(v?.SecondaryLocaleList) ? v.SecondaryLocaleList : [],
				VoiceType: voiceType,
				VoiceTag: {
					TailoredScenarios: tailored,
					VoicePersonalities: personalities
				},
				FriendlyName: `${display} (${voiceType}) - ${localeName}`
			});
		}
		return out;
	}
} });

//#endregion
//#region node_modules/.pnpm/@andresaya+edge-tts@1.9.1/node_modules/@andresaya/edge-tts/dist/core/session.js
var require_session = __commonJS({ "node_modules/.pnpm/@andresaya+edge-tts@1.9.1/node_modules/@andresaya/edge-tts/dist/core/session.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.closeError = closeError;
	exports.abortReason = abortReason;
	exports.runSession = runSession;
	const errors_1$3 = require_errors();
	const protocol_1$2 = require_protocol();
	const CONNECTING = 0;
	const OPEN = 1;
	const CLEAN_CLOSE_CODES = [
		1e3,
		1005,
		1006
	];
	/**
	* The error for a close the service started to refuse the request. It
	* sends code 1007 with a reason such as "Unsupported voice xx-XX-Nobody."
	*/
	function closeError(event) {
		const code = event?.code;
		if (typeof code !== "number" || CLEAN_CLOSE_CODES.includes(code)) return void 0;
		const reason = typeof event?.reason === "string" && event.reason !== "" ? event.reason : `close code ${code}`;
		return new errors_1$3.EdgeTTSError(`The service refused the request: ${reason}`, "REFUSED", { status: code });
	}
	function abortReason(signal) {
		if (signal.reason !== void 0) return signal.reason;
		const error = new Error("This operation was aborted");
		error.name = "AbortError";
		return error;
	}
	function toBytes(data) {
		if (data instanceof ArrayBuffer) return new Uint8Array(data);
		if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
		return new Uint8Array(0);
	}
	function runSession(open, options) {
		return new Promise((resolve, reject) => {
			if (options.signal?.aborted) {
				reject(abortReason(options.signal));
				return;
			}
			const socket = open();
			socket.binaryType = "arraybuffer";
			let settled = false;
			let opened = false;
			let timer;
			const finish = (error) => {
				if (settled) return;
				settled = true;
				clearTimeout(timer);
				options.signal?.removeEventListener("abort", onAbort);
				if (error === void 0) {
					resolve();
					return;
				}
				if (socket.readyState === CONNECTING || socket.readyState === OPEN) socket.close();
				reject(error);
			};
			const arm = () => {
				clearTimeout(timer);
				timer = setTimeout(() => {
					finish(new errors_1$3.EdgeTTSError("WebSocket inactivity timeout - no response from server", "TIMEOUT"));
				}, options.timeout);
			};
			const onAbort = () => finish(abortReason(options.signal));
			options.signal?.addEventListener("abort", onAbort, { once: true });
			arm();
			socket.onopen = () => {
				if (settled) return;
				opened = true;
				arm();
				socket.send(options.configMessage);
				socket.send(options.ssmlMessage);
			};
			socket.onmessage = (event) => {
				if (settled) return;
				arm();
				if (typeof event.data === "string") {
					const frame$1 = (0, protocol_1$2.parseTextFrame)(event.data);
					if (frame$1.path === "audio.metadata") for (const boundary of (0, protocol_1$2.parseMetadata)(frame$1.body)) options.onBoundary(boundary);
					else if (frame$1.path === "turn.end") socket.close();
					return;
				}
				const frame = (0, protocol_1$2.parseBinaryFrame)(toBytes(event.data));
				if (frame.path === "audio") options.onAudio(frame.body);
			};
			socket.onerror = (event) => finish(options.toError(event, opened));
			socket.onclose = (event) => finish(closeError(event));
		});
	}
} });

//#endregion
//#region node_modules/.pnpm/@andresaya+edge-tts@1.9.1/node_modules/@andresaya/edge-tts/dist/core/subtitles.js
var require_subtitles = __commonJS({ "node_modules/.pnpm/@andresaya+edge-tts@1.9.1/node_modules/@andresaya/edge-tts/dist/core/subtitles.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toSRT = toSRT;
	exports.toVTT = toVTT;
	function timestamp(ticks, separator) {
		const total = Math.max(0, Math.round(ticks / 1e4));
		const ms = total % 1e3;
		const s = Math.floor(total / 1e3) % 60;
		const m = Math.floor(total / 6e4) % 60;
		const h = Math.floor(total / 36e5);
		const pad = (n, width = 2) => String(n).padStart(width, "0");
		return `${pad(h)}:${pad(m)}:${pad(s)}${separator}${pad(ms, 3)}`;
	}
	function toSRT(cues) {
		return cues.map((cue, i) => `${i + 1}\n${timestamp(cue.offset, ",")} --> ${timestamp(cue.offset + cue.duration, ",")}\n${cue.text}\n`).join("\n");
	}
	function toVTT(cues) {
		const body = cues.map((cue) => `${timestamp(cue.offset, ".")} --> ${timestamp(cue.offset + cue.duration, ".")}\n${cue.text}\n`).join("\n");
		return `WEBVTT\n\n${body}`;
	}
} });

//#endregion
//#region node_modules/.pnpm/@andresaya+edge-tts@1.9.1/node_modules/@andresaya/edge-tts/dist/core/base.js
var require_base = __commonJS({ "node_modules/.pnpm/@andresaya+edge-tts@1.9.1/node_modules/@andresaya/edge-tts/dist/core/base.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.EdgeTTSCore = exports.NO_AUDIO_MESSAGE = void 0;
	exports.noAudioMessage = noAudioMessage;
	const constants_1$2 = require_constants();
	const clock_1$1 = require_clock();
	const errors_1$2 = require_errors();
	const protocol_1$1 = require_protocol();
	const session_1 = require_session();
	const subtitles_1$1 = require_subtitles();
	const DEFAULT_TIMEOUT = 3e4;
	const DEFAULT_VOICES_CACHE_TTL = 10 * 6e4;
	exports.NO_AUDIO_MESSAGE = "The service returned no audio. Voices are locale specific, so a voice cannot read text written in another script. Check that the voice matches the language of the text.";
	function noAudioMessage(outputFormat) {
		const supported = Object.values(constants_1$2.Constants.OUTPUT_FORMAT);
		if (supported.includes(outputFormat)) return exports.NO_AUDIO_MESSAGE;
		return `${exports.NO_AUDIO_MESSAGE} The output format "${outputFormat}" may also be the cause: the service is known to support ${supported.join(", ")}.`;
	}
	function collect(text, words, sentences) {
		const restore = (0, protocol_1$1.sentenceTextRestorer)(text);
		return (boundary) => {
			if (boundary.type === "WordBoundary") words.push(boundary);
			else sentences.push({
				...boundary,
				text: restore(boundary.text)
			});
		};
	}
	var EdgeTTSCore = class {
		audio_stream = [];
		output_format = protocol_1$1.DEFAULT_OUTPUT_FORMAT;
		word_boundaries = [];
		sentence_boundaries = [];
		options;
		voicesCache;
		constructor(options = {}) {
			this.options = { ...options };
		}
		async recoverHandshake() {
			return false;
		}
		signature() {
			return (0, protocol_1$1.generateSecMsGec)(constants_1$2.Constants.TRUSTED_CLIENT_TOKEN, (0, clock_1$1.now)());
		}
		async normalizeVoices(data) {
			return (0, protocol_1$1.normalizeVoices)(data);
		}
		async getVoices() {
			if (this.voicesCache && this.voicesCache.expires > Date.now()) return JSON.parse(JSON.stringify(this.voicesCache.voices));
			const secMsGEC = await this.signature();
			const url = `${this.options.voicesUrl ?? constants_1$2.Constants.VOICES_URL}?TrustedClientToken=${constants_1$2.Constants.TRUSTED_CLIENT_TOKEN}&Sec-MS-GEC=${secMsGEC}&Sec-MS-GEC-Version=${this.options.secMsGecVersion ?? constants_1$2.Constants.VERSION_MS_GEC}`;
			const voices = await this.normalizeVoices(await this.requestVoices(url));
			const ttl = this.options.voicesCacheTtl ?? DEFAULT_VOICES_CACHE_TTL;
			if (ttl > 0) this.voicesCache = {
				expires: Date.now() + ttl,
				voices: JSON.parse(JSON.stringify(voices))
			};
			return voices;
		}
		async getVoicesByLanguage(locale) {
			const voices = await this.getVoices();
			return voices.filter((voice) => voice.Locale?.startsWith(locale));
		}
		async getVoicesByGender(gender) {
			const voices = await this.getVoices();
			return voices.filter((voice) => voice.Gender === gender);
		}
		async synthesize(text, voice = this.defaultVoice, options = {}) {
			const audio = [];
			const words = [];
			const sentences = [];
			this.audio_stream = audio;
			this.word_boundaries = words;
			this.sentence_boundaries = sentences;
			this.output_format = options.outputFormat || protocol_1$1.DEFAULT_OUTPUT_FORMAT;
			await this.run(text, voice, options, (chunk) => audio.push(chunk), collect(text, words, sentences));
		}
		async *synthesizeStream(text, voice = this.defaultVoice, options = {}) {
			const audio = [];
			const words = [];
			const sentences = [];
			this.audio_stream = audio;
			this.word_boundaries = words;
			this.sentence_boundaries = sentences;
			this.output_format = options.outputFormat || protocol_1$1.DEFAULT_OUTPUT_FORMAT;
			const controller = new AbortController();
			const forwardAbort = () => controller.abort((0, session_1.abortReason)(options.signal));
			if (options.signal?.aborted) forwardAbort();
			else options.signal?.addEventListener("abort", forwardAbort, { once: true });
			const queue = [];
			let wake = null;
			let done = false;
			let failure;
			const notify = () => {
				wake?.();
				wake = null;
			};
			this.run(text, voice, {
				...options,
				signal: controller.signal
			}, (chunk) => {
				audio.push(chunk);
				queue.push(chunk);
				notify();
			}, collect(text, words, sentences)).then(() => {
				done = true;
				notify();
			}, (error) => {
				failure = error;
				done = true;
				notify();
			});
			try {
				while (!done || queue.length > 0) {
					if (queue.length === 0) {
						await new Promise((resolve) => wake = resolve);
						continue;
					}
					yield queue.shift();
				}
				if (failure !== void 0) throw failure;
			} finally {
				options.signal?.removeEventListener("abort", forwardAbort);
				if (!done) controller.abort();
			}
		}
		async generate(text, voice = this.defaultVoice, options = {}) {
			const chunks = [];
			const words = [];
			const sentences = [];
			await this.run(text, voice, options, (chunk) => chunks.push(chunk), collect(text, words, sentences));
			const audio = (0, protocol_1$1.concatChunks)(chunks);
			const outputFormat = options.outputFormat || protocol_1$1.DEFAULT_OUTPUT_FORMAT;
			if (audio.length === 0) throw new errors_1$2.EdgeTTSError(noAudioMessage(outputFormat), "NO_AUDIO");
			return {
				audio,
				format: (0, protocol_1$1.fileExtension)(outputFormat),
				outputFormat,
				wordBoundaries: words,
				sentenceBoundaries: sentences,
				duration: (0, protocol_1$1.estimateDuration)(audio.length, outputFormat)
			};
		}
		getWordBoundaries() {
			return this.word_boundaries;
		}
		getSentenceBoundaries() {
			return this.sentence_boundaries;
		}
		toSRT() {
			return (0, subtitles_1$1.toSRT)(this.sentence_boundaries.length > 0 ? this.sentence_boundaries : this.word_boundaries);
		}
		toVTT() {
			return (0, subtitles_1$1.toVTT)(this.sentence_boundaries.length > 0 ? this.sentence_boundaries : this.word_boundaries);
		}
		async run(text, voice, options, onAudio, onBoundary) {
			if (text.trim() === "") throw new errors_1$2.EdgeTTSError("The text is empty.", "INVALID_OPTION");
			const ssml = this.buildSSML(text, voice, options);
			const outputFormat = options.outputFormat || protocol_1$1.DEFAULT_OUTPUT_FORMAT;
			const attempt = async () => {
				const requestId = (0, protocol_1$1.generateUUID)();
				const url = (0, protocol_1$1.buildSynthesisUrl)(this.options.wssUrl ?? constants_1$2.Constants.WSS_URL, constants_1$2.Constants.TRUSTED_CLIENT_TOKEN, await this.signature(), this.options.secMsGecVersion ?? constants_1$2.Constants.VERSION_MS_GEC, requestId);
				await (0, session_1.runSession)(() => this.openSocket(url), {
					configMessage: (0, protocol_1$1.buildConfigMessage)(this.timestamp(), outputFormat),
					ssmlMessage: (0, protocol_1$1.buildSSMLMessage)(requestId, this.timestamp(), ssml),
					timeout: options.timeout ?? this.options.timeout ?? DEFAULT_TIMEOUT,
					signal: options.signal,
					onAudio,
					onBoundary,
					toError: (event, opened) => this.socketError(event, opened)
				});
			};
			try {
				await attempt();
			} catch (error) {
				if (!(error instanceof errors_1$2.EdgeTTSError && error.code === "HANDSHAKE")) throw error;
				if (!await this.recoverHandshake()) throw error;
				await attempt();
			}
		}
	};
	exports.EdgeTTSCore = EdgeTTSCore;
} });

//#endregion
//#region node_modules/.pnpm/@andresaya+edge-tts@1.9.1/node_modules/@andresaya/edge-tts/dist/services/EdgeTTS.js
var require_EdgeTTS = __commonJS({ "node_modules/.pnpm/@andresaya+edge-tts@1.9.1/node_modules/@andresaya/edge-tts/dist/services/EdgeTTS.js"(exports) {
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.EdgeTTS = void 0;
	const ws_1 = __importDefault(__require("ws"));
	const constants_1$1 = require_constants();
	const promises_1 = __require("fs/promises");
	const buffer_1 = __require("buffer");
	const http_1 = __importDefault(__require("http"));
	const https_1 = __importDefault(__require("https"));
	const crypto_1 = __require("crypto");
	const base_1 = require_base();
	const clock_1 = require_clock();
	const crypto_2 = require_crypto();
	const errors_1$1 = require_errors();
	const protocol_1 = require_protocol();
	if (!globalThis.crypto) (0, crypto_2.setWebCrypto)(crypto_1.webcrypto);
	var EdgeTTS = class extends base_1.EdgeTTSCore {
		defaultVoice = "en-US-AnaNeural";
		ws;
		constructor(options = {}) {
			super(options);
		}
		generateSecMsGec = async (trustedClientToken) => {
			return (0, protocol_1.generateSecMsGec)(trustedClientToken, (0, clock_1.now)());
		};
		async generate(text, voice, options) {
			const result = await super.generate(text, voice, options);
			return {
				...result,
				audio: buffer_1.Buffer.from(result.audio.buffer, result.audio.byteOffset, result.audio.byteLength)
			};
		}
		openSocket(url) {
			this.ws = new ws_1.default(url, { headers: {
				...constants_1$1.Constants.getBaseHeaders(),
				...constants_1$1.Constants.WSS_HEADERS,
				...this.options.headers
			} });
			return this.ws;
		}
		requestVoices(url) {
			const headers = {
				...constants_1$1.Constants.getBaseHeaders(),
				...constants_1$1.Constants.VOICE_HEADERS,
				...this.options.headers,
				"Accept-Encoding": "identity"
			};
			const client = url.startsWith("http:") ? http_1.default : https_1.default;
			return new Promise((resolve, reject) => {
				const req = client.request(url, {
					method: "GET",
					headers
				}, (res) => {
					const chunks = [];
					res.on("data", (chunk) => chunks.push(buffer_1.Buffer.isBuffer(chunk) ? chunk : buffer_1.Buffer.from(chunk)));
					res.on("error", reject);
					res.on("end", () => {
						const body = buffer_1.Buffer.concat(chunks).toString("utf8");
						if (res.statusCode !== 200) {
							reject(new errors_1$1.EdgeTTSError(`Voice list request failed with status ${res.statusCode}`, "VOICES", { status: res.statusCode }));
							return;
						}
						try {
							const parsed = JSON.parse(body);
							const voices = Array.isArray(parsed) ? parsed : parsed.voices || parsed.Voices || [];
							resolve(Array.isArray(voices) ? voices : []);
						} catch (e) {
							reject(new errors_1$1.EdgeTTSError("Invalid voice list JSON: " + (e?.message || String(e)), "VOICES", { cause: e }));
						}
					});
				});
				req.on("error", reject);
				req.end();
			});
		}
		buildSSML(text, voice, options) {
			const pitch = this.validatePitch(options.pitch ?? 0);
			const rate = this.validateRate(options.rate ?? 0);
			const volume = this.validateVolume(options.volume ?? 0);
			return (0, protocol_1.buildSSML)(text, voice, pitch, rate, volume);
		}
		timestamp() {
			return this.nowRFC1123();
		}
		socketError(event, opened) {
			const { error, message } = event;
			const cause = error instanceof Error ? error : new Error(message || "WebSocket error");
			if (opened || cause.code !== void 0) return cause;
			const status = /Unexpected server response: (\d{3})/.exec(cause.message)?.[1];
			return new errors_1$1.EdgeTTSError(cause.message, "HANDSHAKE", {
				status: status ? Number(status) : void 0,
				cause
			});
		}
		async recoverHandshake() {
			const serverTime = await this.serverTime();
			return serverTime !== void 0 && (0, clock_1.adjustClock)(serverTime);
		}
		serverTime() {
			const origin = new URL((this.options.wssUrl ?? constants_1$1.Constants.WSS_URL).replace(/^ws/, "http")).origin + "/";
			const client = origin.startsWith("http:") ? http_1.default : https_1.default;
			return new Promise((resolve) => {
				const req = client.request(origin, {
					method: "HEAD",
					timeout: 1e4
				}, (res) => {
					res.resume();
					const date = Date.parse(res.headers.date ?? "");
					resolve(Number.isNaN(date) ? void 0 : date);
				});
				req.on("timeout", () => req.destroy());
				req.on("error", () => resolve(void 0));
				req.end();
			});
		}
		validatePitch(pitch) {
			if (typeof pitch === "number") return pitch >= 0 ? `+${pitch}Hz` : `${pitch}Hz`;
			if (!/^[+-]?\d{1,3}(?:\.\d+)?Hz$/.test(pitch)) throw new errors_1$1.EdgeTTSError("Invalid pitch format. Expected format: '-100Hz to +100Hz' or a number.", "INVALID_OPTION");
			return pitch;
		}
		validateRate(rate) {
			let rateValue;
			if (typeof rate === "string") {
				rateValue = parseFloat(rate.replace("%", ""));
				if (isNaN(rateValue)) throw new errors_1$1.EdgeTTSError("Invalid rate format.", "INVALID_OPTION");
			} else rateValue = rate;
			if (rateValue >= 0) return `+${rateValue}%`;
			return `${rateValue}%`;
		}
		validateVolume(volume) {
			let volumeValue;
			if (typeof volume === "string") {
				volumeValue = parseInt(volume.replace("%", ""), 10);
				if (isNaN(volumeValue)) throw new errors_1$1.EdgeTTSError("Invalid volume format.", "INVALID_OPTION");
			} else volumeValue = volume;
			if (volumeValue < -100 || volumeValue > 100) throw new errors_1$1.EdgeTTSError("Invalid volume. Expected a value from -100% to 100%.", "INVALID_OPTION");
			return `${volumeValue}%`;
		}
		nowRFC1123(timeZone = "UTC") {
			const now$1 = new Date();
			const options = {
				weekday: "short",
				year: "numeric",
				month: "short",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				timeZone,
				timeZoneName: "short"
			};
			return now$1.toLocaleString("en-US", options);
		}
		getDuration() {
			if (this.audio_stream.length === 0) throw new errors_1$1.EdgeTTSError("No audio data available", "NO_AUDIO");
			return (0, protocol_1.estimateDuration)(this.toBuffer().length, this.output_format);
		}
		getAudioInfo() {
			const buffer = this.toBuffer();
			return {
				size: buffer.length,
				format: (0, protocol_1.fileExtension)(this.output_format),
				estimatedDuration: this.getDuration()
			};
		}
		async toFile(outputPath, format) {
			if (!format) format = (0, protocol_1.fileExtension)(this.output_format);
			const audioBuffer = this.toBuffer();
			const finalPath = outputPath.toLowerCase().endsWith(`.${format.toLowerCase()}`) ? outputPath : `${outputPath}.${format}`;
			await (0, promises_1.writeFile)(finalPath, new Uint8Array(audioBuffer));
			return finalPath;
		}
		toRaw() {
			return this.toBase64();
		}
		toBase64() {
			return this.toBuffer().toString("base64");
		}
		toBuffer() {
			if (this.audio_stream.length === 0) throw new errors_1$1.EdgeTTSError("No audio data available. Did you run synthesize() first?", "NO_AUDIO");
			const buffer = buffer_1.Buffer.concat(this.audio_stream);
			if (buffer.length === 0) throw new errors_1$1.EdgeTTSError((0, base_1.noAudioMessage)(this.output_format), "NO_AUDIO");
			return buffer;
		}
		async saveMetadata(outputPath) {
			if (this.word_boundaries.length === 0) throw new Error("No metadata available to save.");
			const json = JSON.stringify(this.word_boundaries, null, 4);
			await (0, promises_1.writeFile)(outputPath, json);
		}
	};
	exports.EdgeTTS = EdgeTTS;
} });

//#endregion
//#region node_modules/.pnpm/@andresaya+edge-tts@1.9.1/node_modules/@andresaya/edge-tts/dist/index.js
var require_dist = __commonJS({ "node_modules/.pnpm/@andresaya+edge-tts@1.9.1/node_modules/@andresaya/edge-tts/dist/index.js"(exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toVTT = exports.toSRT = exports.EdgeTTSError = exports.Constants = exports.EdgeTTS = void 0;
	var EdgeTTS_1 = require_EdgeTTS();
	Object.defineProperty(exports, "EdgeTTS", {
		enumerable: true,
		get: function() {
			return EdgeTTS_1.EdgeTTS;
		}
	});
	var constants_1 = require_constants();
	Object.defineProperty(exports, "Constants", {
		enumerable: true,
		get: function() {
			return constants_1.Constants;
		}
	});
	var errors_1 = require_errors();
	Object.defineProperty(exports, "EdgeTTSError", {
		enumerable: true,
		get: function() {
			return errors_1.EdgeTTSError;
		}
	});
	var subtitles_1 = require_subtitles();
	Object.defineProperty(exports, "toSRT", {
		enumerable: true,
		get: function() {
			return subtitles_1.toSRT;
		}
	});
	Object.defineProperty(exports, "toVTT", {
		enumerable: true,
		get: function() {
			return subtitles_1.toVTT;
		}
	});
} });

//#endregion
export default require_dist();
