const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const STUDENT = mongoose.model('Student');

const YEARS = ['Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'YGR'];

router.get('/:term/student/:username', function (req, res) {
    const term = req.params.term;
    const username = req.params.username.toUpperCase();

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
            res.status(200);
            res.json(student);
        }
    });
});

router.route('/courses/:name/students')
    .get((req, res) => {
        const name = req.params.name.toUpperCase();
        const regex = new RegExp('.*' + name + '.*');

        STUDENT.find({
            courses: {
                $in: [regex]
            }
        }, (err, students) => {
            if (err) {
                console.log(err);
            } else {
                res.status(200);
                res.json(students);
            }
        });
    });

    router.route('/courses/:name/students/:year')
    .get((req, res) => {
        const name = req.params.name.toUpperCase();
        const year = req.params.year;
        const regex = new RegExp('.*' + name + '.*');

        STUDENT.find({
            courses: {
                $in: [regex]
            }
        }, (err, students) => {
            if (err) {
                console.log(err);
            } else {
                res.status(200);
                res.json(students);
            }
        });
    });


router.route('/courses/:name/students/not-taken')
    .get((req, res) => {
        const name = req.params.name.toUpperCase();
        const regex = new RegExp('.*' + name + '.*');

        STUDENT.find({
            $and: [{
                    type: 'Student'
                }, {
                    courses: {
                        $nin: [regex]
                    }
                }
            ]
        }, (err, students) => {
            if (err) {
                console.log(err);
            } else {
                res.status(200);
                res.json(students);
            }
        });
    });

module.exports = router;