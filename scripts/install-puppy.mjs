#!/usr/bin/env node
/**
 * 把本仓库的 puppy 插件装进 DSH 的一个 profile。
 *
 * 做的事（幂等，可反复跑）：
 *   1. 备份 profile 的 package.json；
 *   2. dependencies 里写 `"puppy": "file:<本仓库 dsh-pet/dsh-pet>"`；
 *   3. dsh.profile.bundles 里补上 "puppy"；
 *   4. 在 node_modules 下建 junction 指向本仓库（改源码即时生效，无需重装）。
 *
 * 用法：
 *   node scripts/install-puppy.mjs [--profile desktop] [--home C:\\Users\\you\\.dsh] [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const dryRun = args.includes('--dry-run');
const profile = opt('profile', 'desktop');
const home = opt('home', process.env.DSH_HOME || path.join(os.homedir(), '.dsh'));
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pluginPath = path.join(repoRoot, 'dsh-pet');
const profileDir = path.join(home, 'profiles', profile);
const pkgPath = path.join(profileDir, 'package.json');

const log = (m) => console.log(`[install] ${m}`);

if (!fs.existsSync(pkgPath)) {
  console.error(`[install] 找不到 profile：${pkgPath}`);
  console.error('[install] 先跑一次 DSH（桌面版或 dsh web）生成 profile，再用 --profile 指定名字');
  process.exit(1);
}
if (!fs.existsSync(path.join(pluginPath, 'package.json'))) {
  console.error(`[install] 仓库里没有插件目录：${pluginPath}`);
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const before = JSON.stringify(pkg);
pkg.dependencies ??= {};
pkg.dependencies.puppy = `file:${pluginPath.replace(/\\/g, '/')}`;
pkg.dsh ??= {};
pkg.dsh.profile ??= {};
pkg.dsh.profile.bundles ??= [];
if (!pkg.dsh.profile.bundles.includes('puppy')) pkg.dsh.profile.bundles.push('puppy');
const changed = JSON.stringify(pkg) !== before;

log(`${dryRun ? '将修改' : '修改'} ${pkgPath}`);
log(`  dependencies.puppy = file:${pluginPath.replace(/\\/g, '/')}`);
log(`  dsh.profile.bundles = ${JSON.stringify(pkg.dsh.profile.bundles)}`);
if (changed && !dryRun) {
  fs.copyFileSync(pkgPath, `${pkgPath}.bak-puppy-${Date.now()}`);
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

const linkPath = path.join(profileDir, 'node_modules', 'puppy');
log(`${dryRun ? '将创建' : '创建'} junction ${linkPath} -> ${pluginPath}`);
if (!dryRun) {
  fs.mkdirSync(path.dirname(linkPath), { recursive: true });
  if (fs.existsSync(linkPath) || fs.lstatSync(linkPath, { throwIfNoEntry: false })) {
    const st = fs.lstatSync(linkPath);
    if (st.isSymbolicLink() || st.isDirectory()) fs.rmSync(linkPath, { recursive: true, force: true });
  }
  try {
    fs.symlinkSync(pluginPath, linkPath, 'junction');
  } catch (err) {
    log(`junction 失败（${err.message}），改用 cmd mklink`);
    execFileSync('cmd', ['/c', 'mklink', '/J', linkPath, pluginPath], { stdio: 'inherit' });
  }
}

log('完成。重启 DSH（关掉桌面应用再打开 / 重跑 dsh web）后生效。');
