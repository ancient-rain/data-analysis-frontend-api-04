const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
// const Term = require('../models/models');
const Term = require('../models/term');
const STUDENT = mongoose.model('Student');

router.get('/:term/student/:username', function (req, res) {
        const username = req.params.username.toUpperCase();
        const term = req.params.term;
        console.log(term, username);
        STUDENT.find({
            $and: [{
                username: username
            }, {
                term: term
            }]
        }, (err, student) => {
            if (err) {
                console.log(err);
            } else {
                res.json(student);
            }
        });
    });

router.route('/courses/:name/students')
    .get((req, res) => {
        db.term.aggregate([{
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
                            cond: {
                                "$setIsSubset": [
                                    ["MA211-05"],
                                    ["$$course.name"]
                                ]
                            }
                        }
                    }
                }
            }
        ]);
    });


router.route('/courses/:name/students/not-taken')
    .get((req, res) => {
        Term.find({
            "courses.name": req.params.name
        }, {
            "student.username": req.params.username
        }, (err, student) => {
            if (err) {
                res.status(404);
                res.json({
                    success: false,
                    message: "Invalid term name or student name"
                });
            } else {
                res.json(student);
            }
        });
    });

    module.exports = router;