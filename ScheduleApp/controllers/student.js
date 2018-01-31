const STUDENT = require('../models/student');

exports.getStudentInfoByTerm = function (req, res, next) {
    const term = req.params.term;
    const username = req.params.username.toUpperCase();

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
                const advisor = getAdvisorStudentInfoTerm(data.advisor[0]);
                const terms = getTermsStudentInfoTerm(data.terms);
                const courses = getCoursesStudentInfoTerm(data.courses);
                const majorStr = createMajorsString(data.majors);
                const minorStr = createMinorsString(data.minors);
                const newStudent = createStudentInfoTerm(data, advisor, terms, courses, majorStr, minorStr);

                res.status(200);
                res.json([newStudent]);
            } catch (error) {
                res.status(404);
                res.json(null);
                console.log(error);
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
        termsArr.push(terms[i].term);
    }

    return termsArr;
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