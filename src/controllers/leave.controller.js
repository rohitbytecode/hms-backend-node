import Leave from '../models/leave.model.js'

export const applyLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body
    if (!startDate || !endDate) return res.status(400).json({ message: 'Start and end date are required.' })
    if (new Date(startDate) > new Date(endDate)) return res.status(400).json({ message: 'Start date cannot be after end date.' })

    const leave = await Leave.create({ doctor: req.user.id, startDate, endDate, reason })
    res.status(201).json(leave)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ doctor: req.user.id }).sort({ createdAt: -1 })
    res.json(leaves)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ status: 'pending' })
      .populate('doctor', 'name email')
      .sort({ createdAt: -1 })
    res.json(leaves)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true })
    if (!leave) return res.status(404).json({ message: 'Leave not found.' })
    res.json(leave)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true })
    if (!leave) return res.status(404).json({ message: 'Leave not found.' })
    res.json(leave)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findOne({ _id: req.params.id, doctor: req.user.id })
    if (!leave) return res.status(404).json({ message: 'Leave not found.' })
    if (leave.status !== 'pending') return res.status(400).json({ message: 'Only pending leaves can be cancelled.' })
    await leave.deleteOne()
    res.json({ message: 'Leave cancelled.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getDoctorApprovedLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ doctor: req.params.doctorId, status: 'approved' })
    res.json(leaves)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}