import User from '../models/User.js';
import bcrypt from 'bcrypt';

const createBillingStaff = async (data) => {
    const password = data.password || 'billing@123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const billing = new User({
        ...data,
        password: hashedPassword,
        role: 'billing',
    });

    await billing.save();

    return {
        success: true,
        message: 'Billing staff created successfully',
    };
};


const changePassword = async (userId, oldPassword, newPassword) => {
    const billing = await User.findById(userId);
    if(!billing) throw new Error('Billing staff not found');

    const isMatch = await bcrypt.compare(oldPassword, billing.password);
    if(!isMatch) throw new Error('Old password is incorrect');

    billing.password = await bcrypt.hash(newPassword, 10);
    await billing.save();

    return { message: 'Password changed successfully' };
};

const getAllBillingStaff = async () => {
    return await User.find({ role: 'billing' });
};

const updateBillingStaff = async (id, data) => {
    if(data.password) {
        data.password = await bcrypt.hash(data.password, 10);
    }

    const billing = await User.findOneAndUpdate(
        { _id: id, role: 'billing' },
        data,
        { new: true, runValidators: true }
    );

    if(!billing) throw new Error('Billing staff not found');

    return billing;
};

const deleteBillingStaff = async (id) => {
    const billing = await User.findOneAndDelete({ _id: id, role: 'billing' });
    if(!billing) throw new Error('Billing staff not found');

    return { message: 'Billing staff deleted successfully' };
};

export default{
  createBillingStaff,
  changePassword,
  getAllBillingStaff,
  updateBillingStaff,
  deleteBillingStaff
}