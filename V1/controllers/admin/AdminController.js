const AdminModel = require('../../model/admin/adminModel');

class AdminController{

  static async getAllUsers(req, res) {
    try {
      const users = await AdminModel.getAllUsers();
      res.status(200).json({
        status: true,
        message: "Get Users List Successfully",
        data: users,
      });
    } catch (error) {
      res.status(500).send({
        status: false,
        message: error.message,
        data: [],
      });
    }
  }
    static async getAllInquiries(req, res) {
        try {
          const enquiry = await AdminModel.getAllInquiries();
          res.status(200).json({
            status: true,
            message: "Get All Enquiries List Successfully",
            data: enquiry,
          });
        } catch (error) {
          res.status(500).send({
            status: false,
            message: error.message,
            data: [],
          });
        }
      }

      static async deleteInquiry(req, res) {
        const { hashid } = req.params;
        try {
            const result = await AdminModel.deleteInquiry(hashid);
            if (result) {
                res.status(200).json({
                    status: true,
                    message: "Inquiry deleted successfully.",
                });
            } else {
                res.status(404).json({
                    status: false,
                    message: "Inquiry not found.",
                });
            }
        } catch (error) {
            res.status(500).send({
                status: false,
                message: error.message,
            });
        }
    }

    //fetch addmin info

    static async fetchAdminInfo(req, res) {
      try {
        const hashid = req.query.hashid; // Get hashid from query parameters
        const adminInfo = await AdminModel.getAdminInfo(hashid); // Call model to fetch data
  
        if (adminInfo) {
          res.status(200).json({
            status: true,
            message: "Admin information retrieved successfully",
            data: adminInfo,
          });
        } else {
          res.status(404).json({
            status: false,
            message: "Admin not found",
          });
        }
      } catch (error) {
        res.status(500).json({
          status: false,
          message: error.message,
          data: [],
        });
      }
    }


}

module.exports = AdminController;
