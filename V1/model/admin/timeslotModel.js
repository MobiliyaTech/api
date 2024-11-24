const pool = require("../../../config/db");
const crypto = require("crypto");

class TimeSlotModel {
  static async timeslotInsert(timeslotData) {
    try {
        const { counselor_id, slot_date, slot_time, status = 'available' } = timeslotData;
        const hashid = crypto.randomBytes(4).toString("hex").slice(0, 8);

        const [startTimeStr, endTimeStr] = slot_time.split(" - ");

        // Create Date objects for start and end times
        const slotStart = new Date(`${slot_date} ${startTimeStr}`);
        const slotEnd = new Date(`${slot_date} ${endTimeStr}`);

        // Check for existing slots that overlap
        const checkOverlapQuery = {
            text: `SELECT id, slot_time FROM public.time_slots
                   WHERE counselor_id = $1 AND slot_date = $2`,
            values: [counselor_id, slot_date]
        };

        const existingSlots = await pool.query(checkOverlapQuery);
        const slotsToDelete = [];

        for (const row of existingSlots.rows) {
            const [existingStartStr, existingEndStr] = row.slot_time.split(" - ");
            const existingStart = new Date(`${slot_date} ${existingStartStr}`);
            const existingEnd = new Date(`${slot_date} ${existingEndStr}`);

            // Check if the existing slot overlaps with the new slot
            if (slotStart < existingEnd && slotEnd > existingStart) {
                slotsToDelete.push(row.id); // Collect IDs of overlapping slots
            }
        }

        // Remove existing overlapping slots
        if (slotsToDelete.length > 0) {
            const deleteQuery = {
                text: `DELETE FROM public.time_slots WHERE id = ANY($1)`,
                values: [slotsToDelete]
            };
            await pool.query(deleteQuery);
        }

        // Insert the new slot
        const insertQuery = {
            text: `INSERT INTO public.time_slots (hashid, counselor_id, slot_date, slot_time, status)
                   VALUES ($1, $2, $3, $4, $5)
                   RETURNING *`,
            values: [hashid, counselor_id, slot_date, `${startTimeStr} - ${endTimeStr}`, status],
        };

        const result = await pool.query(insertQuery);
        return {
            status: true,
            message: "New time slot added successfully.",
            data: result.rows[0]
        };

    } catch (err) {
        console.error("Error in timeslotInsert:", err); 
        throw new Error("Server error: " + err.message);
    }
}



static async getTimeSlotsForMonth(counselor_id, month, year) {
  try {
    // Create start and end date for the given month and year
    const startDate = new Date(year, month - 1, 1); // month - 1 because months are 0-indexed
    const endDate = new Date(year, month, 1); // Next month starts on the 1st

    const sql = {
      text: `
        SELECT hashid, slot_date, slot_time, EXTRACT(DOW FROM slot_date AT TIME ZONE 'UTC') AS day_of_week
        FROM public.time_slots 
        WHERE counselor_id = $1 
          AND slot_date >= $2 
          AND slot_date < $3
        ORDER BY slot_date, slot_time;
      `,
      values: [counselor_id, startDate, endDate], // Pass start and end dates
    };
    
    const result = await pool.query(sql);
    const timeSlots = {};
    
    // Group results by date
    result.rows.forEach((row) => {
      const date = new Date(row.slot_date);
      
      // Format date according to the local timezone
      const formattedDate = date.toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD format
      
      const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][row.day_of_week - 1];
      
      if (!timeSlots[formattedDate]) {
        timeSlots[formattedDate] = [];
      }
      
      timeSlots[formattedDate].push({
        hashid: row.hashid,
        slotTime: row.slot_time,
        dayOfWeek: dayOfWeek,
      });
    });

    return timeSlots;
  } catch (error) {
    console.error("Error fetching time slots:", error);
    throw error;
  }
}


      static async deleteTimeSlot(hashid) {
        try {
          const sql = {
            text: `DELETE FROM public.time_slots WHERE hashid = $1 RETURNING *`,
            values: [hashid],
          };
          const result = await pool.query(sql);
          return result.rows[0]; // Return the deleted row
        } catch (err) {
          console.error(err);
          throw new Error("Server error");
        }
      }
}

module.exports = TimeSlotModel;
