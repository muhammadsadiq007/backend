import express from "express"
import cors from "cors"
import authRouter from './routes/auth.js'
import packageRouter from './routes/package.js'
import employeeRouter from './routes/employee.js'
import clientRouter from './routes/client.js'
import salaryRouter from './routes/salary.js'
import leaveRouter from './routes/leave.js'
import settingRouter from './routes/setting.js'
import networkRouter from './routes/network.js'
import subAreaRouter from './routes/subarea.js'
import collectionRouter from './routes/collection.js'
import connectToDatabase from "./db/db.js"
import dashboardRouter from "./routes/dashboard.js"
import expenseRouter from "./routes/expense.js"
import cron from "node-cron"
// import { clientScheduler } from "./controllers/schedulerController.js"

// cron.schedule(' 0 0 * * *',() => {
//     clientScheduler()
// })


connectToDatabase()
const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api/package', packageRouter)
app.use('/api/employee', employeeRouter)
app.use('/api/client', clientRouter)
app.use('/api/salary', salaryRouter)
app.use('/api/leave', leaveRouter)
app.use('/api/setting', settingRouter)
app.use('/api/network', networkRouter)
app.use('/api/subarea', subAreaRouter)
app.use('/api/collection', collectionRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/expense', expenseRouter)

app.listen(process.env.PORT, () => {
    console.log(`Server is running at Port No ${process.env.PORT}`)
})