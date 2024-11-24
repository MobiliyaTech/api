// models/BookingsModel.js

const pool = require("../../../config/db");

class AdminModel {

  static async getAllUsers() {
    try {
      const users_results = await pool.query(`
                SELECT u.id, u.hashid, u.email, u.role, u.mobile,   v.first_name, v.middle_name, v.last_name
                FROM public.users as u RIGHT JOIN public.user_Profile as v ON v.hashid = u.hashid WHERE u.role = 'user' ORDER BY v.id DESC
            `);
      return users_results.rows;
    } catch (err) {
      console.error(err);
      throw new Error("Server error");
    }
  }
    static async getAllInquiries() {
        try {
          const result = await pool.query(`
            SELECT id, hashid, name, email, message, created_at
            FROM public.contactform
            ORDER BY created_at DESC
          `);
          return result.rows;
        } catch (err) {
          console.error('Error fetching inquiries:', err);
          throw new Error('Server error');
        }
      }

      static async deleteInquiry(hashid) {
        try {
            const result = await pool.query(
                `DELETE FROM public.contactform WHERE hashid = $1 RETURNING *`,
                [hashid]
            );
            return result.rowCount > 0; // Return true if a row was deleted
        } catch (err) {
            console.error('Error deleting inquiry:', err);
            throw new Error('Server error');
        }
    }


    static async getAdminInfo(hashid) {
      try {
        const query = `
           SELECT up.first_name, up.middle_name, up.last_name, u.mobile ,u.email
            FROM public.users AS u
            JOIN public.user_profile AS up ON u.hashid = up.hashid
            WHERE u.hashid = $1
        `;
        const result = await pool.query(query, [hashid]);
  
        if (result.rows.length > 0) {
          return result.rows[0]; // Return the first matching row
        } else {
          return null; // No user found with the given hashid
        }
      } catch (err) {
        console.error(err);
        throw new Error("Server error");
      }
    }

}

module.exports = AdminModel;
