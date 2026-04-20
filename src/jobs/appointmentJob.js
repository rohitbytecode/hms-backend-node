import cron from 'node-cron'
import Appointment from '../models/appointment.js'

export const startAppointmentJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date()

      // Get all scheduled appointments with past dates
      const appointments = await Appointment.find({ status: 'scheduled' }).lean()

      const toComplete = appointments.filter((apt) => {
        // Combine date + time into a single DateTime
        const aptDate = new Date(apt.date)
        const [hours, minutes] = apt.time.split(':').map(Number)
        aptDate.setHours(hours, minutes, 0, 0)
        return aptDate < now
      })

      if (toComplete.length > 0) {
        const ids = toComplete.map((a) => a._id)
        await Appointment.updateMany(
          { _id: { $in: ids } },
          { $set: { status: 'completed' } }
        )
        console.log(`Auto-completed ${toComplete.length} past appointments.`)
      }
    } catch (err) {
      console.error('Appointment auto-complete job failed:', err.message)
    }
  })

  console.log('Appointment auto-complete job scheduled.')
}