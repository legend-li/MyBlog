import {
  SET_STUDY_PERSON, 
  SET_PLAYFUL_PERSON, 
  SET_BOOKS 
} from './actions.js'

let initStudyPerson = {
  name: '',
  age: '',
  like: [],
  sex: '',
  readedBooks: [],
}
let studyPersonReducer = (state = initStudyPerson, action) => {
  switch (action.type) {
    case SET_STUDY_PERSON:
      return action.data
    default:
      return state
  }
}
let initPlayfulPerson = {
  name: '',
  age: '',
  like: [],
  sex: '',
  readedBooks: [],
}
let playfulPersonReducer = (state = initPlayfulPerson, action) => {
  switch (action.type) {
    case SET_PLAYFUL_PERSON:
      return action.data
    default:
      return state
  }
}
let booksReducer = (state = [], action) => {
  switch (action.type) {
    case SET_BOOKS:
      return action.data
    default:
      return state
  }
}
export {
  studyPersonReducer,
  playfulPersonReducer,
  booksReducer,
}