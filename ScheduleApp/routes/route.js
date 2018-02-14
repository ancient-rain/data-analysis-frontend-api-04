const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const STUDENT = mongoose.model('Student');
const FACULTY = mongoose.model('Faculty');
const TERM = mongoose.model('Term');
const COURSE = mongoose.model('Course');
const GROUP = mongoose.model('Group');
const studentController = require('../controllers/student');
const facultyController = require('../controllers/faculty');
const courseController = require('../controllers/course');
const groupController = require('../controllers/group');

router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
    next();
});

/**
 * @swagger
 * "/student/{username}/{term}":
 *   get:
 *     parameters:
 *     - name: "username"
 *       in: path
 *       description: "Username of student"
 *       required: true
 *       type: "string"
 *     - name: "term"
 *       in: path
 *       description: "Term to look for"
 *       required: true
 *       type: "string"
 *     responses:
 *       200:
 *         description: "Student info by term found"
 *         schema:
 *           items:
 *             $ref: "#/definitions/StudentInfoTerm"
 *       404:
 *         description: "Could not find student info by term"
 */
router.get('/student/:username/:term', studentController.getStudentInfoByTerm);

router.get('/students/:term/*', studentController.getStudentsBySearch);

router.get('/faculty/:username/:term', facultyController.getFacultyInfoByTerm);

router.get('/course/:name/:term', courseController.getCourseInfo);

router.get('/courses/:name/:term', courseController.getCoursesInfo);

router.route('/groups/:id').get(groupController.getGroupById);




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

router.route('/student/:username').get((req, res) => {
    const username = req.params.username.toUpperCase();

    STUDENT.find({
        username: username
    }, (err, student) => {
        if (err) {
            console.log(err);
        } else {
            res.status(200);
            res.json(student);
        }
    });
});

router.get('/student/:username/:term/advisor', function (req, res) {
    const term = req.params.term;
    const username = req.params.username.toUpperCase();

    FACULTY.find({
        advisees: {
            $contains: username
        }
    }), (err, advisor) => {
        if (err) {
            console.log(err);
        } else {
            res.status(200);
            res.json(advisor);
        }
    }
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

router.route('/courses/:name/students/not-taken')
    .get((req, res) => {
        const name = req.params.name.toUpperCase();
        const regex = new RegExp('.*' + name + '.*');

        let returnStudents = null;
        let takenStudents = null;

        STUDENT.db.db.command({
            distinct: 'lookup',
            key: 'username',
            query: {
                type: 'Student'
            }
        }, (err, usernames) => {
            if (err) {
                console.log(err);
            } else {
                returnStudents = usernames.values;
            }
        });

        STUDENT.db.db.command({
            distinct: 'lookup',
            key: 'username',
            query: {
                courses: {
                    $in: [regex]
                }
            }
        }, (err, usernames) => {
            if (err) {
                console.log(err);
            } else {
                takenStudents = usernames.values;
                if (returnStudents == null || takenStudents == null) {
                    console.log('Error: Unable to find list of students who haven\'t taken course');
                } else {
                    returnStudents = returnStudents.filter(function (el) {
                        return takenStudents.indexOf(el) < 0;
                    });
                    res.status(200);
                    res.json(returnStudents);
                }
            }

        });
    });

router.route('/groups/')
    .post((req, res) => {
        const students = [];
        const faculty = [];

        for (let i = 0; i < req.body.students.length; i++) {
            students.push(req.body.students[i].toUpperCase());
        }

        for (let i = 0; i < req.body.faculty.length; i++) {
            faculty.push(req.body.faculty[i].toUpperCase());
        }

        GROUP.create({
            type: 'Group',
            groupName: req.body.groupName,
            term: req.body.term,
            className: req.body.className,
            students: students,
            faculty: faculty
        }, (err, group) => {
            if (err) {
                console.log(err);
            } else {
                res.json(group);
            }
        });
    })
    .delete((req, res) => {
        if (req.body.id) {
            GROUP.findByIdAndRemove(req.body.id, (err, book) => {
                if (err) {
                    console.log(err);
                } else {
                    res.status(204);
                    res.json(null);
                }
            });
        } else {
            res.status(404);
            console.log('ERROR, make sure to include all required fields');
        }
    });

router.route('/groups/:username/:term/:id').get((req, res) => {
    const term = req.params.term;

    GROUP.aggregate([{
                $match: {
                    $and: [{
                            students: req.params.username
                        },
                        {
                            term: req.params.term

                        },
                        {
                            _id: req.params.id
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "lookup",
                    localField: "students",
                    foreignField: "username",
                    as: "studentsData"
                }
            }, {
                $lookup: {
                    from: "lookup",
                    localField: "courses",
                    foreignField: "name",
                    as: "courseData"
                }
            }, {
                $project: {
                    name: 1,
                    term: 1,
                    students: {
                        $filter: {
                            input: '$students',
                            as: 'students',
                            cond: {
                                $eq: ['$$students.term', term],
                            }
                        }
                    },
                    "terms.term": 1,
                    courses: {
                        $filter: {
                            input: '$courseData',
                            as: 'courses',
                            cond: {
                                $eq: ['$$courses.term', term]
                            }
                        }
                    }
                }
            }
        ],
        (err, groups) => {
            if (err) {
                console.log(err);
            } else {
                res.status(200);
                res.json(groups);
            }
        });
});

router.route('/term/:term').get((req, res) => {

    TERM.find({
        $and: [{
                term: req.params.term
            },
            {
                type: 'Term Info'
            }
        ]
    }, (err, term) => {
        if (err) {
            console.log(err);
        } else {
            res.status(200);
            res.json(term);
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