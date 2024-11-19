export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const delayYield = async (): Promise<void> => {
  // @ts-expect-error
  if (globalThis.scheduler?.yield) {
    // @ts-expect-error
    await window.scheduler.yield()
  } else {
    await delay(0)
  }
}
