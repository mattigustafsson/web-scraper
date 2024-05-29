import axios from 'axios'
import { parse } from 'node-html-parser'

const baseUrl = 'https://books.toscrape.com/'
const urlsToVisit = []
const visitedUrls = new Set()

export const getPage = async (url: string) => {
  const response = await axios.get(url).catch(error => {
    console.log(error.toJSON().message)
    throw new Error(error.toJSON().message)
  })

  return response.data
}

const html = parse(await getPage(baseUrl))

const tags = html.querySelectorAll('a')

const url = tags.map(data => {
  return data.getAttribute('href')
}).filter(href => href)

console.log(url)
