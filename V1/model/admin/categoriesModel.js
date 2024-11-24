const pool = require("../../../config/db");
const crypto = require("crypto");

class CategoriesModel {
  // static async getAllDepartment(db, company_id) {
  //     try {
  //         const results = await pool.query(`SELECT did as id, hashid, company_id, department_name, status FROM ${db}.department WHERE company_id = $1 ORDER BY id DESC`, [company_id]);
  //         return results.rows;
  //     } catch (err) {
  //         console.error(err);
  //         throw new Error('Server error');
  //     }
  // }
 

  // static async DepartmentInfo(db,hashid) {
  //     try {
  //         const results = await pool.query(`SELECT * FROM ${db}.department WHERE hashid = $1`, [hashid]);
  //         return results.rows;
  //     } catch (err) {
  //         console.error(err);
  //         throw new Error('Server error');
  //     }
  // }
  // static async DepartmentUpdate(req) {
  //     try {
  //         const db = req.header('Schemas');
  //         const { department_name, status, hashid } = req.body;
  //         const sql = {
  //           text: `UPDATE ${db}.department SET department_name = $1, status = $2 WHERE hashid = $3 RETURNING *`,
  //           values: [department_name, status, hashid],
  //         };
  //         const results = await pool.query(sql);
  //         return results.rows;
  //     } catch (err) {
  //         console.error(err);
  //         throw new Error('Server error');
  //     }
  // }
}

module.exports = CategoriesModel;
