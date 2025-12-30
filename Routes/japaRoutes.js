const express = require("express");
const Japa = require("../models/Japa");
const auth = require("../middleware/auth");

const router = express.Router();

// Add / Update Japa
router.post("/add", auth, async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const { count } = req.body;

  let record = await Japa.findOne({
    userId: req.userId,
    date: today
  });

  if (record) {
    record.count += count;
    await record.save();
  } else {
    record = new Japa({
      userId: req.userId,
      date: today,
      count
    });
    await record.save();
  }

  res.json({ message: "Japa updated" });
});
// GET DATE-WISE HISTORY FOR LOGGED-IN USER
router.get("/history", auth, async (req, res) => {
  try {
    const history = await Japa.find({ userId: req.userId })
      .sort({ date: -1 }); // latest first

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

// Get user's japa records
router.get("/", auth, async (req, res) => {
  const records = await Japa.find({ userId: req.userId }).sort({ date: -1 });
  res.json(records);
});

module.exports = router;




// LEADERBOARD (Top users)
router.get("/leaderboard", auth, async (req, res) => {
  try {
    // Per-user leaderboard
    const leaderboard = await Japa.aggregate([
      {
        $group: {
          _id: "$userId",
          totalJapa: { $sum: "$count" }
        }
      },
      { $sort: { totalJapa: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          name: "$user.name",
          totalJapa: 1
        }
      }
    ]);

    // Grand total of all users
    const totalResult = await Japa.aggregate([
      {
        $group: {
          _id: null,
          grandTotal: { $sum: "$count" }
        }
      }
    ]);

    res.json({
      leaderboard,
      grandTotal: totalResult[0]?.grandTotal || 0
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load leaderboard" });
  }
});
