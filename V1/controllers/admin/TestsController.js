const TestModel = require("../../model/admin/testModel");
const crypto = require('crypto');

const generateHashId = () => {
    return crypto.randomBytes(4).toString('hex').slice(0, 8);
};


class TestController {
 
    //test categories insert
  // Controller
static async TestCategoriesInsert(req, res) {
  try {
    const testcategories = await TestModel.TestCategoriesInsert(req);
    console.log("Data inserted successfully!");
    res.status(200).json({
      status: true,
      message: "Test Category Inserted Successfully",
      data: testcategories,
    });
  } catch (err) {
    console.error(err);
    
    // Check if the error code corresponds to a unique constraint violation
    if (err.code === '23505') { // PostgreSQL unique violation error code
      return res.status(409).json({
        status: false,
        message: "This category already exists.",
        data: [],
      });
    }

    // Handle other server errors
    res.status(500).json({
      status: false,
      message: "Server error",
      data: [],
    });
  }
}

  static async getTestCategoryById(req, res) {
    try {
      const categoryId = req.params.hashid;
      const category = await TestModel.getTestCategoryById(categoryId);
      if (category.length > 0) {
        res.status(200).json({ status: true, data: category[0] });
      } else {
        res.status(404).json({ status: false, message: "Category not found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: false, message: err.message });
    }
  }

  static async updateTestCategory(req, res) {
    try {
      const categoryId = req.params.hashid;
      const { category_name, status } = req.body;
      const updatedCategory = await TestModel.updateTestCategory(categoryId, {
        category_name,
        status,
      });
      if (updatedCategory.length > 0) {
        res.status(200).json({ status: true, message: "Category updated successfully", data: updatedCategory });
      } else {
        res.status(404).json({ status: false, message: "Category not found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: false, message: err.message });
    }
  }




  // controllers/TestController.js

static async deleteTestCategoryById(req, res) {
  try {
    const categoryId = req.params.hashid;
    const deleteResult = await TestModel.deleteTestCategoryById(categoryId);
    if (deleteResult.rowCount > 0) {
      res.status(200).json({ status: true, message: "Category deleted successfully" });
    } else {
      res.status(404).json({ status: false, message: "Category not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: err.message });
  }
}

  


    static async getAllTestCategories(req, res) {
    try {
      const category = await TestModel.getAllTestCategories();
      res.status(200).json({
        status: true,
        message: "Get All test categories Successfully",
        data: category,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        message: err.message,
        data: [],
      });
    }
  }


//   static async getTestsByCategory(req, res) {
//     try {
//       const tests = await TestModel.getTestsByCategory(req);
//       if (tests.length > 0) {
//         res.status(200).json({
//           status: true,
//           message: "Tests retrieved successfully",
//           data: tests,
//         });
//       } else {
//         res.status(404).json({
//           status: false,
//           message: "No tests found for the given category",
//           data: [],
//         });
//       }
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({
//         status: false,
//         message: err.message,
//         data: [],
//       });
//     }
//   }


static async insertTest(req, res) {
  try {
      const test = await TestModel.insertTest(req);
      res.status(200).json({
          status: true,
          message: "Test inserted successfully",
          data: test,
      });
  } catch (err) {
      console.error(err);
      // Check if the error message indicates a duplicate entry
      if (err.message === "This test name already exists.") {
          return res.status(409).json({
              status: false,
              message: err.message,
              data: [],
          });
      }

      res.status(500).json({
          status: false,
          message: "Server error: " + err.message,
          data: [],
      });
  }
}



  // controllers/TestController.js

// Fetch Test Details
static async getTestDetails(req, res) {
  try {
    const testId = req.params.test_hashid; // Update this line to use test_hashid
    const test = await TestModel.getTestDetails(testId);
    if (test) {
      res.status(200).json({
        status: true,
        message: "Test details retrieved successfully",
        data: test,
      });
    } else {
      res.status(404).json({
        status: false,
        message: "Test not found",
        data: {},
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: err.message,
      data: [],
    });
  }
}


// Update Test Name
static async updateTestName(req, res) {
  try {
    const updatedTest = await TestModel.updateTestName(req); // Call model to update test
    res.status(200).json({
      status: true,
      message: "Test updated successfully",
      data: updatedTest,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: err.message,
      data: [],
    });
  }
}


// controllers/admin/TestsController.js

static async deleteTest(req, res) {
  try {
    await TestModel.deleteTest(req); // Call model to delete test
    res.status(200).json({
      status: true,
      message: "Test deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: err.message,
    });
  }
}




  static async getAllTestList(req, res) {
    try {
      const category = await TestModel.getAllTestList();
      res.status(200).json({
        status: true,
        message: "Get All test List Successfully",
        data: category,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        message: err.message,
        data: [],
      });
    }
  }


  //get test name as per categories

  static async getTestsByCategory(req, res) {
    const { categoryHashId } = req.params;
    
    try {
      const tests = await TestModel.getTestsByCategory(categoryHashId);
      res.status(200).json({
        status: true,
        message: "Tests fetched successfully",
        data: tests,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        message: "Server error while fetching tests by category",
        data: [],
      });
    }
  }
  


  //add questions and options
  static async addQuestionWithOptions(req, res) {
    const { test_hashid, question_text, options } = req.body;
  
    if (!test_hashid || !question_text || !Array.isArray(options) || options.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid data provided. Test hash ID, question text, and at least one option are required.",
      });
    }
  
    try {
      // Save the question and get the question's hash ID
      const questionHashId = await TestModel.addQuestion(test_hashid, question_text);
  
      // Save options using the question's hash ID
      await Promise.all(
        options.map((optionText) => TestModel.addOption(questionHashId, optionText))
      );
  
      res.status(201).json({
        status: true,
        message: "Question and options added successfully",
      });
    } catch (err) {
      console.error("Error while adding question and options:", err);
      res.status(500).json({
        status: false,
        message: "Server error while adding question and options",
      });
    }
  }

  
  
  

  // controller
static async fetchQuestionsByTest(req, res) {
  const { testHashId } = req.params;

  if (!testHashId) {
    return res.status(400).json({
      status: false,
      message: "Test hash ID is required.",
    });
  }

  try {
    const questions = await TestModel.getQuestionsByTestHashId(testHashId);

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No questions found for the given test.",
      });
    }

    res.status(200).json({
      status: true,
      data: questions,
    });
  } catch (err) {
    console.error("Error while fetching questions:", err);
    res.status(500).json({
      status: false,
      message: "Server error while fetching questions.",
    });
  }
}



// controller
static async updateQuestionWithOptions(req, res) {
  const { question_hashid, question_text, options } = req.body;

  if (!question_hashid || !question_text || !Array.isArray(options) || options.length === 0) {
    return res.status(400).json({
      status: false,
      message: "Invalid data provided. Question hash ID, question text, and at least one option are required.",
    });
  }

  try {
    // Update question text
    await TestModel.updateQuestionText(question_hashid, question_text);

    // Update options (remove old options and insert new ones)
    await TestModel.updateOptionsForQuestion(question_hashid, options);

    res.status(200).json({
      status: true,
      message: "Question and options updated successfully.",
    });
  } catch (err) {
    console.error("Error while updating question and options:", err);
    res.status(500).json({
      status: false,
      message: "Server error while updating question and options.",
    });
  }
}


// Controller function to delete a question by its hash ID
static async deleteQuestion(req, res) {
  const { questionHashId } = req.params;

  if (!questionHashId) {
    return res.status(400).json({
      status: false,
      message: "Question hash ID is required.",
    });
  }

  try {
    const deleteResult = await TestModel.deleteQuestionByHashId(questionHashId);

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({
        status: false,
        message: "Question not found.",
      });
    }

    res.status(200).json({
      status: true,
      message: "Question deleted successfully.",
    });
  } catch (err) {
    console.error("Error while deleting question:", err);
    res.status(500).json({
      status: false,
      message: "Server error while deleting question.",
    });
  }
}



static async getUserTestResult(req, res) {
  const { test_hashid } = req.params;

  try {
    const testResult = await TestModel.getUserTestResult(test_hashid);
    if (!testResult || testResult.length === 0) {  // Check for empty results
      return res.status(204).json({  // Use 204 No Content
        status: false,
        message: "No test result submitted by the user.",
      });
    }
    return res.status(200).json({
      status: true,
      data: testResult,
    });
  } catch (error) {
    console.error("Error fetching test result:", error);
    return res.status(500).json({
      status: false,
      message: "Server error while fetching test result.",
    });
  }
}



}

module.exports = TestController;
