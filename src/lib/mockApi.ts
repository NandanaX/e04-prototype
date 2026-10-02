/**
 * There is no backend in this prototype. This simulates one just enough to make
 * optimistic-update + rollback behavior real and testable: a short network delay,
 * plus a small random failure rate so the rollback path actually fires sometimes
 * instead of being dead code that only exists in theory.
 */
export function simulateWrite<T>(result: T, opts: { failRate?: number; delayMs?: number } = {}): Promise<T> {
  const { failRate = 0.06, delayMs = 350 } = opts
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < failRate) reject(new Error("simulated-network-failure"))
      else resolve(result)
    }, delayMs)
  })
}
