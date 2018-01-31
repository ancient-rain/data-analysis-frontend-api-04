const mongoose = require('mongoose');
const FACULTY = mongoose.model('Faculty');

exports.getFacultyInfoByTerm = function (req, res, next) {
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
            handleError('Bad request!', res, 400, next);
        } else {
            try {
                const data = faculty[0];
                const terms = getTermsFacultyInfoTerm(data.terms);
                const courses = getCoursesFacultyInfoTerm(data.courses);
                const advisees = getAdvisessFacultyInfoTerm(data.advisees);
                const newFaculty = createFacultyInfoTerm(data, terms, courses, advisees);

                res.status(200);
                res.json([newFaculty]);
            } catch (error) {
                handleError('Could not find faculty information for given term', res, 404, next);
            }
        }
    });
};

function createFacultyInfoTerm(data, terms, courses, advisees) {
    return {
        _id: data._id,
        term: data.term,
        name: data.name,
        username: data.username,
        dept: data.dept,
        terms: terms,
        courses: courses,
        advisees: advisees
    };
}

function getTermsFacultyInfoTerm(terms) {
    const termsArr = [];

    for (let i = 0; i < terms.length; i++) {
        termsArr.push(terms[i].term);
    }

    return termsArr;
}

function getCoursesFacultyInfoTerm(courses) {
    const coursesArr = [];

    for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        coursesArr.push({
            _id: course._id,
            name: course.name,
            term: course.term,
            description: course.description,
            creditHours: course.creditHours,
            meetTimes: course.meetTimes,
            instructor: course.instructor
        });
    }

    return coursesArr;
}

function getAdvisessFacultyInfoTerm(advisees) {
    const adviseesArr = [];

    for (let i = 0; i < advisees.length; i++) {
        const advisee = advisees[i];
        const majorStr = createMajorsString(advisee.majors);
        const minorStr = createMinorsString(advisee.minors);
        adviseesArr.push({
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

    return adviseesArr;
}

function createMajorsString(majors) {
    let majorStr = '';

    majors.pop();

    for (let i = 0; i < majors.length; i++) {
        majorStr += `${majors[i]}`;
        if (i + 1 < majors.length) {
            majorStr += '/';
        }
    }

    return majorStr;
}

function createMinorsString(minors) {
    let minorStr = '';

    minors.pop();

    for (let i = 0; i < minors.length; i++) {
        minorStr += `${minors[i]}`;
        if (i + 1 < minors.length) {
            minorStr += '/';
        }
    }

    return minorStr;
}

function handleError(err, res, statusCode, next) {
    res.status(statusCode);
    err.status = statusCode;
    console.log(err);
    next(err);
}