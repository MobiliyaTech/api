const CounselorModel = require("../../model/admin/counselorModel");

class CounselorController {
  static async getAllCounselor(req, res) {
    try {
      const vendor = await CounselorModel.getAllCounselor();
      res.status(200).json({
        status: true,
        message: "Get Counselor List Successfully",
        data: vendor,
      });
    } catch (error) {
      res.status(500).send({
        status: false,
        message: error.message,
        data: [],
      });
    }
  }

  static async CounselorInsert(req, res) {
    try {
      const {
        first_name,
        middle_name,
        last_name,
        mobile,
        email,
        password,
        status,
        start_date,
        end_date,
      } = req.body;

      // Set role as 'counselor' by default
      const role = "counselor";

      const counselor = await CounselorModel.CounselorInsert({
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
      });

      res.status(201).json({
        status: true,
        message: "Counselor registered successfully!",
        data: counselor,
      });
    } catch (error) {
      res.status(500).send({
        status: false,
        message: error.message,
        data: null,
      });
    }
  }


  // Controller for deleting a counselor
static async CounselorDelete(req, res) {
  const { hashid } = req.params; // Extract hashid from URL parameters

  try {
    // Call the model method to delete the counselor
    await CounselorModel.CounselorDelete(hashid);

    res.status(200).json({
      status: true,
      message: "Counselor deleted successfully!",
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error.message,
    });
  }
}


  //fetch counselorInfo
  static async counselorInfo(req, res) {
    try {
      const counselorInfo = await CounselorModel.counselorInfo(
        req.query["hashid"]
      );
      res.status(200).json({
        status: true,
        message: "Get Counselor Details Successfully",
        data: counselorInfo,
      });
    } catch (error) {
      res.status(500).send({
        status: false,
        message: error.message,
        data: [],
      });
    }
  }

  //update counselor
  static async CounselorProfileUpdate(req, res) {
    try {
      const counselor = await CounselorModel.CounselorProfileUpdate(req);
      console.log("Data updated successfully!");
      res.status(200).json({
        status: true,
        message: "Counselor Profile Updated Successfully",
        data: counselor,
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

  //councesolor categories
  static async CategoriesInsert(req, res) {
    try {
      const categories = await CounselorModel.CategoriesInsert(req);
      console.log("Data inserted successfully!");
      res.status(200).json({
        status: true,
        message: "Category Inserted Successfully",
        data: categories,
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

  static async getAllCategories(req, res) {
    try {
      const category = await CounselorModel.getAllCategories();
      res.status(200).json({
        status: true,
        message: "Get All Departments Successfully",
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


  static async CategoriesUpdate(req, res) {
    try {
      const categories = await CounselorModel.CategoriesUpdate(req);
      console.log("Data updated successfully!");
      res.status(200).json({
        status: true,
        message: "Category Updated Successfully",
        data: categories,
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
  
  static async getCategoryById(req, res) {
    try {
      const categories = await CounselorModel.getCategoryById(req.params.hashid);
      if (categories) {
        res.status(200).json(categories);
      } else {
        res.status(404).json({ message: "Category not found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        message: err.message,
      });
    }
  }

static async CounselorCategoryDelete(req, res) {
  const { hashid } = req.params;

  try {
    const result = await CounselorModel.CounselorCategoryDelete(hashid);
    if (result.rowCount === 0) {
      return res.status(404).json({
        status: false,
        message: "Counselor Category not found!",
      });
    }

    res.status(200).json({
      status: true,
      message: "Counselor Category deleted successfully!",
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error.message,
    });
  }
}

  //update counselor in Admin panel

static async UpdateCounselor(req, res) {
  try {
    const updatedCounselor = await CounselorModel.UpdateCounselor(req.body);

    res.status(200).json({
      status: true,
      message: "Counselor Updated Successfully",
      data: updatedCounselor,
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

static async getAppointmentCount(req, res) {
  try {
    const counselorId = req.query.counselorId;

    if (!counselorId) {
      return res.status(400).json({
        status: false,
        message: "Counselor ID is required",
        data: {},
      });
    }

    const appointmentCounts = await CounselorModel.getAppointmentCount(
      counselorId
    );
    res.status(200).json({
      status: true,
      message: "Get Appointment Counts Successfully",
      data: appointmentCounts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: err.message,
      data: {},
    });
  }
}



// controllers/CounselorController.js

  static async getDetailsCount(req, res) {
    try {
      const detailsCounts = await CounselorModel.getDetailsCount();
      res.status(200).json({
        status: true,
        message: "Get Details Counts Successfully",
        data: detailsCounts,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        message: err.message,
        data: {},
      });
    }
  }




//for change password
static async getPassword(req, res) {
  try {
      const hashid =req.query['hashid'];
      const user = await CounselorModel.getPassword(hashid);
      res.status(200).json({
          status: true,
          message: 'Get User Password Successfully',
          data: user
      });
  } catch (error) {
      res.status(500).json({
          status: false,
          message: error.message,
          data: []
      });
  }
}
static async ChangePassword(req, res) {
  try {
      const { hashid, password } = req.body;
      const user = await CounselorModel.ChangePassword(hashid, password);
      res.status(200).json({
          status: true,
          message: 'User Password Update Successfully',
          data: user
      });
  } catch (error) {
      res.status(500).json({
          status: false,
          message: error.message,
          data: []
      });
  }
}

  
}

module.exports = CounselorController;
