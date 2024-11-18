import type { Room } from '@/domain'

const sortRoom = (e: MessageEvent) => {
  const data = JSON.parse(e.data)
  const arr: Room[] = data.payload
  if (Array.isArray(arr)) {
    console.time('排序花費時間')
    arr.sort((a: Room, b: Room) => {
      if (a.updatedAt > b.updatedAt) {
        return -1
      } else {
        return 1
      }
    })

    self.postMessage({
      payload: arr,
      flag: data.flag,
    })
    console.timeEnd('排序花費時間')
  } else {
    self.postMessage(e.data)
  }
}

self.addEventListener('message', sortRoom)
