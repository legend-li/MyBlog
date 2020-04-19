export const SET_STUDY_PERSON = 'SET_STUDY_PERSON'
export const SET_PLAYFUL_PERSON = 'SET_PLAYFUL_PERSON'
export const SET_BOOKS = 'SET_BOOKS'
export const setStudyPerson = (data) => {
  return {
    type: SET_STUDY_PERSON,
    data,
  }
}
export const setPlayfulPerson = (data) => {
  return {
    type: SET_PLAYFUL_PERSON,
    data,
  }
}
export const setBook = (data) => {
  return {
    type: SET_BOOKS,
    data,
  }
}