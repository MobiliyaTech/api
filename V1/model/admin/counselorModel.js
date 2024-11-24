const pool = require("../../../config/db");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, htmlContent) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Replace with your SMTP server
    port: 587, // Replace with your SMTP port
    secure: false,
    auth: {
      user: process.env.EMAIL_USER, // Your email from .env
      pass: process.env.EMAIL_PASS, // Your email password from .env
    },
  });

  const mailOptions = {
    from: `"Rectify You" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

class CounselorModel {
  static async getAllCounselor() {
    try {
      const counselor_results = await pool.query(`
                SELECT u.id, u.hashid, u.email, u.role,  u.status,  v.first_name, v.middle_name, v.last_name, u.mobile, v.start_date, v.end_date
                FROM public.users as u RIGHT JOIN public.counselorProfile as v ON v.hashid = u.hashid WHERE u.role = 'counselor' ORDER BY v.id DESC
            `);
      return counselor_results.rows;
    } catch (err) {
      console.error(err);
      throw new Error("Server error");
    }
  }
  static async CounselorInsert(counselorData) {
    const {
      first_name,
      middle_name,
      last_name,
      mobile,
      email,
      password,
      role,
      status,
      start_date,
      end_date,
    } = counselorData;

    const hashid = crypto.randomBytes(4).toString("hex").slice(0, 8);

    const userSql = {
      text: `INSERT INTO public.users (
                hashid, mobile, email, password, role, schemas, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, hashid, mobile, email`,
      values: [
        hashid,
        mobile,
        email,
        password,
        role,
        null, // Assuming 'schemas' is null, adjust if required
        status,
      ],
    };

    const profileSql = {
      text: `INSERT INTO public.counselorProfile (
                hashid, first_name, middle_name, last_name, start_date, end_date
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, hashid, first_name, last_name`,
      values: [
        hashid,
        first_name,
        middle_name,
        last_name,
        start_date,
        end_date,
      ],
    };

    try {
      // Start a transaction
      await pool.query("BEGIN");

      const userResult = await pool.query(userSql);
      const profileResult = await pool.query(profileSql);

      // Commit the transaction
      await pool.query("COMMIT");

      // Prepare email content
      const emailContent = `
  <div style="font-family: 'Arial', sans-serif; max-width: 650px; margin: auto; padding: 40px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); color: #333; line-height: 1.6;">
   <div style="background-color: #5156be; color: #ffffff; text-align: center; padding: 20px 20px; font-size: 32px; font-weight: bold; border-bottom: 3px solid #0062cc; border-radius: 10px 10px 0 0;">
        RectifyYou
        <p style="font-size: 16px; margin-top: 10px; font-style: italic;">Your Mental Health Support Partner</p>
    </div>

    <!-- Welcome Heading -->
    <h2 style="font-size: 20px; font-weight: 700; color: #2c3e50; text-align: center; margin-bottom: 20px;">
        Welcome to RectifyYou, As Counselor!
    </h2>

    <!-- Greeting Message -->
    <p style="font-size: 16px; color: #555; text-align: left; margin-bottom: 20px;">
        Dear ${first_name} ${last_name},
    </p>

    <p style="font-size: 16px; color: #555; text-align: left; margin-bottom: 20px;">
        We are thrilled to have you join the RectifyYou team as a counselor! Your passion for helping others and your expertise will play a vital role in providing meaningful mental health support to those in need.
    </p>

    <!-- Account Information Section -->
    <div style="background-color: #f7f7f7; padding: 20px; border-radius: 8px; margin-top: 25px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
        
        <div style="margin-bottom: 15px;">
            <p style="font-size: 16px; color: #555; margin-bottom: 5px; font-weight: bold;">Registered Email</p>
            <p style="font-size: 16px; color: #333;">${email}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
            <p style="font-size: 16px; color: #555; margin-bottom: 5px; font-weight: bold;">Password</p>
            <p style="font-size: 16px; color: #333;">${password}</p>
        </div>
    </div>

    <!-- Login Button -->
    <div style="text-align: center; margin-top: 30px;">
        <a href="http://web.rectifyyou.com.s3-website.ap-south-1.amazonaws.com/login" style="display: inline-block; background-color: #5156be; color: #ffffff; padding: 14px 35px; font-size: 18px; font-weight: 600; text-decoration: none; border-radius: 6px; transition: background-color 0.3s;">
            Log in now
        </a>
    </div>

    <!-- Profile Update Instructions -->
   <p style="font-size: 16px; color: #555; text-align: left; margin-top: 30px;">
    <span style="margin-right: 8px;">&#10003;</span> Complete your profile with your background and expertise to match with clients aligned with your counseling style.
</p>
<p style="font-size: 16px; color: #555; text-align: left; margin-bottom: 20px;">
    <span style="margin-right: 8px;">&#10003;</span> For security, change your temporary password to a secure one in account settings as soon as possible.
</p>

    <!-- Support & Contact Information -->
    <p style="font-size: 14px; color: #555; text-align: center; margin-top: 30px;">
        If you need assistance or have any questions, our support team is here to help.
    </p>
    <p style="font-size: 14px; color: #555; text-align: center;">
        Contact us at: 
        <a href="mailto:support@rectifyyou.com" style="color: #1abc9c; text-decoration: none;">support@rectifyyou.com</a>
    </p>

    <!-- Footer -->
    <div style="text-align: center; color: #888; font-size: 12px; margin-top: 40px;">
        <p style="margin: 0;">Thank you for becoming a part of the RectifyYou community.</p>
        <p style="margin-top: 15px;">&copy; 2024 RectifyYou | All rights reserved.</p>
    </div>

</div>

`;

      // Send email
      await sendEmail(email, "Welcome to Our Service", emailContent);

      return {
        user: userResult.rows[0],
        profile: profileResult.rows[0],
      };
    } catch (err) {
      await pool.query("ROLLBACK");
      console.error(err);
      throw new Error("Failed to insert counselor");
    }
  }

  // Email sending function

  //get counselor info

  static async counselorInfo(hashid) {
    try {
        const results = await pool.query(
            `SELECT u.mobile, u.email, u.status, u.password, u.role,
                    c.first_name, c.middle_name, c.last_name, c.gender,
                    c.specialist, c.age, c.languages, c.marital_status,
                    c.experience, c.price, c.original_price, c.education,
                    c.occupation, c.profile_pic, c.description, c.heading,
                    c.categories, c.start_date, c.end_date
             FROM users u
             JOIN counselorProfile c ON u.hashid = c.hashid
             WHERE u.hashid = $1`, [hashid]
        );
        return results.rows;
    } catch (err) {
        console.error(err);
        throw new Error("Server error");
    }
}


  // Model method for deleting a counselor
  static async CounselorDelete(hashid) {
    try {
      // Start a transaction
      await pool.query("BEGIN");

      // Delete from the counselorProfile table
      const profileDeleteSql = {
        text: `DELETE FROM public.counselorProfile WHERE hashid = $1`,
        values: [hashid],
      };
      await pool.query(profileDeleteSql);

      // Delete from the users table
      const userDeleteSql = {
        text: `DELETE FROM public.users WHERE hashid = $1`,
        values: [hashid],
      };
      await pool.query(userDeleteSql);

      // Commit the transaction
      await pool.query("COMMIT");
    } catch (err) {
      await pool.query("ROLLBACK");
      console.error(err);
      throw new Error("Failed to delete counselor");
    }
  }

  static async CounselorProfileUpdate(req) {
    const {
      hashid,
      first_name,
      middle_name,
      last_name,
      email,
      password,
      status,
      start_date,
      end_date,
      gender,
      specialist,
      age,
      languages,
      marital_status,
      experience,
      price,
      original_price,
      education,
      occupation,
      profile_pic,
      description,
      heading,
      city,
      state,
      country,
      zip_code,
      mobile,
      categories, // Array of category IDs selected by the counselor
    } = req.body;

    // Convert categories array to a comma-separated string
    const categoriesString = categories.join(", ");

    try {
      // Update users table
      const usersSql = {
        text: `UPDATE public.users 
                       SET email = $2, 
                           password = $3, 
                           status = $4, 
                           mobile = $5, 
                           updated_at = CURRENT_TIMESTAMP
                       WHERE hashid = $1 
                       RETURNING *`,
        values: [hashid, email, password, status, mobile],
      };
      const usersResults = await pool.query(usersSql);

      // Update counselorprofile table with new category hashids
      const counselorSql = {
        text: `UPDATE public.counselorprofile 
                       SET first_name = $2, 
                           middle_name = $3, 
                           last_name = $4, 
                           gender = $5,
                           specialist = $6,
                           age = $7,
                           languages = $8,
                           marital_status = $9,
                           experience = $10,
                           price = $11,
                           original_price = $12,
                           education = $13,
                           occupation = $14,
                           profile_pic = $15,
                           description = $16,
                           heading = $17,
                           start_date = $18,
                           end_date = $19,
                           city = $20,
                           state = $21,
                           country = $22,
                           zip_code = $23,
                           categories = $24,
                           updated_at = CURRENT_TIMESTAMP
                       WHERE hashid = $1 
                       RETURNING *`,
        values: [
          hashid,
          first_name,
          middle_name,
          last_name,
          gender,
          specialist,
          age,
          languages,
          marital_status,
          experience,
          price,
          original_price,
          education,
          occupation,
          profile_pic,
          description,
          heading,
          start_date,
          end_date,
          city,
          state,
          country,
          zip_code,
          categoriesString, // Save the categories as a comma-separated string
        ],
      };
      const counselorResults = await pool.query(counselorSql);

      return {
        users: usersResults.rows,
        counselor: counselorResults.rows,
      };
    } catch (err) {
      console.error(err);
      throw new Error("Server error");
    }
  }

  //coucesolor categories

  static async CategoriesInsert(req) {
    try {
      const { category_name, status } = req.body;
      const hashid = crypto.randomBytes(4).toString("hex").slice(0, 8);
      const sql = {
        text: `INSERT INTO public.counselorcategories (hashid, category_name,status, created_at, updated_at) 
                           VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
        values: [hashid, category_name, status],
      };
      const results = await pool.query(sql);
      return results.rows;
    } catch (err) {
      console.error(err);
      throw new Error("Server error");
    }
  }

  //get all counceliors categories

  static async getAllCategories() {
    try {
      const query = `SELECT id, hashid, category_name, status, created_at, updated_at FROM public.counselorcategories ORDER BY created_at DESC`;
      const results = await pool.query(query);
      return results.rows;
    } catch (err) {
      console.error(err);
      throw new Error("Server error while fetching categories");
    }
  }

  static async CategoriesUpdate(req) {
    try {
      const { category_name, status } = req.body;
      const { hashid } = req.params;
      const sql = {
        text: `UPDATE public.counselorcategories 
               SET category_name = $1, status = $2, updated_at = CURRENT_TIMESTAMP 
               WHERE hashid = $3 RETURNING *`,
        values: [category_name, status, hashid],
      };
      const result = await pool.query(sql);
      return result.rows[0]; // Return the updated row
    } catch (err) {
      console.error(err);
      throw new Error("Server error");
    }
  }

  static async getCategoryById(hashid) {
    try {
      const sql = {
        text: `SELECT * FROM public.counselorcategories WHERE hashid = $1`,
        values: [hashid],
      };
      const result = await pool.query(sql);
      return result.rows[0];
    } catch (err) {
      console.error(err);
      throw new Error("Server error");
    }
  }

  // delete counselor category
  static async CounselorCategoryDelete(hashid) {
    try {
      const query = {
        text: `DELETE FROM public.counselorcategories WHERE hashid = $1`,
        values: [hashid],
      };

      const result = await pool.query(query); // Execute the delete query

      return result;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  //update counselor in admin panel
  static async UpdateCounselor({
    hashid,
    first_name,
    middle_name,
    last_name,
    email,
    password,
    status,
    start_date,
    end_date,
    mobile,
  }) {
    try {
      const updateUserSql = {
        text: `UPDATE public.users 
             SET email = $2, 
                 password = $3, 
                 status = $4, 
                 mobile = $5, 
                 updated_at = CURRENT_TIMESTAMP
             WHERE hashid = $1 
             RETURNING *`,
        values: [hashid, email, password, status, mobile],
      };
      const userUpdateResult = await pool.query(updateUserSql);

      const updateCounselorSql = {
        text: `UPDATE public.counselorprofile 
             SET first_name = $2, 
                 middle_name = $3, 
                 last_name = $4, 
                 start_date = $5, 
                 end_date = $6, 
                 updated_at = CURRENT_TIMESTAMP
             WHERE hashid = $1 
             RETURNING *`,
        values: [
          hashid,
          first_name,
          middle_name,
          last_name,
          start_date,
          end_date,
        ],
      };
      const counselorUpdateResult = await pool.query(updateCounselorSql);

      // Return updated results
      return {
        user: userUpdateResult.rows[0],
        counselorProfile: counselorUpdateResult.rows[0],
      };
    } catch (err) {
      console.error(err);
      throw new Error("Server error during counselor  update");
    }
  }

  static async getAppointmentCount(counselorId) {
    try {
      const query = `
    SELECT
      COUNT(CASE WHEN booking_date = CURRENT_DATE AND status = 'pending' THEN 1 END) AS live_appointments,
      COUNT(CASE WHEN booking_date > CURRENT_DATE AND status != 'completed' THEN 1 END) AS upcoming_appointments,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_appointments,
       COALESCE(SUM(CASE WHEN status = 'completed' THEN fees END), 0) AS total_revenue
    FROM public.bookings
    WHERE counselor_id = $1;
  `;
      const values = [counselorId];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (err) {
      console.error(err);
      throw new Error("Server error while fetching appointment counts");
    }
  }

  static async getDetailsCount() {
    try {
      const query = `
      SELECT 
        (SELECT COUNT(*) FROM public.users WHERE role = 'user') AS total_users,
        (SELECT COUNT(*) FROM public.users WHERE role = 'counselor') AS total_counselors,
        (SELECT COUNT(*) FROM public.contactform) AS total_enquiries,
        (SELECT COALESCE(SUM(fees), 0) FROM public.bookings) AS total_revenue,
        (SELECT COUNT(*) FROM public.testcategories) AS total_test_categories, 
  (SELECT COUNT(*) FROM public.tests) AS total_tests 
    `;

      const result = await pool.query(query);
      return result.rows[0];
    } catch (err) {
      console.error(err);
      throw new Error("Server error while fetching Details counts");
    }
  }

  //for change password

  static async getPassword(hashid) {
    try {
      const results = await pool.query(
        `SELECT u.hashid, u.email, u.mobile, u.password, u.role, u.schemas, u.status FROM public.users as u WHERE u.hashid = $1`,
        [hashid]
      );
      return results.rows;
    } catch (err) {
      console.error(err);
      throw new Error("Server error");
    }
  }
  static async ChangePassword(hashid, password) {
    const sql = {
      text: `UPDATE public.users SET password = $2 WHERE hashid = $1 RETURNING *`,
      values: [hashid, password],
    };
    try {
      const results = await pool.query(sql);
      return results.rows;
    } catch (err) {
      console.error(err);
      throw new Error("Server error");
    }
  }
}

module.exports = CounselorModel;
