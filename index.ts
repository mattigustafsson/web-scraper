import axios from 'axios'
import { parse } from 'node-html-parser'

const baseUrl = 'https://books.toscrape.com/'

const getPage = async (url: string) => {
  return (await axios.get(url)).data
}

const html = parse(await getPage(baseUrl))

const tags = html.querySelectorAll('a')

const url = tags.map(data => {
  return data.getAttribute('href')
}).filter(href => href)


console.log(url)