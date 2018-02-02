const mongoose = require('mongoose');
const COURSE = mongoose.model('Course');

exports.getCourseInfo = function (req, res, next) {
    const term = req.params.term;
    const name = req.params.name.toUpperCase();

    COURSE.aggregate([{
            $match: {
                $and: [{
                        term: term
                    },
                    {
                        name: name
                    }
                ]
            }
        }, {
            $lookup: {
                from: 'lookup',
                localField: 'name',
                foreignField: 'courses',
                as: 'students'
            }
        }, {
            $lookup: {
                from: 'lookup',
                localField: 'students.username',
                foreignField: 'advisees',
                as: 'advisors'
            }
        }, {
            $project: {
                advisors: {
                    $filter: {
                        input: '$advisors',
                        as: 'advisor',
                        cond: {
                            $eq: ['$$advisor.term', term]
                        }
                    }
                },
                students: {
                    $filter: {
                        input: '$students',
                        as: 'students',
                        cond: {
                            $eq: ['$$students.term', term]
                        }
                    }
                },
                term: 1,
                name: 1,
                description: 1,
                instructor: 1,
                creditHours: 1,
                meetTimes: 1
            }
        }],
        (err, course) => {
            if (err) {
                console.log(err);
            } else {
                const data = course[0];
                const studentMap = createStudentMap(data.students);

                updateMap(studentMap, data.advisors);

                const students = getStudentsCourseInfo(data.students, studentMap);
                const newCourse = createCourseInfo(data, students);

                res.status(200);
                res.json([newCourse]);
            }
        });
};

exports.getCoursesInfo = function (req, res, next) {

};

function createCourseInfo(data, students) {
    return {
        _id: data._id,
        term: data.term,
        name: data.name,
        description: data.description,
        instructor: data.instructor,
        creditHours: data.creditHours,
        meetTimes: data.meetTimes,
        students: students
    };
}

function createStudentMap(students) {
    const map = {};
    for (let i = 0; i < students.length; i++) {
        const student = students[i];
        map[student.username] = '';
    }
    return map;
}

function updateMap(map, advisors) {
    for (let i = 0; i < advisors.length; i++) {
        const advisor = advisors[i];
        const username = advisor.username;
        for (let j = 0; j < advisor.advisees.length; j++) {
            const advisee = advisor.advisees[j];
            if (map.hasOwnProperty(advisee)) {
                map[advisee] = username;
            }
        }
    }
}

function getStudentsCourseInfo(students, map) {
    const studentsArr = [];
    for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const majorStr = createMajorsString(student.majors);
        const minorStr = createMinorsString(student.minors);
        studentsArr.push({
            _id: student._id,
            term: student.term,
            username: student.username,
            name: student.name,
            year: student.year,
            majors: majorStr,
            minors: minorStr,
            graduationDate: student.graduationDate,
            advisor: map[student.username]
        });
    }
    return studentsArr;
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