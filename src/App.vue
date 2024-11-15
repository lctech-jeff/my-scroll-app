<script setup lang="ts">
import { useRooms } from '@/composable/useRooms'
import { UseTimeAgo } from '@vueuse/components'
import { useIntervalFn, useTransition, useVirtualList, watchDebounced } from '@vueuse/core'
import { useFps } from '@vueuse/core'
import { useCPU } from '@/composable/useCPU'
import { useElementVisibility } from '@vueuse/core'

const { rooms, sortRooms, insertRooms, loadRooms, isSorting } = useRooms()

const { list, containerProps, wrapperProps } = useVirtualList(rooms, {
  itemHeight: 64,
  overscan: 10,
})

const loadMoreEl = useTemplateRef<HTMLDivElement>('load-more-trigger')
const loadMoreElIsVisible = useElementVisibility(loadMoreEl)

const { pause, resume } = useIntervalFn(
  () => {
    loadRooms(20)
  },
  500,
  { immediate: false }
)

watchDebounced(
  loadMoreElIsVisible,
  nVal => {
    if (nVal) {
      resume()
    } else {
      pause()
    }
  },
  { debounce: 300, maxWait: 1000 }
)

// UI
const fps = useFps()

const { state: cpuState } = useCPU()

const maxInsertNum = ref<number>(10)
const loadNum = ref<number>(20)

const transitionRoomLength = useTransition(() => rooms.value.length, {
  duration: 1000,
})

const roomsLength = computed(() => {
  return Math.ceil(transitionRoomLength.value)
})

const transitionVirtualListLength = useTransition(() => list.value.length, {
  duration: 1000,
})

const virtualListLength = computed(() => {
  return Math.ceil(transitionVirtualListLength.value)
})

const consoleTheMeasure = (): void => {
  const insertMeasures = performance.getEntriesByName('插入 ＋ 排序')
  const loadedMeasures = performance.getEntriesByName('載入更多 ＋ 排序')
  console.log(insertMeasures)
  console.log(loadedMeasures)
}
</script>

<template>
  <div class="flex items-start gap-4">
    <div v-bind="containerProps" class="h-[80dvh] max-w-[500px] overflow-auto rounded bg-gray-500/5 p-2">
      <div v-bind="wrapperProps">
        <div
          v-for="{ index, data } in list"
          :key="index"
          class="flex h-16 cursor-pointer items-center gap-3 px-4 py-3 hover:bg-slate-500"
        >
          <div class="size-10 shrink-0 overflow-hidden rounded-full bg-slate-500/25">
            <img class="size-full object-cover" :src="data.avatar" :alt="data.name" />
          </div>
          <div class="grid w-full text-start">
            <div class="flex items-center justify-between">
              <span class="line-clamp-1 text-sm">({{ data.index }}) {{ data.name }}</span>
              <UseTimeAgo v-slot="{ timeAgo }" :time="data.updatedAt">
                <span class="text-xs">{{ timeAgo }}</span>
              </UseTimeAgo>
            </div>
            <span class="line-clamp-1 text-xs opacity-60">({{ data.message }})</span>
          </div>
        </div>
      </div>
      <div ref="load-more-trigger" class="-translate-y-[30vh] pointer-event-none invisible"></div>
      <div class="grid place-content-center">
        <svg
          version="1.1"
          id="Layer_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          width="24px"
          height="30px"
          viewBox="0 0 24 30"
          style="enable-background: new 0 0 50 50"
          xml:space="preserve"
        >
          <rect x="0" y="13" width="4" height="5" fill="#44bd87">
            <animate
              attributeName="height"
              attributeType="XML"
              values="5;21;5"
              begin="0s"
              dur="0.6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              attributeType="XML"
              values="13; 5; 13"
              begin="0s"
              dur="0.6s"
              repeatCount="indefinite"
            />
          </rect>
          <rect x="10" y="13" width="4" height="5" fill="#44bd87">
            <animate
              attributeName="height"
              attributeType="XML"
              values="5;21;5"
              begin="0.15s"
              dur="0.6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              attributeType="XML"
              values="13; 5; 13"
              begin="0.15s"
              dur="0.6s"
              repeatCount="indefinite"
            />
          </rect>
          <rect x="20" y="13" width="4" height="5" fill="#44bd87">
            <animate
              attributeName="height"
              attributeType="XML"
              values="5;21;5"
              begin="0.3s"
              dur="0.6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              attributeType="XML"
              values="13; 5; 13"
              begin="0.3s"
              dur="0.6s"
              repeatCount="indefinite"
            />
          </rect>
        </svg>
      </div>
    </div>
    <div class="space-y-5">
      <div class="space-y-2 text-start">
        <div>總房間數量： {{ roomsLength }}</div>
        <div>畫面數量： {{ virtualListLength }}</div>
        <div>FPS： {{ fps }}</div>
        <div>CPU 狀態： {{ cpuState }}</div>
      </div>
      <div class="grid max-w-[30vw] grid-cols-3 items-start gap-2">
        <button type="button" @click="sortRooms()">{{ isSorting ? '排序中' : '排序' }}</button>
        <div class="flex flex-col gap-2">
          <button type="button" @click="insertRooms(maxInsertNum)">插入</button>
          <input type="number" v-model="maxInsertNum" class="w-full appearance-none text-center" />
        </div>
        <div class="flex flex-col gap-2">
          <button type="button" @click="loadRooms(loadNum)">載入更多</button>
          <input type="number" v-model="loadNum" class="w-full appearance-none text-center" />
        </div>
        <button type="button" @click="consoleTheMeasure()">Log Performance</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
