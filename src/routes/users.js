const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')

const {
    allUsers,
    me,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    login,
    logout,
    logoutAll
} = require('../modules/users')

router.route('/login').post(login)
router.route('/logout').post(auth, logout)
router.route('/logoutAll').post(auth, logoutAll)
router.route('/me').get(auth, me)
router.route('/').get(auth, allUsers).post(createUser)
router.route('/:id').get(auth, getUser).patch(auth, updateUser).delete(auth, deleteUser)

module.exports = router


