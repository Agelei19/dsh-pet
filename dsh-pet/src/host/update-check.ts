/**
 * 版本检查：读本地包版本，去插件市场索引里取最新版本，判断要不要提示升级。
 *
 * 只做「读版本 + 比大小 + 抓索引」，不发通知、不定时——节奏与气泡归 plugin/update-loop。
 * 索引是格式 1 的市场索引（`plugins[].versions[]`），抓不到、格式不对、没有插件条目
 * 一律当作「查不到」，绝不因此报错或弹假提示。
 * @module dsh-pet/src/host/update-check
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fetchJson } from './fetch-json.ts';
import { PACKAGE_ROOT } from './paths.ts';

/** 默认索引地址：本 fork 的 puppy 分支索引。 */
export const DEFAULT_INDEX_URL = 'https://raw.githubusercontent.com/Agelei19/dsh-pet-puppy/puppy/market/index.json';

/** 本仓库在索引里的插件名。 */
const PLUGIN_NAME = 'puppy';

/** 一次检查的结果。 */
export interface UpdateInfo {
  /** 本地版本。 */
  current: string;
  /** 索引里的最新版本。 */
  latest: string;
  /** 插件主页（弹窗里点开用）。 */
  url: string;
}

/** 索引里只关心这几个字段；其余宽松忽略。 */
interface MarketIndexLike {
  plugins?: Array<{ name?: unknown; homepage?: unknown; versions?: Array<{ version?: unknown }> } | null> | null;
}

/**
 * 读本地包版本。
 *
 * @returns `package.json` 的 version；读不到或形状不对时回 `0.0.0`（比任何真实版本都旧，
 *   只影响「要不要提示」，不会导致崩溃）。
 */
export function readLocalVersion(): string {
  try {
    const raw = readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8');
    const pkg = JSON.parse(raw) as { version?: unknown };
    return typeof pkg.version === 'string' && pkg.version ? pkg.version : '0.0.0';
  } catch {
    return '0.0.0';
  }
}

/**
 * 比较两个语义化版本。
 *
 * 只比 `x.y.z` 数字段（预发布后缀按「没有后缀」处理：`1.2.3-beta` 与 `1.2.3` 视为同级）。
 *
 * @param a - 左值。
 * @param b - 右值。
 * @returns `a<b` 返回负数，相等 0，`a>b` 正数。
 */
export function compareVersions(a: string, b: string): number {
  const parse = (v: string): number[] =>
    v
      .split('-')[0]
      .split('.')
      .map((part) => {
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

/**
 * 从市场索引里取本插件的最高版本。
 *
 * @param index - 已解析的索引 JSON。
 * @returns 最高版本号；找不到插件条目或版本时 `null`。
 */
export function latestVersionOf(index: unknown): string | null {
  const plugins = (index as MarketIndexLike | null)?.plugins;
  if (!Array.isArray(plugins)) return null;
  const entry = plugins.find((p) => p && p.name === PLUGIN_NAME) ?? null;
  if (!entry || !Array.isArray(entry.versions)) return null;
  const versions = entry.versions
    .map((v) => (v && typeof v.version === 'string' ? v.version : ''))
    .filter((v): v is string => v !== '');
  if (versions.length === 0) return null;
  return versions.reduce((best, v) => (compareVersions(v, best) > 0 ? v : best), versions[0] as string);
}

/** 检查用的依赖。 */
export interface CheckUpdateOptions {
  /** 索引地址；缺省用 {@link DEFAULT_INDEX_URL}。 */
  indexUrl?: string;
  /** 本地版本；缺省现读 `package.json`。 */
  current?: string;
  /** 注入的 fetch（测试用）。 */
  fetchImpl?: typeof fetch;
}

/**
 * 查一次有没有新版本。
 *
 * @param options - 索引地址、本地版本与 fetch 注入。
 * @returns 有新版本时返回 `{ current, latest, url }`；没有、或查询失败 / 索引非法时 `null`。
 */
export async function checkUpdate(options: CheckUpdateOptions = {}): Promise<UpdateInfo | null> {
  const indexUrl = options.indexUrl ?? DEFAULT_INDEX_URL;
  const current = options.current ?? readLocalVersion();
  try {
    const index = await fetchJson(indexUrl, { label: 'plugin-index', fetchImpl: options.fetchImpl });
    const latest = latestVersionOf(index);
    if (latest === null || compareVersions(latest, current) <= 0) return null;
    return { current, latest, url: 'https://github.com/Agelei19/dsh-pet-puppy' };
  } catch {
    return null;
  }
}
