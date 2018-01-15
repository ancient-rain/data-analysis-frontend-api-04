const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const STUDENT = mongoose.model('Student');

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

router.get('/:term/students/course/:name', function (req, res) {
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

/*  TODO: Find the names of the students who are in :name course that are
    in :year durng the :term term.
*/
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

/* TODO: filter out students who have taken the class */
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

module.exports = router;