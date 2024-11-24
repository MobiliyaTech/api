// controllers/BookingsController.js

const BookingsModel = require('../../model/admin/BookingsModel');
const pool = require("../../../config/db");

class BookingsController {
  static async getAppointments(req, res) {
    const { counselor_id } = req.query; 

    if (!counselor_id) {
      return res.status(400).json({ message: "Counselor hashid is required." });
    }

    try {
      const appointments = await BookingsModel.getAppointmentsByCounselor(counselor_id);
      if (appointments.length === 0) {
        return res.status(404).json({ message: 'No appointments founds.' });
      }

      res.status(200).json({
        success: true,
        data: appointments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching appointments.',
        error: error.message,
      });
    }
  }


  static async getAppointmentDetails(req, res) {
    const { appointmentHashId } = req.params; 

    if (!appointmentHashId) {
      return res.status(400).json({ message: "Appointment hash ID is required." });
    }

    try {
      const appointmentDetails = await BookingsModel.getAppointmentDetails(appointmentHashId);
      if (!appointmentDetails) {
        return res.status(404).json({ message: 'Appointment not found.' });
      }

      res.status(200).json({
        success: true,
        data: appointmentDetails,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching appointment details.',
        error: error.message,
      });
    }
  }


  //suggested test insert
 // Controller
static async insertSuggestedTest(req, res) {
  const { booking_id, user_id, testcategory_id, test_id, user_email } = req.body;

  if (!booking_id || !user_id || !testcategory_id || !test_id || !user_email) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Query the test name from the tests table based on test_id
    const testResult = await pool.query('SELECT test_name FROM public.tests WHERE hashid = $1', [test_id]);

    if (testResult.rows.length === 0) {
      return res.status(404).json({ message: "Test not found." });
    }

    const testName = testResult.rows[0].test_name;

    // Insert the suggested test and send the email from the model
    const newTest = await BookingsModel.insertSuggestedTest(
      booking_id,
      user_id,
      testcategory_id,
      test_id,
      user_email, // Pass the user_email here
      testName    // Pass the test name here for constructing the email link
    );

    res.status(201).json({
      success: true,
      message: "Suggested test inserted and email sent successfully.",
      data: newTest,
    });
  } catch (error) {
    console.error("Error inserting suggested test or sending email:", error);
    res.status(500).json({
      success: false,
      message: "Error inserting suggested test or sending email.",
      error: error.message,
    });
  }
}


  static async getSuggestedTests(req, res) {
    const { bookingId } = req.params; 

    if (!bookingId) {
        return res.status(400).json({ message: "Booking ID is required." });
    }

    try {
        const suggestedTests = await BookingsModel.getSuggestedTestsByBookingId(bookingId);
        if (suggestedTests.length === 0) {
            return res.status(404).json({ message: 'No suggested tests found for this booking.' });
        }

        res.status(200).json({
            success: true,
            data: suggestedTests,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching suggested tests.',
            error: error.message,
        });
    }
}

static async deleteSuggestedTest(req, res) {
  const { testHashId } = req.params;

  try {
    const isDeleted = await BookingsModel.deleteSuggestedTestByHashId(testHashId);

    if (isDeleted) {
      return res.status(200).json({ message: 'Suggested test deleted successfully' });
    } else {
      return res.status(404).json({ message: 'Suggested test not found' });
    }
  } catch (error) {
    console.error('Error deleting suggested test:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

static async updateMeetingLink(req, res) {
  const { bookingHashId } = req.params;
  const { meeting_link, user_email, slot_date, slot_time } = req.body; // Get user_email from request body

  if (!bookingHashId || !meeting_link || !user_email) { // Check for user_email
    return res.status(400).json({ message: "Booking hash ID, meeting link, and user email are required." });
  }

  try {
    // Pass user_email to the model method
    const updatedBooking = await BookingsModel.updateMeetingLink(bookingHashId, meeting_link, user_email, slot_date, slot_time);
    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    res.status(200).json({
      success: true,
      data: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating meeting link.',
      error: error.message,
    });
  }
}


static async getMeetingLink(req, res) {
  const { bookingHashId } = req.params;

  if (!bookingHashId) {
    return res.status(400).json({ message: "Booking hash ID is required." });
  }

  try {
    const booking = await BookingsModel.getMeetingLink(bookingHashId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    res.status(200).json({
      success: true,
      data: booking.meeting_link,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving meeting link.',
      error: error.message,
    });
  }
}

// controllers/BookingsController.js

static async markBookingAsCompleted(req, res) {
  const { bookingHashId } = req.params;

  try {
    const updatedBooking = await BookingsModel.updateBookingStatus(bookingHashId, "completed");

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated to completed.",
      data: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating booking status.',
      error: error.message,
    });
  }
}


// controller
static async getBookingStatus(req, res) {
  const { bookingHashId } = req.params;

  try {
    const booking = await BookingsModel.getBookingById(bookingHashId); // Fetch the booking by ID

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    res.status(200).json({
      success: true,
      message: "Booking status retrieved successfully.",
      data: { status: booking.status }, // Return the status of the booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking status.',
      error: error.message,
    });
  }
}




  static async getCompletedAppointments(req, res) {
    const { counselor_id } = req.query; 

    if (!counselor_id) {
      return res.status(400).json({ message: "Counselor hashid is required." });
    }

    try {
      const appointments = await BookingsModel.getCompletedAppointmentsByCounselor(counselor_id);
      if (appointments.length === 0) {
        return res.status(404).json({ message: 'No completed appointments found.' });
      }

      res.status(200).json({
        success: true,
        data: appointments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching completed appointments.',
        error: error.message,
      });
    }
  }
}



module.exports = BookingsController;
