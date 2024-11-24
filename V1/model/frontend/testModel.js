const pool = require("../../../config/db");
const crypto = require("crypto");

class TestModel {
  static async getCategoriesWithTests() {
  try {
    const query = `
      SELECT 
    c.hashid AS category_hashid, 
    c.category_name, 
    c.description AS category_description, 
    t.hashid AS test_hashid, 
    t.test_name, 
    t.description AS test_description
FROM 
    public.testcategories c
LEFT JOIN 
    public.tests t ON t.category_hashid = c.hashid
LEFT JOIN 
    public.questions q ON q.test_hashid = t.hashid
WHERE 
    q.id IS NOT NULL  -- Only include tests that have at least one question
GROUP BY 
    c.hashid, c.category_name, c.description, t.hashid, t.test_name, t.description
ORDER BY 
    c.category_name ASC, t.test_name ASC;
    `;

    const results = await pool.query(query);

    // Structure the data: group tests under their respective categories
    const categoriesMap = {};
    results.rows.forEach((row) => {
      const {
        category_hashid,
        category_name,
        category_description,
        test_hashid,
        test_name,
        test_description,
      } = row;

      if (!categoriesMap[category_hashid]) {
        categoriesMap[category_hashid] = {
          hashid: category_hashid,
          category_name,
          description: category_description,
          tests: [],
        };
      }

      if (test_hashid) {
        categoriesMap[category_hashid].tests.push({
          test_hashid,
          test_name,
          test_description,
        });
      }
    });

    // Convert the map to an array
    return Object.values(categoriesMap);
  } catch (err) {
    console.error(err);
    throw new Error("Server error while fetching categories with tests");
  }
}

  // model
  static async getQuestionsByTestHashId(testHashId) {
    try {
      let hashid_part = testHashId.split("-");
      let id = hashid_part[1];
      const query = `
      SELECT q.hashid, t.test_name, t.description, q.question_text, ARRAY_AGG(
          JSON_BUILD_OBJECT('optionHashid', o.hashid, 'optionText', o.option_text)
        ) AS options
      FROM public.questions q
      LEFT JOIN public.tests t ON q.test_hashid = t.hashid  -- Correct join condition between questions and tests
      --LEFT JOIN public.tests t ON q.test_hashid = t.hashid  -- Correct join condition between questions and tests
      LEFT JOIN public.options o ON q.hashid = o.question_hashid
      WHERE q.test_hashid = $1
      GROUP BY q.hashid, t.test_name, t.description, q.question_text;  -- Added q.question_text to the GROUP BY clause
    `;

      const result = await pool.query(query, [id]);

      return result.rows;
    } catch (err) {
      console.error("Error fetching questions by test:", err);
      throw new Error("Server error while fetching questions.");
    }
  }

  static async submitTest(
    userHashid,
    testHashid,
    selectedAnswers,
    suggested_test_id
  ) {
    const hashid = crypto.randomBytes(4).toString("hex").slice(0, 8); // generate a unique hashid
    const client = await pool.connect(); // connect to the database
    const submittedAt = new Date(); // get current timestamp for submission
    const updatedAt = new Date();
    // const sql = await
    const sql = {
      text: `UPDATE public.suggested_test SET status= $1 
             WHERE hashid = $2 RETURNING *`,
      values: ["Done", suggested_test_id],
    };

    try {
      await client.query("BEGIN"); // start a transaction
      const sqlResult = await client.query(sql);
      let hashid_part = testHashid.split("-");
      let id = hashid_part[1];
      // Insert into the user_tests table with submitted_at and updated_at
      const userTestResult = await client.query(
        `INSERT INTO public.user_tests (hashid, user_hashid, test_hashid, suggested_test_id, submitted_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [hashid, userHashid, id, suggested_test_id, submittedAt, updatedAt]
      );

      const userTestHashid = userTestResult.rows[0].hashid;

      // Insert each answer into the user_answers table with answered_at and updated_at
      for (const { questionHashid, optionHashid } of selectedAnswers) {
        const answeredAt = new Date();
        await client.query(
          `INSERT INTO public.user_answers (hashid, user_test_hashid, question_hashid, option_hashid, answered_at, updated_at, suggestedtesthashid) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            crypto.randomBytes(4).toString("hex").slice(0, 8),
            userTestHashid,
            questionHashid,
            optionHashid,
            answeredAt,
            updatedAt,
            suggested_test_id,
          ]
        );
      }

      await client.query("COMMIT"); // commit the transaction

      return userTestResult.rows[0]; // return the inserted test details
    } catch (error) {
      await client.query("ROLLBACK"); // rollback the transaction if an error occurs
      console.error("Error submitting test:", error);
      throw error; // propagate the error to the controller
    } finally {
      client.release(); // release the client back to the pool
    }
  }

  static async getTestsByUserHashId(userHashId) {
    const query = `
        SELECT 
    ut.hashid AS user_test_hashid,
    t.hashid AS test_hashid,
    t.category_hashid,
    tc.category_name,
    t.test_name,
    t.description
FROM public.user_tests ut
JOIN tests t ON ut.test_hashid = t.hashid
JOIN testcategories tc ON t.category_hashid = tc.hashid
WHERE ut.user_hashid = $1;

    `;

    try {
      const result = await pool.query(query, [userHashId]);
      return result.rows; // Return the rows for the tests
    } catch (error) {
      console.error("Error fetching tests for user:", error);
      throw error;
    }
  }
}
module.exports = TestModel;
