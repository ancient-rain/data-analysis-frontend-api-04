const STUDENT = require('../models/student');

exports.getStudentsBySearch = function (req, res, next) {
    const term = req.params.term;
    const names = req.params[0].split('/');

    for(let i = 0; i < names.length; i++) {
        names[i] = names[i].toUpperCase();
    }    

    STUDENT.aggregate([{
        $match: {
            $and: [{
                term: term
            }, {
                username: {$in: names}
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
        $lookup: {
            from: "lookup",
            localField: "username",
            foreignField: "username",
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
            "terms.term": 1,
        }
    }], (err, students) => {
        if (err) {
            handleError('Bad request!', res, 400, next);
        } else {
            try {
                const data = students;

                const studentArray = [];
                for(let i = 0; i < data.length; i++) {
                    const advisor = getAdvisorStudentInfoTerm(data[i].advisor[0]);
                    const terms = getTermsStudentInfoTerm(data[i].terms);
                    const majorStr = createMajorsString(data[i].majors);
                    const minorStr = createMinorsString(data[i].minors);
                    const newStudent = createStudentInfoTerm(data[i], advisor, terms, [], majorStr, minorStr);
                    studentArray.push(newStudent);
                }

                res.status(200);
                res.json(studentArray);
            } catch (error) {
                handleError('Could not find student information for given term', res, 404, next);
            }
        }
    });
};


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
    switch(term) {
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