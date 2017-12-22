const express = require('express');
const router = express.Router();
const Term = require('../models/models');

router.route('/:term/student/:username')
    .get((req, res) => {
        Term.aggregate([
            { $match: { "name": req.params.term } },
            {
                $project: {
                    student: {
                        $filter: {
                            input: "$students",
                            as: "student",
                            cond: { "$setIsSubset": [[req.term.params], ["$$student.username"]] }
                        }
                    }
                }
            }
        ], (err, student) => {
            if (err) {
                res.status(404);
                res.json({
                    success: false,
                    message: "Invalid term name or student name"
                });
            }
            else {
                res.json(student);
            }
        });
    });

router.route('/courses/:name/students')
    .get((req, res) => {
        db.term.aggregate([
            {
                $project: {
                    "course": "$students.courses"
                }
            },
            {
                $unwind: "$course"
            },
            {
                $project: {
                    student: {
                        $filter: {
                            input: "$course",
                            as: "course",
                            cond: { "$setIsSubset": [["MA211-05"], ["$$course.name"]] }
                        }
                    }
                }
            }
        ]);
    });


router.route('/courses/:name/students/not-taken')
    .get((req, res) => {
        Term.find({ "courses.name": req.params.name }, { "student.username": req.params.username }, (err, student) => {
            if (err) {
                res.status(404);
                res.json({
                    success: false,
                    message: "Invalid term name or student name"
                });
            }
            else {
                res.json(student);
            }
        });
    });

