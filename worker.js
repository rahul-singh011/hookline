import {createWorker} from './src/queues/worker.js'

createWorker().catch((err)=>{
    console.error('Failed to start worker: ',err)
    process.exit(1)
})