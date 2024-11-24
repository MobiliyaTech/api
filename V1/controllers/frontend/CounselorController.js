const CounselorModel = require("../../model/frontend/counselorModel");
const pool = require("../../../config/db");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const dotenv = require("dotenv");
dotenv.config();

class CounselorController {
  static async getAllCounselor(req, res) {
    try {
      const counselor = await CounselorModel.getAllCounselor();
      res.status(200).json({
        status: true,
        message: "Get Counselor List Successfully",
        data: counselor,
      });
    } catch (error) {
      res.status(500).send({
        status: false,
        message: error.message,
        data: [],
      });
    }
  }

  static async counselorInfo(req, res) {
    try {
      const counselorInfo = await CounselorModel.counselorInfo(
        req.query["hashid"]
      );
      res.status(200).json({
        status: true,
        message: "Get Counselor Details Successfully",
        data: counselorInfo,
      });
    } catch (error) {
      res.status(500).send({
        status: false,
        message: error.message,
        data: [],
      });
    }
  }

  // Method to handle getting all categories
  static async getAllCategories(req, res) {
    try {
      const categories = await CounselorModel.getAllCategories();
      res.status(200).json({
        status: true,
        message: "Categories fetched successfully",
        data: categories,
      });
    } catch (error) {
      res.status(500).send({
        status: false,
        message: error.message,
        data: [],
      });
    }
  }

  // Method to handle filtering counselors by category
  static async getCounselorsByCategory(req, res) {
    try {
      const categoryHashid = req.params.categoryHashid; // Get the categoryHashid from URL params

      // Fetch counselors by category
      const counselors = await CounselorModel.getCounselorsByCategory(
        categoryHashid
      );

      // Fetch the category name from counselorcategories table
      const categoryResult = await pool.query(
        `SELECT category_name 
         FROM counselorcategories 
         WHERE hashid = $1`,
        [categoryHashid]
      );

      const categoryName =
        categoryResult.rows.length > 0
          ? categoryResult.rows[0].category_name
          : null;

      res.status(200).json({
        status: true,
        message: "Counselors fetched successfully",
        data: counselors,
        category_name: categoryName, // Adding category_name below the data array
      });
    } catch (error) {
      res.status(500).send({
        status: false,
        message: error.message,
        data: [],
      });
    }
  }

  static async PayNow(req, res) {
    const { amount } = req.body;
    try {
      const razorpay = new Razorpay({
        key_id: process.env.YOUR_RAZORPAY_KEY_ID,
        key_secret: process.env.YOUR_RAZORPAY_KEY_SECRET,
      });
      if (!amount) {
        return res.status(400).json({ error: "Amount is Required" });
      }
      const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `receipt_${Math.random().toString(36).substr(2, 9)}`,
      };
      const order = await razorpay.orders.create(options);
      res.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  static async VerifyPayment(req, res) {
    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
        req.body;
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.YOUR_RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");
      if (razorpay_signature === expectedSign) {
        return res
          .status(200)
          .json({ message: "Payment verified successfully" });
      } else {
        return res.status(400).json({ error: "Invalid payment signature" });
      }
    } catch (err) {
      console.error("Error verifying payment:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // bookings controller
  static async BookingsInsert(req, res) {
    try {
      const bookings = await CounselorModel.BookingsInsert(req);
      const updateSlotSql = {
        text: `UPDATE public.time_slots SET status = 'booked' WHERE hashid = $1`,
        values: [bookings.slot_id],
      };
      await pool.query(updateSlotSql);
      res.status(200).json({
        status: true,
        message: "Booking Inserted Successfully",
        data: bookings,
      });
    } catch (err) {
      console.error("Error in BookingsInsert controller:", err.message);
      res.status(500).json({
        status: false,
        message: err.message,
        data: [],
      });
    }
  }

  static async timeslotFetch(req, res) {
    try {
      const { counselor_id, date } = req.query;

      if (!counselor_id || !date) {
        return res.status(400).json({
          status: false,
          message: "Missing required parameters (counselor_id, date).",
        });
      }

      // Fetch time slots for the specific date
      const timeSlots = await CounselorModel.getTimeSlotsForDate(
        counselor_id,
        date
      );
      // Fetch counselor languages and categories
      const counselorDetails = await CounselorModel.getCounselorDetails(
        counselor_id
      );

      res.status(200).json({
        status: true,
        message: "Time slots and counselor details fetched successfully",
        timeSlots,
        counselorDetails,
      });
    } catch (error) {
      console.error("Error fetching time slots:", error);
      res.status(500).json({
        status: false,
        message:
          error.message || "Failed to fetch time slots and counselor details",
      });
    }
  }

  // Method to handle getting user appointments
  static async getUserAppointments(req, res) {
    const { user_id, status } = req.query; // Get user_id and status from the request query

    if (!user_id) {
      return res.status(400).json({
        status: false,
        message: "User ID is required",
        data: [],
      });
    }

    try {
      const appointments = await CounselorModel.getUserAppointments(
        user_id,
        status
      );

      // Initialize suggested tests for each appointment
      const appointmentsWithTests = await Promise.all(
        appointments.map(async (appointment) => {
          const suggestedTestsQuery = `
              SELECT 
                  st.hashid AS test_hashid,
                  st.testcategory_id,
                  st.test_id,
                  tc.category_name,
                  t.test_name,
                  st.status
              FROM public.suggested_test st
              JOIN testcategories tc ON st.testcategory_id = tc.hashid
              JOIN tests t ON st.test_id = t.hashid
              WHERE st.booking_id = $1
          `;

          const suggestedTestsResult = await pool.query(suggestedTestsQuery, [
            appointment.booking_id,
          ]);
          return {
            ...appointment,
            suggested_tests: suggestedTestsResult.rows, // Add suggested tests to the appointment
          };
        })
      );

      res.status(200).json({
        status: true,
        message: "Appointments fetched successfully",
        data: appointmentsWithTests, // Send the modified appointments array
      });
    } catch (error) {
      res.status(500).send({
        status: false,
        message: error.message,
        data: [],
      });
    }
  }
}

module.exports = CounselorController;
