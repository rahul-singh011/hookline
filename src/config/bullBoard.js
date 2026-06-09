import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import deliveryQueue from '../queues/deliveryQueue.js'

const setupBullBoard = ()=>{
    const serverAdapter = new ExpressAdapter()

    serverAdapter.setBasePath('/admin/queues')

    createBullBoard({
        queues: [new BullMQAdapter(deliveryQueue) ],
        serverAdapter
    })

    return serverAdapter
}

export default setupBullBoard