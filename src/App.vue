<script setup lang="ts">
import { useCPU } from '@/composable/useCPU'
import { useRooms } from '@/composable/useRooms'
import { useVisibleTrigger } from '@/composable/useVisibleTrigger'
import type { Room } from '@/domain'
import { useFps, useTransition, useVirtualList } from '@vueuse/core'

import RoomItem from '@/components/RoomItem.vue'

const { rooms, sortRooms, insertRooms, loadRooms, resetRoomTime, isSorting, chunkNum } = useRooms()

const { list, containerProps, wrapperProps } = useVirtualList(rooms, {
  itemHeight: 64,
  overscan: 10,
})

const { onTrigger } = useVisibleTrigger('load-more-trigger')

onTrigger(() => {
  loadRooms(loadNum.value)
})

// UI
const fps = useFps()

const { state: cpuState } = useCPU()
// @ts-expect-error
const isSupportSchedulerAPI = !!globalThis.scheduler?.yield
const insertNum = ref<number>(30)
const loadNum = ref<number>(30)
const resetTimeNum = ref<number>(10)

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
  const randomMeasures = performance.getEntriesByName('刷新時間 ＋ 排序')
  console.log(insertMeasures)
  console.log(loadedMeasures)
  console.log(randomMeasures)
}

const firstRoom = computed<Room | null>(() => {
  return list.value[0]?.data || null
})
</script>

<template>
  <div class="flex flex-col items-start gap-4 md:flex-row">
    <div
      v-bind="containerProps"
      class="h-[50dvh] w-[80dvw] overflow-auto rounded bg-gray-500/5 p-2 md:h-[80dvh] md:w-[50dvw]"
    >
      <div v-bind="wrapperProps">
        <RoomItem v-for="{ data } in list" :key="data.roomID" :room="data" />
      </div>
      <div ref="load-more-trigger" class="pointer-event-none invisible -translate-y-[30vh]"></div>
      <div class="grid place-content-center">
        <img src="@/assets/images/loading.svg" alt="" />
      </div>
    </div>
    <div class="space-y-5">
      <div class="space-y-2 text-start">
        <div>總房間數量： {{ roomsLength }}</div>
        <div>Virtual List 渲染數量： {{ virtualListLength }}</div>
        <div>FPS： {{ fps }}</div>
        <div>
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/API/PressureRecord/state#value"
            target="_blank"
            rel="noreferrer noopener"
          >
            CPU 狀態
          </a>
          ： {{ cpuState }}
        </div>
        <label v-if="isSupportSchedulerAPI" for="chunkNum" class="flex items-center gap-2">
          <span class="text-center">
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/yield"
              target="_blank"
              rel="noreferrer noopener"
            >
              Scheduler yield
            </a>
            分批處理：
          </span>
          每<input id="chunkNum" type="number" v-model="chunkNum" class="w-24 appearance-none text-center" />筆
        </label>
      </div>
      <div class="grid w-[80vw] grid-cols-3 items-start gap-x-2 gap-y-4 md:w-[40vw]">
        <div class="flex flex-col gap-2">
          <button type="button" @click="insertRooms(insertNum)">插入</button>
          <input type="number" v-model="insertNum" class="w-full appearance-none text-center" />
        </div>
        <div class="flex flex-col gap-2">
          <button type="button" @click="loadRooms(loadNum)">載入更多</button>
          <input type="number" v-model="loadNum" class="w-full appearance-none text-center" />
        </div>
        <div class="flex flex-col gap-2">
          <button type="button" @click="resetRoomTime(resetTimeNum)">刷新項目</button>
          <input type="number" v-model="resetTimeNum" class="w-full appearance-none text-center" />
        </div>
        <button type="button" @click="sortRooms()">{{ isSorting ? '排序中' : '排序' }}</button>
        <button type="button" class="col-span-2 lg:col-span-1" @click="consoleTheMeasure()">Log Performance</button>
        <div class="col-span-3 space-y-2 pt-3">
          <div>Virtual List 第一則</div>
          <div v-if="firstRoom">
            <RoomItem :room="firstRoom" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
