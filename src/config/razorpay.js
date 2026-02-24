import Razorpay from 'razorpay';

const razorpayInstance = () => {
  if (process.env.NODE_ENV === "test") {
    return null;
  }

  if(!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET){
    throw new Error("Razorpay credentials missing");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export default razorpayInstance;