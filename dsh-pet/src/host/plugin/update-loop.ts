/**
 * 版本检查的定时循环：启动后延迟一拍、之后每 24 小时查一次，有新版本就弹一条系统通知。
 *
 * 同一个新版本只提示一次（进程内记住已提示的版本），避免每次定时都刷同一条 toast。
 * 网络失败静默：查不到就不提示，不写日志噪音以外的任何状态。
 * @module dsh-pet/src/host/plugin/update-loop
 */
import { checkUpdate, type UpdateInfo } from '../update-check.ts';
import type { HostContext } from './context.ts';
import type { HostSetup } from './setup.ts';

/** 首次检查的延迟（ms）：先让宿主把界面拉起来，别和启动抢带宽。 */
const FIRST_DELAY_MS = 20_000;

/** 检查周期（ms）：一天一次，够用且不烦人。 */
const PERIOD_MS = 24 * 60 * 60 * 1000;

/** 定时循环的输入。 */
export type UpdateLoopInput = {
  /** 宿主上下文（apply 收到的那一个）。 */
  ctx: HostContext;
} & Pick<HostSetup, 'log'> &
  Pick<HostSetup, 'state'> & {
    /** 注入的检查函数（测试用）；缺省用 {@link checkUpdate}。 */
    check?: () => Promise<UpdateInfo | null>;
  };

/**
 * 注册版本检查循环。
 *
 * @param deps - 宿主上下文、日志、状态写入口与可选的检查函数。
 */
export function registerUpdateLoop(deps: UpdateLoopInput): void {
  const { ctx, log, state } = deps;
  const check = deps.check ?? ((): Promise<UpdateInfo | null> => checkUpdate());
  ctx.effect(() => {
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let notified: string | null = null;

    async function tick(): Promise<void> {
      try {
        const info = await check();
        if (disposed) return;
        if (info && info.latest !== notified) {
          notified = info.latest;
          // 与宿主其它通知同槽：浏览器轮询 /state 后弹 toast，不额外开一条通道。
          state.writeSection('notify', {
            type: 'plugin/update',
            current: info.current,
            latest: info.latest,
            url: info.url,
          });
          log.info('[puppy] 发现新版本 ' + info.latest + '（当前 ' + info.current + '）');
        }
      } catch (e) {
        log.warn('[puppy] 版本检查失败：' + (e instanceof Error ? e.message : String(e)));
      } finally {
        if (!disposed) timer = setTimeout(() => void tick(), PERIOD_MS);
      }
    }

    timer = setTimeout(() => void tick(), FIRST_DELAY_MS);
    return () => {
      disposed = true;
      if (timer !== null) clearTimeout(timer);
    };
  }, 'puppy: update check');
}
