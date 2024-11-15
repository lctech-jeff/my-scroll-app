import { faker } from '@faker-js/faker'

const INIT_ROOM_COUNT = 10

interface Room {
  index: number
  roomID: string
  name: string
  avatar: string
  updatedAt: number
  message: string
  tag: number
}

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

const insertRooms = (max: number): void => {
  performance.mark('insert-started')
  const newRooms = faker.helpers.multiple(createRandomRoom, {
    count: {
      min: 5,
      max,
    },
  })

  rooms.value.push(...newRooms)
  sortRooms()
  performance.mark('insert-ended')
  performance.measure('插入 ＋ 排序', 'insert-started', 'insert-ended')
}

const loadRooms = (count: number): void => {
  performance.mark('load-started')

  timeRange.value.to = timeRange.value.from
  timeRange.value.from = timeRange.value.to - 86400 * 1000 * 1

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

  rooms.value.push(...newRooms)
  sortRooms()

  performance.mark('load-ended')
  performance.measure('載入更多 ＋ 排序', 'load-started', 'load-ended')
}

export const useRooms = () => {
  return {
    rooms,
    sortRooms,
    loadRooms,
    insertRooms,
    isSorting: computed(() => isSortingCount.value > 0),
  }
}
