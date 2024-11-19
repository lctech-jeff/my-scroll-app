<script setup lang="ts">
import { UseTimeAgo } from '@vueuse/components'
import type { RoomSimple, Room } from '@/domain'
import { useRooms } from '@/composable/useRooms'

const { room } = defineProps<{
  room: RoomSimple
}>()

const { roomsMap } = useRooms()

const roomDetail = computed<Room | null>(() => {
  return roomsMap.value.get(room.roomID) || null
})
</script>

<template>
  <div class="flex h-16 cursor-pointer items-center gap-3 px-4 py-3 hover:bg-slate-500">
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
      <span class="line-clamp-1 text-xs opacity-60">{{ roomDetail.message }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
