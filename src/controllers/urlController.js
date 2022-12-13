const urlModel = require('../models/urlModel')
const shortId = require('shortid')
const validURL = require('valid-url')
const axios = require("axios")


const createShortUrl = async function (req, res) {
    try {
        let longUrl = req.body.longUrl
        if (!longUrl) return res.status(400).json({ status: false, message: "Please provide longUrl" })
        if (!validURL.isUri(longUrl)) return res.status(400).json({ status: false, message: `This url ${longUrl} is not valid` })

        let findUrl = await urlModel.findOne({ longUrl: longUrl }).select({ _id: 0, longUrl: 1, shortUrl: 1, urlCode: 1 })
        if (findUrl) return res.status(200).json({ status: true, message: "short url is already present", data: findUrl })
        let baseUrl = "http://localhost:3000/"
        let shortUrl = shortId.generate().toLowerCase()
        let createShortUrl = baseUrl + shortUrl
        let option = {
            method: 'get',
            url: longUrl
        }
        let validateUrl = await axios(option)
            .then(() => longUrl)
            .catch(() => null)

        if (!validateUrl) return res.status(400).send({ status: false, message: `This Link: ${longUrl} is not Valid URL.` })
        let obj = {
            longUrl: longUrl,
            shortUrl: createShortUrl,
            urlCode: shortUrl
        }
        let createUrl = await urlModel.create(obj)
        return res.status(201).json({ status: true, data: createUrl })

    } catch (error) {
        return res.status(500).json({ status: false, message: error.message })
    }
}

const getUrl = async function (req, res) {
    try {
        let url = req.params.urlCode

        let urlDetails = await urlModel.findOne({ urlCode: url })
        if (!urlDetails) return res.status(400).json({ status: false, message: `This url ${url} not found` })

        return res.status(302).redirect(urlDetails.longUrl)
    }
    catch (err) {
        return res.status(500).json({ status: false, message: error.message })
    }
}


module.exports = { createShortUrl, getUrl }
