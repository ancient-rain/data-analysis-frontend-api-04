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

router.get('/student/:username', studentController.getStudentInfo);

router.get('/faculty/:username/:term', facultyController.getFacultyInfoByTerm);

router.get('/course/:name/:term', courseController.getCourseInfo);

router.get('/course/:name/students-taken/all', courseController.getAllStudentsTaken);

router.get('/course/:name/students-taken/:year', courseController.getYearStudentsTaken);

router.get('/course/:name/students-not-taken/all', courseController.getAllStudentsNotTaken);

router.get('/course/:name/students-not-taken/:year', courseController.getYearStudentsNotTaken);

router.route('/group/:id').get(groupController.getGroupById);

router.route('/group/:id').delete(groupController.deleteGroup);

router.route('/group').post(groupController.createGroup);




/* TODO */
router.get('/students/:term/*', studentController.getStudentsBySearch);

/* TODO */
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
