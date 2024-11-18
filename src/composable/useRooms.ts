import type { Room } from '@/domain'
import { faker } from '@faker-js/faker'

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

const rooms = ref<Room[]>(
  faker.helpers.multiple(createRandomRoom, {
    count: INIT_ROOM_COUNT,
  })
)

const sortRooms = async (): Promise<void> => {
  isSortingCount.value++
  console.time('排序花費時間')
  rooms.value.sort((a, b) => {
    if (a.updatedAt > b.updatedAt) {
      return -1
    } else {
      return 1
    }
  })
  isSortingCount.value--
  console.timeEnd('排序花費時間')
}

sortRooms()

const insertRooms = async (count: number): Promise<void> => {
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
      rooms.value = rooms.value.concat(newRooms)
      // @ts-expect-error
      await window.scheduler.yield()

      sortRooms()
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
    rooms.value = rooms.value.concat(newRooms)
    sortRooms()
  }

  performance.mark('insert-ended')
  performance.measure('插入 ＋ 排序', 'insert-started', 'insert-ended')
}

const loadRooms = async (count: number): Promise<void> => {
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
      rooms.value = rooms.value.concat(newRooms)
      // @ts-expect-error
      await window.scheduler.yield()
      sortRooms()
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
    rooms.value = rooms.value.concat(newRooms)
    sortRooms()
  }

  performance.mark('load-ended')
  performance.measure('載入更多 ＋ 排序', 'load-started', 'load-ended')
}

const resetRoomTime = async (count: number): Promise<void> => {
  performance.mark('reset-time-started')

  // @ts-expect-error
  if (globalThis.scheduler?.yield) {
    const chunkCount: number[] = new Array(Math.floor(count / chunkNum.value))
      .fill(chunkNum.value)
      .concat(count % chunkNum.value)

    for (let i = 0; i < chunkCount.length; i++) {
      chunkCount.forEach(() => {
        const randomNum = Math.floor(Math.random() * rooms.value.length)
        rooms.value[randomNum].updatedAt = Date.now()
      })

      rooms.value = [...rooms.value]
      sortRooms()

      // @ts-expect-error
      await window.scheduler.yield()
    }
  } else {
    for (let i = 0; i < count; i++) {
      const randomNum = Math.floor(Math.random() * rooms.value.length)
      rooms.value[randomNum].updatedAt = Date.now()
    }
    rooms.value = [...rooms.value]
    sortRooms()
  }

  performance.mark('reset-time-ended')
  performance.measure('刷新時間 ＋ 排序', 'reset-time-started', 'reset-time-ended')
}

export const useRooms = () => {
  return {
    rooms,
    sortRooms,
    loadRooms,
    insertRooms,
    resetRoomTime,
    isSorting: computed(() => isSortingCount.value > 0),
    chunkNum,
  }
}
