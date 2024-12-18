<script setup lang="ts">
import { useCPU } from '@/composable/useCPU'
import { useRooms } from '@/composable/useRooms'
import { useVisibleTrigger } from '@/composable/useVisibleTrigger'
import type { RoomSimple } from '@/domain'
import { useFps, useTransition, useVirtualList } from '@vueuse/core'

import RoomItem from '@/components/RoomItem.vue'

const {
  rooms,
  sortRooms,
  insertRooms,
  loadRooms,
  resetRoomTime,
  isSorting,
  chunkNum,
  isInserting,
  isLoading,
  isResetting,
  isUsingWorker,
} = useRooms()

const { list, containerProps, wrapperProps } = useVirtualList(rooms, {
  itemHeight: 64,
  overscan: 10,
})

const { onTrigger } = useVisibleTrigger('load-more-trigger')

onTrigger(() => {
  if (isLoading.value) return
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

const firstRoom = computed<RoomSimple | null>(() => {
  return list.value[0]?.data || null
})

const lastRoom = computed<RoomSimple | null>(() => {
  return list.value.at(-1)?.data || null
})

const roomIndex = computed<{ from: number; to: number }>(() => {
  return {
    from: rooms.value.findIndex(v => v.roomID === firstRoom.value?.roomID),
    to: rooms.value.findIndex(v => v.roomID === lastRoom.value?.roomID),
  }
})

const perfObserver = (list: PerformanceObserverEntryList) => {
  list.getEntries().forEach(entry => {
    if (entry.entryType === 'measure') {
      console.log(`${entry.name} 花費時間: ${entry.duration} ms`)
    }
  })
}
const observer = new PerformanceObserver(perfObserver)
observer.observe({ entryTypes: ['measure'] })
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
      <div ref="load-more-trigger" v-if="!isLoading" class="pointer-event-none invisible -translate-y-[30vh]"></div>
      <div class="grid place-content-center">
        <img src="@/assets/images/loading.svg" alt="" />
      </div>
    </div>
    <div class="space-y-5">
      <div class="space-y-2 text-start">
        <div>總房間數量： {{ roomsLength }}</div>
        <div>Virtual List 渲染數量： {{ virtualListLength }} 間</div>
        <div>{{ `渲染 ${roomIndex.from + 1} 至 ${roomIndex.to + 1} 間` }}</div>
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
        <label for="isUsingWorker" class="flex items-center gap-2">
          <input id="isUsingWorker" type="checkbox" v-model="isUsingWorker" class="w-6 text-center" />
          使用
          <a href="https://developer.mozilla.org/en-US/docs/Web/API/Worker" target="_blank" rel="noreferrer noopener">
            Web Worker API
          </a>
        </label>
        <label for="chunkNum" class="flex items-center gap-2">
          <span class="text-center">
            <a
              :href="
                isSupportSchedulerAPI
                  ? 'https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/yield'
                  : 'https://developer.mozilla.org/en-US/docs/Web/API/Prioritized_Task_Scheduling_API#mutable_and_immutable_task_priority'
              "
              target="_blank"
              rel="noreferrer noopener"
            >
              {{ isSupportSchedulerAPI ? 'Scheduler yield' : 'setTimeout' }}
            </a>
            分批處理：
          </span>
          每
          <input id="chunkNum" type="number" v-model="chunkNum" class="w-24 appearance-none text-center" />
          筆
        </label>
      </div>
      <div class="grid w-[80vw] grid-cols-3 items-start gap-x-2 gap-y-4 md:w-[40vw]">
        <div class="flex flex-col gap-2">
          <button type="button" @click="insertRooms(insertNum)" :disabled="isInserting">
            {{ isInserting ? '插入中' : '插入' }}
          </button>
          <input type="number" v-model="insertNum" class="w-full appearance-none text-center" />
        </div>
        <div class="flex flex-col gap-2">
          <button type="button" @click="loadRooms(loadNum)" :disabled="isLoading">
            {{ isLoading ? '載入中' : '載入更多' }}
          </button>
          <input type="number" v-model="loadNum" class="w-full appearance-none text-center" />
        </div>
        <div class="flex flex-col gap-2">
          <button type="button" @click="resetRoomTime(resetTimeNum)" :disabled="isResetting">
            {{ isResetting ? '刷新中' : '刷新項目' }}
          </button>
          <input type="number" v-model="resetTimeNum" class="w-full appearance-none text-center" />
        </div>
        <button type="button" @click="sortRooms()">{{ isSorting ? '排序中' : '排序' }}</button>
        <div class="col-span-3 space-y-2 pt-3">
          <div>Virtual List 第一間</div>
          <div v-if="firstRoom">
            <RoomItem :room="firstRoom" />
          </div>
          <div>Virtual List 最後一間</div>
          <div v-if="lastRoom">
            <RoomItem :room="lastRoom" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
