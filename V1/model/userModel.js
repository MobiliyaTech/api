const pool = require("../../config/db");
const crypto = require("crypto");

class UserModel {

  static async findByEmail(email) {
    const query = {
      text: `SELECT u.*, up.first_name, up.last_name FROM public.users as u INNER JOIN public.user_profile as up ON up.hashid = u.hashid WHERE u.email = $1`,
      values: [email],
    };
    const result = await pool.query(query);
    return result.rows[0];
  }

  static async registerUserWithProfile({ mobile, email, password, first_name, last_name }) {
    const hashid = crypto.randomBytes(4).toString("hex").slice(0, 8);
    const userSql = {
      text: `INSERT INTO public.users (hashid, mobile, email, password, role, schemas, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, hashid, mobile, email, role, status`,
      values: [ hashid, mobile, email, password, "user", null, "active" ],
    };
    const userProfileSql = {
      text: `INSERT INTO public.user_profile ( hashid, first_name, last_name ) VALUES ($1, $2, $3) RETURNING *`,
      values: [ hashid, first_name, last_name],
    };
    try {
      await pool.query("BEGIN");
      const userResult = await pool.query(userSql);
      const userProfileResult = await pool.query(userProfileSql);
      const user = userResult.rows[0];
      const profile = userProfileResult.rows[0];
      await pool.query("COMMIT");
      return { user, profile };
    } catch (error) {
      await pool.query("ROLLBACK");
      console.error("Error during registration transaction:", error);
      throw new Error("Database error");
    }
  }

  static async createContactForm({ name, email, message }) {
    const hashid = crypto.randomBytes(4).toString("hex").slice(0, 8); 
    try {
      const result = await pool.query(
        "INSERT INTO public.contactform (hashid, name, email, message) VALUES ($1, $2, $3, $4) RETURNING *",
        [hashid, name, email, message]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  }

  static async getAllContactForms() {
    try {
      const result = await pool.query("SELECT * FROM public.contactform ORDER BY created_at DESC");
      return result.rows;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error; 
    }
  }

  static async create({ first_name, last_name, email, status }) {
    const hashid = crypto.randomBytes(4).toString("hex").slice(0, 8);
    const userSql = {
        text: `INSERT INTO public.users (hashid, email, status, role) VALUES ($1, $2, $3, $4) RETURNING id, hashid, email, status, role`,
        values: [hashid, email, status, 'user'], // Set the role to 'user' by default
    };
    const userProfileSql = {
        text: `INSERT INTO public.user_profile (hashid, first_name, last_name) VALUES ($1, $2, $3) RETURNING *`,
        values: [hashid, first_name, last_name],
    };
    try {
        await pool.query("BEGIN");
        const userResult = await pool.query(userSql);
        const userProfileResult = await pool.query(userProfileSql);
        const user = userResult.rows[0];
        const profile = userProfileResult.rows[0];
        await pool.query("COMMIT");
        return { user, profile };
    } catch (error) {
        await pool.query("ROLLBACK");
        console.error("Error during user creation transaction:", error);
        throw new Error("Database error");
    }
}
}

module.exports = UserModel;
