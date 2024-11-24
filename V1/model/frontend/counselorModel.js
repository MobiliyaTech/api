const pool = require("../../../config/db");
const crypto = require("crypto");
  const nodemailer = require('nodemailer');
  

class CounselorModel {
  static async getAllCounselor() {
    try {
      const counselor_results = await pool.query(`
        SELECT u.id, u.hashid, u.role,  u.status,  v.first_name, v.middle_name, v.last_name, v.profile_pic, v.heading, v.total_booking
        FROM public.users as u 
        RIGHT JOIN public.counselorProfile as v 
        ON v.hashid = u.hashid 
        WHERE u.role = 'counselor' 
        ORDER BY v.id DESC
      `);
      return counselor_results.rows;
    } catch (err) {
      console.error(err);
      throw new Error("Server error");
    }
  }

  static async counselorInfo(hashid) {
    try {
      let hashid_part = hashid.split("-");
      let id = hashid_part[1];
      const results = await pool.query(
        `SELECT u.role,
                c.first_name, c.middle_name, c.last_name, c.gender,
                c.specialist, c.age, c.languages, c.marital_status, 
                c.experience, c.price, c.original_price, c.education, 
                c.occupation, c.profile_pic, c.description, co.category_name
         FROM users u
         JOIN counselorProfile c ON u.hashid = c.hashid
         LEFT JOIN counselorcategories co ON co.hashid = c.categories
         WHERE u.hashid = $1`,
        [id]
      );
      return results.rows;
    } catch (err) {
      console.error(err);
      throw new Error("Server error");
    }
  }

  // Method to get all categories
  static async getAllCategories() {
    try {
      const categoryResults = await pool.query(`
          SELECT hashid, category_name 
          FROM counselorcategories
          WHERE status = 'active'  -- Assuming you want only active categories
          ORDER BY category_name ASC
        `);
      return categoryResults.rows;
    } catch (err) {
      console.error(err);
      throw new Error("Server error");
    }
  }

  static async getCounselorsByCategory(categoryHashid) {
    try {
      const results = await pool.query(
        `SELECT u.id, u.hashid, u.role, u.status, 
                  c.first_name, c.middle_name, c.last_name, c.profile_pic, c.heading, c.total_booking
           FROM users u
           JOIN counselorProfile c ON u.hashid = c.hashid
           WHERE u.role = 'counselor' AND c.categories LIKE '%' || $1 || '%'
           ORDER BY c.id DESC`,
        [categoryHashid]
      );
      return results.rows;
    } catch (err) {
      console.error(err);
      throw new Error("Server error");
    }
  }



  static async BookingsInsert(req) {
    try {
        const {
            user_id,
            counselor_id,
            slot_id,
            fees,
            problem_category,
            language,
            message,
            booking_date,
            mobile_number,
            razorpay_payment_id,
            razorpay_order_id,
            user_email
        } = req.body;

        // Check for required fields
        if (!user_id || !counselor_id || !slot_id || !booking_date || !fees) {
            throw new Error("Missing required fields");
        }

        // Generate a unique hash ID for the booking
        const hashid = crypto.randomBytes(4).toString("hex").slice(0, 8);

        // SQL query to insert booking data into the database
        const sql = {
            text: `INSERT INTO public.bookings 
                   (hashid, user_id, counselor_id, slot_id, booking_date, fees, problem_category, language, mobile, message, status, created_at, updated_at, razorpay_payment_id, razorpay_order_id) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $11, $12) 
                   RETURNING *`,
            values: [
                hashid,
                user_id,
                counselor_id,
                slot_id,
                new Date(booking_date).toISOString(),
                fees,
                problem_category,
                language,
                mobile_number,
                message,
                razorpay_payment_id,
                razorpay_order_id
            ]
        };

        // Execute the query and return the inserted booking details
        const bookingResult = await pool.query(sql);
        const bookingDetails = bookingResult.rows[0];

        // Update the total booking count for the counselor
        const updateBookingCountQuery = {
            text: `UPDATE public.counselorprofile 
                   SET total_booking = total_booking + 1 
                   WHERE hashid = $1`,
            values: [counselor_id]
        };

        await pool.query(updateBookingCountQuery);

        // Query to get the slot date and time from the time_slots table
        const timeSlotQuery = {
            text: `SELECT slot_date, slot_time 
                   FROM public.time_slots 
                   WHERE hashid = $1`,
            values: [slot_id]
        };

        const timeSlotResult = await pool.query(timeSlotQuery);
        if (timeSlotResult.rows.length === 0) {
            throw new Error("Time slot not found");
        }

        const { slot_date, slot_time } = timeSlotResult.rows[0];
        const formattedDate = new Date(slot_date).toLocaleDateString();
        const formattedTime = slot_time;

        // Query to get counselor's full name from counselorprofile table
        const counselorQuery = {
            text: `SELECT first_name, last_name 
                   FROM public.counselorprofile 
                   WHERE hashid = $1`,
            values: [counselor_id]
        };

        const counselorResult = await pool.query(counselorQuery);
        if (counselorResult.rows.length === 0) {
            throw new Error("Counselor not found");
        }

        const { first_name, last_name } = counselorResult.rows[0];
        const counselorFullName = `${first_name} ${last_name}`;

        // Send confirmation email
        await this.sendBookingConfirmationEmail(user_email, bookingDetails, counselorFullName, formattedDate, formattedTime, message);

        return bookingDetails;
    } catch (err) {
        console.error("Error inserting booking:", err.message);
        throw new Error(err.message || "Server error");
    }
}

static async sendBookingConfirmationEmail(userEmail, bookingDetails, counselorFullName, formattedDate, formattedTime, userMessage) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const emailSubject = `Booking Confirmation for ${formattedDate} at ${formattedTime}`;

    const emailContent = `
   <div style="font-family: 'Arial', sans-serif; max-width: 650px; margin: auto; padding: 30px; background-color: #f4f7fc; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
  
  <!-- Header Section -->
  <div style="background-color: #5156be; color: #ffffff; text-align: center; padding: 30px 20px; font-size: 36px; font-weight: bold; border-bottom: 3px solid #0062cc; border-radius: 10px 10px 0 0;">
    RectifyYou
    <p style="font-size: 18px; margin-top: 10px; font-weight: 400; font-style: italic;">Your Mental Health Support Partner</p>
  </div>

  <!-- Booking Confirmation Section -->
  <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.05); margin-top: -10px;">
    <h2 style="font-size: 28px; color: #333; margin-bottom: 15px; text-align: center; font-weight: 600;">Booking Confirmation</h2>
    <p style="font-size: 16px; color: #555; text-align: center; margin-bottom: 30px;">Thank you for scheduling your session with us! Please find your appointment details below.</p>

    <!-- Booking Details Table -->
    <table style="width: 100%; font-size: 16px; color: #333; margin-bottom: 25px; line-height: 1.6; border-collapse: collapse;">
      <tr>
        <td style="padding: 12px; font-weight: bold; color: #555;">Counselor Name:</td>
        <td style="padding: 12px; color: #333;">${counselorFullName}</td>
      </tr>
      <tr style="background-color: #f2f7fb;">
        <td style="padding: 12px; font-weight: bold; color: #555;">Date & Time:</td>
        <td style="padding: 12px; color: #333;">${formattedDate}, ${formattedTime}</td>
      </tr>
      <tr>
        <td style="padding: 12px; font-weight: bold; color: #555;">Category:</td>
        <td style="padding: 12px; color: #333;">${bookingDetails.problem_category}</td>
      </tr>
      <tr style="background-color: #f2f7fb;">
        <td style="padding: 12px; font-weight: bold; color: #555;">Language:</td>
        <td style="padding: 12px; color: #333;">${bookingDetails.language}</td>
      </tr>
      <tr>
        <td style="padding: 12px; font-weight: bold; color: #555;">Fees:</td>
        <td style="padding: 12px; color: #333;">${bookingDetails.fees}</td>
      </tr>
      <tr style="background-color: #f2f7fb;">
        <td style="padding: 12px; font-weight: bold; color: #555;">Message:</td>
        <td style="padding: 12px; color: #333;">${userMessage}</td>
      </tr>
    </table>
    
     <div style="text-align: center;">
      <a href="http://rectifyyou.com/pages-menu/my-appointments" style="background-color: #5156be; color: #ffffff; padding: 14px 35px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 6px; transition: background-color 0.3s; ">
        View Appointment
      </a>
    </div>

    <!-- Divider -->
    <div style="height: 2px; background-color: #0056b3; margin: 20px 0px; "></div>
    

    <!-- Contact Section -->
    <p style="font-size: 14px; color: #555; text-align: center; margin-bottom: 20px;">
      If you have any questions or need assistance, please feel free to contact us at 
      <a href="mailto:support@rectifyyou.com" style="color: #0056b3; text-decoration: none;">support@rectifyyou.com</a>.
    </p>

    <!-- Call-to-Action Button -->
   

    <!-- Footer Section -->
    <div style="text-align: center; color: #888; font-size: 12px; margin-top: 40px;">
      <p style="margin: 0;">Thank you for trusting RectifyYou with your well-being.</p>
      <p style="margin: 5px 0 0;">The RectifyYou Team</p>
    </div>
  </div>

  <!-- Footer -->
  <div style="text-align: center; padding: 15px; font-size: 12px; color: #888; margin-top: 30px; border-top: 2px solid #e0e0e0;">
    <p style="margin: 0;">© 2024 RectifyYou | All rights reserved.</p>
  </div>
</div>

`;




    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: emailSubject,
        html: emailContent
    };

    await transporter.sendMail(mailOptions);
}


  static async getTimeSlotsForDate(counselor_id, date) {
    try {
      let hashid_part = counselor_id.split("-");
      let id = hashid_part[1];
      const sql = {
        text: `SELECT hashid, slot_date, slot_time, EXTRACT(DOW FROM slot_date AT TIME ZONE 'UTC') AS day_of_week FROM public.time_slots WHERE counselor_id = $1  AND slot_date = $2 AND status = 'available' -- Only fetch time slots with 'available' status ORDER BY slot_time; `,
        values: [id, date],
      };
      const result = await pool.query(sql);
      const timeSlots = [];
      result.rows.forEach((row) => {
        const dayOfWeek = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ][row.day_of_week - 1];
        timeSlots.push({
          hashid: row.hashid,
          slotTime: row.slot_time,
          dayOfWeek: dayOfWeek,
        });
      });
      return timeSlots;
    } catch (error) {
      console.error("Error fetching time slots:", error);
      throw error;
    }
  }

  static async getCounselorDetails(counselor_id) {
    try {
      let hashid_part = counselor_id.split("-");
      let id = hashid_part[1]; 
      const sql = {
        text: ` SELECT cp.languages, cp.categories FROM public.counselorprofile cp WHERE cp.hashid = $1; `,
        values: [id],
      };

      const result = await pool.query(sql);
      const languages = result.rows[0]?.languages || "N/A";
      const categoriesString = result.rows[0]?.categories || null;
      let categories = [];

      if (categoriesString) {
        const categoryHashes = categoriesString.split(",").map((cat) => cat.trim());
        const categorySql = {
          text: ` SELECT cc.category_name FROM public.counselorcategories cc WHERE cc.hashid = ANY($1::varchar[]); `,
          values: [categoryHashes],
        };
        const categoryResult = await pool.query(categorySql);
        categories = categoryResult.rows.map((row) => row.category_name);
      }
      return { languages, categories, };
    } catch (error) {
      console.error("Error fetching counselor details:", error);
      throw error;
    }
  }
  // Method to fetch user appointments based on status
  static async getUserAppointments(user_id, status) {
    try {
      let appointmentsQuery = `
      SELECT 
          c.first_name || ' ' || COALESCE(c.middle_name, '') || ' ' || c.last_name AS counselor_name,
          c.profile_pic,
          c.specialist,
          b.booking_date,
          b.slot_id,
          b.language,
          b.problem_category,
          ts.slot_time,
          b.status,  -- Include the status of the appointment
          b.hashid AS booking_id,  -- Include booking_id to fetch suggested tests
          b.meeting_link,  -- Include meeting_link directly from bookings
          b.message,
          b.fees
      FROM 
          bookings b
      JOIN 
          counselorprofile c ON b.counselor_id = c.hashid
      JOIN 
          time_slots ts ON ts.hashid = b.slot_id
      WHERE 
          b.user_id = $1
      `;

      // If status is provided, filter based on status
      if (status) {
        appointmentsQuery += ` AND b.status = $2`;
      }

      appointmentsQuery += ` ORDER BY b.booking_date DESC`;

      const params = status ? [user_id, status] : [user_id]; // Prepare query parameters
      const result = await pool.query(appointmentsQuery, params);
      return result.rows; // Return the appointments result
    } catch (err) {
      console.error(err);
      throw new Error("Server error");
    }
  }
}

module.exports = CounselorModel;
