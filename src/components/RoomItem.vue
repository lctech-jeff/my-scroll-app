<script setup lang="ts">
import { UseTimeAgo } from '@vueuse/components'
import type { Room } from '@/domain'

const { room } = defineProps<{
  room: Room
}>()
</script>

<template>
  <div class="flex h-16 cursor-pointer items-center gap-3 px-4 py-3 hover:bg-slate-500">
    <div class="size-10 shrink-0 overflow-hidden rounded-full bg-slate-500/25">
      <img class="size-full object-cover" :src="room.avatar" :alt="room.name" />
    </div>
    <div class="grid w-full text-start">
      <div class="flex items-center justify-between">
        <span class="line-clamp-1 text-sm">({{ room.index }}) {{ room.name }}</span>
        <UseTimeAgo v-slot="{ timeAgo }" :time="room.updatedAt">
          <span class="text-xs">{{ timeAgo }}</span>
        </UseTimeAgo>
      </div>
      <span class="line-clamp-1 text-xs opacity-60">({{ room.message }})</span>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
