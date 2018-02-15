const STUDENT = require('../models/student');

exports.getStudentsTaken = function (req, res, next) {
    const name = req.params.name.toUpperCase();
    const regex = new RegExp('.*' + name + '.*');
    let takenStudents;

    STUDENT.db.db.command({
        distinct: 'lookup',
        key: 'username',
        query: {
            courses: regex
        }
    }, (err, usernames) => {
        if (err) {
            console.log(err);
        } else {
            takenStudents = usernames.values;
            if (takenStudents == null) {
                console.log('Error: Unable to find list of students who haven\'t taken course');
            } else {
                STUDENT.aggregate([{
                    $match: {
                        $and: [{
                            term: req.params.term
                        }, {
                            username: { $in: takenStudents }
                        }]
                    }
                }, {
                    $lookup: {
                        from: "lookup",
                        localField: "username",
                        foreignField: "advisees",
                        as: "advisor"
                    }
                }, {
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
                                    $eq: ['$$advisor.term', req.params.term],
                                }
                            }
                        },
                    }
                }], (err, students) => {
                    if (err) {
                        console.log(err);
                    } else {
                        try {
                            const studentArray = [];
                            for (let i = 0; i < students.length; i++) {
                                const data = students[i];
                                const advisor = getAdvisorStudentInfoTerm(data.advisor[0]);
                                const majorStr = createMajorsString(data.majors);
                                const minorStr = createMinorsString(data.minors);
                                const newStudent = createStudentInfoTerm(data, advisor, [], [], majorStr, minorStr);
                                studentArray.push(newStudent);
                            }

                            res.status(200);
                            res.json(studentArray);
                        } catch (error) {
                            handleError('Could not students who have taken given course', res, 404, next);
                        }
                    }
                });
            }
        }
    });
}

exports.getStudentsNotTaken = function (req, res, next) {
    const name = req.params.name.toUpperCase();
    const regex = new RegExp('.*' + name + '.*');
    let major = name.substring(0, 2);
    if (major === 'CS') {
        major = ['CS', 'SE'];
    } else {
        major = [major];
    }

    let returnStudents = null;
    let takenStudents = null;

    STUDENT.db.db.command({
        distinct: 'lookup',
        key: 'username',
        query: {
            $and: [{
                term: req.params.term
            },
            {
                type: 'Student'
            },
            {
                majors: { $in: major }
            }
            ]
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
                STUDENT.aggregate([{
                    $match: {
                        $and: [{
                            term: req.params.term
                        }, {
                            username: { $in: returnStudents }
                        }]
                    }
                }, {
                    $lookup: {
                        from: "lookup",
                        localField: "username",
                        foreignField: "advisees",
                        as: "advisor"
                    }
                }, {
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
                                    $eq: ['$$advisor.term', req.params.term],
                                }
                            }
                        },
                    }
                }], (err, students) => {
                    if (err) {
                        handleError('Bad request!', res, 400, next);
                    } else {
                        try {
                            const studentArray = [];
                            for (let i = 0; i < students.length; i++) {
                                const data = students[i];
                                const advisor = getAdvisorStudentInfoTerm(data.advisor[0]);
                                const majorStr = createMajorsString(data.majors);
                                const minorStr = createMinorsString(data.minors);
                                const newStudent = createStudentInfoTerm(data, advisor, [], [], majorStr, minorStr);
                                studentArray.push(newStudent);
                            }

                            res.status(200);
                            res.json(studentArray);
                        } catch (error) {
                            handleError('Could not find students who have not taken given course', res, 404, next);
                        }
                    }
                });
            }
        }
    }

    );
}

exports.getStudentInfoByTerm = function (req, res, next) {
    const username = req.params.username.toUpperCase();
    const term = req.params.term;

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
            as: "userTerms"
        }
    }, {
        $lookup: {
            from: "lookup",
            localField: "userTerms.term",
            foreignField: "termKey",
            as: "terms"
        }
    }, {
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
            terms: 1,
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
    }], (err, student) => {
        if (err) {
            handleError('Bad request!', res, 400, next);
        } else {
            try {
                const data = student[0];
                const advisor = getAdvisorStudentInfoTerm(data.advisor[0]);
                const terms = getTermsStudentInfoTerm(data.terms);
                const courses = getCoursesStudentInfoTerm(data.courses);
                const majorStr = createMajorsString(data.majors);
                const minorStr = createMinorsString(data.minors);
                const newStudent = createStudentInfoTerm(data, advisor, terms, courses, majorStr, minorStr);

                res.status(200);
                res.json([newStudent]);
            } catch (error) {
                handleError('Could not find student information for given term', res, 404, next);
            }
        }
    });
};

function createStudentInfoTerm(data, advisor, terms, courses, majorStr, minorStr) {
    return {
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
}

function getAdvisorStudentInfoTerm(advisor) {
    return advisor ? advisor.username : '';
}

function getTermsStudentInfoTerm(terms) {
    const termsArr = [];

    for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        const termName = getTermName(term.termKey);
        termsArr.push({
            _id: term._id,
            term: term.termKey,
            name: termName,
            startDate: term.startDate,
            endDate: term.endDate
        });
    }

    return termsArr;
}

function getTermName(key) {
    const year = key.substring(0, 4);
    const term = key.substring(4);
    switch (term) {
        case '10':
            return `Fall ${year}`;
        case '20':
            return `Winter ${year}`;
        case '30':
            return `Spring ${year}`;
        default:
            return `Summer ${year}`;
    }
}

function getCoursesStudentInfoTerm(courses) {
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