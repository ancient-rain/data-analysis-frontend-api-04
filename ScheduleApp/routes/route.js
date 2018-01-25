const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const STUDENT = mongoose.model('Student');
const FACULTY = mongoose.model("Faculty");
const COURSE = mongoose.model('Course');
const YEARS = ['Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'YGR'];

function parseYear(year) {
    const len = year.length;
    const lastChar = year.substring(len - 1);
    const isFilter = lastChar == '+' || lastChar == '-';

    if (isFilter) {
        const index = getYearsIndex(year);

    } else {
        return '{ year:'
    }

}

function getYearsIndex(year) {
    for (let i = 0; i < YEARS.length; i++) {
        if (YEARS[i] == year) {
            return i;
        }
    }
    return -1;
}

function getYear(yearStr) {
    const year = yearStr.toUpperCase();

    switch (year) {
        case YEARS[0]:
            return 1;
        case YEARS[1]:
            return 2;
        case YEARS[2]:
            return 3;
        case YEARS[3]:
            return 4;
        case YEARS[4]:
            return 5;
        case YEARS[5]:
            return 6;
        default:
            return -1;
    }
}

function checkFilter(yearFilter) {

}

router.get('/course/:name/:term/students', function (req, res) {
    const term = req.params.term;
    const course = req.params.name;
    const regex = new RegExp('.*' + course + '.*');

    STUDENT.find({
        $and: [{
            term: term
        }, {
            type: 'Student'
        }, {
            courses: {
                $in: [regex]
            }
        }]
    }, (err, students) => {
        if (err) {
            console.log(err);
        } else {
            res.status(200);
            res.json(students);
        }
    });
});

router.get('/student/:username/:term', function (req, res) {
    const term = req.params.term;
    const username = req.params.username.toUpperCase();
    let result = {
        studentId: "",
        type: "",
        term: "",
        username: "",
        name: "",
        year: "",
        graduationDate: "",
        courses: [],
        minors: [],
        majors: []
    };
    // db.lookup.aggregate([{$match:{$and:[{term:"201630"},{username:"BEDNARTD"}]}},{$lookup:{from:"lookup",localField:"_id",foreignField:"_id",as:"courseData"}}])

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
            const index = student[0];

            result.studentId = index._id;
            result.type = index.type;
            result.term = index.term;
            result.username = index.username;
            result.name = index.name;
            result.year = index.year;
            result.graduationDate = index.graduationDate;
            result.minors = index.minors;
            result.majors = index.majors;

            // for (let i = 0; i < index.courses.length; i++) {
            //     const courseRegex = new RegExp('.*' + index.courses[i] + '.*');
            //     const course = setTimeout(function () {
            //         findStudentCourse(courseRegex)
            //     }, 2000);
            //     console.log(course);
            //     // if (course) {
            //     //     result.courses.push(course);
            //     // } else {
            //     //     console.log(err);
            //     //     res.status(400);
            //     //     return;
            //     // }
            // }

            // COURSE.find({type: 'Course'}, (err, course) => {

            // }).forEach(function (course) {
            //     console.log(course.name);
            // });


            res.status(200);
            res.json(student);
        }
    });
});

function findStudentCourse(regex) {
    let course;
    // console.log('course outside of if', course);
    console.log('starting');
    COURSE.find({
        $and: [{
            type: 'Course'
        }, {
            name: regex
        }]
    }, (err, foundCourse) => {
        // console.log('course', foundCourse);
        if (err) {
            console.log(err);
        } else {
            course = foundCourse;
            // return foundCourse;
            // console.log('course inside if', course);
        }
    });
    console.log('ending');
    return course;
}

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

/* TODO: Filter out usernames that have taken the course already */
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
            }]
        }, (err, students) => {
            if (err) {
                console.log(err);
            } else {
                res.status(200);
                res.json(students);
            }
        });
    });

router.route('/courses/:name/students/:year/:term')
    .get((req, res) => {
        const name = req.params.name.toUpperCase();
        const course = new RegExp('.*' + name + '.*');
        const year = getYear(req.params.year);
        const filter = checkFilter(req.params.year);
        const term = req.params.term;

        STUDENT.find({
            courses: {
                $in: [course]
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

router.route('/groups/:term/:usernames').get((req, res) => {

});

router.route('/faculty/:term/:username/advisees').get((req, res) => {
    FACULTY.find({
            $and: [{
                    username: req.params.username.toUpperCase()
                },
                {
                    term: req.params.term

                }
            ]
        }).select("advisees")
        .exec((err, advisees) => {
            if (err) {
                console.log(err);
            } else {
                res.status(200);
                res.json(advisees);
            }
        });

});

router.route('/faculty/student/:username/:course').get((req, res) => {

    const name = req.params.course.toUpperCase();
    const reg = new RegExp('.*' + name + '.*');

    STUDENT.find({
            $and: [{
                    username: req.params.username.toUpperCase()
                },
                {
                    courses: {
                        $in: [reg]
                    }

                }
            ]
        })
        .exec((err, course) => {
            if (err) {
                console.log(err);
            } else {
                res.status(200);
                res.json(course);
            }
        });
});

router.route('/faculty/:username/:term').get((req, res) => {
    const username = req.params.username.toUpperCase();
    const term = req.params.term;

    COURSE.find({
        $and: [{
            instructor: username
        }, {
            term: term
        }]
    }, (err, faculty) => {
        if (err) {
            console.log(err);
        } else {
            res.status(200);
            res.json(faculty);
        }
    });
});

router.route('/faculty/:username').get((req, res) => {
    const username = req.params.username.toUpperCase();

    COURSE.find({
        instructor: username
    }, (err, faculty) => {
        if (err) {
            console.log(err);
        } else {
            res.status(200);
            res.json(faculty);
        }
    });
});

module.exports = router;