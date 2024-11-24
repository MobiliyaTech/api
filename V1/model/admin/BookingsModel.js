// models/BookingsModel.js

const pool = require("../../../config/db");
const crypto = require("crypto");
const nodemailer = require('nodemailer');

class BookingsModel {
  static async getAppointmentsByCounselor(counselor_id) {
    const query = `
      SELECT 
    b.hashid AS booking_hashid,
    up.first_name AS user_first_name,
    up.last_name AS user_last_name,
    u.email AS user_email,
    u.mobile AS user_mobile,
    b.problem_category,
    b.language,
    b.message,
    b.booking_date,
    b.fees,
    t.slot_date,
    t.slot_time,
    b.status 
FROM 
    bookings b
JOIN 
    time_slots t ON b.slot_id = t.hashid
JOIN 
    user_profile up ON b.user_id = up.hashid
JOIN 
    users u ON b.user_id = u.hashid
WHERE 
    b.counselor_id = $1 AND b.status = 'pending'
ORDER BY 
    b.booking_date DESC;
    `;

    try {
      const result = await pool.query(query, [counselor_id]);
      return result.rows;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
  }

  static async getAppointmentDetails(appointmentHashId) {
    const query = `
      SELECT 
        b.hashid AS booking_hashid,
        up.hashid AS user_id,
        up.first_name AS user_first_name,
        up.last_name AS user_last_name,
        u.email AS user_email,
        b.mobile AS user_mobile,
        b.problem_category,
        b.language,
        b.message,
        b.booking_date,
        b.fees,
        t.slot_date,
        t.slot_time,
        t.status AS slot_status
      FROM bookings b
      JOIN time_slots t ON b.slot_id = t.hashid
      JOIN user_profile up ON b.user_id = up.hashid
      JOIN users u ON b.user_id = u.hashid
      WHERE b.hashid = $1
    `;

    try {
      const result = await pool.query(query, [appointmentHashId]);
      return result.rows[0]; // Return the first row since we expect a single appointment
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      throw error;
    }
  }

  //insert suggested test
  static async insertSuggestedTest(booking_id, user_id, testcategory_id, test_id, user_email, testName) {
    const hashid = crypto.randomBytes(4).toString("hex").slice(0, 8);
  
    const query = `
      INSERT INTO public.suggested_test (hashid, booking_id, user_id, testcategory_id, test_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
  
    try {
      const result = await pool.query(query, [
        hashid,
        booking_id,
        user_id,
        testcategory_id,
        test_id,
      ]);
  
      // Construct the test link using the test name and the newly inserted hashid
      const testLink = `http://localhost:5173/take-test/${testName.replace(/\s+/g, '_')}-${test_id}/${hashid}`;
  
      // Send the test link via email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      const mailOptions = {
        from: `"Rectify Wellness" <${process.env.EMAIL_USER}>`,
        to: user_email,
        subject: "Your Personalized Test Invitation from RectifyYou",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 20px; background-color: #f3f4f7; border-radius: 10px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);">
            
            <!-- Header Section -->
            <div style="background-color: #5156be; color: #ffffff; text-align: center; padding: 30px 20px; font-size: 36px; font-weight: bold; border-bottom: 3px solid #0062cc; border-radius: 10px 10px 0 0;">
              RectifyYou
              <p style="font-size: 18px; margin-top: 10px; font-weight: 400; font-style: italic;">Your Mental Health Support Partner</p>
            </div>
      
            <!-- Message Section -->
            <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.05);">
              <h2 style="font-size: 24px; color: #333; text-align: center; font-weight: 600;">Test Invitation from Your Counselor</h2>
              <p style="font-size: 16px; color: #555; text-align: center; line-height: 1.6;">
                  Your counselor has recommended a test to support your mental health journey. Please click the button below to start the test:
              </p>
      
              <!-- Button for Test Link -->
              <div style="text-align: center; margin: 30px;">
                  <a href="${testLink}" style="display: inline-block; background-color: #5156be; color: #ffffff; padding: 14px 40px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px; transition: background-color 0.3s;">
                      Start Your Test
                  </a>
              </div>
      
              <!-- Alternative Link Message -->
              <p style="font-size: 14px; color: #555; text-align: center; line-height: 1.5; margin: 20px 0;">
                  Alternatively, you can find the test link in your account under the <strong>My Appointments</strong> section. Please log in to access it:
              </p>
              <div style="text-align: center; margin: 20px;">
    <div style="text-align: center; margin: 20px;">
                  <a href="http://localhost:5173/pages-menu/my-appointments">http://localhost:5173/pages-menu/my-appointments</a>
    
              </div>
              </div>
      
              <div style="border-top: 1px solid #ddd; margin: 20px 0;"></div>
      
              <!-- Support Information -->
              <p style="font-size: 14px; color: #555; text-align: center; line-height: 1.5;">
                  If you have any questions or need assistance, feel free to reach out to us at 
                  <a href="mailto:support@rectifyyou.com" style="color: #0056b3; text-decoration: none;">support@rectifyyou.com</a>.
              </p>
            </div>
      
            <!-- Footer -->
            <div style="text-align: center; color: #888; font-size: 12px; margin-top: 25px;">
                <p style="margin: 0; font-size: 14px;">Thank you for trusting RectifyYou with your well-being.</p>
                <p style="margin: 5px 0; font-size: 14px;">The RectifyYou Team</p>
                <p style="margin-top: 15px; font-size: 12px; color: #888;">&copy; 2024 RectifyYou | All rights reserved.</p>
            </div>
      
          </div>
        `,
    };
    
  
      await transporter.sendMail(mailOptions);
  
      return result.rows[0]; // Return the newly inserted test record
    } catch (error) {
      console.error("Error inserting suggested test:", error);
      throw error;
    }
  }
  static async getSuggestedTestsByBookingId(bookingId) {
    const query = `
        SELECT 
            st.hashid AS test_hashid,
            st.testcategory_id,
            st.test_id,
            tc.category_name,
            t.test_name
        FROM public.suggested_test st
        JOIN testcategories tc ON st.testcategory_id = tc.hashid
        JOIN tests t ON st.test_id = t.hashid
        WHERE st.booking_id = $1
    `;

    try {
      const result = await pool.query(query, [bookingId]);
      return result.rows; // Return the rows for the suggested tests
    } catch (error) {
      console.error("Error fetching suggested tests:", error);
      throw error;
    }
  }

  static async deleteSuggestedTestByHashId(testHashId) {
    const query = `
    DELETE FROM public.suggested_test
    WHERE hashid = $1
    RETURNING *;
  `;

    try {
      const result = await pool.query(query, [testHashId]);
      return result.rowCount > 0; // Return true if a row was deleted
    } catch (error) {
      console.error("Error deleting suggested test:", error);
      throw error;
    }
  }


  static async updateMeetingLink(bookingHashId, meetingLink, userEmail, slot_date, slot_time) {
    const query = `
      UPDATE public.bookings
      SET meeting_link = $1, updated_at = CURRENT_TIMESTAMP
      WHERE hashid = $2
      RETURNING *;
    `;
  
    try {
      if (!userEmail) {
        throw new Error("Recipient email is undefined or missing.");
      }
  
      const result = await pool.query(query, [meetingLink, bookingHashId]);
      const updatedBooking = result.rows[0];
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      
      const emailSubject = `Appointment Meeting Link for RectifyYou ${slot_date} at ${slot_time}`;


      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: emailSubject,
        html: `
       <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 20px; background-color: #f3f4f7; border-radius: 10px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);">

    <!-- Logo Section
    <div style="text-align: center; padding-bottom: 20px;">
        <img src="https://www.shutterstock.com/image-vector/checklist-vector-logo-design-concept-600nw-1539779639.jpg" alt="RectifyYou Logo" style="max-width: 120px; height: auto; margin-bottom: 10px;">
    </div>  -->

    <!-- Header Section -->
  <div style="background-color: #5156be; color: #ffffff; text-align: center; padding: 30px 20px; font-size: 36px; font-weight: bold; border-bottom: 3px solid #0062cc; border-radius: 10px 10px 0 0;">
    RectifyYou
    <p style="font-size: 18px; margin-top: 10px; font-weight: 400; font-style: italic;">Your Mental Health Support Partner</p>
  </div>

    <!-- Session Details -->
    <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.05);">
        <h2 style="font-size: 24px; color: #333; text-align: center; font-weight: 600;">Session Details</h2>
        <p style="font-size: 16px; color: #555; text-align: center; line-height: 1.6;">
            We are pleased to confirm your upcoming session with RectifyYou. Please find your meeting details below.
        </p>

        <!-- Appointment Date and Time -->
        <div style="margin: 20px 0; text-align: center;">
            <p style="font-size: 16px; color: #333; margin: 5px 0;"><strong>Appointment Date:</strong> ${slot_date}</p>
            <p style="font-size: 16px; color: #333; margin: 5px 0;"><strong>Appointment Time:</strong> ${slot_time}</p>
        </div>

        <!-- Join Meeting Button -->
        <div style="text-align: center; margin: 30px;">
            <a href="${meetingLink}" style="display: inline-block; background-color:  #5156be;; color: #ffffff; padding: 14px 40px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px; transition: background-color 0.3s;">
                Join Meeting
            </a>
        </div>

        <!-- Divider -->
        <div style="border-top: 1px solid #ddd; margin: 20px 0;"></div>

        <!-- Support Information -->
        <p style="font-size: 14px; color: #555; text-align: center; line-height: 1.5;">
            If you have any questions, please contact us at 
            <a href="mailto:support@rectifyyou.com" style="color: #0056b3; text-decoration: none;">support@rectifyyou.com</a>.
        </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #888; font-size: 12px; margin-top: 25px;">
        <p style="margin: 0; font-size: 14px;">Thank you for trusting RectifyYou with your well-being.</p>
        <p style="margin: 5px 0; font-size: 14px;">The RectifyYou Team</p>
        <p style="margin-top: 15px; font-size: 12px; color: #888;">&copy; 2024 RectifyYou | All rights reserved.</p>
    </div>

</div>

        `,
      };
  
      await transporter.sendMail(mailOptions);
  
      return { success: true, message: "Meeting link updated and email sent successfully.", booking: updatedBooking };
    } catch (error) {
      console.error("Error updating meeting link or sending email:", error);
      return { success: false, message: "Error updating meeting link or sending email.", error: error.message };
    }
  }
  


  static async getMeetingLink(bookingHashId) {
    const query = `
    SELECT meeting_link
    FROM public.bookings
    WHERE hashid = $1;
  `;

    try {
      const result = await pool.query(query, [bookingHashId]);
      return result.rows[0]; // Returns the row with the meeting_link
    } catch (error) {
      console.error("Error retrieving meeting link:", error);
      throw error;
    }
  }

  // models/BookingsModel.js

  static async updateBookingStatus(bookingHashId, status) {
    const query = `
    UPDATE bookings 
    SET status = $1 , updated_at = NOW() 
    WHERE hashid = $2 
    RETURNING *;
  `;

    try {
      const result = await pool.query(query, [status, bookingHashId]);

      if (result.rows.length === 0) {
        return null; // Booking not found
      }

      return result.rows[0]; // Return the updated booking
    } catch (error) {
      throw new Error("Error updating booking status: " + error.message);
    }
  }

  // modal
  static async getBookingById(bookingHashId) {
    const query = `
    SELECT * FROM bookings 
    WHERE hashid = $1;
  `;

    try {
      const result = await pool.query(query, [bookingHashId]);

      if (result.rows.length === 0) {
        return null; // Booking not found
      }

      return result.rows[0]; // Return the booking
    } catch (error) {
      throw new Error("Error fetching booking: " + error.message);
    }
  }

  static async getCompletedAppointmentsByCounselor(counselor_id) {
    const query = `
      SELECT 
    b.hashid AS booking_hashid,
    up.first_name AS user_first_name,
    up.last_name AS user_last_name,
    u.email AS user_email,
    u.mobile AS user_mobile,
    b.problem_category,
    b.language,
    b.message,
    b.booking_date,
    b.fees,
    t.slot_date,
    t.slot_time,
    b.status,
    b.updated_at
FROM 
    bookings b
JOIN 
    time_slots t ON b.slot_id = t.hashid
JOIN 
    user_profile up ON b.user_id = up.hashid
JOIN 
    users u ON b.user_id = u.hashid
WHERE 
    b.counselor_id = $1 AND b.status = 'completed'
ORDER BY 
    b.booking_date DESC;

    `;

    try {
      const result = await pool.query(query, [counselor_id]);
      return result.rows;
    } catch (error) {
      console.error("Error fetching completed appointments:", error);
      throw error;
    }
  }
}

module.exports = BookingsModel;
