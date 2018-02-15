const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const STUDENT = mongoose.model('Student');
const FACULTY = mongoose.model('Faculty');
const TERM = mongoose.model('Term');
const COURSE = mongoose.model('Course');
const studentController = require('../controllers/student');
const facultyController = require('../controllers/faculty');
const courseController = require('../controllers/course');

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

router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
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

/**
 * @swagger
 * "/faculty/{username}/{term}":
 *   get:
 *     parameters:
 *     - name: "username"
 *       in: path
 *       description: "Username of faculty member"
 *       required: true
 *       type: "string"
 *     - name: "term"
 *       in: path
 *       description: "Term to look for"
 *       required: true
 *       type: "string"
 *     responses:
 *       200:
 *         description: "Faculty info by term found"
 *         schema:
 *           items:
 *             $ref: "#/definitions/FacultyInfoTerm"
 *       404:
 *         description: "Could not find faculty info by term"
 */
router.get('/faculty/:username/:term', facultyController.getFacultyInfoByTerm);

router.get('/course/:name/:term', courseController.getCourseInfo);

router.get('/courses/:name/:term', courseController.getCoursesInfo);


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

router.get('/courses/:name/students/taken/:term', studentController.getStudentsTaken);

router.get('/courses/:name/students/not-taken/:term', studentController.getStudentsNotTaken);

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
        }).select('username');
    });

router.route('/groups/:term/:usernames').get((req, res) => {

});

// MAY NOT NEED AS A ROUTE ANYMORE
// router.route('/faculty/:term/:username/advisees').get((req, res) => {
//     FACULTY.find({
//             $and: [{
//                     username: req.params.username.toUpperCase()
//                 },
//                 {
//                     term: req.params.term

//                 }
//             ]
//         }).select('advisees')
//         .exec((err, advisees) => {
//             if (err) {
//                 console.log(err);
//             } else {
//                 res.status(200);
//                 res.json(advisees);
//             }
//         });

// });

// MAY NOT NEED ANYMORE
// router.route('/faculty/student/:username/:course').get((req, res) => {

//     const name = req.params.course.toUpperCase();
//     const reg = new RegExp('.*' + name + '.*');

//     STUDENT.find({
//             $and: [{
//                     username: req.params.username.toUpperCase()
//                 },
//                 {
//                     courses: {
//                         $in: [reg]
//                     }

//                 }
//             ]
//         })
//         .exec((err, course) => {
//             if (err) {
//                 console.log(err);
//             } else {
//                 res.status(200);
//                 res.json(course);
//             }
//         });
// });

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