import { useIntervalFn, useElementVisibility, watchDebounced } from '@vueuse/core'

export const useVisibleTrigger = (key: string) => {
  const targetEl = useTemplateRef<HTMLDivElement>(key)
  const targetElIsVisible = useElementVisibility(targetEl)
  let callback: () => void = () => {}

  const onTrigger = (cb: () => void) => {
    callback = cb
  }

  const { pause, resume } = useIntervalFn(
    () => {
      callback()
    },
    500,
    { immediate: false }
  )

  watch(targetEl, nVal => {
    if (!nVal) {
      pause()
    }
  })

  watchDebounced(
    targetElIsVisible,
    nVal => {
      if (nVal) {
        resume()
      } else {
        pause()
      }
    },
    { debounce: 300, maxWait: 1000 }
  )
  return {
    onTrigger,
  }
}
