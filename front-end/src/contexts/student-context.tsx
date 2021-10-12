import React, { useCallback } from "react"
import { Dispatch } from "react"
import { createContext, FC, useContext, useReducer } from "react"
import { SortDirection, SortBy } from "shared/models/sort"
import { RollStateFilterType } from "shared/models/roll"
import { Student } from "shared/models/person"
import { Reducer } from "react"

export type Action =
  | { type: "SET_SORTED_STUDENTS"; payload: { allStudents: Student[] } }
  | { type: "SET_FILTERED_STUDENTS" }
  | { type: "SET_ROLL_STATE_FILTER"; payload: { type: RollStateFilterType | null } }
  | { type: "SET_SEARCH_INPUT"; payload: { searchInput: string } }
  | { type: "CHANGE_SORT_BY" }
  | { type: "CHANGE_SORT_DIRECTION" }
  | { type: "CREATE_ROLL_SNAPSHOT"; payload: { snapshot: Student[] } }

interface InitialState {
  sortDirection: SortDirection
  searchInput: string
  sortBy: SortBy
  sortedAndFilteredStudents: Student[]
  rollStateFilter: RollStateFilterType | null
  sortedStudents: Student[]
  rollSnapShot: Student[]
}

type StudentContextType = {
  state: InitialState
  dispatch: Dispatch<Action>
}

const initialState: InitialState = {
  sortDirection: "ASC",
  searchInput: "",
  sortBy: "first_name",
  sortedAndFilteredStudents: [],
  rollStateFilter: null,
  sortedStudents: [],
  rollSnapShot: [],
}

const initialContext = {
  state: initialState,
  dispatch: () => null,
}

const StudentContext = createContext<StudentContextType>(initialContext)

export const StudentContextProvider: FC = ({ children }) => {
  /* Function to get filtered students */

  const getFilteredStudents = (students: Student[], type: RollStateFilterType | null) => {
    if (type && type !== "all") {
      return [...students].filter((s) => s.rollState === type)
    } else {
      return students
    }
  }

  /* Function to get searched students */

  const getSearchedStudents = (students: Student[], searchQuery: string) => {
    if (searchQuery !== "") {
      return [...students].filter((student) => (student.first_name + " " + student.last_name).toLowerCase().includes(searchQuery.toLowerCase()))
    } else {
      return students
    }
  }

  /* Function to get sorted students */

  const getSortedStudents = (students: Student[], sortDirection: SortDirection, sortBy: SortBy): Student[] => {
    return sortDirection === "ASC"
      ? [...students].sort((a, b) => {
          if (a[sortBy] < b[sortBy]) return -1
          if (a[sortBy] > b[sortBy]) return 1
          return 0
        })
      : [...students].sort((a, b) => {
          if (a[sortBy] > b[sortBy]) return -1
          if (a[sortBy] < b[sortBy]) return 1
          return 0
        })
  }

  const studentReducer: Reducer<InitialState, Action> = (state: InitialState, action: Action) => {
    switch (action.type) {
      case "SET_SORTED_STUDENTS": {
        return {
          ...state,
          sortedStudents: getSortedStudents(action.payload.allStudents, state.sortDirection, state.sortBy),
        }
      }
      case "SET_FILTERED_STUDENTS": {
        const searchedStudents = getSearchedStudents(state.sortedStudents, state.searchInput)
        const filteredStudents = getFilteredStudents(searchedStudents, state.rollStateFilter)
        return {
          ...state,
          sortedAndFilteredStudents: filteredStudents,
        }
      }
      case "SET_ROLL_STATE_FILTER": {
        return {
          ...state,
          rollStateFilter: action.payload.type,
        }
      }
      case "SET_SEARCH_INPUT": {
        return {
          ...state,
          searchInput: action.payload.searchInput,
        }
      }
      case "CHANGE_SORT_BY": {
        return {
          ...state,
          sortBy: state.sortBy === "first_name" ? "last_name" : "first_name",
        }
      }
      case "CHANGE_SORT_DIRECTION": {
        return {
          ...state,
          sortDirection: state.sortDirection === "ASC" ? "DESC" : "ASC",
        }
      }
      case "CREATE_ROLL_SNAPSHOT": {
        return {
          ...state,
          rollSnapShot: [...action.payload.snapshot],
        }
      }
      default:
        return state
    }
  }

  const [state, dispatch] = useReducer(studentReducer, initialState)

  return <StudentContext.Provider value={{ state, dispatch }}>{children}</StudentContext.Provider>
}

export const useStudentContext = () => {
  return useContext(StudentContext)
}
