import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

//#region src/host/paths.ts
const PACKAGE_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PACKAGE_ROOT_ASSETS = join(PACKAGE_ROOT, "assets");
const PACKAGE_MEMES_DIR = join(PACKAGE_ROOT_ASSETS, "memes");

//#endregion
//#region src/host/fetch-json.ts
/**
* 出站 JSON GET 的唯一入口：带超时与一次重试，非 2xx 与解析失败一律抛错。
*
* 天气与定位共用这里；余额那份自带 Bearer 头，不强行合并。
* 始终成立：成功时返回已解析的 JSON 值；错误文案只带端点名与状态码，不带完整 URL 与响应体。
* @module dsh-pet/src/host/fetch-json
*/
/** 单次请求超时（ms）：境外接口冷启动实测 3~6s，留足余量。 */
const TIMEOUT_MS = 15e3;
/** 失败重试次数：只补一次网络抖动，再多会把一次查询拖到半分钟。 */
const RETRIES = 1;
/** 重试前的等待（ms）。 */
const RETRY_DELAY_MS = 400;
var FetchJsonError = class extends Error {
	/**
	* @param code - 失败分类。
	* @param message - 给日志与用户看的一句话，不得含查询参数与响应体。
	* @param cause - 原始异常，便于排查。
	*/
	constructor(code, message, cause) {
		super(message, { cause });
		this.name = "FetchJsonError";
		this.code = code;
	}
};
async function fetchJson(url, options) {
	const fetchImpl = options.fetchImpl ?? fetch;
	const sleep = options.sleep ?? delayOf;
	const timeoutMs = options.timeoutMs ?? TIMEOUT_MS;
	let last;
	for (let attempt = 0; attempt <= RETRIES; attempt++) try {
		return await fetchOnce(fetchImpl, url, timeoutMs, options.label);
	} catch (e) {
		last = e instanceof FetchJsonError ? e : new FetchJsonError("network", options.label + " 请求失败", e);
		if (last.code !== "timeout" && last.code !== "network" || attempt === RETRIES) break;
		await sleep(RETRY_DELAY_MS);
	}
	throw last ?? new FetchJsonError("network", options.label + " 请求失败");
}
/** 单次抓取：区分超时、状态码、JSON 语法与传输错误。 */
async function fetchOnce(fetchImpl, url, timeoutMs, label) {
	const signal = AbortSignal.timeout(timeoutMs);
	let response;
	try {
		response = await fetchImpl(url, {
			signal,
			headers: { "user-agent": "dsh-pet" }
		});
	} catch (e) {
		const timedOut = signal.aborted || e instanceof Error && e.name === "TimeoutError";
		throw new FetchJsonError(timedOut ? "timeout" : "network", label + (timedOut ? " 请求超时" : " 请求失败"), e);
	}
	if (!response.ok) throw new FetchJsonError("http-status", label + " 返回 HTTP " + response.status);
	try {
		return await response.json();
	} catch (e) {
		if (signal.aborted || e instanceof Error && e.name === "TimeoutError") throw new FetchJsonError("timeout", label + " 请求超时", e);
		if (e instanceof SyntaxError) throw new FetchJsonError("bad-json", label + " 返回的不是 JSON", e);
		throw new FetchJsonError("network", label + " 响应读取失败", e);
	}
}
/** 缺省等待实现。 */
function delayOf(ms) {
	return new Promise((resolve$1) => setTimeout(resolve$1, ms));
}

//#endregion
//#region src/host/update-check.ts
const DEFAULT_INDEX_URL = "https://raw.githubusercontent.com/Agelei19/dsh-pet-puppy/puppy/market/index.json";
/** 本仓库在索引里的插件名。 */
const PLUGIN_NAME = "puppy";
function readLocalVersion() {
	try {
		const raw = readFileSync(join(PACKAGE_ROOT, "package.json"), "utf8");
		const pkg = JSON.parse(raw);
		return typeof pkg.version === "string" && pkg.version ? pkg.version : "0.0.0";
	} catch {
		return "0.0.0";
	}
}
function compareVersions(a, b) {
	const parse = (v) => v.split("-")[0].split(".").map((part) => {
		const n = Number.parseInt(part, 10);
		return Number.isFinite(n) ? n : 0;
	});
	const left = parse(a);
	const right = parse(b);
	for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
		const d = (left[i] ?? 0) - (right[i] ?? 0);
		if (d !== 0) return d;
	}
	return 0;
}
function latestVersionOf(index) {
	const plugins = index?.plugins;
	if (!Array.isArray(plugins)) return null;
	const entry = plugins.find((p) => p && p.name === PLUGIN_NAME) ?? null;
	if (!entry || !Array.isArray(entry.versions)) return null;
	const versions = entry.versions.map((v) => v && typeof v.version === "string" ? v.version : "").filter((v) => v !== "");
	if (versions.length === 0) return null;
	return versions.reduce((best, v) => compareVersions(v, best) > 0 ? v : best, versions[0]);
}
async function checkUpdate(options = {}) {
	const indexUrl = options.indexUrl ?? DEFAULT_INDEX_URL;
	const current = options.current ?? readLocalVersion();
	try {
		const index = await fetchJson(indexUrl, {
			label: "plugin-index",
			fetchImpl: options.fetchImpl
		});
		const latest = latestVersionOf(index);
		if (latest === null || compareVersions(latest, current) <= 0) return null;
		return {
			current,
			latest,
			url: "https://github.com/Agelei19/dsh-pet-puppy"
		};
	} catch {
		return null;
	}
}

//#endregion
export { DEFAULT_INDEX_URL, PACKAGE_MEMES_DIR, PACKAGE_ROOT, checkUpdate, compareVersions, fetchJson, latestVersionOf, readLocalVersion };