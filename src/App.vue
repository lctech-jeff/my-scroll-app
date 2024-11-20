<script setup lang="ts">
import { useCPU } from '@/composable/useCPU'
import { useRooms } from '@/composable/useRooms'
import { useVisibleTrigger } from '@/composable/useVisibleTrigger'
import type { RoomSimple } from '@/domain'
import { useFps, useTransition } from '@vueuse/core'
import { faker } from '@faker-js/faker'

// @ts-expect-error
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import RoomItem from '@/components/RoomItem.vue'

const {
  roomsMap,
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

const { onTrigger } = useVisibleTrigger('load-more-trigger')

onTrigger(() => {
  if (isLoading.value) return
  loadRooms(loadNum.value)
})

const startIndex = ref<number>(0)
const endIndex = ref<number>(0)

const handleScrollerUpdate = (startIdx: number, endIdx: number) => {
  startIndex.value = startIdx
  endIndex.value = endIdx
}

const list = computed<RoomSimple[]>(() => {
  return rooms.value.slice(startIndex.value, endIndex.value)
})

// UI
const avatar = faker.image.avatar()
const firstName = faker.person.firstName()
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
  return roomsMap.value.get(list.value[0]?.roomID || '') || null
})

const lastRoom = computed<RoomSimple | null>(() => {
  return roomsMap.value.get(list.value.at(-1)?.roomID || '') || null
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
    <div class="h-[50dvh] w-[80dvw] overflow-auto rounded bg-gray-500/5 p-2 md:h-[80dvh] md:w-[50dvw]">
      <DynamicScroller
        :items="rooms"
        :min-item-size="24"
        class="h-full"
        key-field="roomID"
        :emit-update="true"
        @update="handleScrollerUpdate"
      >
        <template #before>
          <div class="grid place-content-center gap-3 py-4">
            <img class="size-16 rounded-full mx-auto" :src="avatar" alt="host" />
            <div class="text-center text-lg font-bold">{{ firstName }}'s room list</div>
          </div>
        </template>
        <template v-slot="{ item, active }">
          <DynamicScrollerItem
            :item="item"
            :active="active"
            :size-dependencies="[item.message]"
            :data-index="item.index"
          >
            <RoomItem :room="item" />
          </DynamicScrollerItem>
        </template>
        <template #after>
          <div ref="load-more-trigger" v-if="!isLoading" class="pointer-event-none invisible -translate-y-[30vh]"></div>
          <div class="grid h-12 place-content-center">
            <img src="@/assets/images/loading.svg" alt="" />
          </div>
        </template>
      </DynamicScroller>
    </div>
    <div class="space-y-5">
      <div class="space-y-2 text-start">
        <div>總房間數量： {{ roomsLength }}</div>
        <div>Virtual List 渲染數量： {{ virtualListLength }} 間</div>
        <div>{{ `渲染 ${startIndex + 1} 至 ${endIndex + 1} 間` }}</div>
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
            <RoomItem :room="firstRoom" :line-clamp="3" />
          </div>
          <div>Virtual List 最後一間</div>
          <div v-if="lastRoom">
            <RoomItem :room="lastRoom" :line-clamp="3" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
