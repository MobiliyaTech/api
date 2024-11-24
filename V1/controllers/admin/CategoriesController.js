const CategoriesModel = require('../../model/admin/categoriesModel');

class CategoriesController {

    // static async getDepartment(req, res) {
    //     try {
    //         const db = req.header('Schemas');
    //         const company_id =req.query['hashid'];
    //         const department = await DepartmentModel.getAllDepartment(db,company_id);
    //         res.status(200).json(
    //             {
    //                 status: true,
    //                 message: 'Get All Departments Successfully',
    //                 data: department
    //             }
    //         );
    //     } catch (err) {
    //         console.error(err);
    //         res.status(500).json({
    //             status: false,
    //             message: err.message,
    //             data: [],
                 
    //           });
    //     }
    // }


    // static async DepartmentInfo(req, res) {
    //     try {
    //         const db = req.header('Schemas');
    //         const hashid =req.query['hashid'];
    //         const department = await DepartmentModel.DepartmentInfo(db,hashid);
    //         res.status(200).json(
    //             {
    //                 status: true,
    //                 message: ' Get Department Info Successfully',
    //                 data: department
    //             }
    //         );
    //     } catch (err) {
    //         console.error(err);
    //         res.status(500).json({
    //             status: false,
    //             message: err.message,
    //             data: [],
    //              });
    //     }
    // }
    // static async DepartmentUpdate(req, res) {
    //     try {
    //         const department = await DepartmentModel.DepartmentUpdate(req);
    //         console.log('Data updated successfully!');
    //         res.status(200).json(
    //             {
    //                 status: true,
    //                 message: ' Department  Updated Successfully',
    //                 data: department
    //             }
    //         );
    //     } catch (err) {
    //         console.error(err);
    //         res.status(500).json({
    //             status: false,
    //             message: err.message,
    //             data: [],
    //              });        }
    // }
    
}

module.exports = CategoriesController;