import type { Room } from '@/domain'

const sortRoom = (e: MessageEvent) => {
  const data = JSON.parse(e.data)
  const arr: Room[] = data.payload
  if (Array.isArray(arr)) {
    performance.mark('worker 排序-started')
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
    performance.mark('worker 排序-ended')
    performance.measure('worker 排序', 'worker 排序-started', 'worker 排序-ended')
  } else {
    self.postMessage(e.data)
  }
}

self.addEventListener('message', sortRoom)

const perfObserver = (list: PerformanceObserverEntryList) => {
  list.getEntries().forEach(entry => {
    if (entry.entryType === 'measure') {
      self.postMessage({
        log: `${entry.name} 花費時間: ${entry.duration} ms`
      })
    }
  })
}

const observer = new PerformanceObserver(perfObserver)
observer.observe({ entryTypes: ['measure'] })
