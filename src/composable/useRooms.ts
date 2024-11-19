import type { Room, RoomSimple } from '@/domain'
import { faker } from '@faker-js/faker'
import { useDebounceFn } from '@vueuse/core'

const INIT_ROOM_COUNT = 10
const chunkNum = ref<number>(100)

const timeRange = ref<{
  from: number
  to: number
}>({
  from: Date.now() - 86400 * 1000 * 3,
  to: Date.now(),
})

let roomIndex = 0
const isSortingCount = ref<number>(0)

export const createRandomRoom = (): Room => {
  roomIndex++

  return {
    index: roomIndex,
    roomID: faker.string.uuid(),
    name: faker.person.firstName(),
    avatar: faker.image.avatar(),
    updatedAt: faker.date.between(timeRange.value).getTime(),
    message: faker.lorem.lines(),
    tag: faker.number.int({ min: 1, max: 3 }),
  }
}

const initRooms = faker.helpers.multiple(createRandomRoom, {
  count: INIT_ROOM_COUNT,
})

// 儲存完整資訊
const roomsMap = ref<Map<string, Room>>(new Map())

// 排序用
const rooms = ref<RoomSimple[]>([])

const addRooms = (room: Room) => {
  roomsMap.value.set(room.roomID, room)
  rooms.value.push({
    roomID: room.roomID,
    updatedAt: room.updatedAt,
    tag: room.tag,
  })
}

const updateRoom = (room: Room) => {
  roomsMap.value.set(room.roomID, room)
  const targetRoom = rooms.value.find(v => v.roomID === room.roomID)
  if (targetRoom) {
    targetRoom.updatedAt = room.updatedAt
    targetRoom.roomID = room.roomID
    targetRoom.tag = room.tag
  }
}

initRooms.forEach(v => {
  addRooms(v)
})

let lastSortFlag: number = Date.now()

const sortWorker = new Worker(new URL('@/worker/sort.ts', import.meta.url), {
  type: 'module',
})

sortWorker.addEventListener('message', e => {
  if (e.data.log) {
    console.log(e.data.log)
    return
  }

  if (e.data.flag === lastSortFlag) {
    rooms.value = e.data.payload
    isSortingCount.value--
  }
})

const isUsingWorker = ref<boolean>(true)

const sortRooms = async (): Promise<void> => {
  isSortingCount.value++
  lastSortFlag = Date.now()

  if (isUsingWorker.value) {
    sortWorker.postMessage(
      JSON.stringify({
        payload: rooms.value,
        flag: lastSortFlag,
      })
    )
  } else {
    rooms.value = [...rooms.value]
    performance.mark('本地排序-started')
    rooms.value.sort((a: RoomSimple, b: RoomSimple) => {
      if (a.updatedAt > b.updatedAt) {
        return -1
      } else {
        return 1
      }
    })
    performance.mark('本地排序-ended')
    performance.measure('本地排序', '本地排序-started', '本地排序-ended')
    isSortingCount.value--
  }
}

sortRooms()

const debounceSortRooms = useDebounceFn(
  () => {
    sortRooms()
  },
  300,
  { maxWait: 2000 }
)

const isInserting = ref<boolean>(false)

const insertRooms = async (count: number): Promise<void> => {
  if (isInserting.value) return
  isInserting.value = true
  performance.mark('insert-started')

  // @ts-expect-error
  if (globalThis.scheduler?.yield) {
    const chunkCount: number[] = new Array(Math.floor(count / chunkNum.value))
      .fill(chunkNum.value)
      .concat(count % chunkNum.value)

    for (let i = 0; i < chunkCount.length; i++) {
      const newRooms = faker.helpers
        .multiple(createRandomRoom, {
          count: chunkCount[i],
        })
        .map(v => {
          return {
            ...v,
            updatedAt: faker.date.between({ from: timeRange.value.from, to: Date.now() }).getTime(),
          }
        })

      newRooms.forEach(v => {
        addRooms(v)
      })

      // @ts-expect-error
      await window.scheduler.yield()
      debounceSortRooms()
      // @ts-expect-error
      await window.scheduler.yield()
    }
  } else {
    const newRooms = faker.helpers
      .multiple(createRandomRoom, {
        count,
      })
      .map(v => {
        return {
          ...v,
          updatedAt: faker.date.between({ from: timeRange.value.from, to: Date.now() }).getTime(),
        }
      })
    newRooms.forEach(v => {
      addRooms(v)
    })
    sortRooms()
  }

  performance.mark('insert-ended')
  performance.measure('插入 ＋ 排序', 'insert-started', 'insert-ended')
  isInserting.value = false
}

const isLoadingCount = ref<number>(0)

const loadRooms = async (count: number): Promise<void> => {
  if (isLoadingCount.value > 0) return
  isLoadingCount.value++
  performance.mark('load-started')

  timeRange.value.to = timeRange.value.from
  timeRange.value.from = timeRange.value.to - 86400 * 1000 * 1

  // @ts-expect-error
  if (globalThis.scheduler?.yield) {
    const chunkCount: number[] = new Array(Math.floor(count / chunkNum.value))
      .fill(chunkNum.value)
      .concat(count % chunkNum.value)

    for (let i = 0; i < chunkCount.length; i++) {
      const newRooms = faker.helpers
        .multiple(createRandomRoom, {
          count: chunkCount[i],
        })
        .map(v => {
          return {
            ...v,
            updatedAt: faker.date.between(timeRange.value).getTime(),
          }
        })
      newRooms.forEach(v => {
        addRooms(v)
      })
      // @ts-expect-error
      await window.scheduler.yield()
      debounceSortRooms()
      // @ts-expect-error
      await window.scheduler.yield()
    }
  } else {
    const newRooms = faker.helpers
      .multiple(createRandomRoom, {
        count,
      })
      .map(v => {
        return {
          ...v,
          updatedAt: faker.date.between(timeRange.value).getTime(),
        }
      })
    newRooms.forEach(v => {
      addRooms(v)
    })

    sortRooms()
  }

  performance.mark('load-ended')
  performance.measure('載入更多 ＋ 排序', 'load-started', 'load-ended')
  isLoadingCount.value--
  isLoadingCount.value = Math.max(isLoadingCount.value, 0)
}

const isResetting = ref<boolean>(false)

const resetRoomTime = async (count: number): Promise<void> => {
  if (isResetting.value) return
  isResetting.value = true
  performance.mark('reset-time-started')

  // @ts-expect-error
  if (globalThis.scheduler?.yield) {
    const chunkCount: number[] = new Array(Math.floor(count / chunkNum.value))
      .fill(chunkNum.value)
      .concat(count % chunkNum.value)

    for (let i = 0; i < chunkCount.length; i++) {
      chunkCount.forEach(() => {
        const randomNum = Math.floor(Math.random() * rooms.value.length)
        const targetRoom = roomsMap.value.get(rooms.value[randomNum].roomID)
        if (targetRoom) {
          updateRoom({
            ...targetRoom,
            updatedAt: Date.now(),
          })
        }
      })
      // @ts-expect-error
      await window.scheduler.yield()
    }

    debounceSortRooms()
  } else {
    for (let i = 0; i < count; i++) {
      const randomNum = Math.floor(Math.random() * rooms.value.length)
      rooms.value[randomNum].updatedAt = Date.now()
    }

    sortRooms()
  }

  performance.mark('reset-time-ended')
  performance.measure('刷新時間 ＋ 排序', 'reset-time-started', 'reset-time-ended')
  isResetting.value = false
}

export const useRooms = () => {
  return {
    roomsMap,
    rooms,
    sortRooms,
    loadRooms,
    insertRooms,
    resetRoomTime,
    isSorting: computed(() => isSortingCount.value > 0),
    chunkNum,
    isInserting,
    isLoading: computed(() => isLoadingCount.value > 0),
    isResetting,
    isUsingWorker,
  }
}
