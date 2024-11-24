const TimeSlotModel = require("../../model/admin/timeslotModel");


class TimeSlotController {
  
        static async timeslotInsert(req, res) {
            try {
                const timeslots = req.body.timeSlots; // Adjusted to match the API call
    
                // Check if the payload is an array
                if (!Array.isArray(timeslots)) {
                    return res.status(400).json({
                        status: false,
                        message: "Invalid input: Expected an array of timeslots",
                        data: [],
                    });
                }
    
                const insertedTimeslots = [];
    
                // Insert each timeslot individually
                for (const timeslot of timeslots) {
                    const result = await TimeSlotModel.timeslotInsert(timeslot); 
                    insertedTimeslots.push(result);
                }
    
                res.status(200).json({
                    status: true,
                    message: "Timeslots inserted successfully",
                    data: insertedTimeslots,
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


        static async timeslotFetch(req, res) {
            try {
              const { counselor_id, month, year } = req.query;
        
              if (!counselor_id || !month || !year) {
                return res.status(400).json({
                  status: false,
                  message: "Missing required parameters (counselor_id, month, year).",
                });
              }
        
              const timeSlots = await TimeSlotModel.getTimeSlotsForMonth(counselor_id, month, year);
        
              res.status(200).json({
                status: true,
                message: "Time slots fetched successfully",
                timeSlots,
              });
            } catch (error) {
              console.error("Error fetching time slots:", error);
              res.status(500).json({
                status: false,
                message: error.message || "Failed to fetch time slots",
              });
            }
          }



          static async timeslotDelete(req, res) {
            try {
              const { hashid } = req.body;
        
              if (!hashid) {
                return res.status(400).json({
                  status: false,
                  message: "Missing required parameter (hashid).",
                });
              }
        
              const deletedTimeSlot = await TimeSlotModel.deleteTimeSlot(hashid);
        
              res.status(200).json({
                status: true,
                message: "Time slot deleted successfully",
                data: deletedTimeSlot,
              });
            } catch (err) {
              console.error(err);
              res.status(500).json({
                status: false,
                message: err.message || "Failed to delete time slot.",
              });
            }
          }
        
    }
    
   

module.exports = TimeSlotController;
