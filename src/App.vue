<script setup lang="ts">
import { useCPU } from '@/composable/useCPU'
import { useRooms } from '@/composable/useRooms'
import { useVisibleTrigger } from '@/composable/useVisibleTrigger'
import type { Room } from '@/domain'
import { useFps, useTransition, useVirtualList } from '@vueuse/core'

import RoomItem from '@/components/RoomItem.vue'

const { rooms, sortRooms, insertRooms, loadRooms, isSorting } = useRooms()

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

const insertNum = ref<number>(30)
const loadNum = ref<number>(30)

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

const firstRoom = computed<Room | null>(() => {
  return list.value[0]?.data || null
})
</script>

<template>
  <div class="flex items-start gap-4">
    <div v-bind="containerProps" class="h-[80dvh] max-w-[500px] overflow-auto rounded bg-gray-500/5 p-2">
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
        <div>畫面數量： {{ virtualListLength }}</div>
        <div>FPS： {{ fps }}</div>
        <div>CPU 狀態： {{ cpuState }}</div>
      </div>
      <div class="grid max-w-[30vw] grid-cols-3 items-start gap-2">
        <button type="button" @click="sortRooms()">{{ isSorting ? '排序中' : '排序' }}</button>
        <div class="flex flex-col gap-2">
          <button type="button" @click="insertRooms(insertNum)">插入</button>
          <input type="number" v-model="insertNum" class="w-full appearance-none text-center" />
        </div>
        <div class="flex flex-col gap-2">
          <button type="button" @click="loadRooms(loadNum)">載入更多</button>
          <input type="number" v-model="loadNum" class="w-full appearance-none text-center" />
        </div>
        <button type="button" @click="consoleTheMeasure()">Log Performance</button>
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
