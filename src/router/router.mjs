import express from 'express'

import Controler from '../controler/controler.mjs'
const router = express.Router()

const initApiRouter = (app) => {
    router.get('/', Controler.getHomePage)
    router.post('/postData', Controler.postData)
    // router.post('/getCoin', Controler.getCoin)
    return app.use('/', router)
}

export default initApiRouter