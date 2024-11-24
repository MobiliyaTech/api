const TestModel = require("../../model/frontend/testModel");
const crypto = require("crypto");

const generateHashId = () => {
  return crypto.randomBytes(4).toString("hex").slice(0, 8);
};

class TestController {
  static async getCategoriesWithTests(req, res) {
    try {
      const categoriesWithTests = await TestModel.getCategoriesWithTests();
      res.status(200).json({
        status: true,
        message: "Categories with tests fetched successfully",
        data: categoriesWithTests,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        message: "Server error while fetching categories with tests",
        data: [],
      });
    }
  }
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

      // if (!questions || questions.length === 0) {
      //   return res.status(404).json({
      //     status: false,
      //     message: "No questions found for the given test.",
      //   });
      // }

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

  static async submitTest(req, res) {
    const {
      userHashid,
      testHashid,
      selectedAnswers,
      suggested_test_id /*, passcode */,
    } = req.body; // Comment out passcode

    try {
      // Validate the passcode
      // const validPasscode = "12345"; // In a real app, fetch the passcode from the DB or secure location
      // if (passcode !== validPasscode) {
      //   return res
      //     .status(400)
      //     .json({ status: false, message: "Incorrect passcode" });
      // }

      // Ensure that answers are submitted for every question
      if (!selectedAnswers || selectedAnswers.length === 0) {
        return res
          .status(400)
          .json({ status: false, message: "No answers submitted" });
      }

      // Check if testHashid and userHashid are provided
      if (!testHashid) {
        return res
          .status(400)
          .json({ status: false, message: "Test hashid is missing" });
      }

      if (!userHashid) {
        return res
          .status(400)
          .json({ status: false, message: "User hashid is missing" });
      }

      // Save the test result to the database using the model
      const result = await TestModel.submitTest(
        userHashid,
        testHashid,
        selectedAnswers,
        suggested_test_id
      );

      return res.status(200).json({
        status: true,
        message: "Test submitted successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error submitting test:", error);
      return res
        .status(500)
        .json({ status: false, message: "An error occurred" });
    }
  }

  static async getUserTests(req, res) {
    const { userHashId } = req.query;

    if (!userHashId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    try {
      const userTests = await TestModel.getTestsByUserHashId(userHashId);
      if (userTests.length === 0) {
        return res
          .status(404)
          .json({ message: "No tests found for this user." });
      }

      res.status(200).json({
        success: true,
        data: userTests,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching user tests.",
        error: error.message,
      });
    }
  }
}

module.exports = TestController;
