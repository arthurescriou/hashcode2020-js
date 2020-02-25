const fs = require('fs')

const readFiles = dirname => new Promise((resolve, reject) => fs.readdir(dirname, (err, filenames) => {
  if (err) {
    reject(err)
  } else {
    resolve(filenames)
  }
}))

const parseLine = line => line.split(/ /).map(s => parseInt(s, 10))

const readFile = path => {
  const lines = fs.readFileSync(path, 'utf8').split(/\n/)
  const fLine = parseLine(lines.shift())

  const bookScores = parseLine(lines.shift())

  const libraries = Array(lines.length / 2).fill(0).map((_, i) => {
    const l = parseLine(lines.shift())
    return {
      id: i,
      books: l[0],
      signupTime: l[1],
      bookPerDay: l[2],
      books: parseLine(lines.shift())
    }
  })

  return {
    name: path.match(/data\/(.*?).txt/)[1],
    books: fLine[0],
    libraries: fLine[1],
    dayForScanning: fLine[2],
    bookScores,
    libraries
  }
}

const score = (req, res) => {
  return 0
}

const printResFile = (req, res) => {

  const mapLibrary = library => {
    const lLine = library.id.toString() + ' ' + library.books.length.toString()
    const bLine = library.books.join(' ')
    return lLine + '\n' + bLine
  }

  const fileToPrint = [
      res.libraries.length.toString()
    ].concat(res.libraries.map(mapLibrary))
    .join('\n')
  if (!res.hasOwnProperty('score')) {
    res.score = score(req, res)
  }
  fs.writeFileSync('res/' + res.name + res.score, fileToPrint)
}


const compute = req => ({
  name: 'a_example',
  libraries: [{
    id: 1,
    books: [5, 2, 3]
  }, {
    id: 0,
    books: [0, 1, 2, 3, 4]
  }, ]
})


const main = async () => {
  const folder = 'data'
  const files = await readFiles(folder)

  // files.forEach(file => {
  //   readFile(folder + '/' + file)
  // })
  const file = readFile(folder + '/' + files[0])
  console.log(file)
  console.log(files)
  printResFile(file, compute(file))

}

main()
