const state = ref<string>('')

const callback = (records: unknown[]) => {
  const lastRecord = records[records.length - 1];
  // @ts-expect-error
  state.value = lastRecord.state
}

try {
  // @ts-expect-error
  const observer = new PressureObserver(callback);
  await observer.observe("cpu", {
    sampleInterval: 1000, // 1000ms
  });
} catch (e: unknown) {
  console.log(e)
}

export const useCPU = () => {
  return {
    state
  }
}