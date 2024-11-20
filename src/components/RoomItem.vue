<script setup lang="ts">
import { UseTimeAgo } from '@vueuse/components'
import type { RoomSimple, Room } from '@/domain'
import { useRooms } from '@/composable/useRooms'
import { StyleValue } from 'vue'

const { room, lineClamp = 0 } = defineProps<{
  room: RoomSimple
  lineClamp?: number
}>()

const { roomsMap } = useRooms()

const roomDetail = computed<Room | null>(() => {
  return roomsMap.value.get(room.roomID) || null
})

const lineClampStyle = computed<StyleValue>(() => {
  if (lineClamp > 0) {
    return {
      overflow: 'hidden',
      display: '-webkit-box',
      '-webkit-box-orient': 'vertical',
      '-webkit-line-clamp': 1,
    }
  }
})
</script>

<template>
  <div class="flex min-h-16 cursor-pointer items-center gap-3 px-4 py-3 hover:bg-slate-500">
    <div class="size-10 shrink-0 overflow-hidden rounded-full bg-slate-500/25">
      <img v-if="roomDetail" class="size-full object-cover" :src="roomDetail.avatar" :alt="roomDetail.name" />
    </div>
    <div v-if="roomDetail" class="grid w-full gap-1 text-start">
      <div class="flex items-center justify-between">
        <span class="line-clamp-1 text-sm">({{ roomDetail.index }}) {{ roomDetail.name }}</span>
        <UseTimeAgo v-slot="{ timeAgo }" :time="roomDetail.updatedAt">
          <span class="text-xs">{{ timeAgo }}</span>
        </UseTimeAgo>
      </div>
      <span class="text-xs opacity-60" :style="lineClampStyle">{{ roomDetail.message }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
