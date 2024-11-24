const pool = require("../../../config/db");
const crypto = require("crypto");

class testModel {
  // Model
static async TestCategoriesInsert(req) {
  try {
    const { category_name, description } = req.body;
    const hashid = crypto.randomBytes(4).toString("hex").slice(0, 8);
    const sql = {
      text: `INSERT INTO public.testcategories (hashid, category_name, description) 
             VALUES ($1, $2, $3) RETURNING *`,
      values: [hashid, category_name, description],
    };
    const results = await pool.query(sql);
    return results.rows;
  } catch (err) {
    console.error(err);
    throw err; // Make sure to throw the error to be caught in the controller
  }
}


  //models/TestsModel.js

// Fetch Test Category by ID
static async getTestCategoryById(categoryId) {
  const sql = {
    text: `SELECT * FROM public.testcategories WHERE hashid = $1`,
    values: [categoryId],
  };
  const result = await pool.query(sql);
  return result.rows;
}

// Update Test Category
static async updateTestCategory(categoryId, { category_name, status }) {
  const sql = {
    text: `UPDATE public.testcategories 
           SET category_name = $1 
           WHERE hashid = $2
           RETURNING *`,
    values: [category_name, categoryId],
  };
  const result = await pool.query(sql);
  return result.rows;
}



  static async getAllTestCategories() {
    try {
      const query = `SELECT hashid, category_name, description FROM public.testcategories ORDER BY category_name ASC`;

      const results = await pool.query(query);

      return results.rows;
    } catch (err) {
      console.error(err);
      throw new Error("Server error while fetching categories");
    }
  }




  static async deleteTestCategoryById(categoryId) {
    const client = await pool.connect(); 
    try {
      await client.query('BEGIN'); 
  
      const deleteOptionsSql = {
        text: `DELETE FROM public.options WHERE question_hashid IN (
                 SELECT hashid FROM public.questions WHERE test_hashid IN (
                   SELECT hashid FROM public.tests WHERE category_hashid = $1
                 )
               )`,
        values: [categoryId],
      };
      await client.query(deleteOptionsSql);
  
      const deleteQuestionsSql = {
        text: `DELETE FROM public.questions WHERE test_hashid IN (
                 SELECT hashid FROM public.tests WHERE category_hashid = $1
               )`,
        values: [categoryId],
      };
      await client.query(deleteQuestionsSql);
  
      const deleteTestsSql = {
        text: `DELETE FROM public.tests WHERE category_hashid = $1`,
        values: [categoryId],
      };
      await client.query(deleteTestsSql);
  
      const deleteCategorySql = {
        text: `DELETE FROM public.testcategories WHERE hashid = $1`,
        values: [categoryId],
      };
      const result = await client.query(deleteCategorySql);
  
      await client.query('COMMIT'); 
      return result; 
    } catch (error) {
      await client.query('ROLLBACK'); 
      throw error; 
    } finally {
      client.release(); 
    }
  }
  


  //test-name insert

  static async insertTest(req) {
    try {
        const { test_name, description } = req.body;
        const category_hashid = req.headers["category-hashid"];
        const hashid = crypto.randomBytes(4).toString("hex").slice(0, 8);

        // Check if the test name already exists
        const existingTestQuery = {
            text: `SELECT * FROM public.tests WHERE test_name = $1`,
            values: [test_name],
        };

        const existingTestResult = await pool.query(existingTestQuery);

        if (existingTestResult.rows.length > 0) {
            throw new Error("This test name already exists.");
        }

        // Insert the new test
        const sql = {
            text: `INSERT INTO public.tests (hashid, category_hashid, test_name, description) 
                   VALUES ($1, $2, $3, $4) RETURNING *`,
            values: [hashid, category_hashid, test_name, description],
        };

        const results = await pool.query(sql);
        return results.rows;
    } catch (err) {
        console.error(err);
        throw new Error("Server error while inserting test: " + err.message);
    }
}


  // models/TestModel.js

// Get Test Details
static async getTestDetails(testId) {
  try {
    const query = `SELECT hashid, test_name, description  FROM public.tests WHERE hashid = $1`;
    const results = await pool.query(query, [testId]);
    return results.rows[0]; 
  } catch (err) {
    console.error(err);
    throw new Error("Server error while fetching test details");
  }
}

// Update Test
static async updateTestName(req) {
  try {
    const { test_name, description } = req.body;
    const testId = req.params.test_hashid; 

    const sql = {
      text: `UPDATE public.tests SET test_name = $1, description = $2 WHERE hashid = $3 RETURNING *`,
      values: [test_name, description, testId],
    };

    const results = await pool.query(sql);
    return results.rows[0]; 
  } catch (err) {
    console.error(err);
    throw new Error("Server error while updating test");
  }
}


// models/TestsModel.js

static async deleteTest(req) {
  const client = await pool.connect(); // Get a client from the pool
  try {
    const testId = req.params.test_hashid; 

    await client.query('BEGIN'); // Start a transaction

    // Step 1: Delete options related to this test's questions
    const deleteOptionsSql = {
      text: `DELETE FROM public.options WHERE question_hashid IN (
               SELECT hashid FROM public.questions WHERE test_hashid = $1
             )`,
      values: [testId],
    };
    await client.query(deleteOptionsSql);

    // Step 2: Delete questions related to this test
    const deleteQuestionsSql = {
      text: `DELETE FROM public.questions WHERE test_hashid = $1`,
      values: [testId],
    };
    await client.query(deleteQuestionsSql);

    // Step 3: Delete the test
    const deleteTestSql = {
      text: `DELETE FROM public.tests WHERE hashid = $1`,
      values: [testId],
    };
    await client.query(deleteTestSql);

    await client.query('COMMIT'); // Commit the transaction
  } catch (err) {
    await client.query('ROLLBACK'); // Roll back the transaction on error
    console.error(err);
    throw new Error("Server error while deleting test");
  } finally {
    client.release(); // Release the client back to the pool
  }
}




  static async getAllTestList() {
    try {
      const query = `SELECT t.hashid AS test_hashid, t.test_name, t.category_hashid, t.description, t.created_at, t.updated_at, c.category_name FROM tests t JOIN testcategories c ON t.category_hashid = c.hashid ORDER BY c.category_name ASC, t.test_name ASC`;

      const results = await pool.query(query);

      return results.rows;
    } catch (err) {
      console.error(err);
      throw new Error("Server error while fetching categories");
    }
  }

  //for get test name related that category
  static async getTestsByCategory(categoryHashId) {
    try {
      const query = `
            SELECT t.hashid AS test_hashid, t.test_name, t.category_hashid, t.description, 
                   t.created_at, t.updated_at, c.category_name 
            FROM tests t 
            JOIN testcategories c ON t.category_hashid = c.hashid 
            WHERE t.category_hashid = $1 
            ORDER BY t.test_name ASC`;

      const results = await pool.query(query, [categoryHashId]);
      return results.rows;
    } catch (err) {
      console.error(err);
      throw new Error("Server error while fetching tests by category");
    }
  }

  //test-name get
  static async getTestsByCategory(req) {
    try {
      const category_hashid = req.headers["category-hashid"];

      const sql = {
        text: `SELECT * FROM public.tests WHERE category_hashid = $1`,
        values: [category_hashid],
      };

      const results = await pool.query(sql);
      return results.rows;
    } catch (err) {
      console.error(err);
      throw new Error("Server error while fetching tests by category");
    }
  }

  static async addQuestion(testHashId, questionText) {
    try {
      const questionHashId = crypto.randomBytes(4).toString("hex").slice(0, 8); 
      const query = `
            INSERT INTO public.questions (hashid, test_hashid, question_text, created_at, updated_at)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING hashid;
          `;

      const result = await pool.query(query, [
        questionHashId,
        testHashId,
        questionText,
      ]);
      return result.rows[0].hashid;
    } catch (err) {
      console.error("Error inserting question:", err);
      throw new Error("Server error while adding question");
    }
  }

  static async addOption(questionHashId, optionText) {
    try {
      const optionHashId = crypto.randomBytes(4).toString("hex").slice(0, 8); 
      const query = `
            INSERT INTO public."options" (hashid, question_hashid, option_text, created_at, updated_at)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING hashid;
          `;

      await pool.query(query, [optionHashId, questionHashId, optionText]);
    } catch (err) {
      console.error("Error inserting option:", err);
      throw new Error("Server error while adding option");
    }
  }

  static async getTestsByCategory(category_hashid) {
    const sql = {
      text: `SELECT * FROM public.tests WHERE category_hashid = $1`,
      values: [category_hashid],
    };
    const results = await pool.query(sql);
    return results.rows;
  }


// model
static async getQuestionsByTestHashId(testHashId) {
  try {
    const query = `
      SELECT q.hashid, q.question_text, ARRAY_AGG(o.option_text) AS options
      FROM public.questions q
      LEFT JOIN public.options o ON q.hashid = o.question_hashid
      WHERE q.test_hashid = $1
      GROUP BY q.hashid, q.question_text;  -- Added q.question_text to the GROUP BY clause
    `;

    const result = await pool.query(query, [testHashId]);

    return result.rows;
  } catch (err) {
    console.error("Error fetching questions by test:", err);
    throw new Error("Server error while fetching questions.");
  }
}




// model
static async updateQuestionText(questionHashId, questionText) {
  try {
    const query = `
      UPDATE public.questions
      SET question_text = $1, updated_at = CURRENT_TIMESTAMP
      WHERE hashid = $2;
    `;

    await pool.query(query, [questionText, questionHashId]);
  } catch (err) {
    console.error("Error updating question:", err);
    throw new Error("Server error while updating question.");
  }
}

static async updateOptionsForQuestion(questionHashId, optionsArray) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete existing options for the question
    const deleteQuery = `
      DELETE FROM public.options
      WHERE question_hashid = $1;
    `;
    await client.query(deleteQuery, [questionHashId]);

    // Insert new options
    const insertQuery = `
      INSERT INTO public.options (hashid, question_hashid, option_text, created_at, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `;
    
    for (const optionText of optionsArray) {
      const optionHashId = crypto.randomBytes(4).toString("hex").slice(0, 8);
      await client.query(insertQuery, [optionHashId, questionHashId, optionText]);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error updating options:", err);
    throw new Error("Server error while updating options.");
  } finally {
    client.release();
  }
}


 static async deleteQuestionByHashId(questionHashId) {
  const client = await pool.connect(); 
  try {
    await client.query('BEGIN'); 

    const deleteOptionsSql = {
      text: `DELETE FROM public.options WHERE question_hashid = $1`,
      values: [questionHashId],
    };
    await client.query(deleteOptionsSql);

    const deleteQuestionSql = {
      text: `DELETE FROM public.questions WHERE hashid = $1`,
      values: [questionHashId],
    };
    const result = await client.query(deleteQuestionSql);

    await client.query('COMMIT'); 
    return result; 
  } catch (err) {
    await client.query('ROLLBACK'); 
    console.error("Error deleting question by hash ID:", err);
    throw new Error("Server error while deleting question.");
  } finally {
    client.release(); 
  }
}



static async getUserTestResult(test_hashid) {
  try {
    const query = `
      SELECT 
        q.question_text,
        opt.option_text,
        ua.answered_at,
        q.hashid AS question_hashid,
        opt.hashid AS option_hashid,
        t.test_name
      FROM 
        public.user_tests ut
        JOIN public.user_answers ua ON ut.hashid = ua.user_test_hashid
        JOIN public.questions q ON q.hashid = ua.question_hashid
        JOIN public."options" opt ON opt.hashid = ua.option_hashid
        JOIN public.tests t ON t.hashid = ut.test_hashid 
      WHERE 
        ut.suggested_test_id = $1
    `;
    const result = await pool.query(query, [test_hashid]);

    return result.rows;  // This will return an empty array if no results are found
  } catch (error) {
    console.error("Error fetching user test result:", error);
    throw new Error("Error fetching user test result.");
  }
}



}
module.exports = testModel;
