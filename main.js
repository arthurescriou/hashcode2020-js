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

const removeOutOfTimeBooks = (req, res) => {
  let timeLeft = req.dayForScanning
  res.libraries.forEach(library => {
    if (timeLeft > 0) {
      const libData = req.libraries[library.id]
      timeLeft -= libData.signupTime
      bookleft = timeLeft * libData.bookPerDay
      library.books = library.books.slice(0, bookleft - 1)
    }
  })
  return res
}

const score = (req, res) => {
  const cRes = removeOutOfTimeBooks(req, JSON.parse(JSON.stringify(res)))
  const bookScores = req.bookScores.map(i => i)
  return cRes.libraries.map(library => library.books.map(book => {
    const ret = bookScores[book]
    bookScores[book] = 0
    return ret
  }).reduce((acc, val) => acc + val, 0)).reduce((acc, val) => acc + val, 0)
}

const printResFile = (req, res) => {

  const mapLibrary = library => {
    const lLine = library.id.toString() + ' ' + library.books.length.toString()
    const bLine = library.books.join(' ')
    return lLine + '\n' + bLine
  }

  const fileToPrint = [res.libraries.length.toString()].concat(res.libraries.map(mapLibrary)).join('\n')
  if (!res.hasOwnProperty('score')) {
    res.score = score(req, res)
  }
  fs.writeFileSync('res/' + res.name + res.score, fileToPrint)
}

//bigger sortLibBy get picked first
const sortLibBy = (lib, req) => {
  return -lib.signupTime
  const res = lib.books.map(b => req.bookScores[b]).reduce((acc, val) => acc + val, 0)
  return res
}

const glouton = req => {
  req.libraries.sort((a, b) => sortLibBy(b, req) - sortLibBy(a, req))
  const libThatSignup = req.libraries.reduce((acc, val) => {
    if (acc.time + val.signupTime < req.dayForScanning) {
      acc.lib.push(val)
      acc.time += val.signupTime
    }
    return acc
  }, {
    time: 0,
    lib: []
  })

  const alreadyScannedBook = []
  let timeLeft = req.dayForScanning

  const libraries = libThatSignup.lib.map(lib => {
    const id = lib.id
    timeLeft -= lib.signupTime
    bookleft = timeLeft * lib.bookPerDay
    lib.books.sort((a, b) => req.books[b] - req.books[a])
    const books = lib.books.filter(book => !alreadyScannedBook.includes(book)).slice(0, bookleft - 1)
    alreadyScannedBook.push(books)
    return {id, books}
  })

  return {name: req.name, libraries}
}

const improve = (req, res) => {
  return res
}

const main = async () => {
  const folder = 'data'
  const files = await readFiles(folder)

  const scores = files.map(f => {
    const file = readFile(folder + '/' + f)
    let res = glouton(file)
    let oldScore = score(file, res)
    do {
      oldScore = score(file, res)
      res = improve(file, res)
    } while (score(file, res) > oldScore)

    printResFile(file, res)
    return score(file, res)
  })
  console.log(scores)
  console.log(scores.reduce((acc, val) => acc + val, 0))
}

main()
