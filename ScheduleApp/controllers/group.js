const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const GROUP = require('../models/group');

exports.getGroupById = function (req, res, next) {
    const id = req.params.id;

    GROUP.aggregate([{
        $match: {
            $and: [{
                type: 'Group'
            }, {
                _id: ObjectId(id)
            }]
        }
    }, {
        $lookup: {
            from: 'lookup',
            localField: 'students',
            foreignField: 'username',
            as: 'members'
        }
    }, {
        $lookup: {
            from: 'lookup',
            localField: 'faculty',
            foreignField: 'username',
            as: 'facultyMembers'
        }
    }, {
        $lookup: {
            from: 'lookup',
            localField: 'term',
            foreignField: 'termKey',
            as: 'termInfo'
        }
    }, {
        $lookup: {
            from: "lookup",
            localField: "members.courses",
            foreignField: "name",
            as: "courseData"
        }
    }, {
        $project: {
            termInfo: 1,
            type: 1,
            groupName: 1,
            className: 1,
            courseData: 1,
            members: 1,
            facultyMembers: 1
        }
    }], (err, group) => {
        if (err) {
            handleError('Bad request!', res, 400, next);
        } else {
            try {
                const data = group[0];
                const term = data.termInfo[0].termKey;
                const students = getMembersGroupInfoTerm(data.members, term);
                const faculty = getFacultyGroupInfoTerm(data.facultyMembers, term);
                const courses = getCoursesGroupInfoTerm(data.courseData, term);
                const newGroup = createGroupInfoTerm(data, term, students, faculty, courses);

                res.status(200);
                res.json([newGroup]);
            } catch (error) {
                handleError('Could not find student information for given term', res, 404, next);
            }
        }
    });
};

function createGroupInfoTerm(data, term, students, faculty, courses) {
    return {
        _id: data._id,
        groupName: data.groupName,
        className: data.className,
        term: term,
        students: students,
        faculty: faculty,
        courses: courses
    };
}

function getTermsGroupInfoTerm(terms) {
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

function getMembersGroupInfoTerm(members, term) {
    const memberArr = [];

    for (let i = 0; i < members.length; i++) {
        const member = members[i];
        if (member.term === term) {
            const majorStr = createMajorsString(member.majors);
            const minorStr = createMinorsString(member.minors);

            memberArr.push({
                _id: member._id,
                username: member.username,
                name: member.name,
                year: member.year,
                majors: majorStr,
                minors: minorStr,
                graduationDate: member.graduationDate,
                courses: member.courses
            });
        }
    }

    return memberArr;
}

function getFacultyGroupInfoTerm(faculty, term) {
    const facultyArr = [];

    for (let i = 0; i < faculty.length; i++) {
        const member = faculty[i];
        if (member.term === term) {
            facultyArr.push({
                _id: member._id,
                username: member.username,
                name: member.name,
                dept: member.dept,
            });
        }
    }

    return facultyArr;
}

function getCoursesGroupInfoTerm(courses, term) {
    const coursesArr = [];

    for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        if (course.term === term) {
            coursesArr.push({
                name: course.name,
                description: course.description,
                meetTimes: course.meetTimes,
                instructor: course.instructor,
                creditHours: course.creditHours
            });
        }
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