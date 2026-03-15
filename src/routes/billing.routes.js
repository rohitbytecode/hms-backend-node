import express from 'express';
import { protect, authorize } from '../middleware/authmiddleware.js';
import * as billingController from '../controllers/billing.controller.js';

const router = express.Router();

//BILLING TRANSACTIONS

router.post(
  "/",
  protect,
  authorize(["admin", "billing", "receptionist"]),
  billingController.createBilling
);

router.get(
  "/",
  protect,
  authorize(["admin", "billing", "receptionist"]),
  billingController.getAllBilling
);

router.patch(
  "/:id/status",
  protect,
  authorize(["admin", "billing", "receptionist"]),
  billingController.updateBillingStatus
);

router.delete(
  "/:id",
  protect,
  authorize(["admin", "billing", "receptionist"]),
  billingController.deleteBilling
);

router.get(
  "/my",
  protect,
  authorize(["patient"]),
  billingController.getMyBills
);

router.post(
  "/create-order",
  protect,
  authorize(["patient"]),
  billingController.createRazorpayOrder
);

router.post(
  "/verify-payment",
  protect,
  authorize(["patient"]),
  billingController.verifyRazorpayPayment
);


//BILLING STAFF MANAGEMENT


router.post(
  "/staff",
  protect,
  authorize(["admin"]),
  billingController.createBillingStaff
);

router.get(
  "/staff",
  protect,
  authorize(["admin"]),
  billingController.getAllBillingStaff
);

router.put(
  "/staff/:id",
  protect,
  authorize(["admin"]),
  billingController.updateBillingStaff
);

router.delete(
  "/staff/:id",
  protect,
  authorize(["admin"]),
  billingController.deleteBillingStaff
);

router.put(
  "/staff/change-password",
  protect,
  authorize(["billing"]),
  billingController.changePassword
);

export default router;