/**
 * 贴边收起：静置一段时间后自己溜到最近的屏幕边缘，只露一小截，之后隔一会儿探头探脑。
 * 判定只用指针与拖拽状态；位置提交仍走 `setCustomPos`（归一化中心），与其它运动驱动同一出口。
 * 四边各有一条探头动画：配置里存在同名动作才播，没有就只是挂在那里不动。
 * @module dsh-pet/src/client/pet/card/dock
 */
import { boxToRatio, clampReachableBox } from '../motion/geometry.ts';
import type { Center } from '../motion/geometry.ts';
import type { CardMotion } from './motion.ts';
import type { CardStateApi } from './state.ts';
import type { RuntimePet } from '../types.ts';
import type * as ReactNS from 'react';

/** 四条边。 */
export type DockEdge = 'left' | 'right' | 'top' | 'bottom';

/** 各边的探头动作名（与入包素材的中文名一致）。 */
const PEEK_ANIM: Record<DockEdge, string> = {
  bottom: '探头往下',
  left: '探头往左',
  right: '探头往右',
  top: '探头往上',
};

/** 静置多久开始贴边。 */
const IDLE_MS = 30_000;
/** 贴边后多久探一次头。 */
const PEEK_MS = 11_000;
/** 探头动作播多久后缩回去。 */
const PEEK_HOLD_MS = 2_600;
/** 贴边后命中区留在屏幕内的宽度（px）：比 MIN_REACHABLE_PX 多一点，够点到。 */
const VISIBLE_PX = 58;
/** 探头的位移幅度（px）：往屏幕里探出来一点点。 */
const PEEK_SHIFT = 16;

/** 注入的 react 能力。 */
export interface DockRuntime {
  /** 副作用；计时器随卡片卸载清掉。 */
  useEffect: (effect: ReactNS.EffectCallback, deps?: ReactNS.DependencyList) => void;
  /** 引用；跨渲染保存收起状态与计时器。 */
  useRef: <T>(initial: T) => ReactNS.MutableRefObject<T>;
}

/** 贴边收起的输入。 */
export interface DockInput {
  /** 卡状态：位置提交与当帧尺寸。 */
  card: CardStateApi;
  /** 成品配置的最新值：取动画池。 */
  cfgRef: ReactNS.MutableRefObject<RuntimePet>;
  /** 装配根迟绑槽：读睡觉状态。 */
  live: ReactNS.MutableRefObject<{ flow?: { sleeping: () => boolean } | undefined }>;
  /** 运动面：读当前盒、停走位、写盒。 */
  motion: CardMotion;
  /** 当帧几何（与运动面同一份）。 */
  metrics: { bottomPad: number; halfH: number; halfW: number; size: number };
  /** 提交归一化中心。 */
  setCustomPos: CardStateApi['actions']['setCustomPos'];
  /** 换动画。 */
  setAnim: (anim: string) => void;
  /** 只播一次。 */
  setOnce: (on: boolean) => void;
  /** 指针是否停在宠物上。 */
  isHovered: () => boolean;
  /** 拖拽中或刚拖完。 */
  isBusy: () => boolean;
}

/** 贴边收起的对外面。 */
export interface Dock {
  /** 指针进入或用户操作：立刻收回并重排计时。 */
  wake: () => void;
  /** 只重排静置计时（拖着、点着的时候不收起）。 */
  reset: () => void;
}

/**
 * 造贴边收起的 hook。
 *
 * @param rt - 注入的 react 能力。
 * @returns 接收装配输入的 hook，返回唤醒与重置两个入口。
 */
export function createCardDock(rt: DockRuntime) {
  const { useEffect, useRef } = rt;

  return function useCardDock(input: DockInput): Dock {
    // 每次渲染都新建闭包，计时器里只读最新的那一份。
    const apiRef = useRef(input);
    apiRef.current = input;
    // 收起状态：记住收在哪条边、收起前的位置，回来时原样放回。
    const dockedRef = useRef<{ back: Center; edge: DockEdge } | null>(null);
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const peekTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const peekBackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /** 清掉全部计时器。 */
    const clearTimers = (): void => {
      if (idleTimerRef.current !== null) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      if (peekTimerRef.current !== null) {
        clearInterval(peekTimerRef.current);
        peekTimerRef.current = null;
      }
      if (peekBackTimerRef.current !== null) {
        clearTimeout(peekBackTimerRef.current);
        peekBackTimerRef.current = null;
      }
    };

    /** 现在这只能不能自己躲到边上：悬停、拖拽、睡觉都不收。 */
    const canDock = (): boolean => {
      const api = apiRef.current;
      if (api.isBusy() || api.isHovered()) return false;
      return api.live.current.flow?.sleeping() !== true;
    };

    /** 视口与盒尺寸。 */
    const viewport = (): { half: { h: number; w: number }; height: number; width: number } => {
      const { halfH, halfW } = apiRef.current.metrics;
      return { half: { h: halfH, w: halfW }, height: window.innerHeight, width: window.innerWidth };
    };

    /** 离哪条边最近。 */
    const nearestEdge = (vp: ReturnType<typeof viewport>): DockEdge => {
      const box = apiRef.current.motion.box() ?? { x: 0, y: 0 };
      const cx = box.x + vp.half.w;
      const cy = box.y + vp.half.h;
      const d = { bottom: vp.height - cy, left: cx, right: vp.width - cx, top: cy };
      return (Object.keys(d) as DockEdge[]).reduce((best, k) => (d[k] < d[best] ? k : best), 'right' as DockEdge);
    };

    /** 「只露一小截」的盒子：沿该边挂出去，其余轴保持原值。 */
    const edgeBox = (edge: DockEdge): { x: number; y: number } => {
      const vp = viewport();
      const cur = apiRef.current.motion.box() ?? { x: 0, y: 0 };
      switch (edge) {
        case 'left':
          return { x: VISIBLE_PX - vp.half.w * 2, y: cur.y };
        case 'right':
          return { x: vp.width - VISIBLE_PX, y: cur.y };
        case 'top':
          return { x: cur.x, y: VISIBLE_PX - vp.half.h * 2 };
        default:
          return { x: cur.x, y: vp.height - VISIBLE_PX };
      }
    };

    /** 探头：往屏幕里挪一点 + 播该边的探头动作，稍后缩回去。 */
    const peek = (edge: DockEdge): void => {
      const api = apiRef.current;
      const anim = PEEK_ANIM[edge];
      const pools = api.cfgRef.current.animations;
      const known = Object.values(pools).some((pool) => Array.isArray(pool) && pool.includes(anim));
      const box = api.motion.box();
      if (box === null) return;
      const vp = viewport();
      const dx = edge === 'left' ? PEEK_SHIFT : edge === 'right' ? -PEEK_SHIFT : 0;
      const dy = edge === 'top' ? PEEK_SHIFT : edge === 'bottom' ? -PEEK_SHIFT : 0;
      api.motion.setBox({ x: box.x + dx, y: box.y + dy });
      api.setCustomPos(boxToRatio({ x: box.x + dx, y: box.y + dy }, vp, vp.half));
      if (peekBackTimerRef.current !== null) clearTimeout(peekBackTimerRef.current);
      peekBackTimerRef.current = setTimeout(() => {
        const now = apiRef.current.motion.box();
        if (now === null || dockedRef.current === null) return;
        apiRef.current.motion.setBox({ x: now.x - dx, y: now.y - dy });
        apiRef.current.setCustomPos(boxToRatio({ x: now.x - dx, y: now.y - dy }, vp, vp.half));
      }, PEEK_HOLD_MS);
      if (!known) return;
      api.setOnce(true);
      api.setAnim(anim);
      api.card.actions.bumpSeq();
    };

    /** 贴到最近的边上，并开始周期性探头。 */
    const dock = (): void => {
      const api = apiRef.current;
      if (dockedRef.current !== null) return;
      const vp = viewport();
      const box = api.motion.box();
      if (box === null) return;
      const back = boxToRatio(box, vp, vp.half);
      const edge = nearestEdge(vp);
      const target = clampReachableBox(edgeBox(edge), vp, {
        bottomPad: api.metrics.bottomPad,
        size: api.metrics.size,
      });
      api.motion.flight.stop();
      api.motion.stopMove();
      api.motion.setBox(target);
      api.setCustomPos(boxToRatio(target, vp, vp.half));
      dockedRef.current = { back, edge };
      peek(edge);
      peekTimerRef.current = setInterval(() => {
        const state = dockedRef.current;
        if (state === null) return;
        if (canDock()) peek(state.edge);
      }, PEEK_MS);
    };

    /** 收回来。 */
    const undock = (): void => {
      const state = dockedRef.current;
      if (state === null) return;
      clearTimers();
      dockedRef.current = null;
      apiRef.current.setCustomPos(state.back);
    };

    /** 重排静置计时；已经收起时不重排。 */
    const reset = (): void => {
      clearTimers();
      if (dockedRef.current !== null) return;
      idleTimerRef.current = setTimeout(() => {
        if (canDock()) dock();
        else {
          idleTimerRef.current = null;
          reset();
        }
      }, IDLE_MS);
    };

    // 只在挂载时排一次，卸载清干净。
    useEffect(() => {
      reset();
      return () => clearTimers();
      // eslint-disable-next-line react-hooks/exhaustive-deps -- reset/clearTimers 只读 ref
    }, []);

    return {
      reset,
      wake: () => {
        undock();
        reset();
      },
    };
  };
}
