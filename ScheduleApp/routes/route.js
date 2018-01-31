const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const STUDENT = mongoose.model('Student');
const FACULTY = mongoose.model("Faculty");
const TERM = mongoose.model("Term");
const COURSE = mongoose.model("Course");

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

router.get('/student/:username/:term', function (req, res) {
    const term = req.params.term;
    const username = req.params.username.toUpperCase();
    // db.lookup.aggregate({$match:{$and:[{term:"201630"},{username:"BEDNARTD"}]}},{$lookup:{from:"lookup",localField:"courses",foreignField:"name",as:"courseData"}}).pretty();

    STUDENT.aggregate([{
            $match: {
                $and: [{
                    term: term
                }, {
                    username: username
                }]
            }
        }, {
            $lookup: {
                from: "lookup",
                localField: "courses",
                foreignField: "name",
                as: "courseData"
            }
        }, {
            $lookup: {
                from: "lookup",
                localField: "username",
                foreignField: "advisees",
                as: "advisor"
            }
        }, {
            $lookup: {
                from: "lookup",
                localField: "username",
                foreignField: "username",
                as: "terms"
            }
        },
        {
            $project: {
                term: 1,
                username: 1,
                name: 1,
                year: 1,
                graduationDate: 1,
                minors: 1,
                majors: 1,
                advisor: {
                    $filter: {
                        input: '$advisor',
                        as: 'advisor',
                        cond: {
                            $eq: ['$$advisor.term', term],
                        }
                    }
                },
                "terms.term": 1,
                courses: {
                    $filter: {
                        input: '$courseData',
                        as: 'course',
                        cond: {
                            $eq: ['$$course.term', term]
                        }
                    }
                }
            }
        }
    ], (err, student) => {
        if (err) {
            console.log(err);
        } else {
            try {
                const data = student[0];
                const terms = [];
                const courses = [];
                let advisor = '';
                let majorStr = '';
                let minorStr = '';

                if (data.advisor[0]) {
                    advisor = data.advisor[0].username;
                }

                for (let i = 0; i < data.terms.length; i++) {
                    terms.push(data.terms[i].term);
                }

                for (let i = 0; i < data.courses.length; i++) {
                    const course = data.courses[i];
                    courses.push({
                        _id: course._id,
                        name: course.name,
                        term: course.term,
                        description: course.description,
                        creditHours: course.creditHours,
                        meetTimes: course.meetTimes,
                        instructor: course.instructor
                    });
                }

                data.majors.pop();
                data.minors.pop();

                for (let i = 0; i < data.majors.length; i++) {
                    majorStr += `${data.majors[i]}`;
                    if (i + 1 < data.majors.length) {
                        majorStr += '/';
                    }
                }

                for (let i = 0; i < data.minors.length; i++) {
                    minorStr += `${data.minors[i]}`;
                    if (i + 1 < data.minors.length) {
                        minorStr += '/';
                    }
                }

                const newStudent = {
                    _id: data._id,
                    term: data.term,
                    username: data.username,
                    name: data.name,
                    year: data.year,
                    majors: majorStr,
                    minors: minorStr,
                    graduationDate: data.graduationDate,
                    advisor: advisor,
                    terms: terms,
                    courses: courses
                };

                res.status(200);
                res.json([newStudent]);
            } catch (error) {
                res.status(404);
                res.json(null);
                console.log(error);
            }
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

router.route('/courses/:name/students/not-taken')
    .get((req, res) => {
        const name = req.params.name.toUpperCase();
        const regex = new RegExp('.*' + name + '.*');

        let returnStudents = null;
        let takenStudents = null;

        STUDENT.db.db.command({
            distinct: "lookup",
            key: "username",
            query: {
                type: "Student"
            }
        }, (err, usernames) => {
            if (err) {
                console.log(err);
            } else {
                console.log("here");
                returnStudents = usernames.values;
            }
        });

        STUDENT.db.db.command({
            distinct: "lookup",
            key: "username",
            query: {
                courses: {
                    $in: [regex]
                }
            }
        }, (err, usernames) => {
            if (err) {
                console.log(err);
            } else {
                console.log("here");
                takenStudents = usernames.values;
                if (returnStudents == null || takenStudents == null) {
                    console.log("Error: Unable to find list of students who haven't taken course");
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
        }).select("username");
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

    FACULTY.aggregate([{
        $match: {
            $and: [{
                username: username
            }, {
                term: term
            }]
        }
    }, {
        $lookup: {
            from: 'lookup',
            localField: 'username',
            foreignField: 'instructor',
            as: 'courses'
        }
    }, {
        $lookup: {
            from: 'lookup',
            localField: 'username',
            foreignField: 'username',
            as: 'terms'
        }
    }, {
        $lookup: {
            from: 'lookup',
            localField: 'advisees',
            foreignField: 'username',
            as: 'students'
        }
    }, {
        $project: {
            term: 1,
            username: 1,
            name: 1,
            dept: 1,
            "terms.term": 1,
            courses: {
                $filter: {
                    input: '$courses',
                    as: 'course',
                    cond: {
                        $eq: ['$$course.term', term]
                    }
                }
            },
            advisees: {
                $filter: {
                    input: '$students',
                    as: 'student',
                    cond: {
                        $and: [{
                            $eq: ['$$student.term', term]
                        }, {
                            $eq: ['$$student.type', 'Student']
                        }]
                    }
                }
            }
        }
    }], (err, faculty) => {
        if (err) {
            console.log(err);
        } else {
            try {
                const data = faculty[0];
                const terms = [];
                const courses = [];
                const advisees = [];

                for (let i = 0; i < data.terms.length; i++) {
                    terms.push(data.terms[i].term);
                }

                for (let i = 0; i < data.courses.length; i++) {
                    const course = data.courses[i];
                    courses.push({
                        _id: course._id,
                        name: course.name,
                        term: course.term,
                        description: course.description,
                        creditHours: course.creditHours,
                        meetTimes: course.meetTimes,
                    });
                }

                for (let i = 0; i < data.advisees.length; i++) {
                    const advisee = data.advisees[i];
                    let majorStr = '';
                    let minorStr = '';

                    advisee.majors.pop();
                    advisee.minors.pop();

                    for (let j = 0; j < advisee.majors.length; j++) {
                        majorStr += `${advisee.majors[j]}`;
                        if (j + 1 < advisee.majors.length) {
                            majorStr += '/';
                        }
                    }

                    for (let j = 0; j < advisee.minors.length; j++) {
                        majorStr += `${advisee.minors[j]}`;
                        if (j + 1 < advisee.minors.length) {
                            majorStr += '/';
                        }
                    }

                    advisees.push({
                        _id: advisee._id,
                        term: advisee.term,
                        name: advisee.name,
                        username: advisee.username,
                        year: advisee.year,
                        majors: majorStr,
                        minors: minorStr,
                        graduationDate: advisee.graduationDate
                    });
                }

                const newFaculty = {
                    _id: data._id,
                    term: data.term,
                    name: data.name,
                    username: data.username,
                    dept: data.dept,
                    terms: terms,
                    courses: courses,
                    advisees: advisees
                };

                res.status(200);
                res.json([newFaculty]);
            } catch (error) {
                res.status(404);
                res.json(null);
                console.log(error);
            }
        }
    });
});

router.route('/term/:term').get((req, res) => {

    TERM.find({
        $and: [{
                term: req.params.term
            },
            {
                type: "Term Info"
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

router.route('/courses/:name/:term')
    .get((req, res) => {
        const name = req.params.name.toUpperCase();
        const course = new RegExp('.*' + name + '.*');
        const term = req.params.term;

        COURSE.find({
            $and: [{
                    name: course
                },
                {
                    term: term
                }
            ]
        }, (err, course) => {
            if (err) {
                console.log(err);
            } else {
                res.status(200);
                res.json(course);
            }
        });
    });

module.exports = router;